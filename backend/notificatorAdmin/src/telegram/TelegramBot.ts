import TelegramEntitiesConverter from '../utils/TelegramEntitiesConverter';
import Logger from '../Logger';
import { FatalError } from '../errors/FatalError';
import { $FunctionResultByName, chat, message, ok, setTdlibParameters, updateNewMessage, User } from 'tdlib-types';
import { API_HASH, API_ID, BOT_TOKEN } from '../constants';
import { sleep } from '../utils/sleep';
import { adminBotClient } from './tdl';
import { Client } from 'tdl'
import { databaseInitializationPromise } from '../database';





export default class TelegramBot {
  //STATIC
  protected static _isInit = false;
  protected static _instance: TelegramBot;

  static login() {
    if (this._isInit) return this._instance;
    else this._isInit = true;

    Logger.log('Bot login')

    const bot = this._instance = new TelegramBot(adminBotClient); // Создаём экземпляр
    bot.initializationPromise = databaseInitializationPromise
      .then(() => adminBotClient.loginAsBot(BOT_TOKEN) )
      .then(async () => {
        Logger.debug('Bot is logged in');
        await bot.getMe();
        Logger.log('Bot is ready');
      })
      .catch((error) => {
        Logger.error(error);
        throw new FatalError('Error in loginAsBot');
      })
  
    return bot;
  }


  //CONSTRUCTOR
  protected initializationPromise: Promise<void> | null = null;
  protected knownChats: Set<number> = new Set()
  protected queue: {request: {[key: string]: any}, resolve: Function, reject: Function}[] = []
  protected pause: number;
  protected queueProcessing = false
  protected requestsPerSecond = 20
  protected me: User | null = null;
  readonly client;

  protected constructor(client: Client, pauseInSeconds: number = 1) {
    this.client = client;
    this.pause = pauseInSeconds * 1000

    setInterval(() => {
      this.requestsPerSecond = 0;
    }, 1000);
  }

  async isReady() {
    while (this.initializationPromise === null) {
      sleep(1000)
    }
    return this.initializationPromise
  }


  /** TDLIB METHODS **/

  async getMe() {
    const response = await this.client.invoke({_: 'getMe'})
    Logger.info(response)

    this.me = response
    return response
  }


  /** CHATS */

  async getChat(chatId: number) {
    Logger.info('Getting chat', chatId)

    const chat = await this.addToQueue({
      _: 'getChat',
      chat_id: chatId
    }) as unknown as chat;

    this.knownChats.add(chatId)
    Logger.info("Chat id", chatId, 'is added to a known chats')
    Logger.debug(chat)

    return chat;
  }

  async openChat(chatId: number) {
    Logger.info('Opening chat', chatId)
    
    const response = await this.addToQueue({
      _: 'openChat',
      chat_id: chatId
    }) as unknown as ok;

    Logger.info('Chat', chatId, 'is opened')
    Logger.debug(response)

    if (response._ !== 'ok') {
      throw new Error('Unexpected response from TDLib:\n' + response)
    }

    return true
  }

  /** MESSAGE ACTIONS */

  async sendMessage(chatId: number | string, message: string) {
    await this.isReady(); // Waiting for initialization
    Logger.info('Sending a message to', chatId, 'message', message)

    if (typeof chatId === 'string') {
      chatId = +chatId;
    }

    if (! this.knownChats.has(chatId)) {
      Logger.warn('Chat id is unknown', chatId);

      try {
        await this.getChat(chatId)
      } catch (error) {
        Logger.error('Error while getting chat', error)
        throw new Error('Error while getting chat')
      }
    }

    const {text, entities} = TelegramEntitiesConverter(message)

    const response = await this.addToQueue({
      _: 'sendMessage',
      chat_id: chatId,
      input_message_content: {
        _: 'inputMessageText',
        text: {
          _: 'formattedText',
          text,
          entities
        },
      }
    }) as unknown as message;
    
    Logger.info('Message sent to chatId', chatId)
    Logger.debug(response)

    return response
  }



  
  /** CUSTOM METHODS **/

  // async getRequestPermission(): Promise<void> {
  //   // Пока превышен лимит запросов, ожидаем
  //   while (this.requestsPerSecond >= this.maxRequestsPerSecond) {
  //     await new Promise(resolve => setTimeout(resolve, 75)); // 75 мс ожидания
  //   }
  //   this.requestsPerSecond++;
  // }

  addToQueue<T>(request: {[key: string]: any}): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      Logger.info('Request added to queue:', request);

      if (!this.queueProcessing) {
        this.processQueue();
      }
    });
  }

  async processQueue() {
    const queue = this.queue
    this.queueProcessing = true;

    while (this.queue.length > 0) {
      const { request, resolve, reject } = this.queue.shift()!;

      try {
        //@ts-ignore
        const response = await this.client.invoke(request); // Здесь учитываем типизацию
        resolve(response);
      } catch (error) {
        Logger.error('Error processing request:', error);
        reject(error);
      }
    }

    this.queueProcessing = false;
  }

  

  async getResponseFromUser(chatId: number | string, message: string, timeoutInSeconds = 120): Promise<updateNewMessage> {
    await this.isReady(); // Waiting for initialization

    const requestMessage = await this.sendMessage(chatId, message);
  
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.client.off('update', onUpdate); // Removing listener on timeout
        reject('Timeout exeeded while waiting for users response'); // Возвращаем null, если время ожидания истекло
      }, timeoutInSeconds * 1000);
  
      const onUpdate = (update: any) => {
        if (update._ === 'updateNewMessage' && update.message.chat_id === chatId && update.message.content._ === 'messageText') {
          clearTimeout(timeout); // Очищаем таймер
          this.client.off('update', onUpdate); // Удаляем слушатель
          resolve(update as updateNewMessage); // Возвращаем обновление
        }
      };
  
      this.client.on('update', onUpdate); // Добавляем слушатель
    });
  }
}


export const AdminBot = TelegramBot.login();

