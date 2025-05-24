import { TelegramUserProgramType, UserAttributes, UserStatusType, UserType } from "../shared/interfaces/database/UserAttributes";

export class User implements UserAttributes {
  id!: number;
  telegramId!: number;
  type!: UserType;
  presetStatus!: boolean | null;
  status!: UserStatusType;
  fullName!: string;
  username!: string;
  program!: TelegramUserProgramType;
  messageId!: number | null; // добавлено private

  private constructor(userAttributes: UserAttributes) {
    Object.assign(this, userAttributes);
  }

  init(userAttributes: UserAttributes) {
    new User(userAttributes)
  }
}