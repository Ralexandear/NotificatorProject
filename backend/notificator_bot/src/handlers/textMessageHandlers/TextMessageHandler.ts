import TelegramBot from "node-telegram-bot-api";
import { botInitializationPromise } from "../..";
import NotificatorHandler from "./modules/NotificatorHandler";
import UserController from "../../../controllers/databaseControllers/UserController";
import { MessageConstructor } from "../../messageConstructor/MessageConstructor";
import MenuHandler from "./modules/MenuHandler";
import { UserModel } from "../../../../../../notificatorNew/src/database/models/sequelize/User.model";
import { UserStatusEnum } from "../../../../../../notificatorNew/src/enums/UserStatus.enum";
import { User } from "../../../../../../notificatorNew/src/database/models/public/User";
import { AuthError } from "../../../../../../notificatorNew/src/Errors/AuthError";



export async function TextMessageHandler(message: TelegramBot.Message) {
  await botInitializationPromise;
  try {
    console.log(TextMessageHandler.name, message);
    if (message?.chat?.type !== 'private') return NotificatorHandler(message);

    const telegramId = message.chat.id.toString()
    const user = await UserController.find(telegramId);
    const messageText = message.text;

    // if (! CommandsFreezer.isNewCommand(telegramId, messageText)) {
    //   user.deleteMessage(message.message_id);
    //   return
    // }
    const checkUsername = async (user: User) => {
      if (message.chat?.username) return

      const { text } = MessageConstructor.errors().usernameIsMissing()
      await user.sendMessage(text)
      throw AuthError.usernameIsMissing(user.telegramId)
    }

    if (!user) {
      const notUser = User.init(
        UserModel.build({
          telegramId,
          fullName: [message.from?.first_name, message.from?.last_name].join(' ') || 'Неопознанная лама',
          username: message.from?.username || '',
          status: UserStatusEnum.active
        },
          { isNewRecord: false }
        )
      )

      if (messageText === 'veryFunny') {
        await checkUsername(notUser)

        const user = await UserController.create(notUser.telegramId, notUser.fullName, notUser.username)
        user.openMenu(`Авторизация успешно завершена!`)
        return
      }

      if (messageText === '/start') {
        var { text, reply_markup } = MessageConstructor.welcomeMessage()
        notUser.sendSticker('https://cdn.tlgrm.app/stickers/a02/150/a02150f8-6e7d-4269-aa3b-2097aafc2f32/256/5.webp');
      } else {
        var { text, reply_markup } = MessageConstructor.errors().authorizationError();
      }

      notUser.sendMessage(text, { reply_markup })
      return
    }

    console.log('Пользователь:', user.fullName, 'id', user.id, 'Сообщение:', messageText);
    await checkUsername(user)
    user.checkUsername(message.chat.username as string)

    if (user.status !== UserStatusEnum.active) {
      const { text, reply_markup } = MessageConstructor.errors().authorizationError();
      user.sendMessage(text, { reply_markup })
      return
    }

    if (messageText && ['/start', '/menu'].includes(messageText)) {
      user.openMenu()
      return
    }

    await MenuHandler(user, message)
    await user.save()
  } catch (e) {
    console.error(e)
  }
}