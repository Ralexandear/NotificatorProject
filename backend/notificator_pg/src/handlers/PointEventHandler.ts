import PointController from "../database/controllers/PointContoller";
import { ValidationError } from "../shared/errors/ValidationError";
import { KafkaActionType, KafkaPostgresRequestAttributes, KafkaRequestTopicNameType } from "../shared/interfaces/KafkaRequestAttributes";

export async function PointEventHandler (event: KafkaPostgresRequestAttributes<KafkaRequestTopicNameType, KafkaActionType>) {
  if (event.topic !== 'notificator-db-point-requests') {
    throw new Error( 'Invalid topic in request' + JSON.stringify(event) )
  };

  switch (event.action) {
    case 'CREATE':
      return PointController.create(event.data)
    
    case 'FIND_OR_CREATE':
      return PointController.findOrCreate(event.data);
    
    case 'UPDATE':
      return PointController.update({id: event.data.id}, event.data)

    case 'DELETE':
      return PointController.delete(event.data.id)

    case 'GET':
      return PointController.getById(event.data.id as number)

    case 'FIND':
      return PointController.find(event.data)


    default:
      throw new ValidationError(`Invalid action: ${event.action} for topic ` + event.topic);
  }
  
}