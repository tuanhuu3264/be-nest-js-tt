import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { SnowflakeService } from '../../infrastructure/common/snowflake.service';
import { MinIOService } from '../../infrastructure/storage/minio/minio.service';
import { KafkaService } from '../../infrastructure/queue/kafka/kafka.service';
import type { IMediaProcessingRepository } from '../../domain/media_processing/repositories/media-processing.repository.interface';
import { MediaProcessing } from '../../domain/media_processing/entities/media-processing.entity';
import { 
  CreateFileUploadDto, 
  FileUploadResponseDto, 
  FileProcessingMessage,
} from '../dtos/file-upload.dto';
import { FileProcessingStatus } from '../../domain/media_processing/entities/media-processing.entity';

@Injectable()
export class FileUploadService {
  private readonly UPLOAD_TOPIC = 'file-upload-processing';

  constructor(
    private readonly snowflakeService: SnowflakeService,
    private readonly minioService: MinIOService,
    private readonly kafkaService: KafkaService,
    @Inject('IMediaProcessingRepository')
    private readonly mediaProcessingRepository: IMediaProcessingRepository,
  ) {}

  async createUploadUrl(dto: CreateFileUploadDto): Promise<FileUploadResponseDto> {
    // Generate unique IDs
    const mediaId = this.snowflakeService.generate().toString();
    const uploadKey = `uploads/${dto.userId}/${mediaId}/${dto.fileName}`;

    // Create media processing record
    const mediaProcessing = new MediaProcessing(
      this.snowflakeService.generate().toString(),
      mediaId,
      uploadKey,
      FileProcessingStatus.PENDING,
    );

    await this.mediaProcessingRepository.create(mediaProcessing);

    // Generate presigned upload URL
    const uploadResponse = await this.minioService.getPresignedUploadUrl(uploadKey, {
      expiresIn: 3600, // 1 hour
      contentType: dto.contentType,
      contentLength: dto.fileSize,
    });

    // Prepare Kafka message for processing
    const processingMessage: FileProcessingMessage = {
      mediaId,
      userId: dto.userId,
      uploadKey,
      fileName: dto.fileName,
      mediaType: dto.mediaType,
      fileSize: dto.fileSize,
      contentType: dto.contentType,
      description: dto.description,
      timestamp: new Date().toISOString(),
    };

    // Send message to Kafka for processing (will be processed after upload completes)
    await this.kafkaService.sendMessage(
      this.UPLOAD_TOPIC,
      processingMessage,
      mediaId
    );

    return {
      id: mediaId,
      uploadKey,
      uploadUrl: uploadResponse.url,
      expiresAt: uploadResponse.expiresAt,
      status: FileProcessingStatus.PENDING,
    };
  }

  async getUploadStatus(mediaId: string): Promise<{ status: FileProcessingStatus; processedFiles?: any[] }> {
    const processing = await this.mediaProcessingRepository.findByMediaId(mediaId);
    
    if (!processing) {
      throw new BadRequestException('Upload not found');
    }

    return {
      status: processing.status,
      processedFiles: processing.processedFiles?.map(file => ({
        quality: file.quality,
        fileUrl: file.fileUrl,
        fileSize: file.fileSize,
        width: file.width,
        height: file.height,
        duration: file.duration,
        bitrate: file.bitrate,
      })),
    };
  }
}
