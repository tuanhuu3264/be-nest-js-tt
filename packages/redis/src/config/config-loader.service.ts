import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  RedisConfigRule,
  RedisConnectionConfig,
} from '../interfaces/config.interface';

@Injectable()
export class RedisConfigLoaderService {
  private readonly logger = new Logger(RedisConfigLoaderService.name);
  private rules: RedisConfigRule[] = [];

  constructor(private readonly configService: ConfigService) {
    this.loadDefaultRules();
  }

  /**
   * Load default configuration rules
   */
  private loadDefaultRules(): void {
    // Rule 1: Development environment
    this.addRule({
      name: 'development',
      condition: (context) => {
        const env = this.configService.get<string>('NODE_ENV', 'development');
        return env === 'development' || env === 'dev';
      },
      config: {
        host: this.configService.get<string>('REDIS_HOST', 'localhost'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
        password: this.configService.get<string>('REDIS_PASSWORD'),
        db: this.configService.get<number>('REDIS_DB', 0),
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true,
        connectTimeout: 10000,
      },
    });

    // Rule 2: Production environment
    this.addRule({
      name: 'production',
      condition: (context) => {
        const env = this.configService.get<string>('NODE_ENV', 'development');
        return env === 'production' || env === 'prod';
      },
      config: {
        host: this.configService.get<string>('REDIS_HOST', 'redis'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
        password: this.configService.get<string>('REDIS_PASSWORD', ''),
        db: this.configService.get<number>('REDIS_DB', 0),
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 100, 5000);
          return delay;
        },
        maxRetriesPerRequest: 5,
        enableReadyCheck: true,
        lazyConnect: false,
        connectTimeout: 30000,
        keepAlive: 30000,
        enableAutoPipelining: true,
      },
    });

    // Rule 3: Test environment
    this.addRule({
      name: 'test',
      condition: (context) => {
        const env = this.configService.get<string>('NODE_ENV', 'development');
        return env === 'test';
      },
      config: {
        host: 'localhost',
        port: 6379,
        db: 1,
        retryStrategy: (times: number) => {
          if (times > 3) {
            return null;
          }
          return times * 50;
        },
        maxRetriesPerRequest: 1,
        enableReadyCheck: false,
        lazyConnect: true,
        connectTimeout: 5000,
      },
    });
  }

  /**
   * Add a custom configuration rule
   */
  addRule(rule: RedisConfigRule): void {
    this.rules.push(rule);
    this.logger.log(`Added configuration rule: ${rule.name}`);
  }

  /**
   * Get configuration based on rules
   */
  getConfig(context: any = {}): RedisConnectionConfig {
    // Evaluate rules in order, return first matching rule
    for (const rule of this.rules) {
      try {
        if (rule.condition(context)) {
          this.logger.log(`Using configuration rule: ${rule.name}`);
          return rule.config;
        }
      } catch (error) {
        this.logger.warn(
          `Error evaluating rule ${rule.name}: ${error.message}`,
        );
      }
    }

    // Fallback to default configuration
    this.logger.warn('No matching rule found, using default configuration');
    return {
      host: 'localhost',
      port: 6379,
      db: 0,
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    };
  }

  /**
   * Get all registered rules
   */
  getRules(): RedisConfigRule[] {
    return [...this.rules];
  }

  /**
   * Clear all rules
   */
  clearRules(): void {
    this.rules = [];
    this.logger.log('All configuration rules cleared');
  }
}

