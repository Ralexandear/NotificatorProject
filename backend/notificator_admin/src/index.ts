import './configurations'
import { IS_PRODUCTION } from './constants';
import { saveUserbotUpdateToMongo } from './database/mongo';
import './telegram/TelegramBot';
import fs from 'fs';
import NewMessageHandler from './handlers/userbot/message';
import { FatalError } from './shared/errors/FatalError';
import Logger from './shared/utils/Logger';
import { rabbitInitializationPromise } from './RabbitMQ';
import { bot } from './telegram/TelegramBot';
import { sleep } from './utils/sleep';
import { userbot } from './telegram/UserBot';



if (!IS_PRODUCTION) {
  Logger.useDebug();
}



const originalStdoutWrite = process.stdout.write.bind(process.stdout);
const originalStderrWrite = process.stderr.write.bind(process.stderr);

const logFile = fs.createWriteStream('output.log', { flags: 'a' });
const errorFile = fs.createWriteStream('error.log', { flags: 'a' });

process.stdout.write = (chunk: any, ...args: any[]) => {
  logFile.write(chunk);
  return originalStdoutWrite(chunk, ...args);
};

process.stderr.write = (chunk: any, ...args: any[]) => {
  errorFile.write(chunk);
  return originalStderrWrite(chunk, ...args);
};



// Подключение и настройка RabbitMQ



// Основной процесс
const initializationPromise = (async () => {
  await userbot.isReady();
  await sleep(3000)

  // await bot.isReady();
  // await sleep(3000)
  Logger.log('Telegram bots are ready');

  await rabbitInitializationPromise;
})();

async function main() {
  await initializationPromise;

  Logger.log('Ready to get updates')

  userbot.client.on('update', (update) => {
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