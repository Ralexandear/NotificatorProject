import amqp from 'amqplib';
import Logger from './shared/utils/Logger';
import { RabbitActionType, RabbitPostgresRequestAttributes, RabbitRequestTopicNameType } from './shared/interfaces/RabbitRequestAttributes';
import { LabomatixOrderEventHandler } from './handlers/LabomatixOrderEventHandler';
import { ValidationError } from './shared/errors/ValidationError';
import { ShopEventHandlder } from './handlers/ShopEventHandler';
import { databaseInitializationPromise } from './database';
import { FatalError } from './shared/errors/FatalError';
import PointController from './database/controllers/PointContoller';
import { RabbitResponseStatus } from './shared/interfaces/RabbitResponseAttributes';
import { LogisticSchemaEventHandler } from './handlers/LogisticSchemaEventHandler';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
Logger.log(IS_PRODUCTION ? 'Production mode' : 'Development mode');

// Соединение и каналы RabbitMQ
let channel: amqp.Channel;
let connection: amqp.ChannelModel;

const requestQueues = [
  'notificator-db-labomatix-order-requests',
  'notificator-db-point-requests',
  'notificator-db-shop-requests',
  'notificator-db-user-requests',
];

const responseQueues = [
  'notificator-db-labomatix-order-response',
  'notificator-db-point-response',
  'notificator-db-shop-response',
  'notificator-db-user-response',
];

async function connectToRabbitMQ() {
  try {
    connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();

    // Создаём очереди для запросов и ответов
    for (const queue of requestQueues) {
      await channel.assertQueue(queue, { durable: true });
    }

    for (const queue of responseQueues) {
      await channel.assertQueue(queue, { durable: true });
    }

    Logger.info('Connected to RabbitMQ');
  } catch (error) {
    Logger.error('Failed to connect to RabbitMQ', error);
    throw new FatalError('Fatal RabbitMQ connection error');
  }
}

// Отправка ответа в очередь
class RabbitMQResponse {
  protected _queue: string;
  protected _request_id: string;
  protected _action: RabbitActionType;
  protected _data: any;
  protected _status: RabbitResponseStatus;

  constructor(queue: string, request_id: string, action: RabbitActionType, data: any) {
    this._queue = queue;
    this._request_id = request_id;
    this._action = action;
    this._data = data;
    this._status = 'ERROR'; // default error status
  }

  get queue() {
    return this._queue;
  }

  get request_id() {
    return this._request_id;
  }

  get action() {
    return this._action;
  }

  get data() {
    return this._data;
  }

  set data(data: any) {
    this._data = data;
  }

  get status() {
    return this._status;
  }

  set status(status: RabbitResponseStatus) {
    if (!['OK', 'ERROR', 'NOT_FOUND', 'INVALID_DATA'].includes(status)) {
      throw new Error('Invalid status value');
    }
    this._status = status;
  }

  async send() {
    const response = {
      queue: this._queue,
      request_id: this._request_id,
      action: this._action,
      status: this._status,
      data: this._data,
    };

    try {
      channel.sendToQueue(this._queue, Buffer.from(JSON.stringify(response)), { persistent: true });
      Logger.info('Message sent:', response);
    } catch (err) {
      Logger.error('Error sending message:', err);
    }
  }
}

const setupConsumer = () => {
  for (const queue of requestQueues) {
    channel.consume(queue, async (msg) => {

      if (msg) {
        const stringRequest = msg.content.toString();
        Logger.info('Received request:', stringRequest);

        const topic: RabbitRequestTopicNameType = queue as RabbitRequestTopicNameType;
        const data = JSON.parse(stringRequest);

        let handler: (event: RabbitPostgresRequestAttributes<RabbitRequestTopicNameType, RabbitActionType>) => Promise<any>;
        let responseQueue: string;

        if (topic === 'notificator-db-shop-requests') {
          handler = ShopEventHandlder;
          responseQueue = 'notificator-db-shop-response';
        }
        else if (topic === 'notificator-db-labomatix-order-requests') {
          handler = LabomatixOrderEventHandler;
          responseQueue = 'notificator-db-labomatix-order-response';
        }
        else if (topic === 'notificator-db-logistic-requests') {
          handler = LogisticSchemaEventHandler;
          responseQueue = 'notificator-db-logistic-response';
        } 
        else {
          Logger.error('Unknown topic:', topic);
          return;
        }

        Logger.info('Handler:', handler.name);
        const response = new RabbitMQResponse(responseQueue, data.request_id, data.action, data.data);

        try {
          response.data = await handler(data);
          response.status = response.data ? 'OK' : 'NOT_FOUND';
        } catch (error) {
          if (error instanceof ValidationError) {
            response.status = 'INVALID_DATA';
            response.data = error.message;
          } else {
            response.status = 'ERROR';
            response.data = error;
          }

          Logger.error('FATAL ERROR:', error, error instanceof Error ? error.stack : '');
        } finally {
          response.send();
        }
      }
    }, { noAck: true });
  }
};

// Подключение и настройка RabbitMQ
connectToRabbitMQ().then(async () => {
  await databaseInitializationPromise;
  Logger.info('RabbitMQ consumer is ready');
  setupConsumer();
}).catch(err => {
  Logger.error('Error setting up RabbitMQ consumer', err);
});