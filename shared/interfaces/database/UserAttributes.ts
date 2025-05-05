import { CreationAttributes, DeleteAttributes, FindAttributes, UpdateAttributes } from "./BaseAttributes";

export type UserStatusType = 'active' | 'deleted' | 'paused'
export type UserType = 'user' | 'admin' | 'system'
export type TelegramUserProgramType = 'selectPoints' | 'presets'

export interface UserAttributes {
  id: number;
  telegramId: number;
  type: UserType;
  presetStatus: boolean | null;
  status: UserStatusType;
  fullName: string;
  username: string;
  program: TelegramUserProgramType;
  messageId: number | null; // добавлено private
}
  
export type UserCreationAttributes = CreationAttributes<UserAttributes>;
export type UserUpdateAttributes = UpdateAttributes<UserAttributes>;
export type UserDeleteAttributes = DeleteAttributes<UserAttributes>;
export type UserFindAttributes = FindAttributes<UserAttributes>;