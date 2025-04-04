import Logger from "../../Logger";
import { LabomatixOrderStatusType } from "../../types/LabomatixOrderStatusType";
import { LabomatixOrder, LabomatixOrderSequelizeModel } from "../models/LabomatixOrder";

export class LabomatixOrderController {
  static async create(messageId: number, mongoUpdateId: string, status: LabomatixOrderStatusType = 'created') {
    Logger.info('Saving new Labomatix order in database for:', {messageId, mongoUpdateId, status} );

    const [orderSequelizeModel, isNew] = await LabomatixOrderSequelizeModel.findOrCreate({
      where: {
        messageId
      },
      defaults: {
       mongoUpdateId, messageId, status, 
      }
    });

    if (! isNew) {
      Logger.warn('Order with same messageId already exists:', {messageId, mongoUpdateId, status} );
    }

    return new LabomatixOrder(orderSequelizeModel);
  }
}