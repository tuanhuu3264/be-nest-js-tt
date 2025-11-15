import { registerAs } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

interface ConfigYaml {
  app?: {
    port?: number;
    grpcUrl?: string;
    postgres?: {
      host?: string;
      port?: number;
      username?: string;
      password?: string;
      database?: string;
      sync?: boolean;
      logging?: boolean;
    };
    cassandra?: {
      contactPoints?: string[];
      dataCenter?: string;
      keyspace?: string;
      username?: string;
      password?: string;
    };
    kafka?: {
      clientId?: string;
      brokers?: string[];
      groupId?: string;
      retries?: number;
      initialRetryTime?: number;
    };
    redis?: {
      host?: string;
      port?: number;
      password?: string;
      db?: number;
    };
    snowflake?: {
      machineId?: number;
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
    grpcUrl: getConfigValue(config?.grpcUrl, process.env.GRPC_URL, '0.0.0.0:5000'),
    postgres: {
      host: getConfigValue(config?.postgres?.host, process.env.POSTGRES_HOST, 'localhost'),
      port: getConfigValue(
        config?.postgres?.port,
        process.env.POSTGRES_PORT,
        5432,
        (value) => parseInt(value, 10),
      ),
      username: getConfigValue(
        config?.postgres?.username,
        process.env.POSTGRES_USER,
        'postgres',
      ),
      password: getConfigValue(
        config?.postgres?.password,
        process.env.POSTGRES_PASSWORD,
        'postgres',
      ),
      database: getConfigValue(
        config?.postgres?.database,
        process.env.POSTGRES_DB,
        'user_service',
      ),
      sync: getConfigValue(
        config?.postgres?.sync,
        process.env.POSTGRES_SYNC,
        false,
        (value) => value === 'true',
      ),
      logging: getConfigValue(
        config?.postgres?.logging,
        process.env.POSTGRES_LOGGING,
        false,
        (value) => value === 'true',
      ),
    },
    cassandra: {
      contactPoints: getConfigValue(
        config?.cassandra?.contactPoints,
        process.env.CASSANDRA_CONTACT_POINTS,
        ['localhost'],
        (value) => value.split(','),
      ),
      dataCenter: getConfigValue(
        config?.cassandra?.dataCenter,
        process.env.CASSANDRA_DATA_CENTER,
        'datacenter1',
      ),
      keyspace: getConfigValue(
        config?.cassandra?.keyspace,
        process.env.CASSANDRA_KEYSPACE,
        'user_service',
      ),
      username: getConfigValue(
        config?.cassandra?.username,
        process.env.CASSANDRA_USER,
        'cassandra',
      ),
      password: getConfigValue(
        config?.cassandra?.password,
        process.env.CASSANDRA_PASSWORD,
        'cassandra',
      ),
    },
    kafka: {
      clientId: getConfigValue(
        config?.kafka?.clientId,
        process.env.KAFKA_CLIENT_ID,
        'user-service',
      ),
      brokers: getConfigValue(
        config?.kafka?.brokers,
        process.env.KAFKA_BROKERS,
        ['localhost:9092'],
        (value) => value.split(','),
      ),
      groupId: getConfigValue(
        config?.kafka?.groupId,
        process.env.KAFKA_GROUP_ID,
        'user-service-group',
      ),
      retries: getConfigValue(
        config?.kafka?.retries,
        process.env.KAFKA_RETRIES,
        8,
        (value) => parseInt(value, 10),
      ),
      initialRetryTime: getConfigValue(
        config?.kafka?.initialRetryTime,
        process.env.KAFKA_INITIAL_RETRY_TIME,
        100,
        (value) => parseInt(value, 10),
      ),
    },
    redis: {
      host: getConfigValue(config?.redis?.host, process.env.REDIS_HOST, 'localhost'),
      port: getConfigValue(
        config?.redis?.port,
        process.env.REDIS_PORT,
        6379,
        (value) => parseInt(value, 10),
      ),
      password: getConfigValue(
        config?.redis?.password,
        process.env.REDIS_PASSWORD,
        undefined,
      ),
      db: getConfigValue(
        config?.redis?.db,
        process.env.REDIS_DB,
        0,
        (value) => parseInt(value, 10),
      ),
    },
    snowflake: {
      machineId: getConfigValue(
        config?.snowflake?.machineId,
        process.env.SNOWFLAKE_MACHINE_ID,
        undefined,
        (value) => parseInt(value, 10),
      ),
    },
  };
});
