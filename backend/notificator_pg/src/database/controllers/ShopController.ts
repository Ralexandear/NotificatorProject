import { Op } from "sequelize";
import { Shop } from "../models/Shop";
import Logger from "../../shared/utils/Logger";
import BaseController from "./BaseController";

class ShopControllerClass extends BaseController<Shop> {
  constructor() {
    super(Shop)
  }

  static async find(...names: (string| null)[]) {
    names = names.filter(e => e); //removing emptiness

    if (! names.length) {
      Logger.warn('No shop name provided!');
      return null;
    }
    
    Logger.log('Searching shop by name', names)
    
    const model = await Shop.findOne({
      where: {
        [Op.or]: [
          ...names.map(name => ({ name: { [Op.iLike]: name } })),
          ...names.map(name => ({ alterName: { [Op.iLike]: name } }))
        ]
      }
    })

    if (! model) {
      Logger.warn(`Shop with name from list"${names}" not found!`)
      return null
    }

    Logger.log(`Shop found. Name:`, model.name, 'id', model.id)
    return new Shop(model)
  }
}

export const ShopController = new ShopControllerClass();
export default ShopController;