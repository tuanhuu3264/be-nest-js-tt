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

        const ssl = process.env.KAFKA_SSL === 'true' || configService.get<boolean>('app.kafka.ssl', false);
        const sasl = process.env.KAFKA_SASL || configService.get<any>('app.kafka.sasl', null);
        const connectionTimeout = process.env.KAFKA_CONNECTION_TIMEOUT
          ? parseInt(process.env.KAFKA_CONNECTION_TIMEOUT, 10)
          : configService.get<number>('app.kafka.connectionTimeout', 3000);
        const requestTimeout = process.env.KAFKA_REQUEST_TIMEOUT
          ? parseInt(process.env.KAFKA_REQUEST_TIMEOUT, 10)
          : configService.get<number>('app.kafka.requestTimeout', 30000);
        const enforceRequestTimeout = process.env.KAFKA_ENFORCE_REQUEST_TIMEOUT === 'true' 
          || configService.get<boolean>('app.kafka.enforceRequestTimeout', false);

        const kafkaConfig: KafkaConfig = {
          clientId,
          brokers,
          ssl: ssl || undefined,
          sasl: sasl || undefined,
          connectionTimeout,
          requestTimeout,
          enforceRequestTimeout,
          retry: {
            retries,
            initialRetryTime,
          },
          logLevel: 2, // INFO level
        };
        return new Kafka(kafkaConfig);
      },
      inject: [ConfigService],
    },
    {
      provide: KAFKA_PRODUCER,
      useFactory: (kafka: Kafka, configService: ConfigService): Producer => {
        const acks = process.env.KAFKA_ACKS
          ? parseInt(process.env.KAFKA_ACKS, 10)
          : configService.get<number>('app.kafka.acks', 1);
        const compression = process.env.KAFKA_COMPRESSION || configService.get<string>('app.kafka.compression', 'gzip');

        return kafka.producer({
          allowAutoTopicCreation: true,
          transactionTimeout: 30000,
          retry: {
            retries: 5,
            initialRetryTime: 100,
          },
        });
      },
      inject: [KAFKA_CLIENT, ConfigService],
    },
    {
      provide: KAFKA_CONSUMER,
      useFactory: (configService: ConfigService, kafka: Kafka): Consumer => {
        const groupId = process.env.KAFKA_GROUP_ID || configService.get<string>('app.kafka.groupId', 'material-worker-group');
        const sessionTimeout = process.env.KAFKA_SESSION_TIMEOUT
          ? parseInt(process.env.KAFKA_SESSION_TIMEOUT, 10)
          : configService.get<number>('app.kafka.sessionTimeout', 30000);
        const heartbeatInterval = process.env.KAFKA_HEARTBEAT_INTERVAL
          ? parseInt(process.env.KAFKA_HEARTBEAT_INTERVAL, 10)
          : configService.get<number>('app.kafka.heartbeatInterval', 3000);
        const maxWaitTimeInMs = process.env.KAFKA_MAX_WAIT_TIME
          ? parseInt(process.env.KAFKA_MAX_WAIT_TIME, 10)
          : configService.get<number>('app.kafka.maxWaitTimeInMs', 5000);

        return kafka.consumer({
          groupId,
          allowAutoTopicCreation: true,
          sessionTimeout,
          heartbeatInterval,
          maxWaitTimeInMs,
          retry: {
            retries: 5,
            initialRetryTime: 100,
          },
        });
      },
      inject: [ConfigService, KAFKA_CLIENT],
    },
  ],
  exports: [KAFKA_PRODUCER, KAFKA_CONSUMER, KAFKA_CLIENT],
})
export class KafkaModule {}

