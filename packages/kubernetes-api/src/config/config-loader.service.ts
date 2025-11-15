import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  KubernetesConfigRule,
  KubernetesConnectionConfig,
} from '../interfaces/config.interface';

@Injectable()
export class KubernetesConfigLoaderService {
  private readonly logger = new Logger(KubernetesConfigLoaderService.name);
  private rules: KubernetesConfigRule[] = [];

  constructor(private readonly configService: ConfigService) {
    this.loadDefaultRules();
  }

  /**
   * Load default configuration rules
   */
  private loadDefaultRules(): void {
    // Rule 1: Development environment (local kubeconfig)
    this.addRule({
      name: 'development',
      condition: (context) => {
        const env = this.configService.get<string>('NODE_ENV', 'development');
        return env === 'development' || env === 'dev';
      },
      config: {
        context: this.configService.get<string>(
          'KUBE_CONTEXT',
          'minikube',
        ),
        namespace: this.configService.get<string>(
          'KUBE_NAMESPACE',
          'default',
        ),
        skipTLSVerify: this.configService.get<boolean>(
          'KUBE_SKIP_TLS_VERIFY',
          true,
        ),
        requestTimeout: this.configService.get<number>(
          'KUBE_REQUEST_TIMEOUT',
          30000,
        ),
        watchTimeout: this.configService.get<number>(
          'KUBE_WATCH_TIMEOUT',
          60000,
        ),
      },
    });

    // Rule 2: Production environment (cluster config)
    this.addRule({
      name: 'production',
      condition: (context) => {
        const env = this.configService.get<string>('NODE_ENV', 'development');
        return env === 'production' || env === 'prod';
      },
      config: {
        server: this.configService.get<string>('KUBE_SERVER', ''),
        caData: this.configService.get<string>('KUBE_CA_DATA'),
        certData: this.configService.get<string>('KUBE_CERT_DATA'),
        keyData: this.configService.get<string>('KUBE_KEY_DATA'),
        namespace: this.configService.get<string>(
          'KUBE_NAMESPACE',
          'production',
        ),
        skipTLSVerify: false,
        requestTimeout: this.configService.get<number>(
          'KUBE_REQUEST_TIMEOUT',
          60000,
        ),
        watchTimeout: this.configService.get<number>(
          'KUBE_WATCH_TIMEOUT',
          300000,
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
        context: 'test-context',
        namespace: 'test',
        skipTLSVerify: true,
        requestTimeout: 10000,
        watchTimeout: 30000,
      },
    });
  }

  /**
   * Add a custom configuration rule
   */
  addRule(rule: KubernetesConfigRule): void {
    this.rules.push(rule);
    this.logger.log(`Added configuration rule: ${rule.name}`);
  }

  /**
   * Get configuration based on rules
   */
  getConfig(context: any = {}): KubernetesConnectionConfig {
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
      context: 'default',
      namespace: 'default',
      skipTLSVerify: false,
      requestTimeout: 30000,
      watchTimeout: 60000,
    };
  }

  /**
   * Get all registered rules
   */
  getRules(): KubernetesConfigRule[] {
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

