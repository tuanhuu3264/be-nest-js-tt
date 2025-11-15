import { Module, Global, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KubeConfig } from '@kubernetes/client-node';
import { KubernetesConfigLoaderService } from './config/config-loader.service';
import { KubernetesConnectionConfig } from './interfaces/config.interface';

export const KUBERNETES_CLIENT = 'KUBERNETES_CLIENT';

@Global()
@Module({})
export class KubernetesApiModule {
  static forRoot(context?: any): DynamicModule {
    return {
      module: KubernetesApiModule,
      imports: [ConfigModule],
      providers: [
        KubernetesConfigLoaderService,
        {
          provide: KUBERNETES_CLIENT,
          useFactory: (
            configService: ConfigService,
            configLoader: KubernetesConfigLoaderService,
          ): KubeConfig => {
            const config: KubernetesConnectionConfig =
              configLoader.getConfig(context);
            const kubeConfig = new KubeConfig();

            // Load from config file if no server specified
            if (!config.server) {
              kubeConfig.loadFromDefault();
              if (config.context) {
                kubeConfig.setCurrentContext(config.context);
              }
            } else {
              // Load from provided config
              const cluster = {
                name: 'default-cluster',
                server: config.server,
                skipTLSVerify: config.skipTLSVerify || false,
                caData: config.caData,
                caFile: config.caFile,
              };

              const user = {
                name: 'default-user',
                certData: config.certData,
                certFile: config.certFile,
                keyData: config.keyData,
                keyFile: config.keyFile,
              };

              const contextConfig = {
                name: 'default-context',
                cluster: cluster.name,
                user: user.name,
                namespace: config.namespace || 'default',
              };

              kubeConfig.loadFromClusterAndUser(cluster, user);
              kubeConfig.setCurrentContext(contextConfig.name);
            }

            return kubeConfig;
          },
          inject: [ConfigService, KubernetesConfigLoaderService],
        },
      ],
      exports: [KUBERNETES_CLIENT, KubernetesConfigLoaderService],
    };
  }
}

