export enum FileProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum QualityLevel {
  ORIGINAL = 'original',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export class MediaProcessing {
  constructor(
    public readonly id: string,
    public readonly mediaId: string,
    public readonly uploadKey: string,
    public readonly status: FileProcessingStatus,
    public readonly originalFileUrl?: string,
    public readonly processedFiles?: ProcessedFile[],
    public readonly errorMessage?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}
}

export class ProcessedFile {
  constructor(
    public readonly id: string,
    public readonly mediaProcessingId: string,
    public readonly quality: QualityLevel,
    public readonly fileUrl: string,
    public readonly fileSize: number,
    public readonly width?: number,
    public readonly height?: number,
    public readonly duration?: number,
    public readonly bitrate?: number,
    public readonly createdAt: Date = new Date(),
  ) {}
}
