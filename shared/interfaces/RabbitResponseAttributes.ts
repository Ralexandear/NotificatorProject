import { LabomatixOrderAttributes } from "./database/LabomatixOrderAttributes";
import { LogisticSchemaAttributes } from "./database/LogisticSchemaAttributes";
import { PointAttributes } from "./database/PointAttributes";
import { ShiftAttributes } from "./database/ShiftAttributes";
import { ShopAttributes } from "./database/ShopAttributes";
import { UserAttributes } from "./database/UserAttributes";
import { REQUEST_ENTITIES } from "./RabbitRequestAttributes";



export type RabbitResponseStatus =
  | 'OK'
  | 'ERROR'
  | 'NOT_FOUND'
  | 'INVALID_DATA';

export type RabbitResponseTopicNameType = `notificator-db-${typeof REQUEST_ENTITIES[number]}-response`;

export const RESPONSE_QUEUES: RabbitResponseTopicNameType[] = REQUEST_ENTITIES.map(
  (entity) => `notificator-db-${entity}-response` as const
);

type RabbitResponseDataMap = {
  'notificator-db-labomatix-order-requests': LabomatixOrderAttributes;
  'notificator-db-shop-requests': ShopAttributes;
  'notificator-db-point-requests': PointAttributes;
  'notificator-db-logistic-requests': LogisticSchemaAttributes;
  'notificator-db-user-requests': UserAttributes;
  'notificator-db-shift-requests': ShiftAttributes;
};

export type RabbitResponseAttributes<T extends RabbitResponseTopicNameType> =
  T extends keyof RabbitResponseDataMap
  ? { status: 'OK' ; data: RabbitResponseDataMap[T]; request_id: string; }
  : { status: 'NOT_FOUND' | 'ERROR' | 'INVALID_DATA'; data: string; request_id: string; };

export type GenericRabbitResponse = RabbitResponseAttributes<RabbitResponseTopicNameType>

