import { Optional } from "sequelize";

export interface LogisticSchemaAttributes {
  id: number;
  pointId: number;
  day: number; //js format
  shopId: number;
}

export interface LogisticSchemaCreationAttributes extends Optional<LogisticSchemaAttributes, 'id'> {}