import './configurations'
import { IS_PRODUCTION } from './constants';
import Logger from "./Logger";
// import './classes/UserBot'
import { savebotUpdateToMongo, saveUserbotUpdateToMongo } from './database/mongo';
import './telegram/TelegramBot';
import { UserBot } from './telegram/UserBot';
import { AdminBot } from './telegram/TelegramBot';
import fs from 'fs';
import NewMessageHandler from './handlers/NewMessageHandler';
import { databaseInitializationPromise } from './database';
import { FatalError } from './errors/FatalError';
import { PointSequelizeModel } from './database/models/Point';
import { newBotMessageHandler } from './handlers/NewBotMessageHandler';

// Создаём потоки для перенаправления стандартного вывода и ошибок
const logOut = fs.createWriteStream('./log.out', { flags: 'a' }); // Файл для вывода (дозапись)
const logErr = fs.createWriteStream('./log.out', { flags: 'a' }); // Файл для ошибок (дозапись)

// Перенаправляем стандартный вывод и ошибки
//@ts-ignore
process.stdout.write = logOut.write.bind(logOut);
//@ts-ignore
process.stderr.write = logErr.write.bind(logErr);



if (! IS_PRODUCTION) {
  Logger.useDebug();
}


// Основной процесс
export const initializationPromise = (async () => {
  await databaseInitializationPromise
    .then(async () => {
      const points = await PointSequelizeModel.findAll();
      if (points.length) return
      
      Logger.warn("Points list is missing in database, building default list");
      const pointsList = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
        11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29
      ]
      .map(point => ({name: 'К' + point}))

      return PointSequelizeModel.bulkCreate(pointsList);
    })
  
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