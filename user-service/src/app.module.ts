import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserService } from './application/services/user.service';
import { AccountService } from './application/services/account.service';
import { ProfileService } from './application/services/profile.service';
import { CredentialService } from './application/services/credential.service';
import { UserResolver } from './infrastructure/graphQL/user.resolver';
import { AccountResolver } from './infrastructure/graphQL/account.resolver';
import { ProfileResolver } from './infrastructure/graphQL/profile.resolver';
import { CredentialResolver } from './infrastructure/graphQL/credential.resolver';
import { SnowflakeService } from './infrastructure/common/snowflake.service';
import { PostgresModule } from './infrastructure/presistences/postgres/postgres.module';
import { CassandraModule } from './infrastructure/presistences/cansadara/cassandra.module';
import { RedisModule } from './infrastructure/presistences/redis/redis.module';
import { KafkaModule } from './infrastructure/queue/kafka/kafka.module';
import { KafkaService } from './infrastructure/queue/kafka/kafka.service';
import { RedisService } from './infrastructure/presistences/redis/redis.service';
import { UserRepository } from './infrastructure/presistences/postgres/repositories/user.repository';
import { AccountRepository } from './infrastructure/presistences/postgres/repositories/account.repository';
import { ProfileRepository } from './infrastructure/presistences/postgres/repositories/profile.repository';
import { CredentialRepository } from './infrastructure/presistences/postgres/repositories/credential.repository';
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
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
    UserService,
    AccountService,
    ProfileService,
    CredentialService,
    UserResolver,
    AccountResolver,
    ProfileResolver,
    CredentialResolver,
    KafkaService,
    RedisService,
    SnowflakeService,
    // Repository implementations
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    {
      provide: 'IAccountRepository',
      useClass: AccountRepository,
    },
    {
      provide: 'IProfileRepository',
      useClass: ProfileRepository,
    },
    {
      provide: 'ICredentialRepository',
      useClass: CredentialRepository,
    },
  ],
})
export class AppModule {}

