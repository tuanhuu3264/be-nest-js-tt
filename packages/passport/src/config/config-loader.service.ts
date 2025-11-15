import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PassportConfigRule,
  PassportConnectionConfig,
} from '../interfaces/config.interface';

@Injectable()
export class PassportConfigLoaderService {
  private readonly logger = new Logger(PassportConfigLoaderService.name);
  private rules: PassportConfigRule[] = [];

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
        jwt: {
          secret: this.configService.get<string>(
            'JWT_SECRET',
            'development-secret-key',
          ),
          signOptions: {
            expiresIn: this.configService.get<string>(
              'JWT_EXPIRES_IN',
              '1d',
            ),
            issuer: this.configService.get<string>('JWT_ISSUER', 'app'),
            audience: this.configService.get<string>('JWT_AUDIENCE', 'users'),
          },
        },
        local: {
          usernameField: 'email',
          passwordField: 'password',
          session: false,
        },
        defaultStrategy: 'jwt',
        session: false,
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
        jwt: {
          secret: this.configService.get<string>('JWT_SECRET', ''),
          signOptions: {
            expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
            issuer: this.configService.get<string>('JWT_ISSUER', 'app'),
            audience: this.configService.get<string>('JWT_AUDIENCE', 'users'),
          },
        },
        local: {
          usernameField: 'email',
          passwordField: 'password',
          session: false,
        },
        defaultStrategy: 'jwt',
        session: false,
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
        jwt: {
          secret: 'test-secret-key',
          signOptions: {
            expiresIn: '1h',
            issuer: 'test-app',
            audience: 'test-users',
          },
        },
        local: {
          usernameField: 'email',
          passwordField: 'password',
          session: false,
        },
        defaultStrategy: 'jwt',
        session: false,
      },
    });
  }

  /**
   * Add a custom configuration rule
   */
  addRule(rule: PassportConfigRule): void {
    this.rules.push(rule);
    this.logger.log(`Added configuration rule: ${rule.name}`);
  }

  /**
   * Get configuration based on rules
   */
  getConfig(context: any = {}): PassportConnectionConfig {
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
      jwt: {
        secret: 'default-secret-key',
        signOptions: {
          expiresIn: '1d',
        },
      },
      local: {
        usernameField: 'email',
        passwordField: 'password',
        session: false,
      },
      defaultStrategy: 'jwt',
      session: false,
    };
  }

  /**
   * Get all registered rules
   */
  getRules(): PassportConfigRule[] {
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

