import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MediaService } from './application/services/media.service';
import { MediaInteractionService } from './application/services/media_interaction.service';
import { FileUploadService } from './application/services/file-upload.service';
import { ProcessingCompletionService } from './application/services/processing-completion.service';
import { MediaResolver } from './infrastructure/graphQL/media.resolver';
import { MediaInteractionResolver } from './infrastructure/graphQL/media_interaction.resolver';
import { FileUploadResolver } from './infrastructure/graphQL/file-upload.resolver';
import { SnowflakeService } from './infrastructure/common/snowflake.service';
import { PostgresModule } from './infrastructure/presistences/postgres/postgres.module';
import { CassandraModule } from './infrastructure/presistences/cansadara/cassandra.module';
import { RedisModule } from './infrastructure/presistences/redis/redis.module';
import { KafkaModule } from './infrastructure/queue/kafka/kafka.module';
import { KafkaService } from './infrastructure/queue/kafka/kafka.service';
import { RedisService } from './infrastructure/presistences/redis/redis.service';
import { MinIOModule } from './infrastructure/storage/minio/minio.module';
import { MinIOService } from './infrastructure/storage/minio/minio.service';
import { MinIOController } from './infrastructure/storage/minio/minio.controller';
import { FileUploadController } from './infrastructure/controllers/file-upload.controller';
import { MediaRepository } from './infrastructure/presistences/postgres/repositories/media.repository';
import { MediaInteractionRepository } from './infrastructure/presistences/postgres/repositories/media_interaction.repository';
import { MediaProcessingRepository } from './infrastructure/presistences/postgres/repositories/media-processing.repository';
import config from './config/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: [join(process.cwd(), '../graphql-schemas/material-service/schema.gql')],
      definitions: {
        path: join(process.cwd(), 'src/graphql.schema.ts'),
        outputAs: 'class',
      },
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
    FileUploadController,
  ],
  providers: [
    AppService,
    MediaService,
    MediaInteractionService,
    FileUploadService,
    ProcessingCompletionService,
    MediaResolver,
    MediaInteractionResolver,
    FileUploadResolver,
    KafkaService,
    RedisService,
    MinIOService,
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
    {
      provide: 'IMediaProcessingRepository',
      useClass: MediaProcessingRepository,
    },
  ],
})
export class AppModule {}

