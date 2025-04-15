import './configurations'
import kafka from 'kafka-node';
import { IS_PRODUCTION } from './constants';
import { savebotUpdateToMongo, saveUserbotUpdateToMongo } from './database/mongo';
import './telegram/TelegramBot';
import { UserBot } from './telegram/UserBot';
import { AdminBot } from './telegram/TelegramBot';
import fs from 'fs';
import NewMessageHandler from './handlers/NewMessageHandler';
import { newBotMessageHandler } from './handlers/NewBotMessageHandler';
import { FatalError } from './shared/errors/FatalError';
import Logger from './shared/utils/Logger';
import { KafkaRequestTopicNameType } from './shared/interfaces/KafkaRequestAttributes';

if (! IS_PRODUCTION) {
  Logger.useDebug();
}

// Создаём потоки для перенаправления стандартного вывода и ошибок
const logFile = fs.createWriteStream('./logs/output.log', { flags: 'a' });
const errorFile = fs.createWriteStream('./logs/error.log', { flags: 'a' });

const logStream = new (require('stream').Writable)({
  write(chunk: any, encoding: any, callback: any) {
    process.stdout.write(chunk); // Вывод в консоль
    logFile.write(chunk); // Запись в файл
    callback();
  }
});

const errorStream = new (require('stream').Writable)({
  write(chunk: any, encoding: any, callback: any) {
    process.stderr.write(chunk); // Вывод в консоль ошибок
    errorFile.write(chunk); // Запись в файл ошибок
    callback();
  }
});

process.stdout.write = logStream.write.bind(logStream);
process.stderr.write = errorStream.write.bind(errorStream);


//KAFKA
const requestTopics = [
  'notificator-db-labomatix-order-requests',
  'notificator-db-point-requests',
  'notificator-db-shop-requests',
  'notificator-db-user-requests',
] as KafkaRequestTopicNameType[];

const responseTopics = [
  'notificator-db-labomatix-order-response',
  'notificator-db-point-response',
  'notificator-db-shop-response',
  'notificator-db-user-response'
]

export const kafkaClient = new kafka.KafkaClient({ 
  kafkaHost: 'localhost:9092',
  reconnectOnIdle: true,
});

const consumer = new kafka.Consumer(
  kafkaClient,
  [],
  { 
    autoCommit: true,
  }
);

export const producer = new kafka.Producer(kafkaClient);

let retryCount = 0;
const maxRetries = 3;

const setupConsumer = () => {
  consumer.addTopics(requestTopics, (err, result) => {
    if (err) {
      console.error('Error adding topics:', err);
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Retrying (${retryCount}/${maxRetries})...`);
        setTimeout(setupConsumer, 2000);
      } else {
        throw new FatalError('Failed to add topics after multiple attempts: ' + err);
      }
    } else {
      console.log('Topics successfully added:', result);
    }
  });
};

producer.on('ready', async () => {
  console.log('Producer is ready');
  
  producer.createTopics([...requestTopics, ...responseTopics], (err, result) => {
    if (err) {
      throw new FatalError('Error creating topics:' + err);
    } else {
      console.log('Topics successfully created:', result);
      // Start consumer setup after topics are created
      setTimeout(setupConsumer, 2000);
    }
  });
});





// Основной процесс
export const initializationPromise = (async () => {
  await AdminBot.isReady();
  await UserBot.isReady();
})();

async function main() {
  await initializationPromise
  Logger.log('Ready to get updates')
  

  UserBot.client.on('update', (update) => {
    Logger.info('Userbot received update', JSON.stringify(update));
    
    saveUserbotUpdateToMongo(update)
      .then(
        (mongoId) => {
          if (mongoId === undefined) {
            throw new FatalError('Unexpected mongo behaviour, object id should not be undefined!')
          }
          const mongoStringId = mongoId.toString();
          return mongoStringId
        })
      .then(
        (mongoUpdateId) => {
          if (update._ === 'updateNewMessage') {
            return NewMessageHandler(update, mongoUpdateId);
          }
        }
      )
      .catch(
        error => {
          Logger.error("An error occured while processing update", error);
        }
      )
  })

  AdminBot.client.on('update', update => {
    Logger.info('Admin bot received update', JSON.stringify(update));

    savebotUpdateToMongo(update)
      .then(
        (mongoId) => {
          if (mongoId === undefined) {
            throw new FatalError('Unexpected mongo behaviour, object id should not be undefined!')
          }
          const mongoStringId = mongoId.toString();
          return mongoStringId
        })
      .then(
        (mongoUpdateId) => {
          if (update._ === 'updateNewMessage') {
            return newBotMessageHandler(update, mongoUpdateId);
          }
        }
      )
      .catch(
        error => {
          Logger.error("An error occured while processing update", error);
        }
      )
  })
}

main().catch(Logger.error);