
export interface LogisticSchemaAttributes {
  id: number;
  pointId: number;
  day: number; //js format
  shopId: number;
}

export interface LogisticSchemaCreationAttributes extends Omit<LogisticSchemaAttributes, 'id'> {}

export type LogisticSchemaUpdateAttributes = { id: number } & Partial<LogisticSchemaAttributes>;
export type LogisticSchemaDeleteAttributes = {id: number};
export type LogisticSchemaFindAttributes = Partial<LogisticSchemaAttributes>;