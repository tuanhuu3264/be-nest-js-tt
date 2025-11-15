import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import {
  Consumer,
  EachMessagePayload,
  EachBatchPayload,
} from 'kafkajs';
import { IKafkaConsumer } from '../interfaces/consumer.interface';

@Injectable()
export class KafkaConsumerService
  implements IKafkaConsumer, OnModuleDestroy
{
  private readonly logger = new Logger(KafkaConsumerService.name);
  private connected = false;

  constructor(private readonly consumer: Consumer) {}

  /**
   * Connect the consumer
   */
  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    try {
      await this.consumer.connect();
      this.connected = true;
      this.logger.log('Kafka consumer connected');
    } catch (error) {
      this.logger.error(
        `Error connecting consumer: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Subscribe to topics
   */
  async subscribe(topics: string[]): Promise<void> {
    if (!this.connected) {
      await this.connect();
    }

    try {
      await this.consumer.subscribe({ topics });
      this.logger.log(`Subscribed to topics: ${topics.join(', ')}`);
    } catch (error) {
      this.logger.error(
        `Error subscribing to topics: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Run the consumer with message handlers
   */
  async run(options: {
    eachMessage?: (payload: EachMessagePayload) => Promise<void>;
    eachBatch?: (payload: EachBatchPayload) => Promise<void>;
  }): Promise<void> {
    if (!this.connected) {
      await this.connect();
    }

    try {
      await this.consumer.run({
        eachMessage: options.eachMessage
          ? async (payload) => {
              try {
                await options.eachMessage!(payload);
              } catch (error) {
                this.logger.error(
                  `Error processing message: ${error.message}`,
                  error.stack,
                );
              }
            }
          : undefined,
        eachBatch: options.eachBatch
          ? async (payload) => {
              try {
                await options.eachBatch!(payload);
              } catch (error) {
                this.logger.error(
                  `Error processing batch: ${error.message}`,
                  error.stack,
                );
              }
            }
          : undefined,
      });
    } catch (error) {
      this.logger.error(
        `Error running consumer: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Pause consumption from topics
   */
  pause(topics: Array<{ topic: string; partitions?: number[] }>): void {
    try {
      this.consumer.pause(topics);
      this.logger.log(
        `Paused consumption from topics: ${topics.map((t) => t.topic).join(', ')}`,
      );
    } catch (error) {
      this.logger.error(
        `Error pausing consumer: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Resume consumption from topics
   */
  resume(topics: Array<{ topic: string; partitions?: number[] }>): void {
    try {
      this.consumer.resume(topics);
      this.logger.log(
        `Resumed consumption from topics: ${topics.map((t) => t.topic).join(', ')}`,
      );
    } catch (error) {
      this.logger.error(
        `Error resuming consumer: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Check if consumer is connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Disconnect the consumer
   */
  async disconnect(): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      await this.consumer.disconnect();
      this.connected = false;
      this.logger.log('Kafka consumer disconnected');
    } catch (error) {
      this.logger.error(
        `Error disconnecting consumer: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }
}

