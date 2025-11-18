import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import type { MediaInteraction } from '../../domain/media_interaction/entities/media_interaction.entity';
import { SnowflakeService } from '../../infrastructure/common/snowflake.service';
import type { IMediaInteractionRepository } from '../../domain/media_interaction/repositories/media_interaction.repository.interface';
import { CreateMediaInteractionDto, UpdateMediaInteractionDto, MediaInteractionResponseDto } from '../dtos/media_interaction.dto';
import { MediaInteractionMapper } from '../mappers/media_interaction.mapper';

@Injectable()
export class MediaInteractionService {
  constructor(
    @Inject('IMediaInteractionRepository')
    private readonly mediaInteractionRepository: IMediaInteractionRepository,
    private readonly snowflakeService: SnowflakeService,
  ) {}

  async create(createDto: CreateMediaInteractionDto): Promise<MediaInteractionResponseDto> {
    // Check if interaction already exists
    const existingInteraction = await this.mediaInteractionRepository.findByMediaIdAndType(
      createDto.mediaId,
      createDto.mediaInteractionType,
    );
    if (existingInteraction && existingInteraction.userId === createDto.userId) {
      throw new ConflictException('Media interaction already exists');
    }

    const now = new Date();
    const interactionId = this.snowflakeService.generate().toString();
    const mediaInteraction = MediaInteractionMapper.toEntity(createDto, interactionId, now, now);
    const createdInteraction = await this.mediaInteractionRepository.create(mediaInteraction);
    return MediaInteractionMapper.toResponseDto(createdInteraction);
  }

  async findById(id: string): Promise<MediaInteractionResponseDto> {
    const mediaInteraction = await this.mediaInteractionRepository.findById(id);
    if (!mediaInteraction) {
      throw new NotFoundException(`Media interaction with ID ${id} not found`);
    }
    return MediaInteractionMapper.toResponseDto(mediaInteraction);
  }

  async update(id: string, updateDto: UpdateMediaInteractionDto): Promise<MediaInteractionResponseDto> {
    const mediaInteraction = await this.mediaInteractionRepository.findById(id);
    if (!mediaInteraction) {
      throw new NotFoundException(`Media interaction with ID ${id} not found`);
    }

    const updatedInteraction = MediaInteractionMapper.updateEntity(mediaInteraction, updateDto);
    const savedInteraction = await this.mediaInteractionRepository.update(updatedInteraction);
    return MediaInteractionMapper.toResponseDto(savedInteraction);
  }

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const mediaInteraction = await this.mediaInteractionRepository.findById(id);
    if (!mediaInteraction) {
      throw new NotFoundException(`Media interaction with ID ${id} not found`);
    }

    const deleted = await this.mediaInteractionRepository.delete(id);
    return {
      success: deleted,
      message: deleted
        ? `Media interaction ${id} deleted successfully`
        : `Failed to delete media interaction ${id}`,
    };
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{
    interactions: MediaInteractionResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const result = await this.mediaInteractionRepository.findAll(page, limit);
    return {
      interactions: MediaInteractionMapper.toResponseDtoList(result.interactions),
      total: result.total,
      page,
      limit,
    };
  }

  async findByMediaId(mediaId: string, page: number = 1, limit: number = 10): Promise<{
    interactions: MediaInteractionResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const result = await this.mediaInteractionRepository.findByMediaId(mediaId, page, limit);
    return {
      interactions: MediaInteractionMapper.toResponseDtoList(result.interactions),
      total: result.total,
      page,
      limit,
    };
  }

  async findByUserId(userId: number, page: number = 1, limit: number = 10): Promise<{
    interactions: MediaInteractionResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const result = await this.mediaInteractionRepository.findByUserId(userId, page, limit);
    return {
      interactions: MediaInteractionMapper.toResponseDtoList(result.interactions),
      total: result.total,
      page,
      limit,
    };
  }
}

