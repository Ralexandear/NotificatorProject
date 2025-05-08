import LogisticSchemaController from "../database/controllers/LogisticSchemaController";
import { ValidationError } from "../shared/errors/ValidationError";
import { RabbitPgActionType, RabbitPgRequestAttributes, RabbitPgRequestTopicNameType } from "../shared/interfaces/rabbitMQ/RabbitPgRequestAttributes";

export async function LogisticSchemaEventHandler(event: RabbitPgRequestAttributes<RabbitPgRequestTopicNameType, RabbitPgActionType>) {
  if (event.topic !== 'notificator-db-point-requests') {
    throw new Error('Invalid topic in request' + JSON.stringify(event))
  };

  switch (event.action) {
    case 'CREATE':
      return LogisticSchemaController.create(event.data)

    case 'FIND_OR_CREATE':
      return LogisticSchemaController.findOrCreate(event.data);

    case 'UPDATE':
      return LogisticSchemaController.update({ id: event.data.id }, event.data)

    case 'DELETE':
      return LogisticSchemaController.delete(event.data.id)

    case 'GET':
      return LogisticSchemaController.getById(event.data.id as number)

    case 'FIND':
      return LogisticSchemaController.find(event.data)


    default:
      throw new ValidationError(`Invalid action: ${event.action} for topic ` + event.topic);
  }

}