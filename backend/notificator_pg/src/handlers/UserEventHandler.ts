import UserController from "../database/controllers/UserController";
import { ValidationError } from "../shared/errors/ValidationError";
import { RabbitRequestGeneric } from "../shared/interfaces/RabbitRequestAttributes";

export async function UserEventHandlder(event: RabbitRequestGeneric) {
  if (event.topic !== 'notificator-db-shop-requests') {
    throw new Error('Invalid topic in request' + JSON.stringify(event))
  };

  switch (event.action) {
    case 'CREATE':
      return UserController.create(event.data)

    case 'FIND_OR_CREATE':
      return UserController.findOrCreate(event.data);

    case 'UPDATE':
      return UserController.update({ id: event.data.id }, event.data)

    case 'DELETE':
      return UserController.delete(event.data.id)

    case 'GET':
      return UserController.getById(event.data.id as number)

    case 'FIND':
      return UserController.find(event.data)


    default:
      throw new ValidationError(`Invalid action: ${event.action} for topic ` + event.topic);
  }

}