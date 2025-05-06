//@ts-nocheck
import TelegramBot from "node-telegram-bot-api"
import PointsController from "../../../../controllers/databaseControllers/PointsController"
import { ShiftType } from "../../../types/ShiftType"
import { MessageConstructor } from "../../../messageConstructor/MessageConstructor"
import { googleMapsGeocoder } from "../../../utilities/googleMapsGeocoder"

const getNaviLink = (latitude: number | string, longitude: number | string) => 'https://yandex.ru/navi/?whatshere%5Bzoom%5D=18&whatshere%5Bpoint%5D='+longitude+'%2C'+latitude


function killEmojis (text: string){
  const regex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FAB0}-\u{1FAB6}\u{1FAC0}-\u{1FAC2}\u{1FAD0}-\u{1FAD6}\u{1F920}-\u{1F927}\u{1F9D0}-\u{1F9E6}\u{1F910}-\u{1F91E}]/gu;
  
  return text.replace(regex, '')
}

type OrderType = 'customer' | 'center'

class MessageDestructor {
  readonly rawMessage: string;
  
  messageText: string
  orderType: OrderType | undefined
  orderId: number | undefined
  chatId: number | undefined
  messageId: number | undefined
  courierCode: string | undefined
  private _linkToMessage: string | undefined
  specialOrderType: string



  constructor( messageText: string ){
    this.rawMessage = this.messageText = killEmojis(messageText);
    this.specialOrderType =  '🛴 Самокат'
  }

  throwError(text: string): never{
    throw new Error(MessageDestructor.name + ' ' + text)
  }

  setOrderId(orderId: number){
    this.orderId = orderId
    return this
  }
  
  setOrderType( orderType: OrderType ) {
    this.orderType = orderType;
    return this
  }


  setChatId(chatId: number | undefined){
    if (! chatId) this.throwError('ChatId is missing')
    this.chatId = chatId
    return this
  }

  setMessageId(messageId : number | undefined){
    if (! messageId) this.throwError('MessageId is missing')
    this.messageId = messageId;
    return this
  }

  // extractDeliveryTime(){
  //   const regex = /\D\d\d.\d\d/;
  //   const match = this.messageText.match(regex);

  //   if (match){
  //     this.messageText = this.messageText.replace(regex, ' ');
  //     console.log('Delivery time is', this.deliveryTime = match[0].replace(/\s/g, ''))
  //   }
  //   return this
  // }

  getPointProperties(){
    const regex = /(^|\s)к\s?\d{1,2}(\s*\.1)?/i; // Регулярное выражение для поиска "К" и последующих цифр
    const match = this.messageText.match(regex); // Поиск соответствия в сообщении

    if (match){
      this.messageText = this.messageText.replace(regex, '');
      const courierCode = this.courierCode =  match[0].replace(/\D/g, ''); // Получение найденного кода курьера

      if (courierCode.includes('.1')){
        var shiftType = 'evening'
        var pointNumber = courierCode.replace('.1','')
      } else {
        var shiftType = 'morning'
        var pointNumber = courierCode
      }
      
      return {shiftType, pointNumber}
    }
  }

  get linkToMessage () {
    if (! this.chatId) this.throwError('Chat id is missing');
    return this._linkToMessage ?? (this._linkToMessage = `t.me/c/${this.chatId.toString().substring(4)}/${this.messageId}`)
  }

  extractSpecialOrderType(){
    const regex =  /(\s|[^а-я])(лабо?м?а?т|лбм)/i

    if (regex.test(this.messageText)){
      this.messageText = this.messageText.replace(regex, '')
      this.specialOrderType = '🧪 Лабомат'
    }
    else this.specialOrderType = '❗️ Cito/Аг ❗️'
    
    console.log('Special order type:', this.specialOrderType);
    return this
  }

  getAddress(){
    const regex = /(?:Адрес доставки\s*:?\s*)?(спб|санкт\s*.{0,1}\s*петербург)|(\bули?ц?а?\.?|д\.?|дом|про?с?п?е?к?т(\.|\-)?|проспект|ко?р?п?у?с\.?(\d+|\s*))\s*\d+/i
    const array = this.messageText.split('\n')//.reduce((arr, e) => {
  
    for (let e of array){
      if (regex.test(e)){
        const address = e.replace(/Адрес доставки\s*.?\s*/gi, "").replace(/кв\.\s*\d+/gi, '').replace(/,/g, '')
        
        console.log('Address detected:', address)
        return address
      }
    }
  }

}



