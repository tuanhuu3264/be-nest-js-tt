import {
  Injectable,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { ELASTICSEARCH_CLIENT } from './elasticsearch.module';

@Injectable()
export class ElasticsearchService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ElasticsearchService.name);

  constructor(@Inject(ELASTICSEARCH_CLIENT) private readonly client: Client) {}

  async onModuleInit() {
    try {
      const health = await this.client.cluster.health();
      this.logger.log(`Elasticsearch cluster health: ${health.status}`);
    } catch (error) {
      this.logger.error('Failed to connect to Elasticsearch', error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.client.close();
      this.logger.log('Elasticsearch client disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting from Elasticsearch', error);
    }
  }

  /**
   * Create an index with optional mappings and settings
   */
  async createIndex(
    indexName: string,
    mappings?: any,
    settings?: any,
  ): Promise<boolean> {
    try {
      const exists = await this.indexExists(indexName);
      if (exists) {
        this.logger.warn(`Index ${indexName} already exists`);
        return false;
      }

      const body: any = {};
      if (mappings) body.mappings = mappings;
      if (settings) body.settings = settings;

      await this.client.indices.create({
        index: indexName,
        ...(Object.keys(body).length > 0 && { body }),
      });

      this.logger.log(`Index ${indexName} created successfully`);
      return true;
    } catch (error: any) {
      this.logger.error(`Error creating index: ${indexName}`, error);
      if (error.statusCode) {
        throw new HttpException(error.message || 'Failed to create index', error.statusCode);
      }
      throw new HttpException('Failed to create index', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Check if an index exists
   */
  async indexExists(indexName: string): Promise<boolean> {
    try {
      const result = await this.client.indices.exists({ index: indexName });
      return result;
    } catch (error: any) {
      this.logger.error(`Error checking index existence: ${indexName}`, error);
      // If it's a 404, the index doesn't exist, which is fine
      if (error.statusCode === 404) {
        return false;
      }
      // For other errors, we'll return false but log the error
      return false;
    }
  }

  /**
   * Delete an index
   */
  async deleteIndex(indexName: string): Promise<boolean> {
    try {
      const exists = await this.indexExists(indexName);
      if (!exists) {
        this.logger.warn(`Index ${indexName} does not exist`);
        return false;
      }

      await this.client.indices.delete({ index: indexName });
      this.logger.log(`Index ${indexName} deleted successfully`);
      return true;
    } catch (error: any) {
      this.logger.error(`Error deleting index: ${indexName}`, error);
      if (error.statusCode) {
        throw new HttpException(error.message || 'Failed to delete index', error.statusCode);
      }
      throw new HttpException('Failed to delete index', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Index a document
   */
  async index(
    indexName: string,
    document: any,
    id?: string,
  ): Promise<{ _id: string; _index: string; result: string }> {
    try {
      const params: any = {
        index: indexName,
        body: document,
      };

      if (id) {
        params.id = id;
      }

      const result = await this.client.index(params);
      return {
        _id: result._id,
        _index: result._index,
        result: result.result,
      };
    } catch (error: any) {
      this.logger.error(`Error indexing document in ${indexName}`, error);
      if (error.statusCode) {
        throw new HttpException(error.message || 'Failed to index document', error.statusCode);
      }
      throw new HttpException('Failed to index document', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get a document by ID
   */
  async get(indexName: string, id: string): Promise<any> {
    try {
      const result = await this.client.get({
        index: indexName,
        id,
      });
      return {
        _id: result._id,
        _index: result._index,
        _source: result._source,
      };
    } catch (error: any) {
      if (error.statusCode === 404) {
        return null;
      }
      this.logger.error(`Error getting document ${id} from ${indexName}`, error);
      if (error.statusCode) {
        throw new HttpException(error.message || 'Failed to get document', error.statusCode);
      }
      throw new HttpException('Failed to get document', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Update a document
   */
  async update(indexName: string, id: string, document: any): Promise<any> {
    try {
      const result = await this.client.update({
        index: indexName,
        id,
        body: {
          doc: document,
        },
      });
      return {
        _id: result._id,
        _index: result._index,
        result: result.result,
      };
    } catch (error: any) {
      this.logger.error(`Error updating document ${id} in ${indexName}`, error);
      if (error.statusCode) {
        throw new HttpException(error.message || 'Failed to update document', error.statusCode);
      }
      throw new HttpException('Failed to update document', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Delete a document
   */
  async delete(indexName: string, id: string): Promise<boolean> {
    try {
      const result = await this.client.delete({
        index: indexName,
        id,
      });
      return result.result === 'deleted';
    } catch (error: any) {
      if (error.statusCode === 404) {
        return false;
      }
      this.logger.error(`Error deleting document ${id} from ${indexName}`, error);
      throw error;
    }
  }

  /**
   * Bulk index documents
   */
  async bulkIndex(
    indexName: string,
    documents: Array<{ id?: string; document: any }>,
  ): Promise<{ success: number; failed: number; errors: any[] }> {
    try {
      const body: any[] = [];

      for (const item of documents) {
        body.push({
          index: {
            _index: indexName,
            ...(item.id && { _id: item.id }),
          },
        });
        body.push(item.document);
      }

      const result = await this.client.bulk({ body });

      const errors: any[] = [];
      let success = 0;
      let failed = 0;

      if (result.items) {
        for (const item of result.items) {
          if (item.index?.error) {
            failed++;
            errors.push(item.index.error);
          } else {
            success++;
          }
        }
      }

      return { success, failed, errors };
    } catch (error: any) {
      this.logger.error(`Error bulk indexing in ${indexName}`, error);
      if (error.statusCode) {
        throw new HttpException(error.message || 'Failed to bulk index', error.statusCode);
      }
      throw new HttpException('Failed to bulk index', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Search documents
   */
  async search(
    indexName: string,
    query: any,
    size: number = 10,
    from: number = 0,
  ): Promise<{
    hits: any[];
    total: number;
    took: number;
    max_score: number;
  }> {
    try {
      const searchParams: any = {
        index: indexName,
        body: query,
      };

      if (size !== undefined) {
        searchParams.size = size;
      }
      if (from !== undefined) {
        searchParams.from = from;
      }

      const result = await this.client.search(searchParams);

      return {
        hits: result.hits.hits.map((hit: any) => ({
          _id: hit._id,
          _index: hit._index,
          _score: hit._score,
          ...hit._source,
        })),
        total: typeof result.hits.total === 'object' ? result.hits.total.value : result.hits.total,
        took: result.took,
        max_score: result.hits.max_score,
      };
    } catch (error: any) {
      this.logger.error(`Error searching in ${indexName}`, error);
      if (error.statusCode) {
        throw new HttpException(error.message || 'Search failed', error.statusCode);
      }
      throw new HttpException('Search failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get the Elasticsearch client instance
   */
  getClient(): Client {
    return this.client;
  }
}

