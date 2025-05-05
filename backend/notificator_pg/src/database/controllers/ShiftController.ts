import { Shift } from "../models/Shift";
import BaseController from "./BaseController";

class ShiftControllerClass extends BaseController<Shift> {
  constructor() {
    super(Shift);
  }
}

export const ShiftController = new ShiftControllerClass()
export default ShiftController;