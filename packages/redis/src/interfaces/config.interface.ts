import { RedisOptions } from 'ioredis';

export interface RedisConfigRule {
  name: string;
  condition: (context: any) => boolean;
  config: RedisConnectionConfig;
}

export interface RedisConnectionConfig extends RedisOptions {
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  family?: number;
  keepAlive?: number;
  connectTimeout?: number;
  lazyConnect?: boolean;
  maxRetriesPerRequest?: number;
  retryStrategy?: (times: number) => number | null | void;
  enableReadyCheck?: boolean;
  enableOfflineQueue?: boolean;
  enableAutoPipelining?: boolean;
}

