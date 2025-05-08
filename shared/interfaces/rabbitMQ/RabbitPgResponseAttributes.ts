import { LabomatixOrderAttributes } from "../database/LabomatixOrderAttributes";
import { LogisticSchemaAttributes } from "../database/LogisticSchemaAttributes";
import { PointAttributes } from "../database/PointAttributes";
import { ShiftAttributes } from "../database/ShiftAttributes";
import { ShopAttributes } from "../database/ShopAttributes";
import { UserAttributes } from "../database/UserAttributes";
import { REQUEST_ENTITIES } from "./RabbitPgRequestAttributes";



export type RabbitResponseStatus =
  | 'OK'
  | 'ERROR'
  | 'NOT_FOUND'
  | 'INVALID_DATA';

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

// export type RabbitRequestToResponseMap = {
//   "notificator-db-labomatix-order-requests": "notificator-db-labomatix-order-response";
//   "notificator-db-shop-requests": "notificator-db-shop-response";
//   "notificator-db-point-requests": "notificator-db-point-response";
//   "notificator-db-logistic-requests": "notificator-db-logistic-response";
//   "notificator-db-user-requests": "notificator-db-user-response";
//   "notificator-db-shift-requests": "notificator-db-shift-response";
// };

