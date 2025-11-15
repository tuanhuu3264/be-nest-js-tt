import { Message, TopicMessages } from 'kafkajs';

export interface IKafkaProducer {
  send(topic: string, messages: Message[]): Promise<void>;
  sendBatch(topicMessages: TopicMessages[]): Promise<void>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}

