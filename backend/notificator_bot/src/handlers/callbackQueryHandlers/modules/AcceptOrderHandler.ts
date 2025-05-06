import TelegramBot from "node-telegram-bot-api";
import splitCommand from "../../../utilities/splitCommand";
import { User } from "../../../../../../../notificatorNew/src/database/models/public/User";

export async function AcceptOrderHandler(user: User, callback: TelegramBot.CallbackQuery) {
  if (!callback.data) return

  const { params } = splitCommand(callback.data)
  const reply_to_message_id = Number(params);

  if (isNaN(reply_to_message_id)) {
    console.log('Parameter reply to messageId is missing')
    return
  }

  const scooterGroopId = process.env.SCOOTER_GROUP_ID;
  if (!scooterGroopId) {
    throw new Error('SCOOTER_GROUP_ID is missing in env file!')
  }

  const reply_markup = (() => {
    const reply_markup = callback.message?.reply_markup;
    if (!reply_markup) return null;
    const rowIx = reply_markup.inline_keyboard.findIndex(row => row.find(button => button.callback_data === callback.data))
    if (rowIx === -1) return null;
    reply_markup.inline_keyboard.splice(rowIx, 1);
    return reply_markup;
  })();
  //@ts-ignore
  user.answerCallbackQuery(callback.id, { text: '✅ Заказ подтвержден!' })

  const messageId = callback.message?.message_id
  if (!messageId) {
    throw new Error('Cannot edit reply markup, messageID is missing')
  }

  user.editMessageReplyMarkup(messageId, reply_markup)
  return
}