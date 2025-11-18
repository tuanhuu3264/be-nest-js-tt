import { MediaInteraction } from '../../domain/media_interaction/entities/media_interaction.entity';
import { CreateMediaInteractionDto, UpdateMediaInteractionDto, MediaInteractionResponseDto } from '../dtos/media_interaction.dto';

export class MediaInteractionMapper {
  static toEntity(
    createDto: CreateMediaInteractionDto,
    id: string,
    createdAt: Date,
    updatedAt: Date,
  ): MediaInteraction {
    return new MediaInteraction(
      id,
      createDto.userId,
      createDto.mediaId,
      createDto.mediaInteractionType,
      createDto.status ?? 1,
      createdAt,
      updatedAt,
    );
  }

  static toResponseDto(mediaInteraction: MediaInteraction): MediaInteractionResponseDto {
    return {
      id: mediaInteraction.id,
      userId: mediaInteraction.userId,
      mediaId: mediaInteraction.mediaId,
      mediaInteractionType: mediaInteraction.mediaInteractionType,
      status: mediaInteraction.status,
      createdAt: mediaInteraction.createdAt,
      updatedAt: mediaInteraction.updatedAt,
    };
  }

  static toResponseDtoList(interactions: MediaInteraction[]): MediaInteractionResponseDto[] {
    return interactions.map((interaction) => this.toResponseDto(interaction));
  }

  static updateEntity(
    mediaInteraction: MediaInteraction,
    updateDto: UpdateMediaInteractionDto,
  ): MediaInteraction {
    return new MediaInteraction(
      mediaInteraction.id,
      mediaInteraction.userId,
      mediaInteraction.mediaId,
      updateDto.mediaInteractionType ?? mediaInteraction.mediaInteractionType,
      updateDto.status ?? mediaInteraction.status,
      mediaInteraction.createdAt,
      new Date(),
    );
  }
}

