import { User } from "../models/User";
import BaseController from "./BaseController";

class UserControllerClass extends BaseController<User> {
  constructor() {
    super(User);
  }
}

export const UserController = new UserControllerClass()
export default UserController;