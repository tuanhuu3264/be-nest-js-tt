import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  WebSocketConfigRule,
  WebSocketConnectionConfig,
} from '../interfaces/config.interface';

@Injectable()
export class WebSocketConfigLoaderService {
  private readonly logger = new Logger(WebSocketConfigLoaderService.name);
  private rules: WebSocketConfigRule[] = [];

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
        namespace: this.configService.get<string>('WS_NAMESPACE', '/'),
        cors: {
          origin: this.configService.get<string>(
            'WS_CORS_ORIGIN',
            'http://localhost:3000',
          ),
          credentials: true,
        },
        transports: ['websocket', 'polling'],
        pingTimeout: this.configService.get<number>('WS_PING_TIMEOUT', 60000),
        pingInterval: this.configService.get<number>(
          'WS_PING_INTERVAL',
          25000,
        ),
        maxHttpBufferSize: this.configService.get<number>(
          'WS_MAX_HTTP_BUFFER_SIZE',
          1e6,
        ),
        path: this.configService.get<string>('WS_PATH', '/socket.io'),
        serveClient: true,
        connectTimeout: 45000,
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
        namespace: this.configService.get<string>('WS_NAMESPACE', '/'),
        cors: {
          origin: this.configService.get<string[]>(
            'WS_CORS_ORIGIN',
            ['https://example.com'],
          ),
          credentials: true,
        },
        transports: ['websocket'],
        pingTimeout: this.configService.get<number>('WS_PING_TIMEOUT', 120000),
        pingInterval: this.configService.get<number>(
          'WS_PING_INTERVAL',
          25000,
        ),
        maxHttpBufferSize: this.configService.get<number>(
          'WS_MAX_HTTP_BUFFER_SIZE',
          1e6,
        ),
        path: this.configService.get<string>('WS_PATH', '/socket.io'),
        serveClient: false,
        connectTimeout: 60000,
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
        namespace: '/',
        cors: {
          origin: '*',
          credentials: false,
        },
        transports: ['websocket'],
        pingTimeout: 10000,
        pingInterval: 5000,
        maxHttpBufferSize: 1e5,
        path: '/socket.io',
        serveClient: false,
        connectTimeout: 10000,
      },
    });
  }

  /**
   * Add a custom configuration rule
   */
  addRule(rule: WebSocketConfigRule): void {
    this.rules.push(rule);
    this.logger.log(`Added configuration rule: ${rule.name}`);
  }

  /**
   * Get configuration based on rules
   */
  getConfig(context: any = {}): WebSocketConnectionConfig {
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
      namespace: '/',
      cors: {
        origin: '*',
        credentials: false,
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
      path: '/socket.io',
      serveClient: true,
    };
  }

  /**
   * Get all registered rules
   */
  getRules(): WebSocketConfigRule[] {
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

