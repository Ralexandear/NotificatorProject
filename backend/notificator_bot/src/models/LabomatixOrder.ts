import { LabomatixOrderAttributes, LabomatixOrderStatusType } from "../shared/interfaces/database/LabomatixOrderAttributes";

export class LabomatixOrder implements LabomatixOrderAttributes {
  id!: number;
  messageId!: number;
  // botMessageId!: number;
  status!: LabomatixOrderStatusType;
  mongoUpdateId!: string;
  packetNumber!: number | null;
  shopId!: number | null;
  orderDateTime!: Date;
}