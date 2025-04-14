import { LabomatixOrderAttributes, LabomatixOrderCreationAttributes, LabomatixOrderDeleteAttributes } from "../../shared/interfaces/database/LabomatixOrderAttributes";
import { LabomatixOrder } from "../models/LabomatixOrder";
import BaseController from "./BaseController";

export class LabomatixOrderControllerClass extends BaseController<LabomatixOrder, LabomatixOrderAttributes, LabomatixOrderCreationAttributes> {
  constructor() {
    super(LabomatixOrder)
  }

}

export const LabomatixOrderController = new LabomatixOrderControllerClass();
export default LabomatixOrderController