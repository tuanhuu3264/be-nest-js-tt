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
        const contactPoints = process.env.CASSANDRA_CONTACT_POINTS
          ? process.env.CASSANDRA_CONTACT_POINTS.split(',')
          : configService.get<string[]>('app.cassandra.contactPoints', ['localhost']);
        const dataCenter = process.env.CASSANDRA_DATA_CENTER || configService.get<string>('app.cassandra.dataCenter', 'datacenter1');
        const keyspace = process.env.CASSANDRA_KEYSPACE || configService.get<string>('app.cassandra.keyspace', 'material_service');
        const username = process.env.CASSANDRA_USER || configService.get<string>('app.cassandra.username', 'cassandra');
        const password = process.env.CASSANDRA_PASSWORD || configService.get<string>('app.cassandra.password', 'cassandra');

        const client = new Client({
          contactPoints,
          localDataCenter: dataCenter,
          keyspace,
          credentials: {
            username,
            password,
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

