import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MinIOService } from '../../infrastructure/storage/minio/minio.service';
import { KafkaService } from '../../infrastructure/queue/kafka/kafka.service';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

const ffmpeg = require('fluent-ffmpeg');
const sharp = require('sharp');

export interface FileProcessingMessage {
  mediaId: string;
  userId: number;
  uploadKey: string;
  fileName: string;
  mediaType: number; 
  fileSize: number;
  contentType?: string;
  description?: string;
  timestamp: string;
}

export interface ProcessedFileResult {
  quality: string;
  fileUrl: string;
  fileSize: number;
  width?: number;
  height?: number;
  duration?: number;
  bitrate?: number;
}

@Injectable()
export class FileProcessingService {
  private readonly logger = new Logger(FileProcessingService.name);
  private readonly PROCESSING_TOPIC = 'file-processing-completed';
  private readonly sourceBucket: string;

  constructor(
    private readonly minioService: MinIOService,
    private readonly kafkaService: KafkaService,
    private readonly configService: ConfigService,
  ) {
    // Source bucket where files are uploaded by material-service
    this.sourceBucket = process.env.MINIO_SOURCE_BUCKET 
      || this.configService.get<string>('app.minio.sourceBucket', 'material-service');
  }

  async processFile(message: FileProcessingMessage): Promise<void> {
    this.logger.log(`Processing file: ${message.uploadKey}`);
    
    try {
      // Download original file
      const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'file-processing-'));
      const originalFilePath = path.join(tempDir, message.fileName);
      
      await this.downloadFile(message.uploadKey, originalFilePath);
      
      let processedFiles: ProcessedFileResult[] = [];

      // Process based on media type
      switch (message.mediaType) {
        case 1: // IMAGE
          processedFiles = await this.processImage(originalFilePath, message);
          break;
        case 2: // VIDEO
          processedFiles = await this.processVideo(originalFilePath, message);
          break;
        case 3: // AUDIO
          processedFiles = await this.processAudio(originalFilePath, message);
          break;
        default:
          // For documents, just store original
          processedFiles = await this.processDocument(originalFilePath, message);
      }

      // Send completion message
      await this.kafkaService.sendMessage(this.PROCESSING_TOPIC, {
        mediaId: message.mediaId,
        uploadKey: message.uploadKey,
        status: 'completed',
        processedFiles,
        timestamp: new Date().toISOString(),
      });

      // Cleanup temp files
      await fs.promises.rm(tempDir, { recursive: true, force: true });
      
