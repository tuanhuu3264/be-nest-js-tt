import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PostgreSQLConfigRule,
  PostgreSQLConnectionConfig,
} from '../interfaces/config.interface';

@Injectable()
export class PostgreSQLConfigLoaderService {
  private readonly logger = new Logger(PostgreSQLConfigLoaderService.name);
  private rules: PostgreSQLConfigRule[] = [];

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
        type: 'postgres',
        host: this.configService.get<string>('POSTGRES_HOST', 'localhost'),
        port: this.configService.get<number>('POSTGRES_PORT', 5432),
        username: this.configService.get<string>('POSTGRES_USER', 'postgres'),
        password: this.configService.get<string>('POSTGRES_PASSWORD', 'postgres'),
        database: this.configService.get<string>('POSTGRES_DB', 'user_service'),
        synchronize: this.configService.get<boolean>('POSTGRES_SYNC', false),
        logging: this.configService.get<boolean>('POSTGRES_LOGGING', false),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        extra: {
          max: 10,
          min: 2,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000,
        },
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
        type: 'postgres',
        host: this.configService.get<string>('POSTGRES_HOST', 'postgres'),
        port: this.configService.get<number>('POSTGRES_PORT', 5432),
        username: this.configService.get<string>('POSTGRES_USER', 'postgres'),
        password: this.configService.get<string>('POSTGRES_PASSWORD', ''),
        database: this.configService.get<string>('POSTGRES_DB', 'user_service'),
        synchronize: false,
        logging: false,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        ssl: {
          rejectUnauthorized: false,
        },
        extra: {
          max: 20,
          min: 5,
          idleTimeoutMillis: 60000,
          connectionTimeoutMillis: 30000,
        },
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
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        database: 'test_db',
        synchronize: true,
        logging: false,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        extra: {
          max: 5,
          min: 1,
          idleTimeoutMillis: 10000,
          connectionTimeoutMillis: 5000,
        },
      },
    });
  }

  /**
   * Add a custom configuration rule
   */
  addRule(rule: PostgreSQLConfigRule): void {
    this.rules.push(rule);
    this.logger.log(`Added configuration rule: ${rule.name}`);
  }

  /**
   * Get configuration based on rules
   */
  getConfig(context: any = {}): PostgreSQLConnectionConfig {
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
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'user_service',
      synchronize: false,
      logging: false,
    };
  }

  /**
   * Get all registered rules
   */
  getRules(): PostgreSQLConfigRule[] {
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

