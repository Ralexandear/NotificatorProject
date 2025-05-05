import { Point } from "../models/Point";
import { BaseController } from "./BaseController";

class PointControllerClass extends BaseController<Point> {
  constructor() {
    super(Point);
  }
}

export const PointController = new PointControllerClass()
export default PointController;