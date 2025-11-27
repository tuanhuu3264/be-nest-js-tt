import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IMediaProcessingRepository } from '../../../../domain/media_processing/repositories/media-processing.repository.interface';
import { MediaProcessing, ProcessedFile, QualityLevel } from '../../../../domain/media_processing/entities/media-processing.entity';
import { MediaProcessingEntity } from '../entities/media-processing.entity';

@Injectable()
export class MediaProcessingRepository implements IMediaProcessingRepository {
  constructor(
    @InjectRepository(MediaProcessingEntity)
    private readonly repository: Repository<MediaProcessingEntity>,
  ) {}

  async create(mediaProcessing: MediaProcessing): Promise<MediaProcessing> {
    const entity = this.toEntity(mediaProcessing);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<MediaProcessing | null> {
    const entity = await this.repository.findOne({ 
      where: { id },
      relations: ['processedFiles']
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByMediaId(mediaId: string): Promise<MediaProcessing | null> {
    const entity = await this.repository.findOne({ 
      where: { mediaId },
      relations: ['processedFiles']
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByUploadKey(uploadKey: string): Promise<MediaProcessing | null> {
    const entity = await this.repository.findOne({ 
      where: { uploadKey },
      relations: ['processedFiles']
    });
    return entity ? this.toDomain(entity) : null;
  }

  async update(mediaProcessing: MediaProcessing): Promise<MediaProcessing> {
    const entity = this.toEntity(mediaProcessing);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  private toEntity(domain: MediaProcessing): MediaProcessingEntity {
    const entity = new MediaProcessingEntity();
    entity.id = domain.id;
    entity.mediaId = domain.mediaId;
    entity.uploadKey = domain.uploadKey;
    entity.status = domain.status;
    entity.originalFileUrl = domain.originalFileUrl;
    entity.errorMessage = domain.errorMessage;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }

  private toDomain(entity: MediaProcessingEntity): MediaProcessing {
    return new MediaProcessing(
      entity.id,
      entity.mediaId,
      entity.uploadKey,
      entity.status,
      entity.originalFileUrl,
      entity.processedFiles?.map(pf => new ProcessedFile(
        pf.id,
        pf.mediaProcessingId,
        pf.quality as QualityLevel,
        pf.fileUrl,
        pf.fileSize,
        pf.width,
        pf.height,
        pf.duration,
        pf.bitrate,
        pf.createdAt,
      )),
      entity.errorMessage,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
