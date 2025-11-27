import { registerAs } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

interface ConfigYaml {
  app?: {
    port?: number;
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
      ssl?: boolean;
      sasl?: any;
      connectionTimeout?: number;
      requestTimeout?: number;
      enforceRequestTimeout?: boolean;
      sessionTimeout?: number;
      heartbeatInterval?: number;
      maxWaitTimeInMs?: number;
      acks?: number;
      compression?: string;
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
    minio?: {
      endPoint?: string;
      port?: number;
      useSSL?: boolean;
      accessKey?: string;
      secretKey?: string;
      bucketName?: string;
      region?: string;
      connectTimeout?: number;
      requestTimeout?: number;
      maxRetries?: number;
      retryDelay?: number;
      partSize?: string;
      sessionToken?: string;
      publicRead?: boolean;
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
      3002,
      (value) => parseInt(value, 10),
    ),
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
        'material_service',
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
        'material_service',
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
        'material-worker',
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
        'material-worker-group',
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
      ssl: getConfigValue(
        config?.kafka?.ssl,
        process.env.KAFKA_SSL,
        false,
        (value) => value === 'true',
      ),
      sasl: getConfigValue(
        config?.kafka?.sasl,
        process.env.KAFKA_SASL,
        null,
      ),
      connectionTimeout: getConfigValue(
        config?.kafka?.connectionTimeout,
        process.env.KAFKA_CONNECTION_TIMEOUT,
        3000,
        (value) => parseInt(value, 10),
      ),
      requestTimeout: getConfigValue(
        config?.kafka?.requestTimeout,
        process.env.KAFKA_REQUEST_TIMEOUT,
        30000,
        (value) => parseInt(value, 10),
      ),
      enforceRequestTimeout: getConfigValue(
        config?.kafka?.enforceRequestTimeout,
        process.env.KAFKA_ENFORCE_REQUEST_TIMEOUT,
        false,
        (value) => value === 'true',
      ),
      sessionTimeout: getConfigValue(
        config?.kafka?.sessionTimeout,
        process.env.KAFKA_SESSION_TIMEOUT,
        30000,
        (value) => parseInt(value, 10),
      ),
      heartbeatInterval: getConfigValue(
        config?.kafka?.heartbeatInterval,
        process.env.KAFKA_HEARTBEAT_INTERVAL,
        3000,
        (value) => parseInt(value, 10),
      ),
      maxWaitTimeInMs: getConfigValue(
        config?.kafka?.maxWaitTimeInMs,
        process.env.KAFKA_MAX_WAIT_TIME,
        5000,
        (value) => parseInt(value, 10),
      ),
      acks: getConfigValue(
        config?.kafka?.acks,
        process.env.KAFKA_ACKS,
        1,
        (value) => parseInt(value, 10),
      ),
      compression: getConfigValue(
        config?.kafka?.compression,
        process.env.KAFKA_COMPRESSION,
        'gzip',
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
    minio: {
      endPoint: getConfigValue(
        config?.minio?.endPoint,
        process.env.MINIO_ENDPOINT,
        'localhost',
      ),
      port: getConfigValue(
        config?.minio?.port,
        process.env.MINIO_PORT,
        9000,
        (value) => parseInt(value, 10),
      ),
      useSSL: getConfigValue(
        config?.minio?.useSSL,
        process.env.MINIO_USE_SSL,
        false,
        (value) => value === 'true',
      ),
      accessKey: getConfigValue(
        config?.minio?.accessKey,
        process.env.MINIO_ACCESS_KEY,
        'minioadmin',
      ),
      secretKey: getConfigValue(
        config?.minio?.secretKey,
        process.env.MINIO_SECRET_KEY,
        'minioadmin',
      ),
      bucketName: getConfigValue(
        config?.minio?.bucketName,
        process.env.MINIO_BUCKET_NAME,
        'material-worker',
      ),
      region: getConfigValue(
        config?.minio?.region,
        process.env.MINIO_REGION,
        'us-east-1',
      ),
      connectTimeout: getConfigValue(
        config?.minio?.connectTimeout,
        process.env.MINIO_CONNECT_TIMEOUT,
        5000,
        (value) => parseInt(value, 10),
      ),
      requestTimeout: getConfigValue(
        config?.minio?.requestTimeout,
        process.env.MINIO_REQUEST_TIMEOUT,
        10000,
        (value) => parseInt(value, 10),
      ),
      maxRetries: getConfigValue(
        config?.minio?.maxRetries,
        process.env.MINIO_MAX_RETRIES,
        3,
        (value) => parseInt(value, 10),
      ),
      retryDelay: getConfigValue(
        config?.minio?.retryDelay,
        process.env.MINIO_RETRY_DELAY,
        1000,
        (value) => parseInt(value, 10),
      ),
      partSize: getConfigValue(
        config?.minio?.partSize,
        process.env.MINIO_PART_SIZE,
        '64MB',
      ),
      sessionToken: getConfigValue(
        config?.minio?.sessionToken,
        process.env.MINIO_SESSION_TOKEN,
        null,
      ),
      publicRead: getConfigValue(
        config?.minio?.publicRead,
        process.env.MINIO_PUBLIC_READ,
        false,
        (value) => value === 'true',
      ),
    },
  };
});

