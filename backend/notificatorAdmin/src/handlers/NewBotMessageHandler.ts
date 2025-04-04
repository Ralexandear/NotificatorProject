import { updateNewMessage } from "tdlib-types";
import { databaseInitializationPromise } from "../database";
import Logger from "../Logger";
import { Configuration } from "../Configuration";
import { ValidationError } from "../errors/ValidationError";
import { AdminBot } from "../telegram/TelegramBot";

export async function newBotMessageHandler(update: updateNewMessage, mongoUpdateId: string) {
  await databaseInitializationPromise
  Logger.info(mongoUpdateId, 'Message handler processing message id')

  const chatId = update.message.chat_id
  const messageId = update.message.id

  if (Configuration.admin_ids.includes( update.message.chat_id )) {
    Logger.log(mongoUpdateId, 'Bot got update from admin');
    
    if (update.message.content._ !== 'messageText') {
      Logger.warn(mongoUpdateId, 'Incoming message is not text message');
      return
    }
    
    const text = update.message.content.text.text;
    const [command, value] = text.split(' ');
    
    Logger.log('Bot recieved command from admin:', command, mongoUpdateId)
    switch (command) {
      case '/change_delivery_time':
        if (! /\d+/g.test(value)) {
          throw new ValidationError(mongoUpdateId + ' Invorrect value while trying to update delivery time, value: ' + value);
        }

        Configuration.delivery_time = +value;
        const minutes = Configuration.delivery_time % 60
        const hours = (Configuration.delivery_time - minutes)/ 60;

        await AdminBot.sendMessage(chatId, `Время доставки обновлено, текущий интервал ${hours}ч ${minutes}мин`);
        return

      case '/enable_test':
        if (Configuration.use_test) {
          const text = 'Test group is already in use, chatId: ' + Configuration.test_group_id
          Logger.log(mongoUpdateId, text)
          await AdminBot.sendMessage(chatId, text)
          return
        }
        Configuration.use_test = true;
        
        const text = 'Test group activated, use_test value:' + Configuration.use_test
        Logger.log(mongoUpdateId, text)
        await AdminBot.sendMessage(chatId, text)
        return
    }

  }

  
}