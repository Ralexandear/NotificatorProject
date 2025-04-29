import { LabomatixOrderController } from "../database/controllers/LabomatixOrderController";
import { ValidationError } from "../shared/errors/ValidationError";
import { RabbitActionType, RabbitPostgresRequestAttributes, RabbitRequestTopicNameType } from "../shared/interfaces/RabbitRequestAttributes";

export async function LabomatixOrderEventHandler(event: RabbitPostgresRequestAttributes<RabbitRequestTopicNameType, RabbitActionType>) {
  if (event.topic !== 'notificator-db-labomatix-order-requests') {
    throw new Error('Invalid topic in request' + JSON.stringify(event))
  };

  switch (event.action) {
    case 'CREATE':
      return LabomatixOrderController.create(event.data);

    case 'FIND_OR_CREATE':
      return LabomatixOrderController.findOrCreate(event.data)

    case 'UPDATE':
      return LabomatixOrderController.update({ id: event.data.id }, event.data)

    case 'DELETE':
      return LabomatixOrderController.delete(event.data.id)

    case 'GET':
      if (event.data.id === undefined || typeof event.data.id !== 'number') {
        throw new ValidationError('Order id is missing while trying to get' + JSON.stringify(event.data, null, 2));
      }
      return LabomatixOrderController.getById(event.data.id as number)

    case 'FIND':

      return LabomatixOrderController.find({
        ...event.data
      })


    default:
      throw new ValidationError(`Invalid action: ${event.action} for topic ` + event.topic);
  }

}
