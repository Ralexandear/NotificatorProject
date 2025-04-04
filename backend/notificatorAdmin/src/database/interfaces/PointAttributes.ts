import { Optional } from "sequelize";

export interface PointAttributes {
  id: number;
  name: string;
  isActive: boolean;
}

export interface PointCreationAttributes extends Optional<PointAttributes, 'id' | 'isActive'> {}