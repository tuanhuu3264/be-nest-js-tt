import { Module, Global, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoaderConfigLoaderService } from './config/config-loader.service';

@Global()
@Module({})
export class LoaderModule {
  static forRoot(context?: any): DynamicModule {
    return {
      module: LoaderModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: LoaderConfigLoaderService,
          useFactory: (configService: ConfigService) => {
            const loader = new LoaderConfigLoaderService(configService);
            // Auto-load configuration
            loader.load(context);
            return loader;
          },
          inject: [ConfigService],
        },
      ],
      exports: [LoaderConfigLoaderService],
    };
  }
}

