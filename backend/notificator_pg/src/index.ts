import kafka from 'kafka-node';
import Logger from './shared/utils/Logger';
import { KafkaActionType, KafkaPostgresRequestAttributes, KafkaRequestTopicNameType } from './shared/interfaces/KafkaRequestAttributes';
import { UserEventHandler } from './handlers/UserEventHandler';
import { LabomatixOrderEventHandler } from './handlers/LabomatixOrderEventHandler';
import { KafkaPostgresResponseAttributes, KafkaResponseStatus, KafkaResponseTopicNameType } from './shared/interfaces/KafkaResponseAttributes';
import { ValidationError } from './shared/errors/ValidationError';
import { ShopEventHandlder } from './handlers/ShopEventHandler';

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const client = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });

const consumer = new kafka.Consumer(
  client,
  [{ topic: 'pg-labomatix-order-events', partition: 0 }, {topic: 'pg-point-events'}, {topic: 'pg-shop-events'}],
  { autoCommit: true }
);

export const producer = new kafka.Producer(client)

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




consumer.on('message', async (message) => {
  const stringRequest = message.value.toString()
  Logger.info('Recieved request:', stringRequest);

  const topic: KafkaRequestTopicNameType = message.topic as KafkaRequestTopicNameType //if not we don't care
  const data = JSON.parse(stringRequest);

  let handler: (event: KafkaPostgresRequestAttributes<KafkaRequestTopicNameType, KafkaActionType>) => Promise<any>;
  let responseTopic: KafkaResponseTopicNameType
  if (topic === 'notificator-db-user-requests') {
    handler = UserEventHandler
    responseTopic = 'notificator-db-user-response'
  }
  else if (topic === 'notificator-db-shop-requests') {
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
  
});
