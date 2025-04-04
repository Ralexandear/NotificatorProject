import { LabomatixOrderCreationAttributes, LabomatixOrderDeleteAttributes, LabomatixOrderFindAttributes, LabomatixOrderUpdateAttributes } from "./database/LabomatixOrderAttributes";
import { ShopCreationAttributes, ShopDeleteAttributes, ShopFindAttributes, ShopUpdateAttributes } from "./database/ShopAttributes";

// Определяем список топиков
export type KafkaRequestTopicNameType =
  | 'notificator-db-labomatix-order-requests'
  | 'notificator-db-point-requests'
  | 'notificator-db-shop-requests'
  | 'notificator-db-user-requests';

// Определяем список возможных действий
export type KafkaActionType =
  | 'GET'
  | 'UPDATE'
  | 'CREATE'
  | 'FIND_OR_CREATE'
  | 'DELETE'
  | 'FIND'
  | 'GET_ALL';

// Определяем структуры данных для каждого топика
type KafkaActionDataMap = {
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
    UPDATE: ShopUpdateAttributes;
    DELETE: ShopDeleteAttributes;
    FIND: ShopFindAttributes;
    // GET: { shopId: number };
  };
  'notificator-db-user-requests': {
    CREATE: { userId: number; name: string; email: string };
    UPDATE: { userId: number; updatedFields: Record<string, unknown> };
    DELETE: { userId: number };
    GET: { userId: number };
  };
};

// Автоматически создаём `KafkaPostgresRequestAttributes`
export type KafkaPostgresRequestAttributes<T extends KafkaRequestTopicNameType, A extends KafkaActionType> = 
  T extends keyof KafkaActionDataMap
    ? A extends keyof KafkaActionDataMap[T]
      ? { topic: T; request_id: string; action: A; data: KafkaActionDataMap[T][A] }
      : { topic: T; action: A; data: unknown }
    : { topic: T; action: A; data: unknown };
