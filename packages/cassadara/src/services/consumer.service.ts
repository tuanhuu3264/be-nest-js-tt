import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Client } from 'cassandra-driver';
import { ICassandraConsumer } from '../interfaces/consumer.interface';
import { CassandraConsumerConfig } from '../interfaces/config.interface';

@Injectable()
export class CassandraConsumerService
  implements ICassandraConsumer, OnModuleDestroy
{
  private readonly logger = new Logger(CassandraConsumerService.name);

  constructor(private readonly client: Client) {}

  /**
   * Execute a SELECT query and return all results
   */
  async consume<T>(
    query: string,
    params?: any[],
    config?: CassandraConsumerConfig,
  ): Promise<T[]> {
    try {
      const result = await this.client.execute(query, params || [], {
        fetchSize: config?.fetchSize,
        prepare: config?.prepare ?? true,
        autoPage: config?.autoPage ?? true,
      });

      const rows = result.rows || [];
      this.logger.debug(
        `Query consumed successfully: ${query.substring(0, 50)}... (${rows.length} rows)`,
      );
      return rows as T[];
    } catch (error) {
      this.logger.error(`Error consuming query: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Execute a SELECT query and return the first result
   */
  async consumeOne<T>(
    query: string,
    params?: any[],
    config?: CassandraConsumerConfig,
  ): Promise<T | null> {
    try {
      const result = await this.client.execute(query, params || [], {
        fetchSize: 1,
        prepare: config?.prepare ?? true,
      });

      const row = result.rows?.[0] || null;
      this.logger.debug(
        `Query consumed (one) successfully: ${query.substring(0, 50)}...`,
      );
      return row as T | null;
    } catch (error) {
      this.logger.error(
        `Error consuming query (one): ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Stream results from a SELECT query
   */
  async *stream(
    query: string,
    params?: any[],
    config?: CassandraConsumerConfig,
  ): AsyncIterable<any> {
    try {
      const result = await this.client.execute(query, params || [], {
        fetchSize: config?.fetchSize || 100,
        prepare: config?.prepare ?? true,
        autoPage: config?.autoPage ?? true,
      });

      for (const row of result.rows) {
        yield row;
      }
    } catch (error) {
      this.logger.error(`Error streaming query: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Close the consumer connection
   */
  async close(): Promise<void> {
    try {
      await this.client.shutdown();
      this.logger.log('Cassandra consumer connection closed');
    } catch (error) {
      this.logger.error(
        `Error closing consumer connection: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}

