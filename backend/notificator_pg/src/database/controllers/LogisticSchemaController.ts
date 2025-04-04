import Logger from "../../shared/utils/Logger"
import { LogisticSchema } from "../models/LogisticSchema"
import BaseController from "./BaseController"

class LogisticSchemaControllerClass extends BaseController<LogisticSchema> {
  constructor() {
    super(LogisticSchema)
  }
}

export const LogisticSchemaController = new LogisticSchemaControllerClass();
export default LogisticSchemaController