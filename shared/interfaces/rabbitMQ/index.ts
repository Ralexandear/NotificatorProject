import { RabbitPgActionType, RabbitPgRequestAttributes, RabbitPgRequestGeneric, RabbitPgRequestTopicNameType } from "./RabbitPostgresAttributes";
import { RabbitTelegramRequestAttributes, RabbitTelegramRequestGeneric, RabbitTgActionType, RabbitTgRequestTopicName } from "./RabbitTelegramAttributes";

export type RabbitResponseStatus =
  | 'OK'
  | 'ERROR'
  | 'NOT_FOUND'
  | 'INVALID_DATA';

export type RabbitRequestAttributes = RabbitPgRequestAttributes<RabbitPgRequestTopicNameType, RabbitPgActionType> | RabbitTelegramRequestAttributes<RabbitTgActionType>

export type RabbitRequestAttributesGeneric = RabbitPgRequestGeneric | RabbitTelegramRequestGeneric;
export type RabbitRequestTopicNameType = RabbitPgRequestTopicNameType | typeof RabbitTgRequestTopicName
