import { KafkaActionType, KafkaPostgresRequestAttributes, KafkaRequestTopicNameType } from "../shared/interfaces/KafkaRequestAttributes";

export async function UserEventHandler(event: KafkaPostgresRequestAttributes<KafkaRequestTopicNameType, KafkaActionType>) {
  
}