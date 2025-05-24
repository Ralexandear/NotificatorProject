import { CreationAttributes, DeleteAttributes, FindAttributes, UpdateAttributes } from "./BaseAttributes";

export type LabomatixOrderStatusType = 'CREATED' | 'PROCESSING' | 'FINISHED' | 'ERROR'

export interface LabomatixOrderAttributes {
  id: number;
  messageId: number;
  // botMessageId: number;
  status: LabomatixOrderStatusType;
  mongoUpdateId: string;
  packetNumber: number | null;
  shopId: number | null,
}

export type LabomatixOrderCreationAttributes = Omit< CreationAttributes<LabomatixOrderAttributes>, 'shopId'>
export type LabomatixOrderUpdateAttributes = UpdateAttributes<LabomatixOrderAttributes>
export type LabomatixOrderDeleteAttributes = DeleteAttributes<LabomatixOrderAttributes>
export type LabomatixOrderFindAttributes = FindAttributes<LabomatixOrderAttributes>
