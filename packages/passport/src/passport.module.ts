import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule as NestPassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PassportConfigLoaderService } from './config/config-loader.service';
import { PassportConnectionConfig } from './interfaces/config.interface';

@Module({})
export class PassportModule {
  static forRoot(context?: any): DynamicModule {
    return {
      module: PassportModule,
      imports: [
        ConfigModule,
        NestPassportModule,
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: (
            configService: ConfigService,
            configLoader: PassportConfigLoaderService,
          ) => {
            const config: PassportConnectionConfig =
              configLoader.getConfig(context);
            return config.jwt || { secret: 'default-secret' };
          },
          inject: [ConfigService, PassportConfigLoaderService],
        }),
      ],
      providers: [PassportConfigLoaderService],
      exports: [
        NestPassportModule,
        JwtModule,
        PassportConfigLoaderService,
      ],
    };
  }
}

