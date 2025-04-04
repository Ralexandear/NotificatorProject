import { LabomatixOrder } from "../models/LabomatixOrder";
import BaseController from "./BaseController";

export class LabomatixOrderControllerClass extends BaseController<LabomatixOrder> {
  constructor() {
    super(LabomatixOrder)
  }

}

export const LabomatixOrderController = new LabomatixOrderControllerClass();
export default LabomatixOrderController