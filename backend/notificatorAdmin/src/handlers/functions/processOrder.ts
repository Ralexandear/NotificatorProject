import { Configuration } from "../../Configuration";
import { LogisticSchemaController } from "../../database/controllers/LogisticSchemaController";
import { PointController } from "../../database/controllers/PointContoller";
import { ShopController } from "../../database/controllers/ShopController";
import { LabomatixOrder } from "../../database/models/LabomatixOrder";
import Logger from "../../Logger";
import { AdminBot } from "../../telegram/TelegramBot";
import { addTimeToTimeString } from "../../utils/addTimeToTimeString";


export async function processOrder(order: LabomatixOrder, text: string) {
  Logger.log('Processing order', order.id, 'for message', order.messageId);
  const {packetNumber, place, time} = extractPackageInfo(text);
  const placeFormatted = place?.replace(/дц\s/i, '') || null;

  order.packetNumber = packetNumber ? Number(packetNumber) : null;
  order.status = 'processing'
  
  try {
    const shop = await ShopController.findByName(place, placeFormatted);

    if (! shop) {
      const messageText = 'ДЦ НЕ НАЙДЕН\n\n' + text;
      await AdminBot.sendMessage(Configuration.target_group_id, messageText);
      Logger.warn('Shop not found!')
      return
    }

    order.shopId = shop.id;

    const schema = await LogisticSchemaController.findCurrentCourierId(shop.id);

    if (! schema) {
      Logger.warn('Schema not found, order', order.id)
      return
    }

    const point = await PointController.getById(schema.pointId);

    if (! point) {
      Logger.warn('Point not found, order', order.id)
      return
    }


    const timeToIncrease = time || (() => {
      const today = new Date();
      return [today.getHours(), today.getMinutes()].join(':')
    })();

    const newTime = addTimeToTimeString(timeToIncrease , 0, Configuration.delivery_time)

    const messageText = [
      point.name + ' ✚',
    `<b>${shop.name}</b>`,
      `🛻 <code>${shop.address}</code>`,
      'Доставить до: ' + newTime,
      '✚ Лабомат'
    ].join('\n');

    await AdminBot.sendMessage(Configuration.target_group_id, messageText)
    order.status = 'finished'
  } catch (error) {
    Logger.error("Error while processing order", error)
  } finally {
    await order.save();
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
//                 "_": "textEntityTypeBold"
//               }
//             },
//             {
//               "_": "textEntity",
//               "offset": 27,
//               "length": 5,
//               "type": {
//                 "_": "textEntityTypeItalic"
//               }
//             },
//             {
//               "_": "textEntity",
//               "offset": 32,
//               "length": 11,
//               "type": {
//                 "_": "textEntityTypeBold"
//               }
//             },
//             {
//               "_": "textEntity",
//               "offset": 32,
//               "length": 11,
//               "type": {
//                 "_": "textEntityTypeItalic"
//               }
//             },
//             {
//               "_": "textEntity",
//               "offset": 52,
//               "length": 14,
//               "type": {
//                 "_": "textEntityTypeBold"
//               }
//             },
//             {
//               "_": "textEntity",
//               "offset": 52,
//               "length": 14,
//               "type": {
//                 "_": "textEntityTypeItalic"
//               }
//             },
//             {
//               "_": "textEntity",
//               "offset": 77,
//               "length": 10,
//               "type": {
//                 "_": "textEntityTypePhoneNumber"
//               }
//             },
//             {
//               "_": "textEntity",
//               "offset": 77,
//               "length": 10,
//               "type": {
//                 "_": "textEntityTypeBold"
//               }
//             },
//             {
//               "_": "textEntity",
//               "offset": 77,
//               "length": 10,
//               "type": {
//                 "_": "textEntityTypeItalic"
//               }
//             }
//           ]
//         }
//       }
//     }
//   },
// )