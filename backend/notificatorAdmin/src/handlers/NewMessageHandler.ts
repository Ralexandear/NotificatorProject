import { updateNewMessage } from "tdlib-types";
import Logger from "../Logger";
import { databaseInitializationPromise } from "../database";
import { LabomatixOrderController } from "../database/controllers/LabomatixOrderController";
import { processOrder } from "./functions/processOrder";
import { AdminBot } from "../telegram/TelegramBot";
import { Configuration } from "../Configuration";



export default async function NewMessageHandler(update: updateNewMessage, mongoUpdateId: string) {
  await databaseInitializationPromise
  Logger.info('Message handler processing message id', update.message.id)

  const chatId = update.message.chat_id
  const messageId = update.message.id
  
  if (update.message.content._ !== 'messageText') {
    Logger.warn(mongoUpdateId, 'Incoming message is not text message');
    return
  }
  
  const text = update.message.content.text.text;
  const isTestMessage = text.startsWith('LBM_TEST')

  if (chatId === -1002120695329 || isTestMessage) { //чат группы лабоматы
    Logger.info(mongoUpdateId, 'its labomatix chat')

    if (! isTestMessage && (update.message.sender_id._ !== 'messageSenderUser' || update.message.sender_id.user_id !== 6100930151)) {
      Logger.info(mongoUpdateId, 'Message sender is not labomatix bot')
      return
    }

  

    if (text.startsWith('⛔️')) {
      Logger.warn(mongoUpdateId, 'Message is not an order, message text:', text);
      await AdminBot.sendMessage(Configuration.target_group_id, ['Сообщение о блокировке, игнор...', text].join('\n\n'))
      return
    }
    
    Logger.log(mongoUpdateId, 'Saving labomatix order to postgres');
    const order = await LabomatixOrderController.create(messageId, mongoUpdateId)
    Logger.log(mongoUpdateId, 'Labomatix order created id:', order.id);

    await processOrder(order, text)
  }
}
