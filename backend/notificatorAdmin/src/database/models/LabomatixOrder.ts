import { Model } from "sequelize";
import { LabomatixOrderAttributes, LabomatixOrderCreationAttributes } from "../interfaces/LabomatixOrderAttributes";
import { LabomatixOrderStatusType } from "../../types/LabomatixOrderStatusType";

export class LabomatixOrderSequelizeModel extends Model<LabomatixOrderAttributes, LabomatixOrderCreationAttributes> implements LabomatixOrderAttributes {
  id!: number;
  messageId!: number;
  // botMessageId!: number;
  status!: LabomatixOrderStatusType;
  mongoUpdateId!: string;
  packetNumber!: number | null;
  shopId!: number;
  orderDateTime!: Date;
}



export class LabomatixOrder implements LabomatixOrderAttributes {
  protected model: LabomatixOrderSequelizeModel;

  constructor(sequelizeModel: LabomatixOrderSequelizeModel) {
    this.model = sequelizeModel;
  }

  get id() {
    return this.model.id
  }

  // get botMessageId() {
  //   return this.model.botMessageId
  // }

  get messageId() {
    return this.model.messageId
  }

  /** STATUS **/
  get status() {
    return this.model.status
  }

  set status(status: LabomatixOrderStatusType) {
    this.model.status = status
  }

  get mongoUpdateId() {
    return this.model.mongoUpdateId
  }

  /** PACKET NUMBER **/
  get packetNumber() {
    return this.model.packetNumber
  }

  set packetNumber(number: number | null) {
    this.model.packetNumber = number
  }

  get shopId() {
    return this.model.shopId
  }

  set shopId(id: number) {
    this.model.shopId = id;
  }

  get orderDateTime() {
    return this.model.orderDateTime
  }

  save() {
    return this.model.save()
  }

  
}