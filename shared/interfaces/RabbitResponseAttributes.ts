import { LabomatixOrderAttributes } from "./database/LabomatixOrderAttributes";
import { LogisticSchemaAttributes } from "./database/LogisticSchemaAttributes";
import { PointAttributes } from "./database/PointAttributes";
import { ShopAttributes } from "./database/ShopAttributes";
import { RabbitActionType, RabbitRequestTopicNameType } from "./RabbitRequestAttributes";



export type RabbitResponseStatus =
  | 'OK'
  | 'ERROR'
  | 'NOT_FOUND'
  | 'INVALID_DATA';

// type BaseResponseAttributes<OK> = {
//   OK: OK;
//   ERROR: string;
//   NOT_FOUND: string;
//   INVALID_DATA: string;
// };

// type LabomatixOrderResponseAttributes = BaseResponseAttributes<LabomatixOrderAttributes>;
// type ShopResponseAttributes = BaseResponseAttributes<ShopAttributes>;

// type ActionMap<Resp> = {
//   [K in RabbitActionType]: Resp;
// };

export type RabbitResponseTopicNameType =
  | 'notificator-db-labomatix-order-response'
  | 'notificator-db-point-response'
  | 'notificator-db-shop-response'
  | 'notificator-db-user-response'
  | 'notificator-db-logistic-response';



// Автоматически создаём `RabbitPostgresRequestAttributes`
// export type RabbitPGResponse<T extends RabbitResponseTopicNameType, A extends RabbitActionType, E extends RabbitResponseStatus> =
//   T extends keyof RabbitActionDataMap
//   ? A extends keyof RabbitActionDataMap[T]
//     ? { queue: T;  status: E; data: RabbitActionDataMap[T][A][E] }
//     : { queue: T; request_id: string; status: E; data: unknown }
//   : { queue: T; request_id: string; status: E; data: unknown }




type RabbitResponseDataMap = {
  'notificator-db-labomatix-order-requests': LabomatixOrderAttributes;
  'notificator-db-shop-requests': ShopAttributes;
  'notificator-db-point-requests': PointAttributes;
  'notificator-db-logistic-requests': LogisticSchemaAttributes;
};

export type RabbitResponseAttributes<T extends RabbitRequestTopicNameType> =
  T extends keyof RabbitResponseDataMap
  ? { status: 'OK' ; data: RabbitResponseDataMap[T]; request_id: string; }
  : { status: 'NOT_FOUND' | 'ERROR' | 'INVALID_DATA'; data: string; request_id: string; };

export type GenericRabbitResponse = RabbitResponseAttributes<RabbitRequestTopicNameType>

