import Logger from "./Logger";

export async function connectToRedis(redisClient: any, retryCount = 5, delay = 5000) {
  let attempts = retryCount;
  
  while (attempts > 0) {
    try {
      await redisClient.connect();
      Logger.log('Redis connected');
      
      redisClient.on('ready', () => Logger.log('Redis is ready'));
      redisClient.on('reconnecting', () => Logger.warn('Redis reconnecting...'));
      redisClient.on('error', (err: any) => {
        Logger.error('Redis error:', err);
        setTimeout(connectToRedis, delay); // Переподключение после ошибки
      });
      redisClient.on('end', () => {
        Logger.warn('Redis connection closed');
        setTimeout(connectToRedis, delay);
      });

      return;
    } catch (error) {
      Logger.error(`Redis connection attempt failed (${attempts} left):`, error);
      attempts--;
      if (attempts > 0) await new Promise(res => setTimeout(res, delay));
      else throw new Error('Fatal Redis connection error');
    }
  }
}