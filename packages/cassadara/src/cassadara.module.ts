import { Module, Global, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Client } from 'cassandra-driver';
import { CassandraConfigLoaderService } from './config/config-loader.service';
import { CassandraProducerService } from './services/producer.service';
import { CassandraConsumerService } from './services/consumer.service';
import { CassandraConnectionConfig } from './interfaces/config.interface';

export const CASSANDRA_CLIENT = 'CASSANDRA_CLIENT';
export const CASSANDRA_PRODUCER = 'CASSANDRA_PRODUCER';
export const CASSANDRA_CONSUMER = 'CASSANDRA_CONSUMER';

@Global()
@Module({})
export class CassandraModule {
  static forRoot(context?: any): DynamicModule {
    return {
      module: CassandraModule,
      imports: [ConfigModule],
      providers: [
        CassandraConfigLoaderService,
        {
          provide: CASSANDRA_CLIENT,
          useFactory: (
            configService: ConfigService,
            configLoader: CassandraConfigLoaderService,
          ): Client => {
            const config: CassandraConnectionConfig =
              configLoader.getConfig(context);
            const client = new Client(config);
            return client;
          },
          inject: [ConfigService, CassandraConfigLoaderService],
        },
        {
          provide: CASSANDRA_PRODUCER,
          useFactory: (client: Client): CassandraProducerService => {
            return new CassandraProducerService(client);
          },
          inject: [CASSANDRA_CLIENT],
        },
        {
          provide: CASSANDRA_CONSUMER,
          useFactory: (client: Client): CassandraConsumerService => {
            return new CassandraConsumerService(client);
          },
          inject: [CASSANDRA_CLIENT],
        },
      ],
      exports: [
        CASSANDRA_CLIENT,
        CASSANDRA_PRODUCER,
        CASSANDRA_CONSUMER,
        CassandraConfigLoaderService,
        CassandraProducerService,
        CassandraConsumerService,
      ],
    };
  }
}

