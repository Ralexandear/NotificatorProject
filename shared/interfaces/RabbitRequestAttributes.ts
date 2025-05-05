import { LabomatixOrderCreationAttributes, LabomatixOrderDeleteAttributes, LabomatixOrderFindAttributes, LabomatixOrderUpdateAttributes } from "./database/LabomatixOrderAttributes";
import { LogisticSchemaCreationAttributes, LogisticSchemaDeleteAttributes, LogisticSchemaFindAttributes, LogisticSchemaUpdateAttributes } from "./database/LogisticSchemaAttributes";
import { PointCreationAttributes, PointDeleteAttributes, PointFindAttributes, PointUpdateAttributes } from "./database/PointAttributes";
import { ShopCreationAttributes, ShopDeleteAttributes, ShopFindAttributes, ShopUpdateAttributes } from "./database/ShopAttributes";

// Определяем список топиков
export const REQUEST_ENTITIES = ['labomatix-order', 'point', 'shop', 'user', 'logistic', 'shift'] as const;

export type RabbitRequestTopicNameType = `notificator-db-${typeof REQUEST_ENTITIES[number]}-requests`;

export const REQUEST_QUEUES: RabbitRequestTopicNameType[] = REQUEST_ENTITIES.map(
  (entity) => `notificator-db-${entity}-requests` as const
);

// Определяем список возможных действий
export type RabbitActionType =
  | 'GET'
  | 'UPDATE'
  | 'CREATE'
  | 'FIND_OR_CREATE'
  | 'DELETE'
  | 'FIND'
  | 'GET_ALL';

// Определяем структуры данных для каждого топика
type RabbitActionDataMap = {
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
  }
};

// Автоматически создаём `RabbitPostgresRequestAttributes`
export type RabbitPostgresRequestAttributes<T extends RabbitRequestTopicNameType, A extends RabbitActionType> =
  T extends keyof RabbitActionDataMap
  ? A extends keyof RabbitActionDataMap[T]
  ? { topic: T; request_id: string; action: A; data: RabbitActionDataMap[T][A] }
  : { topic: T; action: A; data: unknown }
  : { topic: T; action: A; data: unknown };

export type RabbitRequestGeneric = RabbitPostgresRequestAttributes<RabbitRequestTopicNameType, RabbitActionType>

export interface RabbitPostgresRequestInterface {
  topic: RabbitRequestTopicNameType;
  request_id: string;
  action: RabbitActionType;
  data: any;
}

