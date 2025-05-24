import { createClient } from 'redis';
import { connectToRedis } from '../shared/utils/connectToRedis';

export const redisClient = createClient();
export const redisInitializationPromise = connectToRedis(redisClient);
