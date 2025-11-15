import { Injectable, Inject, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.module';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async onModuleInit() {
    try {
      await this.redis.connect();
      this.logger.log('Redis client connected');
    } catch (error) {
      this.logger.error('Failed to connect to Redis', error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.redis.quit();
      this.logger.log('Redis client disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting from Redis', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Error getting key: ${key}`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, stringValue);
      } else {
        await this.redis.set(key, stringValue);
      }
      return true;
    } catch (error) {
      this.logger.error(`Error setting key: ${key}`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting key: ${key}`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking existence of key: ${key}`, error);
      return false;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      await this.redis.expire(key, seconds);
      return true;
    } catch (error) {
      this.logger.error(`Error setting expiry for key: ${key}`, error);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      this.logger.error(`Error getting TTL for key: ${key}`, error);
      return -1;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.redis.keys(pattern);
    } catch (error) {
      this.logger.error(`Error getting keys with pattern: ${pattern}`, error);
      return [];
    }
  }

  async hget<T>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.redis.hget(key, field);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Error getting hash field: ${key}.${field}`, error);
      return null;
    }
  }

  async hset(key: string, field: string, value: any): Promise<boolean> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await this.redis.hset(key, field, stringValue);
      return true;
    } catch (error) {
      this.logger.error(`Error setting hash field: ${key}.${field}`, error);
      return false;
    }
  }

  async hgetall<T>(key: string): Promise<Record<string, T> | null> {
    try {
      const data = await this.redis.hgetall(key);
      if (!data || Object.keys(data).length === 0) return null;

      const result: Record<string, T> = {};
      for (const [field, value] of Object.entries(data)) {
        try {
          result[field] = JSON.parse(value) as T;
        } catch {
          result[field] = value as T;
        }
      }
      return result;
    } catch (error) {
      this.logger.error(`Error getting hash: ${key}`, error);
      return null;
    }
  }

  async hdel(key: string, ...fields: string[]): Promise<boolean> {
    try {
      await this.redis.hdel(key, ...fields);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting hash fields: ${key}`, error);
      return false;
    }
  }

  getClient(): Redis {
    return this.redis;
  }
}

