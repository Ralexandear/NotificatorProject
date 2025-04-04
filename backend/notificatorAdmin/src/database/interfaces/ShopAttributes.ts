import { Optional } from "sequelize";

export interface ShopAttributes {
  id: number;
  name: string;
  alterName: string;
  address: string
}

export interface ShopCreationAttributes extends Optional<ShopAttributes, 'id'> {};