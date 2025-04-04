import { Model } from "sequelize";
import { ShopAttributes, ShopCreationAttributes } from "../interfaces/ShopAttributes";

export class ShopSequelizeModel extends Model<ShopAttributes, ShopCreationAttributes> implements ShopAttributes {
  id!: number;
  name!: string;
  alterName!: string;
  address!: string;
}



export class Shop implements ShopAttributes {
  private model: ShopSequelizeModel;

  constructor(sequelizeModel: ShopSequelizeModel) {
    this.model = sequelizeModel;
  }

  get id() {
    return this.model.id
  }

  get name() {
    return this.model.name
  }

  get alterName() {
    return this.model.alterName
  }

  get address() {
    return this.model.address
  }
}