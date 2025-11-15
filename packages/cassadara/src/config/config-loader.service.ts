import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CassandraConfigRule,
  CassandraConnectionConfig,
} from '../interfaces/config.interface';

@Injectable()
export class CassandraConfigLoaderService {
  private readonly logger = new Logger(CassandraConfigLoaderService.name);
  private rules: CassandraConfigRule[] = [];

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
        contactPoints: this.configService.get<string[]>(
          'CASSANDRA_CONTACT_POINTS',
          ['localhost'],
        ),
        localDataCenter: this.configService.get<string>(
          'CASSANDRA_DATA_CENTER',
          'datacenter1',
        ),
        keyspace: this.configService.get<string>(
          'CASSANDRA_KEYSPACE',
          'user_service',
        ),
        credentials: {
          username: this.configService.get<string>('CASSANDRA_USER', 'cassandra'),
          password: this.configService.get<string>(
            'CASSANDRA_PASSWORD',
            'cassandra',
          ),
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
        contactPoints: this.configService.get<string[]>(
          'CASSANDRA_CONTACT_POINTS',
          ['cassandra-1', 'cassandra-2', 'cassandra-3'],
        ),
        localDataCenter: this.configService.get<string>(
          'CASSANDRA_DATA_CENTER',
          'datacenter1',
        ),
        keyspace: this.configService.get<string>(
          'CASSANDRA_KEYSPACE',
          'user_service',
        ),
        credentials: {
          username: this.configService.get<string>('CASSANDRA_USER', 'cassandra'),
          password: this.configService.get<string>('CASSANDRA_PASSWORD', ''),
        },
        queryOptions: {
          consistency: 1, // QUORUM for production
          prepare: true,
        },
        socketOptions: {
          connectTimeout: 5000,
          readTimeout: 10000,
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
        contactPoints: ['localhost'],
        localDataCenter: 'datacenter1',
        keyspace: 'test_keyspace',
        credentials: {
          username: 'cassandra',
          password: 'cassandra',
        },
      },
    });
  }

  /**
   * Add a custom configuration rule
   */
  addRule(rule: CassandraConfigRule): void {
    this.rules.push(rule);
    this.logger.log(`Added configuration rule: ${rule.name}`);
  }

  /**
   * Get configuration based on rules
   */
  getConfig(context: any = {}): CassandraConnectionConfig {
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
      contactPoints: ['localhost'],
      localDataCenter: 'datacenter1',
      keyspace: 'user_service',
      credentials: {
        username: 'cassandra',
        password: 'cassandra',
      },
    };
  }

  /**
   * Get all registered rules
   */
  getRules(): CassandraConfigRule[] {
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

