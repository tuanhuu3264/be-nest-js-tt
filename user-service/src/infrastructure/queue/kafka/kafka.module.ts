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
        const kafkaConfig: KafkaConfig = {
          clientId: configService.get<string>('KAFKA_CLIENT_ID', 'user-service'),
          brokers: configService.get<string[]>('KAFKA_BROKERS', ['localhost:9092']),
          retry: {
            retries: configService.get<number>('KAFKA_RETRIES', 8),
            initialRetryTime: configService.get<number>('KAFKA_INITIAL_RETRY_TIME', 100),
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
        const groupId = configService.get<string>('KAFKA_GROUP_ID', 'user-service-group');
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

