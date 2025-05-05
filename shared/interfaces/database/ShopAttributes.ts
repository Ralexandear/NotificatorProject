import { CreationAttributes, DeleteAttributes, FindAttributes, UpdateAttributes } from "./BaseAttributes";

export interface ShopAttributes {
  id: number;
  name: string;
  alterName: string;
  address: string;
}

export type ShopCreationAttributes = CreationAttributes<ShopAttributes>;
export type ShopUpdateAttributes = UpdateAttributes<ShopAttributes>;
export type ShopDeleteAttributes = DeleteAttributes<ShopAttributes>;

export type ShopFindAttributes = {
  names: string[]
}
