import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export interface PostgreSQLConfigRule {
  name: string;
  condition: (context: any) => boolean;
  config: PostgreSQLConnectionConfig;
}

export interface PostgreSQLConnectionConfig extends TypeOrmModuleOptions {
  type: 'postgres';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize?: boolean;
  logging?: boolean | 'all' | ('query' | 'error' | 'schema' | 'warn' | 'info' | 'log' | 'migration')[];
  entities?: any[];
  migrations?: string[];
  subscribers?: string[];
  ssl?: boolean | { rejectUnauthorized: boolean };
  extra?: {
    max?: number;
    min?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
  };
}

