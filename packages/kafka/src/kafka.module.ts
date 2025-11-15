import { Module, Global, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Kafka, Producer, Consumer } from 'kafkajs';
import { KafkaConfigLoaderService } from './config/config-loader.service';
import { KafkaProducerService } from './services/producer.service';
import { KafkaConsumerService } from './services/consumer.service';
import {
  KafkaConnectionConfig,
  KafkaProducerConfig,
  KafkaConsumerConfig,
} from './interfaces/config.interface';

export const KAFKA_CLIENT = 'KAFKA_CLIENT';
export const KAFKA_PRODUCER = 'KAFKA_PRODUCER';
export const KAFKA_CONSUMER = 'KAFKA_CONSUMER';

@Global()
@Module({})
export class KafkaModule {
  static forRoot(context?: any): DynamicModule {
    return {
      module: KafkaModule,
      imports: [ConfigModule],
      providers: [
        KafkaConfigLoaderService,
        {
          provide: KAFKA_CLIENT,
          useFactory: (
            configService: ConfigService,
            configLoader: KafkaConfigLoaderService,
          ): Kafka => {
            const config: KafkaConnectionConfig =
              configLoader.getConfig(context);
            return new Kafka(config);
          },
          inject: [ConfigService, KafkaConfigLoaderService],
        },
        {
          provide: KAFKA_PRODUCER,
          useFactory: (
            kafka: Kafka,
            configService: ConfigService,
          ): Producer => {
            const producerConfig: KafkaProducerConfig = {
              allowAutoTopicCreation: configService.get<boolean>(
                'KAFKA_ALLOW_AUTO_TOPIC_CREATION',
                true,
              ),
              transactionTimeout: configService.get<number>(
                'KAFKA_TRANSACTION_TIMEOUT',
                30000,
              ),
              idempotent: configService.get<boolean>(
                'KAFKA_IDEMPOTENT',
                false,
              ),
            };
            return kafka.producer(producerConfig);
          },
          inject: [KAFKA_CLIENT, ConfigService],
        },
        {
          provide: KAFKA_CONSUMER,
          useFactory: (
            kafka: Kafka,
            configService: ConfigService,
          ): Consumer => {
            const groupId = configService.get<string>(
              'KAFKA_GROUP_ID',
              'default-group',
            );
            const consumerConfig: KafkaConsumerConfig = {
              groupId,
              allowAutoTopicCreation: configService.get<boolean>(
                'KAFKA_ALLOW_AUTO_TOPIC_CREATION',
                true,
              ),
              sessionTimeout: configService.get<number>(
                'KAFKA_SESSION_TIMEOUT',
                30000,
              ),
              heartbeatInterval: configService.get<number>(
                'KAFKA_HEARTBEAT_INTERVAL',
                3000,
              ),
            };
            return kafka.consumer(consumerConfig);
          },
          inject: [KAFKA_CLIENT, ConfigService],
        },
        {
          provide: KafkaProducerService,
          useFactory: (producer: Producer): KafkaProducerService => {
            return new KafkaProducerService(producer);
          },
          inject: [KAFKA_PRODUCER],
        },
        {
          provide: KafkaConsumerService,
          useFactory: (consumer: Consumer): KafkaConsumerService => {
            return new KafkaConsumerService(consumer);
          },
          inject: [KAFKA_CONSUMER],
        },
      ],
      exports: [
        KAFKA_CLIENT,
        KAFKA_PRODUCER,
        KAFKA_CONSUMER,
        KafkaConfigLoaderService,
        KafkaProducerService,
        KafkaConsumerService,
      ],
    };
  }
}

