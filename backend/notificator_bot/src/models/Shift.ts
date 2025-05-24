import { ShiftAttributes, ShiftType } from "../shared/interfaces/database/ShiftAttributes";

export class Shift implements ShiftAttributes {
  id!: number;
  date!: Date;
  type!: ShiftType;
  pointId!: number;
  userId!: number;
}