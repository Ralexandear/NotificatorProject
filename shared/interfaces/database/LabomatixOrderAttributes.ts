
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

export interface LabomatixOrderCreationAttributes extends Omit<LabomatixOrderAttributes, 'id' | 'shopId'> {}

export type LabomatixOrderUpdateAttributes = { id: number } & Partial<LabomatixOrderAttributes>;
export type LabomatixOrderDeleteAttributes = {id: number};
export type LabomatixOrderFindAttributes = Partial<LabomatixOrderAttributes>;
