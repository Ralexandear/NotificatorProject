import TelegramBot from "node-telegram-bot-api";
import Buttons from "./Buttons";
import PointsController from "../../../controllers/databaseControllers/PointsController";
import { SelectPointsTempType } from "../../types/TempType";
import { ShiftSelectorType, ShiftType } from "../../types/ShiftType";
import { PresetActionType } from "../../types/PresetActionType";
import { ShiftSizeType } from "../../types/ShiftSizeType";
import Config from "../../../../../../notificatorNew/src/utils/Config";
import { User } from "../../../../../../notificatorNew/src/database/models/public/User";
import { Icons } from "../../../../../../notificatorNew/src/enums/IconsEnum";
import { Point } from "../../../../../../notificatorNew/src/database/models/public/Point";
import { ShiftEnum } from "../../../../../../notificatorNew/src/enums/ShiftEnum";
import { Preset } from "../../../../../../notificatorNew/src/database/models/public/Preset";


type InlineKeyboardRow = TelegramBot.InlineKeyboardButton[];
const maxRowWidth = 4


export class InlineKeyboardReplyMarkup implements TelegramBot.InlineKeyboardMarkup {
  inline_keyboard: TelegramBot.InlineKeyboardButton[][];

  constructor(columns: number, ...buttons: InlineKeyboardRow) {
    const row: InlineKeyboardRow = [];
    this.inline_keyboard = buttons.reduce((arr: InlineKeyboardRow[], button, index) => {
      row.push(button);
      if ((index + 1) % columns === 0 || index === buttons.length - 1) {
        arr.push([...row]);
        row.length = 0;
      }
      return arr;
    }, []);
    if (row.length) this.inline_keyboard.push(row);
  }

  static welcomeMessage(){
    return new InlineKeyboardReplyMarkup(1, Buttons.textToAdmin())
  }

  static errors(){
    return {
      authorizationError(){
        return new InlineKeyboardReplyMarkup(1, Buttons.textToAdmin())
      }
    }
  }

  static orders(chatId: number | string, messageId: number | string) {
    return {
      mainMessage({navLink, orderId} : {navLink?: string, orderId?: string | number} = {}) {
        const buttons: Buttons[] = [];

        if ( navLink ) buttons.push( Buttons.navButton( navLink ) )
        buttons.push( Buttons.linkToMessage( chatId, messageId ))
    
        const reply_markup = new InlineKeyboardReplyMarkup(2, ...buttons);
        if ( orderId ) reply_markup.inline_keyboard.unshift([ Buttons.acceptOrder( orderId )])
        return reply_markup
      },

      listenerMessage(){
        return new InlineKeyboardReplyMarkup(1, Buttons.linkToMessage( chatId, messageId ))
      }
    }
  }

  static menu() {
    return {
      selectPoints(){
        return new InlineKeyboardReplyMarkup(2, Buttons.fullShift(), Buttons.halfShift(), Buttons.calendar())
      },

      async presets(user: User) {
        if (! user.presetStatus) return new InlineKeyboardReplyMarkup(1, Buttons.activate());
        
        const points = await PointsController.getAll()
        const icon = Icons.redPin
        const presetAction: PresetActionType = 'selectPoint'
        const buttons = (points.map(point => Buttons.selectButton(icon + ' ' + point.point, presetAction, point.id)))
        const reply_markup = new InlineKeyboardReplyMarkup(maxRowWidth, ...buttons);
        reply_markup.inline_keyboard.unshift( [ Buttons.deactivate() ] )
        
        return reply_markup
      }
    }
  }

