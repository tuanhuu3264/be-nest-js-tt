import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MediaService } from './application/services/media.service';
import { MediaInteractionService } from './application/services/media_interaction.service';
import { FileProcessingService } from './application/services/file-processing.service';
import { KafkaConsumerService } from './application/services/kafka-consumer.service';
import { MediaResolver } from './infrastructure/graphQL/media.resolver';
import { MediaInteractionResolver } from './infrastructure/graphQL/media_interaction.resolver';
import { SnowflakeService } from './infrastructure/common/snowflake.service';
import { PostgresModule } from './infrastructure/presistences/postgres/postgres.module';
import { CassandraModule } from './infrastructure/presistences/cansadara/cassandra.module';
import { RedisModule } from './infrastructure/presistences/redis/redis.module';
import { KafkaModule } from './infrastructure/queue/kafka/kafka.module';
import { KafkaService } from './infrastructure/queue/kafka/kafka.service';
import { RedisService } from './infrastructure/presistences/redis/redis.service';
import { MinIOModule } from './infrastructure/storage/minio/minio.module';
import { MinIOService } from './infrastructure/storage/minio/minio.service';
import { MinIOHealthService } from './infrastructure/storage/minio/minio.health';
import { MinIOController } from './infrastructure/storage/minio/minio.controller';
import { MediaRepository } from './infrastructure/presistences/postgres/repositories/media.repository';
import { MediaInteractionRepository } from './infrastructure/presistences/postgres/repositories/media_interaction.repository';
import config from './config/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      csrfPrevention: false,
    }),
    PostgresModule,
    CassandraModule,
    RedisModule,
    KafkaModule,
    MinIOModule,
  ],
  controllers: [
    AppController,
    MinIOController,
  ],
  providers: [
    AppService,
    MediaService,
    MediaInteractionService,
    FileProcessingService,
    KafkaConsumerService,
    MediaResolver,
    MediaInteractionResolver,
    KafkaService,
    RedisService,
    MinIOService,
    MinIOHealthService,
    SnowflakeService,
    // Repository implementations
    {
      provide: 'IMediaRepository',
      useClass: MediaRepository,
    },
    {
      provide: 'IMediaInteractionRepository',
      useClass: MediaInteractionRepository,
    },
  ],
})
export class AppModule {}

