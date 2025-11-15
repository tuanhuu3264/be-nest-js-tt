import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgreSQLConfigLoaderService } from './config/config-loader.service';
import { PostgreSQLConnectionConfig } from './interfaces/config.interface';

@Module({})
export class PostgreSQLModule {
  static forRoot(context?: any): DynamicModule {
    return {
      module: PostgreSQLModule,
      imports: [
        ConfigModule,
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (
            configService: ConfigService,
            configLoader: PostgreSQLConfigLoaderService,
          ) => {
            const config: PostgreSQLConnectionConfig =
              configLoader.getConfig(context);
            return config;
          },
          inject: [ConfigService, PostgreSQLConfigLoaderService],
        }),
      ],
      providers: [PostgreSQLConfigLoaderService],
      exports: [PostgreSQLConfigLoaderService],
    };
  }
}