      this.logger.log(`File processing completed: ${message.uploadKey}`);
    } catch (error) {
      this.logger.error(`File processing failed: ${message.uploadKey}`, error);
      
      // Send error message
      await this.kafkaService.sendMessage(this.PROCESSING_TOPIC, {
        mediaId: message.mediaId,
        uploadKey: message.uploadKey,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private async downloadFile(uploadKey: string, localPath: string, maxRetries = 5): Promise<void> {
    const client = this.minioService.getClient();
    this.logger.debug(`Downloading from bucket: ${this.sourceBucket}, key: ${uploadKey}`);
    
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Check if file exists first
        await client.statObject(this.sourceBucket, uploadKey);
        await client.fGetObject(this.sourceBucket, uploadKey, localPath);
        this.logger.debug(`File downloaded successfully on attempt ${attempt}`);
        return;
      } catch (error) {
        lastError = error;
        if (error.code === 'NotFound' && attempt < maxRetries) {
          // File not uploaded yet, wait and retry
          const waitTime = attempt * 2000; // 2s, 4s, 6s, 8s, 10s
          this.logger.warn(`File not found, retrying in ${waitTime}ms (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          throw error;
        }
      }
    }
    
    throw lastError;
  }

  private async uploadProcessedFile(filePath: string, uploadKey: string, quality: string): Promise<string> {
    const processedKey = uploadKey.replace('/uploads/', '/processed/').replace(/\.[^/.]+$/, `_${quality}$&`);
    await this.minioService.uploadFile(processedKey, filePath);
    return processedKey;
  }

  private async processImage(filePath: string, message: FileProcessingMessage): Promise<ProcessedFileResult[]> {
    const results: ProcessedFileResult[] = [];
    const qualities = [
      { name: 'original', width: null, height: null },
      { name: 'high', width: 1920, height: 1080 },
      { name: 'medium', width: 1280, height: 720 },
      { name: 'low', width: 854, height: 480 },
    ];

    for (const quality of qualities) {
      try {
        const outputPath = filePath.replace(/\.[^/.]+$/, `_${quality.name}$&`);
        let sharpInstance = sharp(filePath);

        if (quality.width && quality.height) {
          sharpInstance = sharpInstance.resize(quality.width, quality.height, {
            fit: 'inside',
            withoutEnlargement: true,
          });
        }

        await sharpInstance.jpeg({ quality: quality.name === 'low' ? 60 : quality.name === 'medium' ? 80 : 90 })
          .toFile(outputPath);

        const stats = await fs.promises.stat(outputPath);
        const metadata = await sharp(outputPath).metadata();
        
        const processedKey = await this.uploadProcessedFile(outputPath, message.uploadKey, quality.name);

        results.push({
          quality: quality.name,
          fileUrl: processedKey,
          fileSize: stats.size,
          width: metadata.width,
          height: metadata.height,
        });

        // Cleanup temp file
        await fs.promises.unlink(outputPath);
      } catch (error) {
        this.logger.error(`Failed to process image quality ${quality.name}:`, error);
      }
    }

    return results;
  }

  private async processVideo(filePath: string, message: FileProcessingMessage): Promise<ProcessedFileResult[]> {
    const results: ProcessedFileResult[] = [];
    const qualities = [
      { name: 'original', resolution: null, bitrate: null },
      { name: 'high', resolution: '1920x1080', bitrate: '5000k' },
      { name: 'medium', resolution: '1280x720', bitrate: '2500k' },
      { name: 'low', resolution: '854x480', bitrate: '1000k' },
    ];

    return new Promise((resolve) => {
      let completedCount = 0;

      for (const quality of qualities) {
        const outputPath = filePath.replace(/\.[^/.]+$/, `_${quality.name}.mp4`);
        
        let command = ffmpeg(filePath);

        if (quality.resolution && quality.bitrate) {
          command = command
            .size(quality.resolution)
            .videoBitrate(quality.bitrate)
            .audioCodec('aac')
            .videoCodec('libx264');
        }

        command
          .output(outputPath)
          .on('end', async () => {
            try {
              const stats = await fs.promises.stat(outputPath);
              const processedKey = await this.uploadProcessedFile(outputPath, message.uploadKey, quality.name);

              // Get video metadata
              ffmpeg.ffprobe(outputPath, async (err, metadata) => {
                if (!err && metadata?.streams?.[0]) {
                  const videoStream = metadata.streams.find(s => s.codec_type === 'video');
                  results.push({
                    quality: quality.name,
                    fileUrl: processedKey,
                    fileSize: stats.size,
                    width: videoStream?.width,
                    height: videoStream?.height,
                    duration: Math.round(metadata.format?.duration || 0),
                    bitrate: parseInt(quality.bitrate?.replace('k', '') || '0'),
                  });
                }

                // Cleanup temp file
                await fs.promises.unlink(outputPath).catch(() => {});
                
                completedCount++;
                if (completedCount === qualities.length) {
                  resolve(results);
                }
              });
            } catch (error) {
              this.logger.error(`Failed to process video quality ${quality.name}:`, error);
              completedCount++;
              if (completedCount === qualities.length) {
                resolve(results);
              }
            }
          })
          .on('error', (error) => {
            this.logger.error(`FFmpeg error for ${quality.name}:`, error);
            completedCount++;
            if (completedCount === qualities.length) {
              resolve(results);
            }
          })
          .run();
      }
    });
  }

  private async processAudio(filePath: string, message: FileProcessingMessage): Promise<ProcessedFileResult[]> {
    const results: ProcessedFileResult[] = [];
    const qualities = [
      { name: 'original', bitrate: null },
      { name: 'high', bitrate: '320k' },
      { name: 'medium', bitrate: '192k' },
      { name: 'low', bitrate: '128k' },
    ];

    return new Promise((resolve) => {
      let completedCount = 0;

      for (const quality of qualities) {
        const outputPath = filePath.replace(/\.[^/.]+$/, `_${quality.name}.mp3`);
        
        let command = ffmpeg(filePath);

        if (quality.bitrate) {
          command = command.audioBitrate(quality.bitrate);
        }

        command
          .output(outputPath)
          .on('end', async () => {
            try {
              const stats = await fs.promises.stat(outputPath);
              const processedKey = await this.uploadProcessedFile(outputPath, message.uploadKey, quality.name);

              ffmpeg.ffprobe(outputPath, async (err, metadata) => {
                results.push({
                  quality: quality.name,
                  fileUrl: processedKey,
                  fileSize: stats.size,
                  duration: Math.round(metadata?.format?.duration || 0),
                  bitrate: parseInt(quality.bitrate?.replace('k', '') || '0'),
                });

                // Cleanup temp file
                await fs.promises.unlink(outputPath).catch(() => {});
                
                completedCount++;
                if (completedCount === qualities.length) {
                  resolve(results);
                }
              });
            } catch (error) {
              this.logger.error(`Failed to process audio quality ${quality.name}:`, error);
              completedCount++;
              if (completedCount === qualities.length) {
                resolve(results);
              }
            }
          })
          .on('error', (error) => {
            this.logger.error(`FFmpeg error for ${quality.name}:`, error);
            completedCount++;
            if (completedCount === qualities.length) {
              resolve(results);
            }
          })
          .run();
      }
    });
  }

  private async processDocument(filePath: string, message: FileProcessingMessage): Promise<ProcessedFileResult[]> {
    // For documents, just store the original
    const stats = await fs.promises.stat(filePath);
    const processedKey = await this.uploadProcessedFile(filePath, message.uploadKey, 'original');

    return [{
      quality: 'original',
      fileUrl: processedKey,
      fileSize: stats.size,
    }];
  }
}
