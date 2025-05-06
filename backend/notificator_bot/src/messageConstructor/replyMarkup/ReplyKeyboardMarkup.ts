import TelegramBot from "node-telegram-bot-api";
import Buttons from "./Buttons";

type KeyboardButton = Buttons[]
// add in TelegramBot.KeyboardButton property 'toReplyKeyboard' as optional

export default class ReplyKeyboardMarkup implements TelegramBot.ReplyKeyboardMarkup {
  public keyboard: KeyboardButton[] = [];
  public is_persistent: boolean = true;
  public resize_keyboard: boolean = true;
  public input_field_placeholder?: string;

  constructor(columns: number, ...buttons: KeyboardButton) {
    const row: KeyboardButton = [];
    this.keyboard = buttons.reduce((arr: KeyboardButton[], button, index) => {
      if (button.toKeyboardButton) button = button.toKeyboardButton();

      row.push(button);
      if ((index + 1) % columns === 0 || index === buttons.length - 1) {
        arr.push([...row]);
        row.length = 0;
      }
      return arr;
    }, []);
    if (row.length) this.keyboard.push(row);
  }
  
  setInputFieldPlaceholder (text: string){
    this.input_field_placeholder = text;
    return this
  }

  static menu(){
    return new ReplyKeyboardMarkup(2, Buttons.selectPoints(), Buttons.presets(), Buttons.status()) //.setInputFieldPlaceholder('ex: Chicago')
  }

}




