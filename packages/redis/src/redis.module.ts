import { Module, Global, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisConfigLoaderService } from './config/config-loader.service';
import { RedisConnectionConfig } from './interfaces/config.interface';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({})
export class RedisModule {
  static forRoot(context?: any): DynamicModule {
    return {
      module: RedisModule,
      imports: [ConfigModule],
      providers: [
        RedisConfigLoaderService,
        {
          provide: REDIS_CLIENT,
          useFactory: (
            configService: ConfigService,
            configLoader: RedisConfigLoaderService,
          ): Redis => {
            const config: RedisConnectionConfig =
              configLoader.getConfig(context);
            const redis = new Redis(config);

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
          inject: [ConfigService, RedisConfigLoaderService],
        },
      ],
      exports: [REDIS_CLIENT, RedisConfigLoaderService],
    };
  }
}

