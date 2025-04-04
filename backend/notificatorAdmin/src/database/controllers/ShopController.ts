import { Op } from "sequelize";
import { Shop, ShopSequelizeModel } from "../models/Shop";
import Logger from "../../Logger";

export class ShopController {
  static async findByName(...names: (string| null)[]) {
    names = names.filter(e => e); //removing emptiness

    if (! names.length) {
      Logger.warn('No shop name provided!');
      return null;
    }
    
    Logger.log('Searching shop by name', names)
    
    const model = await ShopSequelizeModel.findOne({
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