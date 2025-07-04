import { Configuration } from "../../../Configuration";
import { LabomatixOrderController } from "../../../database/controllers/LabomatixOrderController";
import { LogisticSchemaController } from "../../../database/controllers/LogisticSchemaController";
import { PointController } from "../../../database/controllers/PointContoller";
import { ShopController } from "../../../database/controllers/ShopController";
import { RabbitMQRequest, RabbitTelegramRequest } from "../../../RabbitMQ";
import { LabomatixOrderAttributes } from "../../../shared/interfaces/database/LabomatixOrderAttributes";
import Logger from "../../../shared/utils/Logger";
import { bot } from "../../../telegram/TelegramBot";
import { userbot } from "../../../telegram/UserBot";
import { addTimeToTimeString } from "../../../utils/addTimeToTimeString";
import { sleep } from "../../../utils/sleep";

export async function processOrder(order: LabomatixOrderAttributes, text: string, chatId: number) {
  Logger.log('Processing order', order.id, 'for message', order.messageId);
  const { packetNumber, place, time } = extractPackageInfo(text);
  const placeFormatted = place?.replace(/дц\s/i, '') || null;

  order.packetNumber = packetNumber ? Number(packetNumber) : null;
  order.status = 'PROCESSING'

  try {
    const shop = await ShopController.findByName(place, placeFormatted);

    if (!shop) {
      const messageText = '@HE_operator\n❗️ ДЦ НЕ НАЙДЕН\n\n' + text;
      await await new RabbitTelegramRequest(messageText).send();
      Logger.warn('Shop not found!')
      return
    }

    order.shopId = shop.id;

    const schema = await LogisticSchemaController.findCurrentCourierId(shop.id);

    if (!schema) {
      Logger.warn('Schema not found, order', order.id)
      return
    }

    const point = await PointController.getById(schema.pointId);

    if (!point) {
      Logger.warn('Point not found, order', order.id)
      return
    }


    const timeToIncrease = time || (() => {
      const today = new Date();
      return [today.getHours(), today.getMinutes()].join(':')
    })();

    const newTime = addTimeToTimeString(timeToIncrease, 0, Configuration.delivery_time)

    const messageText = [
      point.name + ' ✚',
      `<b>${shop.name}</b>`,
      `🛻 <code>${shop.address}</code>`,
      'Доставить до: ' + newTime,
      '✚ Лабомат'
    ].join('\n');

    // await new RabbitMQRequest('')

    const response = await new RabbitTelegramRequest(messageText).send()

    if (! response) return
    
    order.status = 'FINISHED'

    // Задержка на случайный интервал от 4 до 7 секунд
    const randomDelay = 4000 + Math.floor(Math.random() * 3000); // 4000–6999 мс
    await sleep(randomDelay);

    await userbot.addMessageReaction(chatId, order.messageId, '👍')
  } catch (error) {
    Logger.error("Error while processing order", error)
  } finally {
    await LabomatixOrderController.update(order);
  }
}


/**
 * Helper to extract order info
 * @param text 
 * @returns 
 */
function extractPackageInfo(text: string) {
  const timeRegex = /Получен:\s(\d{2}:\d{2})/;
  const dateRegex = /(\d{2}\.\d{2}\.\d{4})/;
  const placeRegex = /Место:\s(.+)/;
  const packageNumberRegex = /Пакет №:\s(\d+)/;

  const timeMatch = text.match(timeRegex);
  const placeMatch = text.match(placeRegex);
  const packageNumberMatch = text.match(packageNumberRegex);

  return {
    time: timeMatch ? timeMatch[1].trim() : null,
    place: placeMatch ? placeMatch[1].trim() : null,
    packetNumber: packageNumberMatch ? packageNumberMatch[1].trim() : null,
  };
}



// MessageHandler(
//   {
//     "_": "updateNewMessage",
//     "message": {
//       "_": "message",
//       "id": 68438458368,
//       "sender_id": {
//         "_": "messageSenderUser",
//         "user_id": 6100930151
//       },
//       "chat_id": -1002120695329,
//       "is_outgoing": false,
//       "is_pinned": false,
//       "is_from_offline": false,
//       "can_be_saved": true,
//       "has_timestamped_media": true,
//       "is_channel_post": false,
//       "is_topic_message": false,
//       "contains_unread_mention": false,
//       "date": 1742805569,
//       "edit_date": 0,
//       "interaction_info": {
//         "_": "messageInteractionInfo",
//         "view_count": 0,
//         "forward_count": 0,
//         "reply_info": {
//           "_": "messageReplyInfo",
//           "reply_count": 0,
//           "recent_replier_ids": [],
//           "last_read_inbox_message_id": 0,
//           "last_read_outbox_message_id": 0,
//           "last_message_id": 0
//         }
//       },
//       "unread_reactions": [],
//       "message_thread_id": 68438458368,
//       "saved_messages_topic_id": 0,
//       "self_destruct_in": 0,
//       "auto_delete_in": 0,
//       "via_bot_user_id": 0,
//       "sender_business_bot_user_id": 0,
//       "sender_boost_count": 0,
//       "author_signature": "",
//       "media_album_id": "0",
//       "effect_id": "0",
//       "has_sensitive_content": false,
//       "restriction_reason": "",
//       "content": {
//         "_": "messageText",
//         "text": {
//           "_": "formattedText",
//           "text": "1️⃣ Первый пакет \nПолучен: 11:39 24.03.2025 \nМесто: ДЦ на Доблести \nПакет №: 6124949519",
//           "entities": [
//             {
//               "_": "textEntity",
//               "offset": 4,
//               "length": 12,
//               "type": {
//                 "_": "textEntityTypeBold"
//               }
//             },
//             {
//               "_": "textEntity",
//               "offset": 4,
//               "length": 12,
//               "type": {
//                 "_": "textEntityTypeUnderline"
//               }
//             },
//             {
//               "_": "textEntity",
//               "offset": 27,
//               "length": 5,
//               "type": {
