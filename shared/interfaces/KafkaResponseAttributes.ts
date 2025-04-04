import { LabomatixOrderAttributes } from "./database/LabomatixOrderAttributes";
import { KafkaActionType, KafkaRequestTopicNameType } from "./KafkaRequestAttributes";

export type KafkaResponseTopicNameType =
  | 'notificator-db-labomatix-order-response'
  | 'notificator-db-point-response'
  | 'notificator-db-shop-response'
  | 'notificator-db-user-response';

export type KafkaResponseStatus =
  | 'OK'
  | 'ERROR'
  | 'NOT_FOUND'
  | 'INVALID_DATA';

type LabomatixOrderResponseAttributes = {
  OK: LabomatixOrderAttributes;
  ERROR: string;
  NOT_FOUND: string;
  INVALID_DATA: string
}

type KafkaActionDataMap = {
  'notificator-db-labomatix-order-response': {
    CREATE: LabomatixOrderResponseAttributes;
    FIND_OR_CREATE: LabomatixOrderResponseAttributes;
    UPDATE: LabomatixOrderResponseAttributes;
    DELETE: LabomatixOrderResponseAttributes;
    FIND: LabomatixOrderResponseAttributes;
    GET: LabomatixOrderResponseAttributes;
  };
  // 'notificator-db-shop-requests': {
  //   CREATE: { shopId: number; name: string };
  //   UPDATE: { shopId: number; updatedFields: Record<string, unknown> };
  //   DELETE: { shopId: number };
  //   GET: { shopId: number };
  // };
  // 'notificator-db-user-requests': {
  //   CREATE: { userId: number; name: string; email: string };
  //   UPDATE: { userId: number; updatedFields: Record<string, unknown> };
  //   DELETE: { userId: number };
  //   GET: { userId: number };
  // };
};

// Автоматически создаём `KafkaPostgresRequestAttributes`
export type KafkaPostgresResponse<T extends KafkaRequestTopicNameType, A extends KafkaActionType, E extends KafkaResponseStatus> =
  T extends keyof KafkaActionDataMap
    ? A extends keyof KafkaActionDataMap[T]
      ? { topic: T; request_id: string; action: A; status: E, data: KafkaActionDataMap[T][A][E] }
      : { topic: T; action: A; status: E, data: unknown }
    : { topic: T; action: A; status: E, data: unknown }

export interface KafkaPostgresResponseAttributes {
  topic: KafkaResponseTopicNameType;
  request_id: string;
  action: KafkaActionType;
  status: KafkaResponseStatus;
}


