export type CreationAttributes<T extends { id?: any }> = Omit<T, 'id'>;
export type FindAttributes<T> = Partial<T>;
export type UpdateAttributes<T extends { id: any }> = { id: T['id'] } & Omit<Partial<T>, 'id'>;
export type DeleteAttributes<T extends { id: any }> = Pick<T, 'id'>;