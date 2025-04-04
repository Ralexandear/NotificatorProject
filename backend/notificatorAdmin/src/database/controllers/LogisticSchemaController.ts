import Logger from "../../Logger"
import { LogisticSchema, LogisticSchemaSequelizeModel } from "../models/LogisticSchema"

export class LogisticSchemaController {
  static async findCurrentCourierId(shopId: number) {
    const day = new Date().getDay()

    Logger.log('Getting schema for shopId', shopId, 'day', day)

    const schema = await LogisticSchemaSequelizeModel.findOne({
      where: {
        shopId, day
      }
    })

    if (! schema) {
      Logger.warn('Schema not found for shopId', shopId, 'day', day);
      return null
    }

    return new LogisticSchema(schema)
  }
}