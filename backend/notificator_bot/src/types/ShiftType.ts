import { ShiftEnum } from "../../../../../notificatorNew/src/enums/ShiftEnum";

export type ShiftSelectorType = keyof typeof ShiftEnum;
export type ShiftType = Exclude<ShiftSelectorType, "full">
