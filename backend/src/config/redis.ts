// backend/src/config/redis.ts

import * as redis from 'redis';
import * as dotenv from 'dotenv';

dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const REDIS_DB = parseInt(process.env.REDIS_DB || '0', 10);

export class RedisClient {
  private static instance: redis.RedisClientType;

  static getInstance(): redis.RedisClientType {
    if (!this.instance) {
      throw new Error('Redis client not initialized. Call initialize() first.');
    }
    return this.instance;
  }

  static async initialize(): Promise<void> {
    try {
      const client = redis.createClient({
        host: REDIS_HOST,
        port: REDIS_PORT,
        password: REDIS_PASSWORD,
        db: REDIS_DB,
        socket: {
          reconnectStrategy: (retries: number) => {
            if (retries > 10) {
              return new Error('Max Redis reconnect attempts exceeded');
            }
            return retries * 100;
          },
        },
      } as any);

      client.on('error', (err) => {
        console.error('❌ Redis error:', err);
      });

      client.on('connect', () => {
        console.log('✅ Redis connected');
      });

      client.on('ready', () => {
        console.log('✅ Redis ready');
      });

      await client.connect();

      RedisClient.instance = client;
      console.log('✅ Redis client initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Redis:', error);
      throw error;
    }
  }

  static async close(): Promise<void> {
    if (this.instance) {
      await this.instance.quit();
      console.log('✅ Redis connection closed');
    }
  }

  // Convenience methods
  static async setWithExpiry(
    key: string,
    value: string,
    ttlSeconds: number
  ): Promise<void> {
    const client = this.getInstance();
    await client.setEx(key, ttlSeconds, value);
  }

  static async get(key: string): Promise<string | null> {
    const client = this.getInstance();
    return await client.get(key);
  }

  static async set(key: string, value: string): Promise<void> {
    const client = this.getInstance();
    await client.set(key, value);
  }

  static async delete(key: string): Promise<void> {
    const client = this.getInstance();
    await client.del(key);
  }

  static async incr(key: string): Promise<number> {
    const client = this.getInstance();
    return await client.incr(key);
  }

  static async expire(key: string, seconds: number): Promise<void> {
    const client = this.getInstance();
    await client.expire(key, seconds);
  }

  static async flushDb(): Promise<void> {
    const client = this.getInstance();
    await client.flushDb();
  }
}

export default RedisClient;
