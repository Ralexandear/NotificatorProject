import { Model } from "sequelize";
import { LogisticSchemaAttributes, LogisticSchemaCreationAttributes } from "../../shared/interfaces/database/LogisticSchemaAttributes";

export class LogisticSchema extends Model<LogisticSchemaAttributes, LogisticSchemaCreationAttributes> implements LogisticSchemaAttributes {
  readonly id!: number;
  pointId!: number;
  day!: number;
  shopId!: number;
}
