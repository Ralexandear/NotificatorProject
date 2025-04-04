import { Model } from "sequelize";
import { PointAttributes, PointCreationAttributes } from "../../shared/interfaces/database/PointAttributes";

export class Point extends Model<PointAttributes, PointCreationAttributes> implements PointAttributes {
  readonly id!: number;
  name!: string;
  isActive!: boolean;
}