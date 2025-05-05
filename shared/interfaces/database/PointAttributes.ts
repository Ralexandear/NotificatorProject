import { CreationAttributes, DeleteAttributes, FindAttributes, UpdateAttributes } from "./BaseAttributes";

export interface PointAttributes {
  id: number;
  name: string;
  isActive: boolean;
}

export type PointCreationAttributes = CreationAttributes<Omit<PointAttributes, 'isActive'>>;
export type PointUpdateAttributes = UpdateAttributes<PointAttributes>;
export type PointDeleteAttributes = DeleteAttributes<PointAttributes>;
export type PointFindAttributes = FindAttributes<PointAttributes>;