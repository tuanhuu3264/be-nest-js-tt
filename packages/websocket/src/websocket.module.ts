import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebSocketModule as NestWebSocketModule } from '@nestjs/websockets';
import { WebSocketConfigLoaderService } from './config/config-loader.service';
import { WebSocketConnectionConfig } from './interfaces/config.interface';

@Module({})
export class WebSocketModule {
  static forRoot(context?: any): DynamicModule {
    return {
      module: WebSocketModule,
      imports: [
        ConfigModule,
        NestWebSocketModule,
      ],
      providers: [WebSocketConfigLoaderService],
      exports: [WebSocketConfigLoaderService],
    };
  }

  static forRootAsync(context?: any): DynamicModule {
    return {
      module: WebSocketModule,
      imports: [
        ConfigModule,
        NestWebSocketModule,
      ],
      providers: [
        {
          provide: WebSocketConfigLoaderService,
          useFactory: (configService: ConfigService) => {
            const loader = new WebSocketConfigLoaderService(configService);
            return loader;
          },
          inject: [ConfigService],
        },
      ],
      exports: [WebSocketConfigLoaderService],
    };
  }
}

