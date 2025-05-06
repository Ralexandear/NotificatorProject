import { ShiftSizeType } from "./ShiftSizeType";

export type SelectPointsTempType = {
  shiftSizeType: ShiftSizeType,
}

export type EmptyTempType = {};
export type TempType = SelectPointsTempType | EmptyTempType