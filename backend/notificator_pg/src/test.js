const kafka = require('kafka-node');
const { KafkaClient, Producer, Consumer } = kafka;

// Конфигурация
const KAFKA_HOST = 'localhost:9092';
const TOPIC_NAME = 'test-topic-' + Date.now();

async function setupKafka() {
  const client = new KafkaClient({ kafkaHost: KAFKA_HOST });

  // Обработчики событий клиента
  client.on('ready', () => console.log('Kafka client ready'));
  client.on('error', (err) => console.error('Kafka client error:', err));

  // Создаем producer
  const producer = new Producer(client);

  try {
    // Ждем готовности producer
    await new Promise((resolve, reject) => {
      producer.on('ready', resolve);
      producer.on('error', reject);
    });
    console.log('Producer is ready');

    // Создаем топик
    await new Promise((resolve, reject) => {
      producer.createTopics([TOPIC_NAME], true, (err, data) => {
        if (err) reject(err);
        else {
          console.log(`Topic "${TOPIC_NAME}" created or exists`);
          resolve(data);
        }
      });
    });

    // Отправляем тестовое сообщение
    await new Promise((resolve, reject) => {
      producer.send([{ 
        topic: TOPIC_NAME, 
        messages: 'Test message from producer',
        partition: 0 
      }], (err, data) => {
        if (err) reject(err);
        else {
          console.log('Message sent successfully:', data);
          resolve(data);
        }
      });
    });

    // Только после создания топика создаем consumer
    const consumer = new Consumer(
      client,
      [{ topic: TOPIC_NAME, partition: 0 }],
      { 
        autoCommit: true,
        fromOffset: 'latest' // Читаем только новые сообщения
      }
    );

    consumer.on('message', (message) => {
      console.log('Received message:', message.value);
    });

    consumer.on('error', (err) => console.error('Consumer error:', err));
    console.log(`Consumer ready. Listening to topic "${TOPIC_NAME}"`);

  } catch (err) {
    console.error('Error in Kafka setup:', err);
    process.exit(1);
  }

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('Disconnecting...');
    client.close(() => {
      console.log('Disconnected');
      process.exit();
    });
  });
}

setupKafka();