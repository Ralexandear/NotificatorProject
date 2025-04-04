import { Model } from "sequelize";
import { LabomatixOrderAttributes, LabomatixOrderCreationAttributes, LabomatixOrderStatusType } from "../../shared/interfaces/database/LabomatixOrderAttributes";

export class LabomatixOrder extends Model<LabomatixOrderAttributes, LabomatixOrderCreationAttributes> implements LabomatixOrderAttributes {
  id!: number;
  messageId!: number;
  // botMessageId!: number;
  status!: LabomatixOrderStatusType;
  mongoUpdateId!: string;
  packetNumber!: number | null;
  shopId!: number;
  orderDateTime!: Date;
}