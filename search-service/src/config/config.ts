import { registerAs } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

interface ConfigYaml {
  app?: {
    port?: number;
    elasticsearch?: {
      node?: string;
      nodes?: string[];
      username?: string;
      password?: string;
      ssl?: {
        rejectUnauthorized?: boolean;
      };
      requestTimeout?: number;
      pingTimeout?: number;
      maxRetries?: number;
    };
  };
}

function loadYamlConfig(): ConfigYaml | null {
  try {
    const configPath = path.join(process.cwd(), 'src', 'config', 'config.yaml');
    if (fs.existsSync(configPath)) {
      const fileContents = fs.readFileSync(configPath, 'utf8');
      return yaml.load(fileContents) as ConfigYaml;
    }
  } catch (error) {
    console.warn('Failed to load config.yaml, falling back to environment variables', error);
  }
  return null;
}

function getConfigValue<T>(
  yamlValue: T | undefined,
  envValue: string | undefined,
  defaultValue: T,
  transform?: (value: string) => T,
): T {
  // Priority: Environment variables > YAML config > defaults
  if (envValue !== undefined) {
    return transform ? transform(envValue) : (envValue as T);
  }
  if (yamlValue !== undefined) {
    return yamlValue;
  }
  return defaultValue;
}

export default registerAs('app', () => {
  const yamlConfig = loadYamlConfig();
  const config = yamlConfig?.app;

  return {
    port: getConfigValue(
      config?.port,
      process.env.PORT,
      3000,
      (value) => parseInt(value, 10),
    ),
    elasticsearch: {
      node: getConfigValue(
        config?.elasticsearch?.node,
        process.env.ELASTICSEARCH_NODE,
        'http://localhost:9200',
      ),
      nodes: getConfigValue(
        config?.elasticsearch?.nodes,
        process.env.ELASTICSEARCH_NODES,
        ['http://localhost:9200'],
        (value) => value.split(',').map((node) => node.trim()),
      ),
      username: getConfigValue(
        config?.elasticsearch?.username,
        process.env.ELASTICSEARCH_USERNAME,
        undefined,
      ),
      password: getConfigValue(
        config?.elasticsearch?.password,
        process.env.ELASTICSEARCH_PASSWORD,
        undefined,
      ),
      ssl: {
        rejectUnauthorized: getConfigValue(
          config?.elasticsearch?.ssl?.rejectUnauthorized,
          process.env.ELASTICSEARCH_SSL_REJECT_UNAUTHORIZED,
          true,
          (value) => value === 'true',
        ),
      },
      requestTimeout: getConfigValue(
        config?.elasticsearch?.requestTimeout,
        process.env.ELASTICSEARCH_REQUEST_TIMEOUT,
        30000,
        (value) => parseInt(value, 10),
      ),
      pingTimeout: getConfigValue(
        config?.elasticsearch?.pingTimeout,
        process.env.ELASTICSEARCH_PING_TIMEOUT,
        3000,
        (value) => parseInt(value, 10),
      ),
      maxRetries: getConfigValue(
        config?.elasticsearch?.maxRetries,
        process.env.ELASTICSEARCH_MAX_RETRIES,
        3,
        (value) => parseInt(value, 10),
      ),
    },
  };
});

