import { RabbitMQRequest } from "../../RabbitMQ";
import Logger from "../../shared/utils/Logger";

export class ShopController {
  static async findByName(...names: (string| null)[]) {
    names = names.filter(e => e); //removing emptiness

    if (! names.length) {
      Logger.warn('No shop name provided!');
      return null;
    }
    
    Logger.log('Searching shop by name', names)
    
    const response = await new RabbitMQRequest(
      'notificator-db-shop-requests',
      'FIND',
      {
        names: names as string[]
      }
    ).send()

    Logger.log('Shop found', JSON.stringify(response))

    return response
  }
}