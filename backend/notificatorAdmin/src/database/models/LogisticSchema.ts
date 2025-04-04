import { Model } from "sequelize";
import { LogisticSchemaAttributes, LogisticSchemaCreationAttributes } from "../interfaces/LogisticSchemaAttributes";

export class LogisticSchemaSequelizeModel extends Model<LogisticSchemaAttributes, LogisticSchemaCreationAttributes> implements LogisticSchemaAttributes {
  id!: number;
  pointId!: number;
  day!: number;
  shopId!: number;
}


export class LogisticSchema implements LogisticSchemaAttributes {
  private model: LogisticSchemaSequelizeModel;

  constructor(sequelizeModel: LogisticSchemaSequelizeModel) {
    this.model = sequelizeModel
  }

  get id() {
    return this.model.id
  }

  get pointId() {
    return this.model.pointId
  }

  get day() {
    return this.model.day
  }

  get shopId() {
    return this.model.shopId
  }
}