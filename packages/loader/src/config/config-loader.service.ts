import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import {
  LoaderConfigRule,
  LoaderConnectionConfig,
} from '../interfaces/config.interface';

@Injectable()
export class LoaderConfigLoaderService {
  private readonly logger = new Logger(LoaderConfigLoaderService.name);
  private rules: LoaderConfigRule[] = [];
  private loadedConfig: any = {};

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
        configPath: this.configService.get<string>(
          'CONFIG_PATH',
          './config',
        ),
        configFile: this.configService.get<string>(
          'CONFIG_FILE',
          'config.yaml',
        ),
        watch: this.configService.get<boolean>('CONFIG_WATCH', true),
        encoding: 'utf8',
        validate: false,
        cache: false,
        expandVariables: true,
        loaders: {
          yaml: true,
          json: true,
          env: true,
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
        configPath: this.configService.get<string>(
          'CONFIG_PATH',
          '/app/config',
        ),
        configFile: this.configService.get<string>(
          'CONFIG_FILE',
          'config.prod.yaml',
        ),
        watch: false,
        encoding: 'utf8',
        validate: true,
        cache: true,
        expandVariables: true,
        loaders: {
          yaml: true,
          json: true,
          env: true,
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
        configPath: './test/config',
        configFile: 'config.test.yaml',
        watch: false,
        encoding: 'utf8',
        validate: false,
        cache: false,
        expandVariables: false,
        loaders: {
          yaml: true,
          json: true,
          env: false,
        },
      },
    });
  }

  /**
   * Add a custom configuration rule
   */
  addRule(rule: LoaderConfigRule): void {
    this.rules.push(rule);
    this.logger.log(`Added configuration rule: ${rule.name}`);
  }

  /**
   * Get configuration based on rules
   */
  getConfig(context: any = {}): LoaderConnectionConfig {
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
      configPath: './config',
      configFile: 'config.yaml',
      watch: false,
      encoding: 'utf8',
      validate: false,
      cache: false,
      expandVariables: true,
      loaders: {
        yaml: true,
        json: true,
        env: true,
      },
    };
  }

  /**
   * Load configuration from file
   */
  load(context: any = {}): any {
    const config = this.getConfig(context);
    const configPath = path.resolve(
      config.configPath || './config',
      config.configFile || 'config.yaml',
    );

    try {
      if (fs.existsSync(configPath)) {
        const fileContent = fs.readFileSync(configPath, config.encoding || 'utf8');
        const ext = path.extname(configPath).toLowerCase();

        if (ext === '.yaml' || ext === '.yml') {
          this.loadedConfig = yaml.load(fileContent);
        } else if (ext === '.json') {
          this.loadedConfig = JSON.parse(fileContent);
        } else {
          this.logger.warn(`Unsupported config file format: ${ext}`);
          this.loadedConfig = {};
        }

        this.logger.log(`Configuration loaded from: ${configPath}`);
        return this.loadedConfig;
      } else {
        this.logger.warn(`Config file not found: ${configPath}`);
        return {};
      }
    } catch (error) {
      this.logger.error(
        `Error loading configuration: ${error.message}`,
        error.stack,
      );
      return {};
    }
  }

  /**
   * Get loaded configuration
   */
  getLoadedConfig(): any {
    return this.loadedConfig;
  }

  /**
   * Get all registered rules
   */
  getRules(): LoaderConfigRule[] {
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

