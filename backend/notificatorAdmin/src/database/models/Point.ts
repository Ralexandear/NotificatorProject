import { Model } from "sequelize";
import { PointAttributes, PointCreationAttributes } from "../interfaces/PointAttributes";

export class PointSequelizeModel extends Model<PointAttributes, PointCreationAttributes> implements PointAttributes {
  id!: number;
  name!: string;
  isActive!: boolean;
}



export class Point implements PointAttributes {
  protected model: PointSequelizeModel;
  
  constructor(sequelizeModel: PointSequelizeModel) {
    this.model = sequelizeModel;
  }

  get id() {
    return this.model.id;
  }

  get name() {
    return this.model.name;
  }

  get isActive() {
    return this.model.isActive
  }
}