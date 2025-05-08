import { RabbitMQRequest } from "../../RabbitMQ";
import { LabomatixOrderFindAttributes, LabomatixOrderStatusType, LabomatixOrderUpdateAttributes } from "../../shared/interfaces/database/LabomatixOrderAttributes";

const topic = 'notificator-db-labomatix-order-requests'
export class LabomatixOrderController {
  static async create(messageId: number, mongoUpdateId: string, packetNumber = null, status: LabomatixOrderStatusType = 'CREATED') {
    const response = await new RabbitMQRequest(
      topic,
      'CREATE',
      {
        messageId,
        mongoUpdateId,
        status,
        packetNumber
      }
    ).send()

    return response
  }

  static async update(attributes: LabomatixOrderUpdateAttributes) {
    const response = await new RabbitMQRequest(
      topic,
      'UPDATE',
      attributes
    ).send()

    return response
  }

  static async find(attributes: LabomatixOrderFindAttributes) {
    const response = await new RabbitMQRequest(
      topic,
      'FIND',
      attributes
    ).send()

    return response

  }

  static async delete(id: number) {
    const response = await new RabbitMQRequest(
      'notificator-db-labomatix-order-requests',
      'DELETE',
      {id}
    ).send()

    return response
  }
}
