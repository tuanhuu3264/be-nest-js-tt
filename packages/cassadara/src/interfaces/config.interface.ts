export interface CassandraConfigRule {
  name: string;
  condition: (context: any) => boolean;
  config: CassandraConnectionConfig;
}

export interface CassandraConnectionConfig {
  contactPoints: string[];
  localDataCenter: string;
  keyspace: string;
  credentials?: {
    username: string;
    password: string;
  };
  queryOptions?: {
    consistency?: number;
    prepare?: boolean;
  };
  socketOptions?: {
    connectTimeout?: number;
    readTimeout?: number;
  };
}

export interface CassandraProducerConfig {
  batchSize?: number;
  consistencyLevel?: number;
  defaultTimestamp?: number;
}

export interface CassandraConsumerConfig {
  fetchSize?: number;
  autoPage?: boolean;
  prepare?: boolean;
}

