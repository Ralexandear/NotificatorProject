import crypto from 'crypto';
import Logger from '../../shared/utils/Logger';
import { redisClient } from '../redis';

export class RedisController<T> {
  private collectionHash: string;
  private ttlSeconds: number;

  constructor(collectionName: string, ttlSeconds: number) {
    this.collectionHash = this.hashCollectionName(collectionName);
    this.ttlSeconds = ttlSeconds;
  }

  private hashCollectionName(name: string): string {
    return crypto.createHash('sha256').update(name).digest('hex').slice(0, 8); // Берем первые 8 символов
  }

  async set(key: string, value: T): Promise<void> {
    try {
      const fullKey = `${this.collectionHash}:${key}`;
      const data = JSON.stringify(value);
      await redisClient.set(fullKey, data, { EX: this.ttlSeconds });
      Logger.info(`Saved key "${fullKey}" in Redis`);
    } catch (error) {
      Logger.error(`Error saving key "${key}" to Redis:`, error);
    }
  }

  async get(key: string): Promise<T | null> {
    try {
      const fullKey = `${this.collectionHash}:${key}`;
      const data = await redisClient.get(fullKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      Logger.error(`Error retrieving key "${key}" from Redis:`, error);
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const fullKey = `${this.collectionHash}:${key}`;
      await redisClient.del(fullKey);
      Logger.info(`Deleted key "${fullKey}" from Redis`);
    } catch (error) {
      Logger.error(`Error deleting key "${key}" from Redis:`, error);
    }
  }
}

export default RedisController;
