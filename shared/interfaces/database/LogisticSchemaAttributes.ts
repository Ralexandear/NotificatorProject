import { CreationAttributes, DeleteAttributes, FindAttributes, UpdateAttributes } from "./BaseAttributes";

export interface LogisticSchemaAttributes {
  id: number;
  pointId: number;
  day: number; //js format
  shopId: number;
}

export type LogisticSchemaCreationAttributes = CreationAttributes<LogisticSchemaAttributes>;
export type LogisticSchemaUpdateAttributes = UpdateAttributes<LogisticSchemaAttributes>;
export type LogisticSchemaDeleteAttributes = DeleteAttributes<LogisticSchemaAttributes>;
export type LogisticSchemaFindAttributes = FindAttributes<LogisticSchemaAttributes>;