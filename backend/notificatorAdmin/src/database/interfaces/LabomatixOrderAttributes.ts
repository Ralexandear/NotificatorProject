import { Optional } from "sequelize";
import { LabomatixOrderStatusType } from "../../types/LabomatixOrderStatusType";

export interface LabomatixOrderAttributes {
  id: number;
  messageId: number;
  // botMessageId: number;
  status: LabomatixOrderStatusType;
  mongoUpdateId: string;
  packetNumber: number | null;
  shopId: number | null,
  orderDateTime: Date | null;
}

export interface LabomatixOrderCreationAttributes extends Optional<LabomatixOrderAttributes, 'id' | 'shopId' | 'orderDateTime'> {}