import { Model } from "sequelize";
import { ShopAttributes, ShopCreationAttributes } from "../../shared/interfaces/database/ShopAttributes";

export class Shop extends Model<ShopAttributes, ShopCreationAttributes> implements ShopAttributes {
  readonly id!: number;
  name!: string;
  alterName!: string;
  address!: string;
}