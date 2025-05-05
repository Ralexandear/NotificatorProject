import { CreationAttributes, DeleteAttributes, FindAttributes, UpdateAttributes } from "./BaseAttributes";

export type ShiftType = 'main' | 'listener'

export interface ShiftAttributes {
  id: number;
  date: Date;
  type: ShiftType;
  pointId: number;
  userId: number;
}

export type ShiftCreationAttributes = CreationAttributes<ShiftAttributes>;
export type ShiftUpdateAttributes = UpdateAttributes<ShiftAttributes>;
export type ShiftDeleteAttributes = DeleteAttributes<ShiftAttributes>;
export type ShiftFindAttributes = FindAttributes<ShiftAttributes>;