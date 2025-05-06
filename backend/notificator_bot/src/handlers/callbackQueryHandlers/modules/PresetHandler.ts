import TelegramBot from "node-telegram-bot-api";
import splitCommand from "../../../utilities/splitCommand";
import Buttons from "../../../messageConstructor/replyMarkup/Buttons";
import { MessageConstructor } from "../../../messageConstructor/MessageConstructor";
import { PresetActionType } from "../../../types/PresetActionType";
import BotError from "../../../../../../../notificatorNew/src/Errors/BotError";
import PointsController from "../../../../controllers/databaseControllers/PointsController";
import { User } from "../../../../../../../notificatorNew/src/database/models/public/User";
import { Preset } from "../../../../../../../notificatorNew/src/database/models/public/Preset";



async function getSelectedPoint(pointId: string | number) {
  if (typeof pointId === 'string') {
    const string = pointId;
    pointId = +pointId;
    if (isNaN(pointId)) {
      throw BotError.cannotParseInt(string)
    }
  }
  return PointsController.find(pointId)
}



async function openPresetMenu(user: User) {
  const { text, reply_markup } = await MessageConstructor.menu().presets(user);
  user.editMessageText(text, { reply_markup })
  return
}



export async function PresetHandler(user: User, callback: TelegramBot.CallbackQuery) {
  if (!callback.data) return;

  const { action, params } = splitCommand(callback.data);
  const [presetAction, pointId] = params as [PresetActionType | undefined, string | undefined]
  var preset: undefined | Preset

  if (presetAction === undefined) { //отвечает за активацию и деактивацию пресета глобально
    if (action === Buttons.activate().callback_data) {
      // user.preset().activate();
    } else if (action === Buttons.deactivate().callback_data) {
      // user.preset().deactivate();
    }
    openPresetMenu(user)
    return
  } else if (pointId === undefined) {
    throw new BotError('Unexpected point id: ' + pointId);
  }

  if (presetAction === 'selectPoint') {
    var selectedPoint = await getSelectedPoint(pointId)
  } else if (presetAction === 'selectPreset') {

    if (action === Buttons.backButton().callback_data) {
      openPresetMenu(user)
      return
    }

    const selectedPointId = (() => {
      const inlineKeyboard = callback.message?.reply_markup?.inline_keyboard;
      if (!inlineKeyboard) throw new ReferenceError('inlineKeyboard is missing, but required!')

      const backButton = Buttons.backButton()
      for (const row of inlineKeyboard) {
        for (const button of row) {
          if (button.callback_data === undefined) continue;

          const { action, params } = splitCommand(button.callback_data);
          if (backButton.callback_data === action) return params[1]
        }
      }
      throw new Error('Selected point not found in reply markup!')
    })();

    var selectedPoint = await getSelectedPoint(selectedPointId);
    // preset = await user.preset().getPointPreset(selectedPoint.id);

    // if (action === Buttons.activate().callback_data) {
    //   await preset.addPointsToListen(pointId)
    // } else if (action === Buttons.deactivate().callback_data){
    //   await preset.removePointsToListen(pointId)
    // } else {
    //   console.log('Unhandled request, unsupported action', action as string);
    //   return
    // }
  } else {
    console.log('Unhandled request, unsupported presetAction', presetAction as string);
    return
  }

  // const {text, reply_markup} = await MessageConstructor.presets(user, selectedPoint, preset);
  // user.editMessageText(text, {reply_markup})
  return
}

export default PresetHandler