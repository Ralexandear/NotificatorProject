import kafka from 'kafka-node';
import Logger from './shared/utils/Logger';
import { KafkaActionType, KafkaPostgresRequestAttributes, KafkaRequestTopicNameType } from './shared/interfaces/KafkaRequestAttributes';
import { LabomatixOrderEventHandler } from './handlers/LabomatixOrderEventHandler';
import { KafkaPostgresResponseAttributes, KafkaResponseStatus, KafkaResponseTopicNameType } from './shared/interfaces/KafkaResponseAttributes';
import { ValidationError } from './shared/errors/ValidationError';
import { ShopEventHandlder } from './handlers/ShopEventHandler';
import { databaseInitializationPromise } from './database';
import { FatalError } from './shared/errors/FatalError';

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

Logger.log(IS_PRODUCTION ? 'Production mode' : 'Development mode');


class KafkaResponse implements KafkaPostgresResponseAttributes {
  //Класс может реализовать только тип объекта или пересечение типов объектов со статическими известными членами
  protected _topic: KafkaResponseTopicNameType;
  protected _request_id: string;
  protected _action: KafkaActionType;
  protected _data: any; // Можно уточнить тип данных, если известно
  protected _status: KafkaResponseStatus

  constructor(topic: KafkaResponseTopicNameType, request_id: string, action: KafkaActionType, data: any) {
    this._topic = topic;
    this._request_id = request_id;
    this._action = action;
    this._data = data;
    this._status = 'ERROR'; //default error
  }

  get topic() {
    return this._topic
  }

  get request_id() {
    return this._request_id
  }

  get action() {
    return this._action
  }

  get data() {
    return this._data
  }

  set data(data: any) {
    this._data = data
  }

  get status() {
    return this._status
  }

  set status(status: KafkaResponseStatus) {
    if (! ['OK', 'ERROR', 'NOT_FOUND', 'INVALID_DATA'].includes(status)) {
      throw new Error('Invalid status value');
    }
    this._status = status;
  }

  send() {
    const response = {
      topic: this._topic,
      request_id: this._request_id,
      action: this._action,
      status: this._status,
      data: this._data
    };

    const payloads = [
      { topic: this._topic, messages: JSON.stringify(response) }
    ];

    producer.send(payloads, (err, data) => {
      if (err) {
        Logger.error('Error sending message:', err);
      } else {
        Logger.info('Message sent:', data);
      }
    });
  }
}

const requestTopics = [
  'notificator-db-labomatix-order-requests',
  'notificator-db-point-requests',
  'notificator-db-shop-requests',
  'notificator-db-user-requests',
] as KafkaRequestTopicNameType[];

const responseTopics = [
  'notificator-db-labomatix-order-response',
  'notificator-db-point-response',
  'notificator-db-shop-response',
  'notificator-db-user-response'
]


export const kafkaClient = new kafka.KafkaClient({ 
  kafkaHost: 'localhost:9092',
  reconnectOnIdle: true,
  
});

kafkaClient.connect()

const consumer = new kafka.Consumer(
  kafkaClient,
  [],
  { 
    autoCommit: true,
  }
);

export const producer = new kafka.Producer(kafkaClient);

let retryCount = 0;
const maxRetries = 3;


const setupConsumer = () => {
  consumer.addTopics(requestTopics, (err, result) => {
    if (err) {
      console.error('Error adding topics:', err);
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Retrying (${retryCount}/${maxRetries})...`);
        setTimeout(setupConsumer, 2000);
      } else {
        throw new FatalError('Failed to add topics after multiple attempts: ' + err);
      }
    } else {
      console.log('Topics successfully added:', result);
    }
  });
};

producer.on('ready', async () => {
  console.log('Producer is ready');
  
  producer.createTopics([...requestTopics, ...responseTopics], (err, result) => {
    if (err) {
      throw new FatalError('Error creating topics:' + err);
    } else {
      console.log('Topics successfully created:', result);
      // Start consumer setup after topics are created
      setTimeout(setupConsumer, 2000);
    }
  });
});


consumer.on('message', async (message) => {
  await databaseInitializationPromise;

  try {
    const stringRequest = message.value.toString()
    Logger.info('Recieved request:', stringRequest);

    const topic: KafkaRequestTopicNameType = message.topic as KafkaRequestTopicNameType //if not we don't care
    const data = JSON.parse(stringRequest);

    let handler: (event: KafkaPostgresRequestAttributes<KafkaRequestTopicNameType, KafkaActionType>) => Promise<any>;
    let responseTopic: KafkaResponseTopicNameType
    // if (topic === 'notificator-db-user-requests') {
    //   handler = UserEventHandler
    //   responseTopic = 'notificator-db-user-response'
    // }
    if (topic === 'notificator-db-shop-requests') {
      handler = ShopEventHandlder
      responseTopic = 'notificator-db-shop-response'
    }
    // else if (topic === 'pg-point-events') handler = PointEventHandler
    else if (topic === 'notificator-db-labomatix-order-requests') {
      handler = LabomatixOrderEventHandler
      responseTopic = 'notificator-db-labomatix-order-response'
    }
    else {
      Logger.error('Unknown topic:', topic);
      return;
    }

    Logger.info('Handler:', handler.name);
    const response = new KafkaResponse(responseTopic, data.request_id, data.action, data.data);


    try {
      response.data = await handler(data);
      response.status = response.data ? 'OK' : 'NOT_FOUND';
    }
    catch (error) {
      if (error instanceof ValidationError) {
        response.status = 'INVALID_DATA';
        response.data = error.message;
      } else {
        response.status = 'ERROR';
        response.data = error;
      }

      Logger.error('FATAL ERROR:', error, error instanceof Error ? error.stack : '');
    }
    finally {
      response.send()
    }
  } catch (error) {
    Logger.error('Error processing message:', error);
  }
});


producer.on('error', (err) => {
  console.error('Producer error:', err);
});

consumer.on('error', (err) => {
  console.error('Consumer error:', err);
});

kafkaClient.on('error', (err) => {
  console.error('Client error:', err);
});