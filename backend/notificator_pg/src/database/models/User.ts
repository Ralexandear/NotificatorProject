import { Model } from "sequelize";
import { TelegramUserProgramType, UserAttributes, UserCreationAttributes, UserStatusType, UserType } from "../../shared/interfaces/database/UserAttributes";

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  id!: number;
  telegramId!: number;
  type!: UserType;
  presetStatus!: boolean | null;
  status!: UserStatusType;
  fullName!: string;
  username!: string;
  program!: TelegramUserProgramType;
  messageId!: number | null; // добавлено private
}