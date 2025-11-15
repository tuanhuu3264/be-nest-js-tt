import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Client } from 'cassandra-driver';
import { ICassandraProducer } from '../interfaces/producer.interface';
import { CassandraProducerConfig } from '../interfaces/config.interface';

@Injectable()
export class CassandraProducerService
  implements ICassandraProducer, OnModuleDestroy
{
  private readonly logger = new Logger(CassandraProducerService.name);

  constructor(private readonly client: Client) {}

  /**
   * Execute a CQL query (INSERT, UPDATE, DELETE)
   */
  async produce<T>(
    query: string,
    params?: any[],
    config?: CassandraProducerConfig,
  ): Promise<T> {
    try {
      const result = await this.client.execute(query, params || [], {
        consistency: config?.consistencyLevel,
        prepare: config?.prepare ?? true,
        defaultTimestamp: config?.defaultTimestamp,
      });

      this.logger.debug(`Query executed successfully: ${query.substring(0, 50)}...`);
      return result as unknown as T;
    } catch (error) {
      this.logger.error(`Error executing query: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Execute multiple queries in a batch
   */
  async produceBatch(
    queries: Array<{ query: string; params?: any[] }>,
  ): Promise<void> {
    if (queries.length === 0) {
      return;
    }

    try {
      const batchQueries = queries.map((q) => ({
        query: q.query,
        params: q.params || [],
      }));

      await this.client.batch(batchQueries, {
        prepare: true,
        consistency: 1, // QUORUM
      });

      this.logger.debug(`Batch executed successfully: ${queries.length} queries`);
    } catch (error) {
      this.logger.error(`Error executing batch: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Close the producer connection
   */
  async close(): Promise<void> {
    try {
      await this.client.shutdown();
      this.logger.log('Cassandra producer connection closed');
    } catch (error) {
      this.logger.error(
        `Error closing producer connection: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}

