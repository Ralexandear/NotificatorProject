import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import { BOT_TOKEN } from './constants';
import Logger from './shared/utils/Logger';
import { connectToRabbitMQ } from './RabbitMQ';

const bot = new TelegramBot(BOT_TOKEN, {
  polling: {
    autoStart: false,
    params: {},
    //@ts-ignore type don't have skip pending updates
    skip_pending_updates: true,
  },
});

let isReconnecting = false
// Обработчик ошибок polling
bot.on('polling_error', (error) => {
  if (isReconnecting) return

  Logger.error('FATAL POLLING ERROR:', error);
  Logger.warn('Attempting to reconnect to Telegram...');
  reconnectBot();
});

// Функция для переподключения бота
const reconnectBot = async (retryDelay: number = 5000, force = false) => {
  if (isReconnecting && ! force) return
  
  isReconnecting = true
  
  try {
    Logger.info('Reconnecting to Telegram...');
    await bot.stopPolling(); // Останавливаем текущий polling
    await bot.startPolling(); // Перезапускаем polling
    await bot.getMe()

    Logger.info('Reconnected to Telegram successfully.');
    isReconnecting = false
  } catch (error) {
    Logger.error('Failed to reconnect to Telegram:', error);
    Logger.warn(`Retrying to reconnect in ${retryDelay / 1000} seconds...`);
    setTimeout(() => reconnectBot(Math.min(retryDelay * 2, 60000), true), retryDelay); // Увеличиваем задержку до 60 секунд
  } 
};

// Запуск получения обновлений
bot.getUpdates()
  .then(
    (updates) => {
      Logger.debug('Got updates:', JSON.stringify(updates));
      // Если есть ожидающие обновления и skip_pending_updates включён
      //@ts-ignore for bot options
      if (updates.length > 0 && bot.options.polling.skip_pending_updates) {
        // Устанавливаем offset для пропуска ожидающих обновлений
        //@ts-ignore
        bot.options.polling.params = {
          offset: updates[updates.length - 1]?.update_id + 1,
        };
        Logger.debug(`Will be skipped updates: ${updates.length}`);
        Logger.debug(
          `Start polling with offset: ${
            updates[updates.length - 1]?.update_id + 1
          }`,
        );
      }

      // После всего запускаем polling
      bot.startPolling().then(() => Logger.info('Notificator bot started polling'));
    },
    (error) => {
      Logger.error(error);
      throw error;
    },
  )
  .then(() => {
    const attemptRabbitMQConnection = async (retryDelay: number = 30000) => {
      Logger.info('Trying to establish RabbitMQ connection');

      try {
        await connectToRabbitMQ();
        Logger.info('RabbitMQ connection established successfully');
      } catch (error) {
        Logger.error(error);
        Logger.warn(
          `Unable to establish RabbitMQ connection, retrying in ${
            retryDelay / 1000
          } seconds`,
        );
        setTimeout(
          () => attemptRabbitMQConnection(Math.min(retryDelay * 2, 300000)),
          retryDelay,
        ); // Задержка до 5 минут
      }
    };

    attemptRabbitMQConnection();
  });