import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { MediaType } from '../../domain/media/entities/media.entity';

export class CreateFileUploadDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsEnum(MediaType)
  @IsNotEmpty()
  mediaType: MediaType;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  fileSize: number;

  @IsOptional()
  @IsString()
  contentType?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class FileUploadResponseDto {
  id: string;
  uploadKey: string;
  uploadUrl: string;
  expiresAt: Date;
  status: string;
}

export interface FileProcessingMessage {
  mediaId: string;
  userId: number;
  uploadKey: string;
  fileName: string;
  mediaType: MediaType;
  fileSize: number;
  contentType?: string;
  description?: string;
  timestamp: string;
}

export enum FileProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum QualityLevel {
  ORIGINAL = 'original',
  HIGH = 'high',      // 1080p
  MEDIUM = 'medium',  // 720p
  LOW = 'low',        // 480p
}
