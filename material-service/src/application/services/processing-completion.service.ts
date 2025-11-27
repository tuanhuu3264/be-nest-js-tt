import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaService } from '../../infrastructure/queue/kafka/kafka.service';
import type { IMediaProcessingRepository } from '../../domain/media_processing/repositories/media-processing.repository.interface';
import type { IMediaRepository } from '../../domain/media/repositories/media.repository.interface';
import { MediaProcessing, ProcessedFile } from '../../domain/media_processing/entities/media-processing.entity';
import { FileProcessingStatus } from '../../domain/media_processing/entities/media-processing.entity';
import { SnowflakeService } from '../../infrastructure/common/snowflake.service';

interface ProcessingCompletionMessage {
  mediaId: string;
  uploadKey: string;
  status: 'completed' | 'failed';
  processedFiles?: Array<{
    quality: string;
    fileUrl: string;
    fileSize: number;
    width?: number;
    height?: number;
    duration?: number;
    bitrate?: number;
  }>;
  error?: string;
  timestamp: string;
}

@Injectable()
export class ProcessingCompletionService implements OnModuleInit {
  private readonly logger = new Logger(ProcessingCompletionService.name);

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly snowflakeService: SnowflakeService,
    @Inject('IMediaProcessingRepository')
    private readonly mediaProcessingRepository: IMediaProcessingRepository,
    @Inject('IMediaRepository')
    private readonly mediaRepository: IMediaRepository,
  ) {}

  async onModuleInit() {
    // Subscribe to processing completion topic
    await this.kafkaService.subscribe('file-processing-completed');
    
    // Start consuming messages
    await this.kafkaService.run(async ({ topic, message }) => {
      if (topic === 'file-processing-completed' && message.value) {
        try {
          const completionMessage: ProcessingCompletionMessage = JSON.parse(message.value.toString());
          this.logger.log(`Received processing completion for media: ${completionMessage.mediaId}`);
          
          await this.handleProcessingCompletion(completionMessage);
        } catch (error) {
          this.logger.error('Error processing completion message:', error);
        }
      }
    });

    this.logger.log('Processing completion service initialized');
  }

  private async handleProcessingCompletion(message: ProcessingCompletionMessage): Promise<void> {
    try {
      // Find the media processing record
      const processing = await this.mediaProcessingRepository.findByMediaId(message.mediaId);
      if (!processing) {
        this.logger.error(`Media processing record not found: ${message.mediaId}`);
        return;
      }

      if (message.status === 'completed' && message.processedFiles) {
        // Create processed file records
        const processedFiles: ProcessedFile[] = message.processedFiles.map(file => 
          new ProcessedFile(
            this.snowflakeService.generate().toString(),
            processing.id,
            file.quality as any,
            file.fileUrl,
            file.fileSize,
            file.width,
            file.height,
            file.duration,
            file.bitrate,
          )
        );

        // Update processing record with completed status and processed files
        const updatedProcessing = new MediaProcessing(
          processing.id,
          processing.mediaId,
          processing.uploadKey,
          FileProcessingStatus.COMPLETED,
          processing.originalFileUrl,
          processedFiles,
          undefined,
          processing.createdAt,
          new Date(),
        );

        await this.mediaProcessingRepository.update(updatedProcessing);

        // Create media record with the original quality file
        const originalFile = processedFiles.find(f => f.quality === 'original');
        if (originalFile) {
          // You can create the media record here if needed
          // This depends on your business logic
          this.logger.log(`Media processing completed successfully: ${message.mediaId}`);
        }

      } else if (message.status === 'failed') {
        // Update processing record with failed status
        const updatedProcessing = new MediaProcessing(
          processing.id,
          processing.mediaId,
          processing.uploadKey,
          FileProcessingStatus.FAILED,
          processing.originalFileUrl,
          processing.processedFiles,
          message.error,
          processing.createdAt,
          new Date(),
        );

        await this.mediaProcessingRepository.update(updatedProcessing);
        this.logger.error(`Media processing failed: ${message.mediaId} - ${message.error}`);
      }

    } catch (error) {
      this.logger.error(`Error handling processing completion for ${message.mediaId}:`, error);
    }
  }
}
