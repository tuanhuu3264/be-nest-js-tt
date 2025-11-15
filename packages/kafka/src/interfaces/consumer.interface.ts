import { EachMessagePayload, EachBatchPayload } from 'kafkajs';

export interface IKafkaConsumer {
  subscribe(topics: string[]): Promise<void>;
  run(
    options: {
      eachMessage?: (payload: EachMessagePayload) => Promise<void>;
      eachBatch?: (payload: EachBatchPayload) => Promise<void>;
    },
  ): Promise<void>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  pause(topics: Array<{ topic: string; partitions?: number[] }>): void;
  resume(topics: Array<{ topic: string; partitions?: number[] }>): void;
}

