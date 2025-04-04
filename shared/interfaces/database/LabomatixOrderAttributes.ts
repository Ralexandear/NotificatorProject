import { Optional } from "sequelize";

export type LabomatixOrderStatusType = 'CREATED' | 'PROCESSING' | 'FINISHED' | 'ERROR'

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

export type LabomatixOrderUpdateAttributes = { id: number } & Partial<LabomatixOrderAttributes>;
export type LabomatixOrderDeleteAttributes = {id: number};
export type LabomatixOrderFindAttributes = Partial<LabomatixOrderAttributes>;
