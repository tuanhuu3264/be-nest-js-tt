import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';
import { ElasticsearchService } from './elasticsearch.service';

export const ELASTICSEARCH_CLIENT = 'ELASTICSEARCH_CLIENT';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: ELASTICSEARCH_CLIENT,
      useFactory: (configService: ConfigService): Client => {
        const elasticsearchConfig = configService.get('app.elasticsearch');

        const clientConfig: any = {
          requestTimeout: elasticsearchConfig.requestTimeout,
          pingTimeout: elasticsearchConfig.pingTimeout,
          maxRetries: elasticsearchConfig.maxRetries,
        };

        // Support multiple nodes (preferred) or single node
        if (elasticsearchConfig.nodes && elasticsearchConfig.nodes.length > 0) {
          clientConfig.nodes = elasticsearchConfig.nodes;
        } else if (elasticsearchConfig.node) {
          clientConfig.node = elasticsearchConfig.node;
        } else {
          clientConfig.node = 'http://localhost:9200';
        }

        // Add authentication if provided
        if (elasticsearchConfig.username && elasticsearchConfig.password) {
          clientConfig.auth = {
            username: elasticsearchConfig.username,
            password: elasticsearchConfig.password,
          };
        }

        // Add SSL configuration if needed
        if (elasticsearchConfig.ssl) {
          clientConfig.ssl = {
            rejectUnauthorized: elasticsearchConfig.ssl.rejectUnauthorized,
          };
        }

        const client = new Client(clientConfig);

        // Test connection
        client.ping()
          .then(() => {
            console.log('Elasticsearch client connected successfully');
          })
          .catch((error) => {
            console.error('Elasticsearch client connection error:', error);
          });

        return client;
      },
      inject: [ConfigService],
    },
    ElasticsearchService,
  ],
  exports: [ELASTICSEARCH_CLIENT, ElasticsearchService],
})
export class ElasticsearchModule {}

