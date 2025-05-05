import { Model } from "sequelize";
import { ShiftAttributes, ShiftCreationAttributes, ShiftType } from "../../shared/interfaces/database/ShiftAttributes";

export class Shift extends Model<ShiftAttributes, ShiftCreationAttributes> implements ShiftAttributes {
  id!: number;
  date!: Date;
  type!: ShiftType;
  pointId!: number;
  userId!: number;
}