export interface PointAttributes {
  id: number;
  name: string;
  isActive: boolean;
}

export interface PointCreationAttributes extends Omit<PointAttributes, 'id' | 'isActive'> {}

export type PointUpdateAttributes = { id: number } & Partial<PointAttributes>;
export type PointDeleteAttributes = {id: number};
export type PointFindAttributes = Partial<PointAttributes>;