  static points() {
    return {
      async pointList ( user: User, shiftSize: ShiftSizeType ) {
        const points = await PointsController.getAll()      
        // const replyMarkup = new InlineKeyboardReplyMarkup(maxRowWidth);
        
        // const keyboard = replyMarkup.inline_keyboard;
    
        if (shiftSize === 'full') {
          const getButton = (icon: string, point: Point) => Buttons.selectButton(icon + ' ' + point.point + '.2', [icon, point.id, ShiftEnum[ shiftSize ] ].join(Config.delimiter))
          const buttons = points.map(point => {
            const shiftTypes = ['morning', 'evening'] as ShiftType[];

            const icon = (() => {
              //if point is taken by user
              if (shiftTypes.every(shiftType => point.getUserId(shiftType) === user.id)) return Icons.greenDot

              const pointIsVailable = (['morning', 'evening'] as ShiftType[]).every(shiftType => {
                const userId = point.getUserId(shiftType);
                return userId === null || userId === user.id
              })
              
              if (pointIsVailable) return Icons.yellowDot;
              return  Icons.redDot;
            })();
            
            return getButton(icon, point);
          });

          const buttonsToAdd = maxRowWidth - buttons.length % maxRowWidth;
          if (buttonsToAdd !== maxRowWidth) buttons.push( ...new Array(buttonsToAdd).fill(Buttons.emptyButton()) )
    
          return new InlineKeyboardReplyMarkup(maxRowWidth, ...buttons);
        } 

        const buttons =  (['morning', 'evening'] as ShiftType[]).map((shiftType, el) => {
          const postfix = el ? '.1' : ''
          const getButton = (icon: string, point: Point) => Buttons.selectButton(icon + ' ' + point.point + postfix, [icon, point.id, ShiftEnum[ shiftType ]].join(Config.delimiter))
    
          const buttons = points.map(point => {
            const icon = (() => {
              const courierId = point.getUserId(shiftType)
              
              if (courierId === user.id) return Icons.greenDot
              else if (courierId) return Icons.redDot
              return Icons.yellowDot
            })();
            return getButton(icon, point)
          })
    
          const buttonsToAdd = maxRowWidth - buttons.length % maxRowWidth;
          if (buttonsToAdd !== maxRowWidth) buttons.push( ...new Array(buttonsToAdd).fill(Buttons.emptyButton()) )

          return buttons
        });

        buttons.splice(1, 0, new Array(maxRowWidth).fill(Buttons.emptyButton()));
    
        return new InlineKeyboardReplyMarkup(maxRowWidth, ...buttons.flat())
      },

      pointIsBusy( point: Point, shiftType: ShiftSelectorType ) {
        return new InlineKeyboardReplyMarkup(1, Buttons.setForce( point.id, shiftType ))
      }
    }
  }

  static calendar() {
    const getMonthDays = (date: Date): number[][] => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7; // Переводим воскресенье в конец недели
      const daysInMonth = new Date(year, month + 1, 0).getDate();
  
      const weeks: number[][] = [];
      let week: number[] = new Array(7).fill(0);
  
      // Заполняем пустые дни до начала месяца
      let currentDay = 1 - firstDayOfMonth;
  
      for (; currentDay <= daysInMonth; currentDay++) {
          const dayIndex = ((currentDay + firstDayOfMonth - 1) % 7);
          if (currentDay > 0 && currentDay <= daysInMonth) {
              week[dayIndex] = currentDay;
          }
  
          if (dayIndex === 6) {
              weeks.push(week);
              week = new Array(7).fill(0);
          }
      }
  
      // Добавляем последнюю неделю, если в ней есть дни
      if (week.some((d) => d > 0)) {
          weeks.push(week);
      }
  
      return weeks;
    }
    
    const create = (date = new Date()) => {
      const monthDays = getMonthDays(date); // Получаем дни месяца
      const monthName = date.toLocaleString("ru-RU", { month: "long" });
      const year = date.getFullYear();
  
      // Заголовок календаря
      const header = [{ text: `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`, callback_data: date.getTime().toString() }];
  
      // Названия дней недели (на русском)
      const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
      const weekdayRow = weekdays.map((day) => ({ text: day, callback_data: "IGNORE" }));
  
      // Генерация кнопок для дней месяца
      const daysRows = monthDays.map((week) => 
          week.map((day) => ({
              text: day > 0 ? day.toString() : " ",
              callback_data: day > 0 ? `DAY_${day}` : "IGNORE",
          }))
      );
  
      // Кнопки переключения месяцев
      const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  
      const navButtons = [
          { text: "<", callback_data: `PREV"${prevMonth.getMonth() + 1}_${prevMonth.getFullYear()}` },
          { text: ">", callback_data: `NEXT_${nextMonth.getMonth() + 1}_${nextMonth.getFullYear()}` },
      ];
  
      // Сборка клавиатуры
      return {
          inline_keyboard: [
              header,
              weekdayRow,
              ...daysRows,
              navButtons,
          ],
      };
    }

    return {
      create
    }
  }
}

  // static async presets(user: User, selectedPointOrPreset: Point | Preset){
    
  //   const [points, preset, selectedPointId] = await ( async () => {
  //     const pointsPromise = PointsController.getAll()
  //     if (selectedPointOrPreset instanceof Preset) return pointsPromise.then(points => [points, selectedPointOrPreset, selectedPointOrPreset.pointId]);
  //     return Promise.all([pointsPromise, PresetController.getPointPreset(user.id, selectedPointOrPreset.id)]).then(result => [...result, selectedPointOrPreset.id])
  //   })() as [Point[], Preset, number];
    
    
  //   const pointsToListen = new Set(preset?.pointsToListen || []);
  //   const presetAction: PresetActionType = 'selectPreset'; 
  //   const buttons = points.map(point => {
  //     if ( point.id === selectedPointId ) return Buttons.backButton(Icons.redPin + ' ' + point.point, presetAction, point.id);
  //     if ( pointsToListen.has( point.id )) return Buttons.deactivate(Icons.greenDot + ' ' + point.point, presetAction, point.id)
  //     return Buttons.activate(Icons.yellowDot + ' ' + point.point, presetAction, point.id);
  //   })
    
  //   return new InlineKeyboardReplyMarkup(maxRowWidth, ...buttons);
  // }



