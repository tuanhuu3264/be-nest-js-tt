import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Kafka, Producer, Consumer, KafkaConfig } from 'kafkajs';

export const KAFKA_PRODUCER = 'KAFKA_PRODUCER';
export const KAFKA_CONSUMER = 'KAFKA_CONSUMER';
export const KAFKA_CLIENT = 'KAFKA_CLIENT';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: KAFKA_CLIENT,
      useFactory: (configService: ConfigService): Kafka => {
        const clientId = process.env.KAFKA_CLIENT_ID || configService.get<string>('app.kafka.clientId', 'material-worker');
        const brokers = process.env.KAFKA_BROKERS
          ? process.env.KAFKA_BROKERS.split(',')
          : configService.get<string[]>('app.kafka.brokers', ['localhost:9092']);
        const retries = process.env.KAFKA_RETRIES
          ? parseInt(process.env.KAFKA_RETRIES, 10)
          : configService.get<number>('app.kafka.retries', 8);
        const initialRetryTime = process.env.KAFKA_INITIAL_RETRY_TIME
          ? parseInt(process.env.KAFKA_INITIAL_RETRY_TIME, 10)
          : configService.get<number>('app.kafka.initialRetryTime', 100);

        const kafkaConfig: KafkaConfig = {
          clientId,
          brokers,
          retry: {
            retries,
            initialRetryTime,
          },
        };
        return new Kafka(kafkaConfig);
      },
      inject: [ConfigService],
    },
    {
      provide: KAFKA_PRODUCER,
      useFactory: (kafka: Kafka): Producer => {
        return kafka.producer({
          allowAutoTopicCreation: true,
          transactionTimeout: 30000,
        });
      },
      inject: [KAFKA_CLIENT],
    },
    {
      provide: KAFKA_CONSUMER,
      useFactory: (configService: ConfigService, kafka: Kafka): Consumer => {
        const groupId = process.env.KAFKA_GROUP_ID || configService.get<string>('app.kafka.groupId', 'material-worker-group');
        return kafka.consumer({
          groupId,
          allowAutoTopicCreation: true,
        });
      },
      inject: [ConfigService, KAFKA_CLIENT],
    },
  ],
  exports: [KAFKA_PRODUCER, KAFKA_CONSUMER, KAFKA_CLIENT],
})
export class KafkaModule {}