export default async function NotificatorHandler( message: TelegramBot.Message ){
  try{
    console.log('Notificator, messageId', message.message_id);
    const messageData = extractDataFromMessage(message);
    
    if (! messageData) return

    const pointProperties = messageData.getPointProperties()
    if (! pointProperties) return console.log('There is no point properties');
    
    const {pointNumber, shiftType} = pointProperties;
    const point = await PointsController.find( pointNumber );

    const [courier, listeners] = await Promise.all(
      [point.getUser(shiftType as ShiftType), point.listeners(shiftType as ShiftType).get()]
    );

    const pointDesc = `К${pointNumber}, тип ${shiftType}, messageId: ${message.message_id}`;

    const {specialOrderType, rawMessage, chatId, messageId, orderId} = messageData
    if ( chatId === undefined || messageId === undefined ) throw new Error('Required parameter "chatId" is missing');
    const messageConstructor = MessageConstructor.orders(specialOrderType, rawMessage, chatId, messageId)
    
    if (courier){
      console.log('Sending of message to main courier is ready');
      const address = messageData.getAddress(); //извлекаем адрес из текста сообщения
      
      console.log('courierName:', courier.name)

      const navLink = await ( async () => {
        if (! address) return;

        const response = await googleMapsGeocoder(address);
        if (response) return getNaviLink(response.latitude, response.longitude)
      })()
      .catch(err => console.error('При получении данных геокодера произошла ошибка!', err));

      [messageData.specialOrderType, messageData.rawMessage, messageData.chatId, messageData.messageId]
        .forEach(e => { if (e === undefined) throw new Error('One of required parameters has undefined value')})
      //@ts-ignore
      const {text, reply_markup} = MessageConstructor.orderMainMessage(specialOrderType, rawMessage, chatId, messageId, {navLink, orderId})
      courier.sendMessage(text, { reply_markup })
    } else {
      console.log('Main reciever was not found, pointdata', pointDesc)
    }


    if (! listeners) {
      console.log('Listeners not found for pointData', pointDesc)
      return
    }

    const {text, reply_markup} = messageConstructor.listenerMessage( pointNumber )
    const informedUsers: Set<number> = new Set()
    
    listeners.forEach(user => {
      const userId = user.id;
      if (informedUsers.has( userId )) return
      informedUsers.add( userId );

      user.sendMessage(text, { reply_markup })
      console.log('Сообщение слушателя успешно добавлено в очередь, получатель:', user.fullName);

    })
  } catch (e) {
    if (e instanceof Error)
    console.error(['Unhandled error catched at ' + e.stack, e.message].join('\n'))
  }
}



function extractDataFromMessage( message: TelegramBot.Message ): undefined | MessageDestructor {
  const
    chatId = message.chat.id,
    messageText = message.text,
    messageId = message.message_id;

  if (! messageText) {
    console.log('Message text was not found!')
    return
  }

  const messageData = new MessageDestructor(messageText)

  if ( [-1001190624063, -1001904761313].includes(chatId) ){
    console.log(messageId, 'Order type: САМОКАТ')
    if(! message.hasOwnProperty("is_automatic_forward")) {
      console.log("Message is not order");
      return
    }

    messageData
      .setOrderId(message.message_id)
      .setOrderType('customer')
      .setChatId(message.sender_chat?.id)
      .setMessageId(message.forward_from_message_id)   
  }
  //@ts-ignore
  else if (! [, 1479922579].includes(message.from?.id)) {
    console.log('Sender is not administrator')
    return 
  }
  else { //if антиген
    console.log('Order type: АНТИГЕН')

    messageData
      .setChatId(chatId)
      .setOrderType('center')
      .setMessageId( message.message_id)
      // .extractDeliveryTime()
      .extractSpecialOrderType()
  }
  return messageData
}
