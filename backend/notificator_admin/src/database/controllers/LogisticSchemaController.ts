import { RabbitMQRequest } from "../../RabbitMQ";
import Logger from "../../shared/utils/Logger";

export class LogisticSchemaController {
  static async findCurrentCourierId(shopId: number) {
    const day = new Date().getDay()

    Logger.log('Getting schema for shopId', shopId, 'day', day)

    const response = await new RabbitMQRequest(
      'notificator-db-logistic-requests',
      'FIND',
      {
        shopId,
        day
      }
    ).send()

    Logger.log('Schema for shopId', shopId, 'day', day, JSON.stringify(response))

    return response
  }
}