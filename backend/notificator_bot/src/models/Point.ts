import { PointAttributes } from "../shared/interfaces/database/PointAttributes";

export class Point implements PointAttributes {
  readonly id!: number;
  name!: string;
  isActive!: boolean;
}