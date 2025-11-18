import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { Media } from '../../domain/media/entities/media.entity';
import { SnowflakeService } from '../../infrastructure/common/snowflake.service';
import type { IMediaRepository } from '../../domain/media/repositories/media.repository.interface';
import { CreateMediaDto, UpdateMediaDto, MediaResponseDto } from '../dtos/media.dto';
import { MediaMapper } from '../mappers/media.mapper';

@Injectable()
export class MediaService {
  constructor(
    @Inject('IMediaRepository')
    private readonly mediaRepository: IMediaRepository,
    private readonly snowflakeService: SnowflakeService,
  ) {}

  async create(createDto: CreateMediaDto): Promise<MediaResponseDto> {
    const now = new Date();
    const mediaId = this.snowflakeService.generate().toString();
    const media = MediaMapper.toEntity(createDto, mediaId, now, now);
    const createdMedia = await this.mediaRepository.create(media);
    return MediaMapper.toResponseDto(createdMedia);
  }

  async findById(id: string): Promise<MediaResponseDto> {
    const media = await this.mediaRepository.findById(id);
    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }
    return MediaMapper.toResponseDto(media);
  }

  async update(id: string, updateDto: UpdateMediaDto): Promise<MediaResponseDto> {
    const media = await this.mediaRepository.findById(id);
    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    const updatedMedia = MediaMapper.updateEntity(media, updateDto);
    const savedMedia = await this.mediaRepository.update(updatedMedia);
    return MediaMapper.toResponseDto(savedMedia);
  }

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const media = await this.mediaRepository.findById(id);
    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    const deleted = await this.mediaRepository.delete(id);
    return {
      success: deleted,
      message: deleted ? `Media ${id} deleted successfully` : `Failed to delete media ${id}`,
    };
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{
    medias: MediaResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const result = await this.mediaRepository.findAll(page, limit);
    return {
      medias: MediaMapper.toResponseDtoList(result.medias),
      total: result.total,
      page,
      limit,
    };
  }

  async findByUserId(userId: number, page: number = 1, limit: number = 10): Promise<{
    medias: MediaResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const result = await this.mediaRepository.findByUserId(userId, page, limit);
    return {
      medias: MediaMapper.toResponseDtoList(result.medias),
      total: result.total,
      page,
      limit,
    };
  }

  async findByMediaType(mediaType: number, page: number = 1, limit: number = 10): Promise<{
    medias: MediaResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const result = await this.mediaRepository.findByMediaType(mediaType, page, limit);
    return {
      medias: MediaMapper.toResponseDtoList(result.medias),
      total: result.total,
      page,
      limit,
    };
  }
}

