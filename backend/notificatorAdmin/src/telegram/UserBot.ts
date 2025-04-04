import * as tdl from 'tdl';
import Logger from '../Logger';
import { FatalError } from '../errors/FatalError';
import TelegramBot, { AdminBot } from './TelegramBot';
import { userBotClient } from './tdl';
import { databaseInitializationPromise } from '../database';
import { availableReactions, chat, ok } from 'tdlib-types';


const delayBetweenRequests = 4 // seconds



//@ts-ignore
export class UserBotClass extends TelegramBot {
   //STATIC
  protected static _isInit = false;
  protected static _instance: UserBotClass;

  static login() {
    if (this._isInit) return this._instance;
    else this._isInit = true;

    Logger.log('UserBot waiting for AdminBot')
    const bot = this._instance = new UserBotClass(userBotClient); // Создаём экземпляр
    bot.initializationPromise = databaseInitializationPromise
      .then(() => userBotClient.login())
      .then(async () => {
        console.log('UserBot is ready')
        await bot.getMe()
      })
      .catch((error) => {
        Logger.error(error);
        throw new FatalError('Error in loginAsBot');
      })

    return bot
  }


  private constructor(client: tdl.Client) {
    super(client)

    this.requestsPerSecond = 1
  }

  async createSecretChat( userId: number) {
    Logger.info('Creating secret chat with user', userId)
    
    const secretChat = await this.addToQueue({
      _: 'createNewSecretChat',
      user_id: userId
    }) as unknown as chat

    Logger.info('Secret chat with user', userId, 'created successfully')
    Logger.debug(secretChat)

    return secretChat
  }

  /** REACTIONS **/

  async getMessageAvailableReactions(chatId: number, messageId: number) {
    await this.isReady(); // Waiting for initialization

    Logger.info('Getting available reactions for message', messageId, 'in chat', chatId)
    
    const client = this.client

    await this.openChat(chatId);

    const availableReactions = await this.addToQueue({
      _: 'getMessageAvailableReactions',
      chat_id: chatId,
      message_id: messageId,
      row_size: 25 // Get maximum possible
    }) as unknown as availableReactions;

    Logger.info('Recieved available reactions for message', messageId, 'in chat', chatId)
    Logger.debug(availableReactions)

    return availableReactions
  }

  async addMessageReaction(chatId: number, messageId: number, emoji: "❤️" | "👍" | "👎" | "😂" | "😢" | "😮" | "😡" | "🎉") {
    await this.isReady(); // Waiting for initialization

    Logger.info('Preparing to send emoji', emoji, 'for message', messageId, 'in chat', chatId)
    
    if (! await this.isMessageReactionAvailable(chatId, messageId, emoji)) {
      Logger.error('Emoji', emoji, 'is not supported for message', messageId, 'in chat', chatId)
      throw new Error('Emoji is not supported!')
    }
    
    const response = await this.addToQueue({
      _: 'addMessageReaction',
      chat_id: chatId,
      message_id: messageId,
      reaction_type: { _: 'reactionTypeEmoji', emoji },
      is_big: false
    }) as unknown as ok;

    if (response._ !== 'ok') {
      throw new Error('Unexpected response from TDLib:\n' + response)
    }

    Logger.info('Emoji', emoji, 'added successfully to the message', messageId, 'in chat', chatId)
    return true;
  }

  async isMessageReactionAvailable(chatId: number, messageId: number, emoji: string) {
    await this.isReady(); // Waiting for initialization

    Logger.info('Checking if emoji', emoji, 'is available for message', messageId, 'in chat', chatId)
    
    const availableReactions = await this.getMessageAvailableReactions(chatId, messageId);

    const allReactions = [
      ...(availableReactions.top_reactions || []),
      ...(availableReactions.recent_reactions || []),
      ...(availableReactions.popular_reactions || [])
    ];

    const isAvailable = allReactions.some(r => 
      r.type._ === 'reactionTypeEmoji' && 
      r.type.emoji === emoji
    );

    Logger.info('Reaction', (isAvailable ? 'IS' : 'IS NOT'), 'available for message', messageId, 'in chat', chatId)
    return isAvailable
  }
}


export const UserBot = UserBotClass.login();



//

    /*
    await AdminBot.isReady()

    const warn = () => Logger.warn("Unexpected response while trying to log in")



    while (true) {
      const { _: authState } = await client.invoke({
        _: 'getAuthorizationState',
      });

      if (authState === 'authorizationStateWaitPhoneNumber') {
        const response = await AdminBot.getResponseFromUser(ADMIN_CHAT_ID, 'Введите номер телефона: ');
        
        if (! (response.message.content._ === 'messageText')) {
          warn()
          continue;
        }

        const phoneNumber = response.message.content.text.text.trim();
        Logger.debug(phoneNumber)

        await client.invoke({
          '_': 'setAuthenticationPhoneNumber',
          phone_number: phoneNumber,
        });
      } else if (authState === 'authorizationStateWaitCode') {
        try{
          // Logger.debug('Creating secret chat...')
          // const chat = await AdminBot.createSecretChat(ADMIN_CHAT_ID)

          // const chatId = chat.id;
          // Logger.debug('Chat id:', chatId)

          const response = await AdminBot.getResponseFromUser(ADMIN_CHAT_ID, 'Введите код авторизации: ');

          if (! (response.message.content._ === 'messageText')) {
            warn()
            continue;
          }

          const authCode = response.message.content.text.text.trim();
          Logger.debug(authCode)

          if (! /\d+/.test(authCode)) { //if it's not a number
            warn()
            continue;
          }

          await client.invoke({
            _: 'checkAuthenticationCode',
            code: authCode,
          });
        } catch (error) {
          Logger.error(error)
          if (error instanceof Error && error.message.includes('PHONE_CODE_EXPIRED')) {
            Logger.error('Код истёк, анлогин...');
            await client.invoke({
              _: 'logOut',
            });

            client = tdl.createClient(config)
          } else {
            Logger.error('Произошла ошибка:', error);
          }
        }
      } else if (authState === 'authorizationStateWaitPassword') {
        const response = await AdminBot.getResponseFromUser(ADMIN_CHAT_ID,'Введите пароль: ');

        if (! (response.message.content._ === 'messageText')) {
          warn()
          continue;
        }

        const password = response.message.content.text.text;

        const state = await client.invoke({ _: 'getAuthorizationState' });
        if (state._ === 'authorizationStateWaitPassword') {
          await client.invoke({
            '_': 'checkAuthenticationPassword',
            password: password,
          });
        } else {
          warn()
          continue;
        }

        await client.invoke({
          '_': 'checkAuthenticationPassword',
          password: password,
        });
      } else if (authState === 'authorizationStateReady') {
        const bot = this._instance = new UserBotClass(client); // Создаём экземпляр

        bot._initializationPromise = client.login()
          .then(async () => {
            await bot.getMe();
            Logger.log('UserBot is ready');
          })
          .catch((error) => {
            Logger.error(error);
            throw new FatalError('Error in login as user');
          });

        return bot;
      } else if (authState === 'authorizationStateClosed') {
        Logger.log('Authorization closed');
        await sleep()
      } else if (authState === 'authorizationStateClosing') {
        Logger.log('Authorization closing');
        await sleep()
      } else if (authState === 'authorizationStateLoggingOut') {
        Logger.log('Logging out');
        await sleep()
      } else {
        throw new Error(`Неизвестное состояние авторизации: ${authState}`);
      }
    }
    */
