import { Injectable, Inject, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import type { Producer, Consumer, ProducerRecord, Message, EachMessagePayload } from 'kafkajs';
import { KAFKA_PRODUCER, KAFKA_CONSUMER } from './kafka.module';

export interface KafkaMessage {
  topic: string;
  messages: Array<{
    key?: string | Buffer;
    value: string | Buffer;
    partition?: number;
    headers?: Record<string, string | Buffer>;
  }>;
}

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);

  constructor(
    @Inject(KAFKA_PRODUCER)
    private readonly producer: Producer,
    @Inject(KAFKA_CONSUMER)
    private readonly consumer: Consumer,
  ) {}

  async onModuleInit() {
    try {
      await this.producer.connect();
      await this.consumer.connect();
      this.logger.log('Kafka producer and consumer connected');
    } catch (error) {
      this.logger.error('Failed to connect to Kafka', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
      await this.consumer.disconnect();
      this.logger.log('Kafka producer and consumer disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting from Kafka', error);
    }
  }

  async sendMessage(topic: string, message: object | string, key?: string): Promise<void> {
    try {
      const value = typeof message === 'string' ? message : JSON.stringify(message);
      await this.producer.send({
        topic,
        messages: [
          {
            key,
            value,
          },
        ],
      });
      this.logger.debug(`Message sent to topic: ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to send message to topic: ${topic}`, error);
      throw error;
    }
  }

  async sendBatch(messages: KafkaMessage): Promise<void> {
    try {
      const producerRecord: ProducerRecord = {
        topic: messages.topic,
        messages: messages.messages.map((msg) => ({
          key: typeof msg.key === 'string' ? Buffer.from(msg.key) : msg.key,
          value: typeof msg.value === 'string' ? Buffer.from(msg.value) : msg.value,
          partition: msg.partition,
          headers: msg.headers
            ? Object.entries(msg.headers).reduce((acc, [k, v]) => {
                acc[k] = typeof v === 'string' ? Buffer.from(v) : v;
                return acc;
              }, {} as Record<string, Buffer>)
            : undefined,
        })),
      };
      await this.producer.send(producerRecord);
      this.logger.debug(`Batch messages sent to topic: ${messages.topic}`);
    } catch (error) {
      this.logger.error(`Failed to send batch messages to topic: ${messages.topic}`, error);
      throw error;
    }
  }

  async subscribe(topic: string, fromBeginning: boolean = false): Promise<void> {
    try {
      await this.consumer.subscribe({ topic, fromBeginning });
      this.logger.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to subscribe to topic: ${topic}`, error);
      throw error;
    }
  }

  async run(
    handler: (message: {
      topic: string;
      partition: number;
      message: {
        key?: Buffer | null;
        value: Buffer | null;
        headers?: Record<string, Buffer | string | (string | Buffer)[] | undefined>;
        timestamp: string;
        offset: string;
      };
    }) => Promise<void>,
  ): Promise<void> {
    try {
      await this.consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          try {
            const { topic, partition, message } = payload;
            await handler({
              topic,
              partition,
              message: {
                key: message.key ?? undefined,
                value: message.value ?? null,
                headers: message.headers as Record<string, Buffer | string | (string | Buffer)[] | undefined> | undefined,
                timestamp: message.timestamp,
                offset: message.offset,
              },
            });
          } catch (error) {
            this.logger.error(`Error processing message from topic: ${payload.topic}`, error);
          }
        },
      });
    } catch (error) {
      this.logger.error('Error running consumer', error);
      throw error;
    }
  }
}

