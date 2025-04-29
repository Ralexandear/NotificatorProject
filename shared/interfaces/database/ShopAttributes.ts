export interface ShopAttributes {
  id: number;
  name: string;
  alterName: string;
  address: string;
}

// `ShopCreationAttributes` позволяет `id` быть необязательным
export interface ShopCreationAttributes extends Omit<ShopAttributes, 'id'> {}
export type ShopDeleteAttributes = {id: number}

// `ShopUpdateAttributes` исключает `id` и делает все остальные поля необязательными
export type ShopUpdateAttributes = {id: number} & Omit<Partial<ShopAttributes>, 'id'>;

export type ShopFindAttributes = {
  names: string[]
}
