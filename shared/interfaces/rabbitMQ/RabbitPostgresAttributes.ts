import { LabomatixOrderAttributes, LabomatixOrderCreationAttributes, LabomatixOrderDeleteAttributes, LabomatixOrderFindAttributes, LabomatixOrderUpdateAttributes } from "../database/LabomatixOrderAttributes";
import { LogisticSchemaAttributes, LogisticSchemaCreationAttributes, LogisticSchemaDeleteAttributes, LogisticSchemaFindAttributes, LogisticSchemaUpdateAttributes } from "../database/LogisticSchemaAttributes";
import { PointAttributes, PointCreationAttributes, PointDeleteAttributes, PointFindAttributes, PointUpdateAttributes } from "../database/PointAttributes";
import { ShiftAttributes, ShiftCreationAttributes, ShiftDeleteAttributes, ShiftFindAttributes, ShiftUpdateAttributes } from "../database/ShiftAttributes";
import { ShopAttributes, ShopCreationAttributes, ShopDeleteAttributes, ShopFindAttributes, ShopUpdateAttributes } from "../database/ShopAttributes";
import { UserAttributes, UserCreationAttributes, UserDeleteAttributes, UserFindAttributes, UserUpdateAttributes } from "../database/UserAttributes";

// Определяем список топиков
export const REQUEST_ENTITIES = ['labomatix-order', 'point', 'shop', 'user', 'logistic', 'shift'] as const;

export type RabbitPgRequestTopicNameType = `notificator-db-${typeof REQUEST_ENTITIES[number]}-requests`;

export const REQUEST_PG_QUEUES: RabbitPgRequestTopicNameType[] = REQUEST_ENTITIES.map(
  (entity) => `notificator-db-${entity}-requests` as const
);

// Определяем список возможных действий
export type RabbitPgActionType =
  | 'GET'
  | 'UPDATE'
  | 'CREATE'
  | 'FIND_OR_CREATE'
  | 'DELETE'
  | 'FIND'
  | 'GET_ALL'

// Определяем структуры данных для каждого топика
type RabbitPgActionDataMap = {
  'notificator-db-labomatix-order-requests': {
    CREATE: LabomatixOrderCreationAttributes;
    FIND_OR_CREATE: LabomatixOrderCreationAttributes;
    UPDATE: LabomatixOrderUpdateAttributes;
    DELETE: LabomatixOrderDeleteAttributes;
    FIND: LabomatixOrderFindAttributes;
    GET: { id: number };
  };
  'notificator-db-shop-requests': {
    CREATE: ShopCreationAttributes;
    FIND_OR_CREATE: ShopCreationAttributes;
    UPDATE: ShopUpdateAttributes;
    DELETE: ShopDeleteAttributes;
    FIND: ShopFindAttributes;
    GET: { id: number };
  };
  'notificator-db-point-requests': {
    CREATE: PointCreationAttributes;
    FIND_OR_CREATE: PointCreationAttributes;
    UPDATE: PointUpdateAttributes;
    DELETE: PointDeleteAttributes;
    FIND: PointFindAttributes;
    GET: { id: number };
  };
  'notificator-db-logistic-requests': {
    CREATE: LogisticSchemaCreationAttributes;
    FIND_OR_CREATE: LogisticSchemaCreationAttributes;
    UPDATE: LogisticSchemaUpdateAttributes;
    DELETE: LogisticSchemaDeleteAttributes;
    FIND: LogisticSchemaFindAttributes;
    GET: { id: number };
  };
  'notificator-db-user-requests': {
    CREATE: UserCreationAttributes;
    FIND_OR_CREATE: UserCreationAttributes;
    UPDATE: UserUpdateAttributes;
    DELETE: UserDeleteAttributes;
    FIND: UserFindAttributes;
    GET: { id: number };
  };
  'notificator-db-shift-requests': {
    CREATE: ShiftCreationAttributes;
    FIND_OR_CREATE: ShiftCreationAttributes;
    UPDATE: ShiftUpdateAttributes;
    DELETE: ShiftDeleteAttributes;
    FIND: ShiftFindAttributes;
    GET: { id: number };
  };
  'notificator-tg-bot-request': {
    SEND_MESSAGE: { chat_id: number; text: string; parse_mode?: 'Markdown' | 'HTML' };
  }
};

// Автоматически создаём `RabbitPgRequestAttributes`
export type RabbitPgRequestAttributes<T extends RabbitPgRequestTopicNameType, A extends RabbitPgActionType> =
  T extends keyof RabbitPgActionDataMap
  ? A extends keyof RabbitPgActionDataMap[T]
  ? { topic: T; request_id: string; action: A; data: RabbitPgActionDataMap[T][A] }
  : { topic: T; action: A; data: unknown }
  : { topic: T; action: A; data: unknown };

export type RabbitPgRequestGeneric = RabbitPgRequestAttributes<RabbitPgRequestTopicNameType, RabbitPgActionType>

export interface RabbitPgRequestInterface {
  topic: RabbitPgRequestTopicNameType;
  request_id: string;
  action: RabbitPgActionType;
  data: any;
}

/**
 * RESPONSE TYPES
 */

export type RabbitResponseTopicNameType = `notificator-db-${typeof REQUEST_ENTITIES[number]}-response`;

export const RESPONSE_PG_QUEUES: RabbitResponseTopicNameType[] = REQUEST_ENTITIES.map(
  (entity) => `notificator-db-${entity}-response` as const
);

export type RabbitResponseDataMap = {
  'notificator-db-labomatix-order-response': LabomatixOrderAttributes;
  'notificator-db-shop-response': ShopAttributes;
  'notificator-db-point-response': PointAttributes;
  'notificator-db-logistic-response': LogisticSchemaAttributes;
  'notificator-db-user-response': UserAttributes;
  'notificator-db-shift-response': ShiftAttributes;
};

export type RabbitResponseAttributes<T extends RabbitResponseTopicNameType | string> =
  T extends keyof RabbitResponseDataMap
  ? { status: 'OK'; data: RabbitResponseDataMap[T]; request_id: string; }
  : { status: 'NOT_FOUND' | 'ERROR' | 'INVALID_DATA'; data: string; request_id: string; };

export type GenericRabbitResponse =
  | { status: 'OK'; data: RabbitResponseDataMap[keyof RabbitResponseDataMap]; request_id: string }
  | { status: 'NOT_FOUND' | 'ERROR' | 'INVALID_DATA'; data: string; request_id: string };

export type RabbitRequestToResponseMap = {
  "notificator-db-labomatix-order-requests": "notificator-db-labomatix-order-response";
  "notificator-db-shop-requests": "notificator-db-shop-response";
  "notificator-db-point-requests": "notificator-db-point-response";
  "notificator-db-logistic-requests": "notificator-db-logistic-response";
  "notificator-db-user-requests": "notificator-db-user-response";
  "notificator-db-shift-requests": "notificator-db-shift-response";
};
