import { TelegramMessage } from "../telegram/message";

export type RabbitTgActionType =
  'SEND_MESSAGE'

export const RabbitTgRequestTopicName = 'notificator-tg-bot-request'
export const RabbitTgResponseTopicName = 'notificator-tg-bot-response'

type RabbitTelegramActionDataMap = {
  'notificator-tg-bot-request': TelegramMessage;
}

export type RabbitTelegramRequestAttributes<A extends RabbitTgActionType> =
  A extends keyof RabbitTelegramActionDataMap
  ? { topic: typeof RabbitTgRequestTopicName, id: string; action: A; data: RabbitTelegramActionDataMap[A] }
  : { topic: any; action: A; data: unknown };

export type RabbitTelegramRequestGeneric = RabbitTelegramRequestAttributes<RabbitTgActionType>

/**
 * RESPONSE TYPES
 */

