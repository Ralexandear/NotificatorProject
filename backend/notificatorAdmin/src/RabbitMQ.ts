import amqp from 'amqplib';
import Logger from './shared/utils/Logger';
import { RabbitActionType, RabbitPostgresRequestAttributes, RabbitPostgresRequestInterface, RabbitRequestTopicNameType } from './shared/interfaces/RabbitRequestAttributes';
import { GenericRabbitResponse, RabbitResponseAttributes } from './shared/interfaces/RabbitResponseAttributes';
import { RABBIT_RESPONSE_TIMEOUT } from './constants';
import { FatalError } from './shared/errors/FatalError';
import { v4 as uuidv4 } from 'uuid';
import RedisController from './database/controllers/RedisController';


// Соединение и каналы RabbitMQ
let channel: amqp.Channel;
let connection: amqp.ChannelModel;
const pendingRequests = new RedisController<GenericRabbitResponse | null>('notificator_admin_pr', 600)

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




// Отправка ответа в очередь
export class RabbitMQRequest<
  T extends RabbitRequestTopicNameType,
  A extends RabbitActionType
> implements RabbitPostgresRequestInterface {
  protected _topic: T;
  protected _request_id: string;
  protected _action: A;
  protected _data: RabbitPostgresRequestAttributes<T, A>['data'];

  constructor(
    topic: T,
    action: A,
    data: RabbitPostgresRequestAttributes<T, A>['data']
  ) {
    this._topic = topic;
    this._request_id = uuidv4();
    this._action = action;
    this._data = data;
  }

  get topic() {
    return this._topic;
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

  async send(): Promise<RabbitResponseAttributes<T>['data']> {
    return new Promise(async (resolve, reject) => {
      const request = {
        topic: this.topic,
        request_id: this.request_id,
        action: this.action,
        data: this.data,
      };
  
      pendingRequests.set(this.request_id, null);
      channel.sendToQueue(this._topic, Buffer.from(JSON.stringify(request)), { persistent: true });
      Logger.info('Message sent:', request);
      let isResolved = false
  
      const interval = setInterval(async () => {
        const response = await pendingRequests.get(this.request_id);
        if (response) {
          pendingRequests.delete(this.request_id);
          clearInterval(interval); // Останавливаем интервал после ответа
          isResolved = true;

          function isGenericRabbitResponse(obj: any): obj is GenericRabbitResponse {
            return obj && typeof obj === 'object' && 'request_id' in obj && 'status' in obj;
          }
          
          if (!isGenericRabbitResponse(response)) {
            Logger.error('Invalid response format: ' + JSON.stringify(response));
          }
          else if (response.status !== 'OK') {
            Logger.error('Received unsuccessful message for request:', JSON.stringify(request), '\n', 'RESPONSE', JSON.stringify(response));
          }
          else {
            resolve(response.data as RabbitResponseAttributes<T>['data']);
          }
          //only for errors
          reject(new Error('Error processing RabbitMQ request: ' + request.request_id));
        }
      }, 100);
  
      // Таймаут обработки
      setTimeout(() => {
        if (isResolved) return;

        clearInterval(interval); // Останавливаем проверку
        pendingRequests.delete(this.request_id);
        reject(new Error(`Timeout: No response for request ${this.request_id}`));
      }, RABBIT_RESPONSE_TIMEOUT * 1000);
    });
  }
  
}



async function connectToRabbitMQ(retryCount = 3, delay = 5000) {
  while (retryCount > 0) {
    try {
      connection = await amqp.connect('amqp://localhost');
      channel = await connection.createChannel();

      for (const queue of [...requestQueues, ...responseQueues]) {
        await channel.assertQueue(queue, { durable: true });
      }

      Logger.info('Connected to RabbitMQ');
      setupConsumer();

      connection.on('close', async () => {
        Logger.warn('RabbitMQ connection lost. Reconnecting...');
        await connectToRabbitMQ();
      });

      return;
    } catch (error) {
      Logger.error(`RabbitMQ connection failed. Attempts left: ${retryCount}`, error);
      retryCount--;
      if (retryCount > 0) await new Promise((resolve) => setTimeout(resolve, delay));
      else throw new FatalError('Fatal RabbitMQ connection error');
    }
  }
}



const setupConsumer = () => {
  for (const queue of responseQueues) {
    channel.consume(queue, async (msg) => {
      if (msg) {
        const stringRequest = msg.content.toString();
        Logger.info('Received response:', stringRequest);

        const response = JSON.parse(stringRequest) as GenericRabbitResponse;
        const {request_id: requestId} = response

        if (! pendingRequests.get(requestId)) {
          Logger.warn('pending requests object is missing request with id', requestId)
          return
        }
        
        pendingRequests.set(requestId, response)
      }
    }, { noAck: true });
  }
};


export const rabbitInitializationPromise = connectToRabbitMQ().then(async () => {
  Logger.info('RabbitMQ consumer is ready');
  setupConsumer();
})
