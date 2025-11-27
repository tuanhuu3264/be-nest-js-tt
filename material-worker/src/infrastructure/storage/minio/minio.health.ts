import { Injectable, Logger } from '@nestjs/common';
import { MinIOService } from './minio.service';

@Injectable()
export class MinIOHealthService {
  private readonly logger = new Logger(MinIOHealthService.name);

  constructor(private readonly minioService: MinIOService) {}

  async checkHealth(): Promise<{ status: 'ok' | 'error'; message: string; details?: any }> {
    try {
      const client = this.minioService.getClient();
      const bucketName = this.minioService.getBucketName();

      // Test bucket access
      const exists = await client.bucketExists(bucketName);
      if (!exists) {
        return {
          status: 'error',
          message: `Bucket ${bucketName} does not exist`,
        };
      }

      // Test upload/download capability with a small test file
      const testObjectName = `health-check-${Date.now()}.txt`;
      const testContent = Buffer.from('MinIO health check test');

      // Upload test file
      await client.putObject(bucketName, testObjectName, testContent);

      // Download test file
      const downloadedContent = await this.minioService.getFileAsBuffer(testObjectName);

      // Clean up test file
      await client.removeObject(bucketName, testObjectName);

      // Verify content
      if (!testContent.equals(downloadedContent)) {
        return {
          status: 'error',
          message: 'MinIO upload/download test failed - content mismatch',
        };
      }

      return {
        status: 'ok',
        message: 'MinIO is healthy',
        details: {
          bucket: bucketName,
        },
      };
    } catch (error) {
      this.logger.error('MinIO health check failed:', error);
      return {
        status: 'error',
        message: `MinIO health check failed: ${error.message}`,
        details: error,
      };
    }
  }
}
