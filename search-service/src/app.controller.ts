import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus, HttpException } from '@nestjs/common';
import { AppService } from './app.service';
import { ElasticsearchService } from './infrastructure/presistences/elasticsearch/elasticsearch.service';
import {
  SearchDto,
  IndexDocumentDto,
  UpdateDocumentDto,
  BulkIndexDto,
  CreateIndexDto,
} from './application/dtos/search.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async getHealth() {
    try {
      const client = this.elasticsearchService.getClient();
      const health = await client.cluster.health();
      return {
        status: 'ok',
        service: 'search-service',
        timestamp: new Date().toISOString(),
        elasticsearch: {
          status: health.status,
          cluster_name: health.cluster_name,
        },
      };
    } catch (error) {
      return {
        status: 'error',
        service: 'search-service',
        timestamp: new Date().toISOString(),
        elasticsearch: {
          status: 'unavailable',
        },
      };
    }
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  async search(@Body() searchDto: SearchDto) {
    try {
      return await this.elasticsearchService.search(
        searchDto.index,
        searchDto.query,
        searchDto.size,
        searchDto.from,
      );
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Search failed',
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('index/:indexName')
  @HttpCode(HttpStatus.CREATED)
  async indexDocument(@Param('indexName') indexName: string, @Body() body: IndexDocumentDto) {
    try {
      return await this.elasticsearchService.index(indexName, body.document, body.id);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Indexing failed',
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('index/:indexName/:id')
  async getDocument(@Param('indexName') indexName: string, @Param('id') id: string) {
    try {
      const result = await this.elasticsearchService.get(indexName, id);
      if (!result) {
        throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
      }
      return result;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Get document failed',
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('index/:indexName/:id')
  @HttpCode(HttpStatus.OK)
  async updateDocument(
    @Param('indexName') indexName: string,
    @Param('id') id: string,
    @Body() body: UpdateDocumentDto,
  ) {
    try {
      return await this.elasticsearchService.update(indexName, id, body.document);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Update failed',
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('index/:indexName/:id/delete')
  @HttpCode(HttpStatus.OK)
  async deleteDocument(@Param('indexName') indexName: string, @Param('id') id: string) {
    try {
      const result = await this.elasticsearchService.delete(indexName, id);
      if (!result) {
        throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
      }
      return { success: true, message: 'Document deleted successfully' };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Delete failed',
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('index/:indexName/bulk')
  @HttpCode(HttpStatus.OK)
  async bulkIndex(@Param('indexName') indexName: string, @Body() body: BulkIndexDto) {
    try {
      return await this.elasticsearchService.bulkIndex(indexName, body.documents);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Bulk indexing failed',
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('index/:indexName/create')
  @HttpCode(HttpStatus.CREATED)
  async createIndex(@Param('indexName') indexName: string, @Body() body?: CreateIndexDto) {
    try {
      const result = await this.elasticsearchService.createIndex(
        indexName,
        body?.mappings,
        body?.settings,
      );
      if (!result) {
        throw new HttpException('Index already exists', HttpStatus.CONFLICT);
      }
      return { success: true, message: 'Index created successfully' };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Create index failed',
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('index/:indexName/delete')
  @HttpCode(HttpStatus.OK)
  async deleteIndex(@Param('indexName') indexName: string) {
    try {
      const result = await this.elasticsearchService.deleteIndex(indexName);
      if (!result) {
        throw new HttpException('Index not found', HttpStatus.NOT_FOUND);
      }
      return { success: true, message: 'Index deleted successfully' };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Delete index failed',
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('index/:indexName/exists')
  async indexExists(@Param('indexName') indexName: string) {
    try {
      const exists = await this.elasticsearchService.indexExists(indexName);
      return { exists };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Check index existence failed',
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

