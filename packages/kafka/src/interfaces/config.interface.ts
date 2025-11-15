import { KafkaConfig, ProducerConfig, ConsumerConfig } from 'kafkajs';

export interface KafkaConfigRule {
  name: string;
  condition: (context: any) => boolean;
  config: KafkaConnectionConfig;
}

export interface KafkaConnectionConfig extends KafkaConfig {
  brokers: string[];
  clientId: string;
  retry?: {
    retries?: number;
    initialRetryTime?: number;
    multiplier?: number;
    maxRetryTime?: number;
  };
  requestTimeout?: number;
  connectionTimeout?: number;
}

export interface KafkaProducerConfig extends ProducerConfig {
  allowAutoTopicCreation?: boolean;
  transactionTimeout?: number;
  idempotent?: boolean;
  maxInFlightRequests?: number;
}

export interface KafkaConsumerConfig extends ConsumerConfig {
  groupId: string;
  allowAutoTopicCreation?: boolean;
  sessionTimeout?: number;
  heartbeatInterval?: number;
  maxBytesPerPartition?: number;
  minBytes?: number;
  maxBytes?: number;
  maxWaitTimeInMs?: number;
}

