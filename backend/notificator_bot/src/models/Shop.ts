import { ShopAttributes } from "../shared/interfaces/database/ShopAttributes";

export class Shop implements ShopAttributes {
  readonly id!: number;
  name!: string;
  alterName!: string;
  address!: string;
}