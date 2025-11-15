import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  KafkaConfigRule,
  KafkaConnectionConfig,
} from '../interfaces/config.interface';

@Injectable()
export class KafkaConfigLoaderService {
  private readonly logger = new Logger(KafkaConfigLoaderService.name);
  private rules: KafkaConfigRule[] = [];

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
        clientId: this.configService.get<string>(
          'KAFKA_CLIENT_ID',
          'user-service',
        ),
        brokers: this.configService.get<string[]>(
          'KAFKA_BROKERS',
          ['localhost:9092'],
        ),
        retry: {
          retries: this.configService.get<number>('KAFKA_RETRIES', 8),
          initialRetryTime: this.configService.get<number>(
            'KAFKA_INITIAL_RETRY_TIME',
            100,
          ),
        },
        requestTimeout: this.configService.get<number>(
          'KAFKA_REQUEST_TIMEOUT',
          30000,
        ),
        connectionTimeout: this.configService.get<number>(
          'KAFKA_CONNECTION_TIMEOUT',
          3000,
        ),
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
        clientId: this.configService.get<string>(
          'KAFKA_CLIENT_ID',
          'user-service',
        ),
        brokers: this.configService.get<string[]>(
          'KAFKA_BROKERS',
          ['kafka-1:9092', 'kafka-2:9092', 'kafka-3:9092'],
        ),
        retry: {
          retries: this.configService.get<number>('KAFKA_RETRIES', 10),
          initialRetryTime: this.configService.get<number>(
            'KAFKA_INITIAL_RETRY_TIME',
            100,
          ),
          multiplier: 2,
          maxRetryTime: 30000,
        },
        requestTimeout: this.configService.get<number>(
          'KAFKA_REQUEST_TIMEOUT',
          60000,
        ),
        connectionTimeout: this.configService.get<number>(
          'KAFKA_CONNECTION_TIMEOUT',
          10000,
        ),
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
        clientId: 'test-client',
        brokers: ['localhost:9092'],
        retry: {
          retries: 3,
          initialRetryTime: 100,
        },
        requestTimeout: 10000,
        connectionTimeout: 1000,
      },
    });
  }

  /**
   * Add a custom configuration rule
   */
  addRule(rule: KafkaConfigRule): void {
    this.rules.push(rule);
    this.logger.log(`Added configuration rule: ${rule.name}`);
  }

  /**
   * Get configuration based on rules
   */
  getConfig(context: any = {}): KafkaConnectionConfig {
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
      clientId: 'default-client',
      brokers: ['localhost:9092'],
      retry: {
        retries: 8,
        initialRetryTime: 100,
      },
    };
  }

  /**
   * Get all registered rules
   */
  getRules(): KafkaConfigRule[] {
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

