import { Op } from "sequelize";
import { Shop } from "../models/Shop";
import Logger from "../../shared/utils/Logger";
import BaseController from "./BaseController";

class ShopControllerClass extends BaseController<Shop> {
  constructor() {
    super(Shop)
  }

  async findByName(...names: (string| null)[]) {
    names = names.filter(e => e); //removing emptiness

    if (! names.length) {
      Logger.warn('No shop name provided!');
      return null;
    }
    
    Logger.log('Searching shop by name', names)
    
    const shop = await Shop.findOne({
      where: {
        [Op.or]: [
          ...names.map(name => ({ name: { [Op.iLike]: name } })),
          ...names.map(name => ({ alterName: { [Op.iLike]: name } }))
        ]
      }
    })

    if (! shop) {
      Logger.warn(`Shop with name from list"${names}" not found!`)
      return null
    }

    Logger.log(`Shop found. Name:`, shop.name, 'id', shop.id)
    return shop
  }
}

export const ShopController = new ShopControllerClass();
export default ShopController;