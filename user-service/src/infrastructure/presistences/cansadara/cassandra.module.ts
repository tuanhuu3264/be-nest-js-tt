import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Client } from 'cassandra-driver';

export const CASSANDRA_CLIENT = 'CASSANDRA_CLIENT';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: CASSANDRA_CLIENT,
      useFactory: (configService: ConfigService) => {
        const client = new Client({
          contactPoints: configService.get<string[]>('CASSANDRA_CONTACT_POINTS', ['localhost']),
          localDataCenter: configService.get<string>('CASSANDRA_DATA_CENTER', 'datacenter1'),
          keyspace: configService.get<string>('CASSANDRA_KEYSPACE', 'user_service'),
          credentials: {
            username: configService.get<string>('CASSANDRA_USER', 'cassandra'),
            password: configService.get<string>('CASSANDRA_PASSWORD', 'cassandra'),
          },
        });
        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [CASSANDRA_CLIENT],
})
export class CassandraModule {}

