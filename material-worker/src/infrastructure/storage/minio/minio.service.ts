import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as MinIO from 'minio';
import { BucketItem } from 'minio';
import { MINIO_CLIENT } from './minio.module';

export interface UploadedObjectInfo {
  etag: string;
  versionId: string | null;
}

export interface PresignedUrlOptions {
  expiresIn?: number; // seconds, default 7 days
  contentType?: string;
  contentLength?: number;
}

export interface PresignedUrlResponse {
  url: string;
  method: 'PUT' | 'GET' | 'POST';
  expiresAt: Date;
  objectName: string;
}

@Injectable()
export class MinIOService implements OnModuleInit {
  private readonly logger = new Logger(MinIOService.name);
  private readonly bucketName: string;

  constructor(
    @Inject(MINIO_CLIENT)
    private readonly minioClient: MinIO.Client,
    private readonly configService: ConfigService,
  ) {
    this.bucketName =
      process.env.MINIO_BUCKET_NAME || configService.get<string>('app.minio.bucketName', 'material-worker');
  }

  async onModuleInit() {
    try {
      // Check if bucket exists, create if not
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, this.configService.get<string>('app.minio.region', 'us-east-1'));
        this.logger.log(`Bucket ${this.bucketName} created successfully`);
      } else {
        this.logger.log(`Bucket ${this.bucketName} already exists`);
      }
    } catch (error) {
      this.logger.error(`Failed to initialize MinIO bucket: ${this.bucketName}`, error);
      throw error;
    }
  }

  /**
   * Generate pre-signed URL for uploading a file
   * @param objectName - Name/path of the object in the bucket
   * @param options - Options for the pre-signed URL
   * @returns Pre-signed URL response
   */
  async getPresignedUploadUrl(
    objectName: string,
    options: PresignedUrlOptions = {},
  ): Promise<PresignedUrlResponse> {
    try {
      const expiresIn = options.expiresIn || 7 * 24 * 60 * 60; // Default 7 days
      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      const url = await this.minioClient.presignedPutObject(this.bucketName, objectName, expiresIn);

      this.logger.debug(`Generated pre-signed upload URL for object: ${objectName}`);

      return {
        url,
        method: 'PUT',
        expiresAt,
        objectName,
      };
    } catch (error) {
      this.logger.error(`Failed to generate pre-signed upload URL for object: ${objectName}`, error);
      throw error;
    }
  }

  /**
   * Generate pre-signed URL for downloading/viewing a file
   * @param objectName - Name/path of the object in the bucket
   * @param expiresIn - Expiration time in seconds (default: 7 days)
   * @returns Pre-signed URL response
   */
  async getPresignedDownloadUrl(objectName: string, expiresIn: number = 7 * 24 * 60 * 60): Promise<PresignedUrlResponse> {
    try {
      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      const url = await this.minioClient.presignedGetObject(this.bucketName, objectName, expiresIn);

      this.logger.debug(`Generated pre-signed download URL for object: ${objectName}`);

      return {
        url,
        method: 'GET',
        expiresAt,
        objectName,
      };
    } catch (error) {
      this.logger.error(`Failed to generate pre-signed download URL for object: ${objectName}`, error);
      throw error;
    }
  }

  /**
   * Upload a file directly to MinIO
   * @param objectName - Name/path of the object in the bucket
   * @param filePath - Path to the file to upload
   * @param metadata - Optional metadata
   */
  async uploadFile(
    objectName: string,
    filePath: string,
    metadata?: MinIO.ItemBucketMetadata,
  ): Promise<UploadedObjectInfo> {
    try {
      const result = await this.minioClient.fPutObject(this.bucketName, objectName, filePath, metadata);
      this.logger.log(`File uploaded successfully: ${objectName}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${objectName}`, error);
      throw error;
    }
  }

  /**
   * Upload a buffer directly to MinIO
   * @param objectName - Name/path of the object in the bucket
   * @param buffer - Buffer containing the file data
   * @param metadata - Optional metadata
   */
  async uploadBuffer(
    objectName: string,
    buffer: Buffer,
    metadata?: MinIO.ItemBucketMetadata,
  ): Promise<UploadedObjectInfo> {
    try {
      const result = await this.minioClient.putObject(this.bucketName, objectName, buffer, buffer.length, metadata);
      this.logger.log(`Buffer uploaded successfully: ${objectName}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to upload buffer: ${objectName}`, error);
      throw error;
    }
  }

  /**
   * Download a file from MinIO
   * @param objectName - Name/path of the object in the bucket
   * @param filePath - Path where to save the downloaded file
   */
  async downloadFile(objectName: string, filePath: string): Promise<void> {
    try {
      await this.minioClient.fGetObject(this.bucketName, objectName, filePath);
      this.logger.log(`File downloaded successfully: ${objectName}`);
    } catch (error) {
      this.logger.error(`Failed to download file: ${objectName}`, error);
      throw error;
    }
  }

  /**
   * Get the MinIO client instance
   * @returns MinIO client
   */
  getClient(): MinIO.Client {
    return this.minioClient;
  }

  /**
   * Get bucket name
   * @returns Bucket name
   */
  getBucketName(): string {
    return this.bucketName;
  }

  /**
   * Get a file as buffer from MinIO
   * @param objectName - Name/path of the object in the bucket
   * @returns Buffer containing the file data
   */
  async getFileAsBuffer(objectName: string): Promise<Buffer> {
    try {
      const chunks: Buffer[] = [];
      const stream = await this.minioClient.getObject(this.bucketName, objectName);

      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch (error) {
      this.logger.error(`Failed to get file as buffer: ${objectName}`, error);
      throw error;
    }
  }

  /**
   * Delete a file from MinIO
   * @param objectName - Name/path of the object in the bucket
   */
  async deleteFile(objectName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, objectName);
      this.logger.log(`File deleted successfully: ${objectName}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${objectName}`, error);
      throw error;
    }
  }

  /**
   * Check if a file exists in MinIO
   * @param objectName - Name/path of the object in the bucket
   * @returns True if file exists, false otherwise
   */
  async fileExists(objectName: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(this.bucketName, objectName);
      return true;
    } catch (error) {
      if ((error as Error).name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get file metadata
   * @param objectName - Name/path of the object in the bucket
   * @returns File metadata
   */
  async getFileMetadata(objectName: string): Promise<MinIO.BucketItemStat> {
    try {
      const stat = await this.minioClient.statObject(this.bucketName, objectName);
      return stat;
    } catch (error) {
      this.logger.error(`Failed to get file metadata: ${objectName}`, error);
      throw error;
    }
  }

  /**
   * List objects in the bucket
   * @param prefix - Optional prefix to filter objects
   * @param recursive - Whether to list recursively
   * @returns List of objects
   */
  async listObjects(prefix?: string, recursive: boolean = true): Promise<BucketItem[]> {
    try {
      const objects: BucketItem[] = [];
      const stream = this.minioClient.listObjects(this.bucketName, prefix, recursive);

      return new Promise((resolve, reject) => {
        stream.on('data', (obj: BucketItem) => objects.push(obj));
        stream.on('end', () => resolve(objects));
        stream.on('error', reject);
      });
    } catch (error) {
      this.logger.error(`Failed to list objects with prefix: ${prefix}`, error);
      throw error;
    }
  }

  /**
   * Get the public URL for an object (if bucket is public)
   * @param objectName - Name/path of the object in the bucket
   * @returns Public URL
   */
  getPublicUrl(objectName: string): string {
    const endPoint = process.env.MINIO_ENDPOINT || this.configService.get<string>('app.minio.endPoint', 'localhost');
    const port = process.env.MINIO_PORT
      ? parseInt(process.env.MINIO_PORT, 10)
      : this.configService.get<number>('app.minio.port', 9000);
    const useSSL = process.env.MINIO_USE_SSL === 'true' || this.configService.get<boolean>('app.minio.useSSL', false);
    const protocol = useSSL ? 'https' : 'http';
    return `${protocol}://${endPoint}:${port}/${this.bucketName}/${objectName}`;
  }
}

