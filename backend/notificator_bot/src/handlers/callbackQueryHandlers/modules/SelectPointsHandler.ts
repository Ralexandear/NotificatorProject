import TelegramBot from "node-telegram-bot-api"
import splitCommand from "../../../utilities/splitCommand"
import Buttons from "../../../messageConstructor/replyMarkup/Buttons"
import { MessageConstructor } from "../../../messageConstructor/MessageConstructor"
import { ShiftSelectorType } from "../../../types/ShiftType"
import PointsController from "../../../../controllers/databaseControllers/PointsController"
import { ShiftSizeType } from "../../../types/ShiftSizeType"
import { User } from "../../../../../../../notificatorNew/src/database/models/public/User"
import { Point } from "../../../../../../../notificatorNew/src/database/models/public/Point"
import { Icons } from "../../../../../../../notificatorNew/src/enums/IconsEnum"




export async function SelectPointsHandler(user: User, callback: TelegramBot.CallbackQuery) {
  if (!callback.data) return

  const sendBusyAlert = async (point: Point, shiftType: ShiftSelectorType) => {
    const { text, reply_markup } = await MessageConstructor.points().pointIsBusy(point, shiftType);
    console.log(reply_markup.inline_keyboard[0][0])
    user.editMessageText(text, { reply_markup })
  }

  const getPoint = async (pointId: string | number) => {
    const id = +pointId;
    if (isNaN(id)) return
    const point = await PointsController.find(id);
    if (!point) {
      console.log('Point with id', pointId, 'notFound')
      return
    };
    return point
  };

  console.log('callbackId', callback.id)
  const { action, params } = splitCommand(callback.data)

  if (Buttons.halfShift().callback_data === action) {
    var shiftSize: ShiftSizeType = 'half'
  } else if (Buttons.fullShift().callback_data === action) {
    var shiftSize: ShiftSizeType = 'full'
  } else if (action === Buttons.setForce().callback_data) {
    const [pointId, shiftType] = params as [string, ShiftSelectorType];
    const point = await getPoint(pointId);
    if (!point) return

    //    await point.setUserToShift(user, shiftType, true);
    var shiftSize: ShiftSizeType = shiftType === 'full' ? 'full' : 'half';
  } else {
    if (action !== Buttons.selectButton().callback_data) return
    const [icon, pointId, shiftType] = params as [Icons, string, ShiftSelectorType];
    var shiftSize: ShiftSizeType = shiftType === 'full' ? 'full' : 'half';

    const point = await getPoint(pointId);
    if (!point) return;


    console.log(icon)
    if (icon === Icons.greenDot) {
      //   await point.removeUser(user, shiftType);
    } else if ([Icons.yellowDot, Icons.redDot].includes(icon as Icons)) {
      // const pointIsSet = await point.setUserToShift(user, shiftType);
      // console.log(pointIsSet)
      // if (! pointIsSet) return sendBusyAlert(point, shiftType);
    } else return
  }

  console.log('ShiftSize is', shiftSize)
  const { text, reply_markup } = await MessageConstructor.points().pointList(user, shiftSize)
  user.editMessageText(text, { reply_markup });
}