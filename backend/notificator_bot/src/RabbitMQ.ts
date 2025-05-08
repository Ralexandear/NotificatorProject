import amqp from 'amqplib';
import { REQUEST_PG_QUEUES } from "./shared/interfaces/rabbitMQ/RabbitPgRequestAttributes";
import { RabbitResponseStatus, RESPONSE_PG_QUEUES } from "./shared/interfaces/rabbitMQ/RabbitPgResponseAttributes";
import { RabbitTgActionType, RabbitTgRequestTopicName, RabbitTgResponseTopicName } from "./shared/interfaces/rabbitMQ/RabbitTgAttributes";
import Logger from "./shared/utils/Logger";
import { FatalError } from './shared/errors/FatalError';

let channel: amqp.Channel;
let connection: amqp.ChannelModel;

export async function connectToRabbitMQ() {
  try {
    connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();

    // Создаём очереди для запросов и ответов
    for (const queue of REQUEST_PG_QUEUES) {
      await channel.assertQueue(queue, { durable: true });
    }

    for (const queue of RESPONSE_PG_QUEUES) {
      await channel.assertQueue(queue, { durable: true });
    }

    for (const queue of [RabbitTgRequestTopicName, RabbitTgResponseTopicName]) { //adding topics for tg bot
      await channel.assertQueue(queue, { durable: true });
    }

    Logger.info('Connected to RabbitMQ');
  } catch (error) {
    Logger.error('Failed to connect to RabbitMQ', error);
    throw new FatalError('Fatal RabbitMQ connection error');
  }
}

async function checkRabbitMQConnection() {
  try {
    // Проверяем, существует ли соединение и канал
    if (!connection || !channel) {
      Logger.warn('RabbitMQ connection lost. Attempting to reconnect...');
      await reconnectToRabbitMQ();
      return;
    }

    // Проверяем доступность RabbitMQ, отправляя тестовый запрос
    await channel.checkQueue(RabbitTgRequestTopicName); // Проверяем существование тестовой очереди
    Logger.info('RabbitMQ connection is active.');
  } catch (error) {
    Logger.error('RabbitMQ connection check failed:', error);
    Logger.warn('Attempting to reconnect to RabbitMQ...');
    await reconnectToRabbitMQ();
  }
}

async function reconnectToRabbitMQ() {
  try {
    await connectToRabbitMQ();
    Logger.info('Reconnected to RabbitMQ successfully.');
  } catch (error) {
    Logger.error('Failed to reconnect to RabbitMQ. Retrying in 30 seconds...');
    setTimeout(reconnectToRabbitMQ, 30000); // Повторная попытка через 5 секунд
  }
}

setInterval(checkRabbitMQConnection, 60000)

export class RabbitMQResponse {
  protected _queue = RabbitTgResponseTopicName;
  protected _request_id: string;
  protected _action: RabbitTgActionType;
  protected _data: any;
  protected _status: RabbitResponseStatus;

  constructor(request_id: string, action: RabbitTgActionType, data: any) {
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