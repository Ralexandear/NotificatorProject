import ShiftController from "../database/controllers/ShiftController";
import { ValidationError } from "../shared/errors/ValidationError";
import { RabbitPgRequestGeneric } from "../shared/interfaces/rabbitMQ/RabbitPgRequestAttributes";

export async function ShiftEventHandlder(event: RabbitPgRequestGeneric) {
  if (event.topic !== 'notificator-db-shop-requests') {
    throw new Error('Invalid topic in request' + JSON.stringify(event))
  };

  switch (event.action) {
    case 'CREATE':
      return ShiftController.create(event.data)

    case 'FIND_OR_CREATE':
      return ShiftController.findOrCreate(event.data);

    case 'UPDATE':
      return ShiftController.update({ id: event.data.id }, event.data)

    case 'DELETE':
      return ShiftController.delete(event.data.id)

    case 'GET':
      return ShiftController.getById(event.data.id as number)

    case 'FIND':
      return ShiftController.find(event.data)


    default:
      throw new ValidationError(`Invalid action: ${event.action} for topic ` + event.topic);
  }

}