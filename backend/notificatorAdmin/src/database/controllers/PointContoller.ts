import Logger from "../../Logger";
import { Point, PointSequelizeModel } from "../models/Point";

export class PointController {
  static async getById(pointId: number) {
    Logger.log('Getting point with id', pointId);
    
    const point = await PointSequelizeModel.findByPk(pointId);

    if (! point) {
      Logger.warn('Point with id', pointId, 'not found')
      return null
    }
    return new Point(point);
  } 
}