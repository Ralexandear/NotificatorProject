import { ShopController } from "../database/controllers/ShopController";
import { ValidationError } from "../shared/errors/ValidationError";
import { KafkaActionType, KafkaPostgresRequestAttributes, KafkaRequestTopicNameType } from "../shared/interfaces/KafkaRequestAttributes";

export async function LabomatixOrderEventHandler(event: KafkaPostgresRequestAttributes<KafkaRequestTopicNameType, KafkaActionType>) {
  if (event.topic !== 'notificator-db-shop-requests') {
    throw new Error( 'Invalid topic in request' + JSON.stringify(event) )
  };

  switch (event.action) {
    // case 'CREATE':
    //   return LabomatixOrderController.create(event.data.messageId, event.data.mongoUpdateId, event.data.status);

    // case 'FIND_OR_CREATE':
    //   return LabomatixOrderController.findOrCreate
    
    // case 'UPDATE':
    //   return LabomatixOrderController.update(event.data)

    // case 'DELETE':
    //   return LabomatixOrderController.delete(event.data.id)

    // case 'GET':
    //   if (event.data.id === undefined || typeof event.data.id !== 'number') {
    //     throw new ValidationError('Order id is missing while trying to find' + JSON.stringify(event.data, null, 2));
    //   }
    //   return LabomatixOrderController.getById(event.data.id as number)

    case 'FIND':
      return ShopController.find(...event.data.names)


    default:
      throw new Error(`Invalid action: ${event.action}`);
  }
  
}