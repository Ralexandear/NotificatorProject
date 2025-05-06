import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import { BOT_TOKEN } from './constants';
// import { TextMessageHandler } from './handlers/textMessageHandlers/TextMessageHandler';
// import { CallbackQueryHandler } from './handlers/callbackQueryHandlers/CallbackQueryHandler';
import Logger from './shared/utils/Logger';

const bot = new TelegramBot(BOT_TOKEN, {
  //@ts-ignore
  polling: { autoStart: false, params: {}, skip_pending_updates: true },
});
// bot.on("message", TextMessageHandler)
// bot.on("callback_query", CallbackQueryHandler)

bot.getUpdates().then(
  (updates) => {
    Logger.debug('Got updates:', JSON.stringify(updates))
    // if there are pending updates and skip_pending_updates is true
    //@ts-ignore for bot options
    if (updates.length > 0 && bot.options.polling.skip_pending_updates) {
      //set offset to last update's id + 1 to skip pending updates
      //@ts-ignore
      bot.options.polling.params = {
        offset: updates[updates.length - 1]?.update_id + 1,
      };
      Logger.debug(`Will be skipped updates: ${updates.length}`);
      Logger.debug(`Start polling with offset: ${updates[updates.length - 1]?.update_id + 1}`,);
    }

    // after all start polling
    bot.startPolling()
      .then(() => Logger.info('Notificator bot started polling'))
  },
  (error) => {
    Logger.error(error);
  },
);

// const botInitializationPromise = (async () => {
//   const adminTelegramId = process.env.ADMIN;

//   if (!adminTelegramId) throw new Error('Required parameter ADMIN is missing in env')
//   Admin = await UserController.findOrCreate(adminTelegramId, 'admin', 'ralexandear')

//   console.log(await bot.getMe());
//   console.log('bot is ready')
// })();


// async function syncPoints() {
//   const pointsIds = new Set(await PointsController.getPointIds());

//   for (const pointId of Config.enabledPoints) {
//     if (pointsIds.has(pointId)) continue;
//     await PointsController.create(pointId);
//   }
// }

// export { botInitializationPromise, bot };
// export default bot;
