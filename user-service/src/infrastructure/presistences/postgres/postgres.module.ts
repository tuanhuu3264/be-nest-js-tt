import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Priority: Environment variables > YAML config > defaults
        const host = process.env.POSTGRES_HOST || configService.get<string>('app.postgres.host', 'localhost');
        const port = process.env.POSTGRES_PORT
          ? parseInt(process.env.POSTGRES_PORT, 10)
          : configService.get<number>('app.postgres.port', 5432);
        const username = process.env.POSTGRES_USER || configService.get<string>('app.postgres.username', 'postgres');
        const password = process.env.POSTGRES_PASSWORD || configService.get<string>('app.postgres.password', 'postgres');
        const database = process.env.POSTGRES_DB || configService.get<string>('app.postgres.database', 'user_service');
        const sync = process.env.POSTGRES_SYNC === 'true' || configService.get<boolean>('app.postgres.sync', false);
        const logging = process.env.POSTGRES_LOGGING === 'true' || configService.get<boolean>('app.postgres.logging', false);

        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: sync,
          logging,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class PostgresModule {}

