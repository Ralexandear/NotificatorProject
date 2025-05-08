import { RabbitMQRequest } from "../../RabbitMQ";
import Logger from "../../shared/utils/Logger";

const topic = 'notificator-db-point-requests'
export class PointController {
  static async getById(id: number) {
    Logger.log('Getting point with id', id);
    
    const response = await new RabbitMQRequest(
      topic,
      'GET',
      { id }
    ).send();

    Logger.info('Point with id', id, 'found', JSON.stringify(response))

    return response
  } 
}