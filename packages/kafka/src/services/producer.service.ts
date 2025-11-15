import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Producer, Message, TopicMessages } from 'kafkajs';
import { IKafkaProducer } from '../interfaces/producer.interface';

@Injectable()
export class KafkaProducerService
  implements IKafkaProducer, OnModuleDestroy
{
  private readonly logger = new Logger(KafkaProducerService.name);
  private connected = false;

  constructor(private readonly producer: Producer) {}

  /**
   * Connect the producer
   */
  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    try {
      await this.producer.connect();
      this.connected = true;
      this.logger.log('Kafka producer connected');
    } catch (error) {
      this.logger.error(
        `Error connecting producer: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Send messages to a topic
   */
  async send(topic: string, messages: Message[]): Promise<void> {
    if (!this.connected) {
      await this.connect();
    }

    try {
      await this.producer.send({
        topic,
        messages,
      });
      this.logger.debug(
        `Messages sent to topic ${topic}: ${messages.length} messages`,
      );
    } catch (error) {
      this.logger.error(
        `Error sending messages to topic ${topic}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Send messages to multiple topics in a batch
   */
  async sendBatch(topicMessages: TopicMessages[]): Promise<void> {
    if (!this.connected) {
      await this.connect();
    }

    try {
      await this.producer.sendBatch({
        topicMessages,
      });
      this.logger.debug(
        `Batch sent: ${topicMessages.length} topics`,
      );
    } catch (error) {
      this.logger.error(
        `Error sending batch: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Check if producer is connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Disconnect the producer
   */
  async disconnect(): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      await this.producer.disconnect();
      this.connected = false;
      this.logger.log('Kafka producer disconnected');
    } catch (error) {
      this.logger.error(
        `Error disconnecting producer: ${error.message}`,
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

