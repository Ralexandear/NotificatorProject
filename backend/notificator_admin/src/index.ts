import './configurations'
import { IS_PRODUCTION } from './constants';
import { saveUserbotUpdateToMongo } from './database/mongo';
import './telegram/TelegramBot';
import { UserBot } from './telegram/UserBot';
import fs from 'fs';
import NewMessageHandler from './handlers/userbot/NewMessageHandler';
import { FatalError } from './shared/errors/FatalError';
import Logger from './shared/utils/Logger';
import { rabbitInitializationPromise } from './RabbitMQ';



if (!IS_PRODUCTION) {
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



// Подключение и настройка RabbitMQ



// Основной процесс
const initializationPromise = (async () => {
  await rabbitInitializationPromise;
  // await bot.isReady();
  await UserBot.isReady();

})();

async function main() {
  await initializationPromise;

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

  // bot.client.on('update', update => {
  //   Logger.info('Admin bot received update', JSON.stringify(update));

  //   savebotUpdateToMongo(update)
  //     .then(
  //       (mongoId) => {
  //         if (mongoId === undefined) {
  //           throw new FatalError('Unexpected mongo behaviour, object id should not be undefined!')
  //         }
  //         const mongoStringId = mongoId.toString();
  //         return mongoStringId
  //       })
  //     .then(
  //       (mongoUpdateId) => {
  //         if (update._ === 'updateNewMessage') {
  //           return newBotMessageHandler(update, mongoUpdateId);
  //         }
  //       }
  //     )
  //     .catch(
  //       error => {
  //         Logger.error("An error occured while processing update", error);
  //       }
  //     )
  // })
}

main().catch(Logger.error);