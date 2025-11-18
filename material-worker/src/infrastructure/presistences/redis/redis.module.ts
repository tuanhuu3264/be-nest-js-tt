import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService): Redis => {
        const host = process.env.REDIS_HOST || configService.get<string>('app.redis.host', 'localhost');
        const port = process.env.REDIS_PORT
          ? parseInt(process.env.REDIS_PORT, 10)
          : configService.get<number>('app.redis.port', 6379);
        const password = process.env.REDIS_PASSWORD || configService.get<string>('app.redis.password');
        const db = process.env.REDIS_DB
          ? parseInt(process.env.REDIS_DB, 10)
          : configService.get<number>('app.redis.db', 0);

        const redis = new Redis({
          host,
          port,
          password,
          db,
          retryStrategy: (times: number) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          lazyConnect: true,
        });

        redis.on('connect', () => {
          console.log('Redis client connected');
        });

        redis.on('error', (error) => {
          console.error('Redis client error:', error);
        });

        redis.on('close', () => {
          console.log('Redis client connection closed');
        });

        return redis;
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}

