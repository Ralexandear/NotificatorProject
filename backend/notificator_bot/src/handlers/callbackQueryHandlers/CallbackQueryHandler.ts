import TelegramBot from "node-telegram-bot-api";
import { User } from "../../../../../../notificatorNew/src/database/models/public/User";
import { SelectPointsHandler } from "./modules/SelectPointsHandler";
import PresetHandler from "./modules/PresetHandler";
import { AcceptOrderHandler } from "./modules/AcceptOrderHandler";
import Buttons from "../../messageConstructor/replyMarkup/Buttons";
import splitCommand from "../../utilities/splitCommand";
import { AuthError } from "../../../../../../notificatorNew/src/Errors/AuthError";
import { MessageConstructor } from "../../messageConstructor/MessageConstructor";
import UserController from "../../../controllers/databaseControllers/UserController";
import { botInitializationPromise } from "../..";

export async function CallbackQueryHandler(callback: TelegramBot.CallbackQuery) {
  try {
    await botInitializationPromise;
    console.log("New callback", callback);

    const telegramId = callback.from.id.toString();
    const user = await UserController.find(telegramId);

    if (!user) return;

    const username = callback.from.username;
    if (!username) {
      const { text, reply_markup } = MessageConstructor.errors().usernameIsMissing();
      await user.sendMessage(text, { reply_markup });
      throw AuthError.usernameIsMissing(telegramId);
    }

    user.checkUsername(username);

    if (!callback.data) {
      console.warn("Callback data is missing:", callback);
      return;
    }

    const { action } = splitCommand(callback.data);
    console.log(`User: ${user.fullName} (${user.id}), Action: ${action}`);

    if (action === Buttons.acceptOrder().callback_data) {
      await AcceptOrderHandler(user, callback);
    } else {
      await handleProgramAction(user, callback, action);
    }

    await user.save();
  } catch (e) {
    console.error("Error in CallbackQueryHandler", { error: e, callback });
  }
}



async function handleProgramAction(user: User, callback: TelegramBot.CallbackQuery, action: string) {
  let handler;
  switch (user.program) {
    case "selectPoints":
      if (action === Buttons.calendar().callback_data) {
        var { text, reply_markup } = MessageConstructor.calendar()
      } else {
        handler = SelectPointsHandler;
        break;
      }
      await user.editMessageText(text, { reply_markup })
      return
    case "presets":
      handler = PresetHandler;
      break;
    default:
      console.warn(`Unhandled program: ${user.program}`);
      return;
  }

  console.log(`Selected handler: ${handler.name}`);
  await handler(user, callback);
}
