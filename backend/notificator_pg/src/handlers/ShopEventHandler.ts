import { ShopController } from "../database/controllers/ShopController";
import { ValidationError } from "../shared/errors/ValidationError";
import { KafkaActionType, KafkaPostgresRequestAttributes, KafkaRequestTopicNameType } from "../shared/interfaces/KafkaRequestAttributes";

export async function ShopEventHandlder (event: KafkaPostgresRequestAttributes<KafkaRequestTopicNameType, KafkaActionType>) {
  if (event.topic !== 'notificator-db-shop-requests') {
    throw new Error( 'Invalid topic in request' + JSON.stringify(event) )
  };

  switch (event.action) {
    case 'CREATE':
      return ShopController.create(event.data)
    
    case 'FIND_OR_CREATE':
      return ShopController.findOrCreate(event.data);
    
    case 'UPDATE':
      return ShopController.update({id: event.data.id}, event.data)

    case 'DELETE':
      return ShopController.delete(event.data.id)

    case 'GET':
      return ShopController.getById(event.data.id as number)

    case 'FIND':
      return ShopController.findByName(...event.data.names)


    default:
      throw new ValidationError(`Invalid action: ${event.action} for topic ` + event.topic);
  }
  
}