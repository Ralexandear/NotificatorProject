// import { User } from "../database/models";

import PointsController from "../../controllers/databaseControllers/PointsController"
import { Point } from "../../../../../notificatorNew/src/database/models/public/Point"
import { User } from "../../../../../notificatorNew/src/database/models/public/User"
import { PostfixEnum } from "../../../../../notificatorNew/src/enums/PostfixEnum"
import { ShiftSelectorType, ShiftType } from "../types/ShiftType"

const getDateString = (date = new Date()) => date.toLocaleDateString('ru', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
const getUserlink = (user: User) => `<a href="t.me/${user.username}">${user.fullName}</a>`

export class MessageTextClass {
  // private user: User

  // constructor( user: User ){
  //   this.user = user
  // };

  welcomeMessage() {
    return `Бот для получения заказов СНК. Для подключения, напишите администратору`
  }

  menu() {
    return {
      mainMenu() {
        return 'Кнопки меню обновлены!'
      },

      presets() {
        return 'Пресеты позволяют получать дополнительные уведомления о заказах выбранных курьеров'
      },

      selectPoints() {
        return 'Какие смены желаете выбрать?'
      },

      async status(user: User) {
        const points = await PointsController.getAll();
        const currentPoints: string[] = [];
        const shiftTypes: ShiftType[] = ['morning', 'evening']

        for (const e of points) {
          const result = shiftTypes.reduce((res, shiftType) => {
            const userId = e.getUserId(shiftType);
            if (userId !== user.id) return res

            if (res) return e.point + PostfixEnum.full; // if res, means first half is checked
            if (shiftType === 'morning') return e.point + PostfixEnum.morning
            if (shiftType === 'evening') return e.point + PostfixEnum.evening
          }, undefined as string | undefined);

          if (result) currentPoints.push(result);
        }

        return [
          getDateString(),
          'Точки на сегодня:',
          '',
          (currentPoints.join(', ') || 'Нет выбранных точек') + ';'
        ].join('\n')
      }


    }
  }

  errors() {
    return {
      usernameIsMissing() {
        return '⚠️ Использование бота невозможно без никнейма.\n🔄Пожалуйста, установите никнейм и повторите попытку!'
      },

      authorizationError() {
        return `❗️Ошибка авторизации\nДля получения дополнительной информации, обратитесь к администратору!`
      }
    }
  }

  orders(specialOrderType: string, messageText: string) {
    return {
      mainMessage() {
        return [specialOrderType, messageText].join('\n\n')
      },

      listenerMessage(pointNum: string | number, deliveryTime?: string) {
        let text = `У курьера К${pointNum} новый заказ\n\nТип: ${specialOrderType}`
        if (deliveryTime) text += '\n\nДоставить до: ' + deliveryTime
        return text
      },

      acception(user: User) {
        return `✅ ${getUserlink(user)} принял заказ в работу`
      }
    }
  }

  points() {
    return {
      pointList() {
        return getDateString()
      },

      async pointIsBusy(point: Point, shiftTypeToSelect: ShiftSelectorType) {
        const textArray = [getDateString(), '']

        const shiftTypes: ShiftType[] = shiftTypeToSelect === 'full' ? ['morning', 'evening'] : [shiftTypeToSelect]

        for (const shiftType of shiftTypes) {
          const user = await point.getUser(shiftType);
          const postfix = PostfixEnum[shiftType];
          textArray.push(point.point + postfix + ': ' + (user === null ? '🟢' : getUserlink(user)))
        }

        return textArray.join('\n')
      }
    }
  }

  notifications() {
    return {
      pointLost(user: User, point: string) {
        return [getUserlink(user), 'принудительно занял точку', point].join(' ')
      }
    }
  }

  presets(selectedPoint: Point) {
    return `Настройки пресетов для точки: ${selectedPoint.point}`
  }

  calendar() {
    return 'Выберите дату'
  }


}

export const MessageText = new MessageTextClass()
export default MessageText;