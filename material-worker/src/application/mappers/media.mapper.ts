import { Media } from '../../domain/media/entities/media.entity';
import { CreateMediaDto, UpdateMediaDto, MediaResponseDto } from '../dtos/media.dto';

export class MediaMapper {
  static toEntity(
    createDto: CreateMediaDto,
    id: string,
    createdAt: Date,
    updatedAt: Date,
  ): Media {
    return new Media(
      id,
      createDto.userId,
      createDto.fileName,
      createDto.mediaType,
      createDto.mediaUrl,
      createDto.mediaSize,
      createDto.mediaLastExpiration ?? new Date(),
      createDto.mediaIsPublic ?? false,
      createDto.tags ?? [],
      createDto.status ?? 1,
      createdAt,
      updatedAt,
    );
  }

  static toResponseDto(media: Media): MediaResponseDto {
    return {
      id: media.id,
      userId: media.userId,
      fileName: media.fileName,
      mediaType: media.mediaType,
      mediaUrl: media.mediaUrl,
      mediaSize: media.mediaSize,
      mediaLastExpiration: media.mediaLastExpiration,
      mediaIsPublic: media.mediaIsPublic,
      tags: media.tags,
      status: media.status,
      createdAt: media.createdAt,
      updatedAt: media.updatedAt,
    };
  }

  static toResponseDtoList(medias: Media[]): MediaResponseDto[] {
    return medias.map((media) => this.toResponseDto(media));
  }

  static updateEntity(media: Media, updateDto: UpdateMediaDto): Media {
    return new Media(
      media.id,
      media.userId,
      updateDto.fileName ?? media.fileName,
      media.mediaType,
      updateDto.mediaUrl ?? media.mediaUrl,
      updateDto.mediaSize ?? media.mediaSize,
      updateDto.mediaLastExpiration ?? media.mediaLastExpiration,
      updateDto.mediaIsPublic ?? media.mediaIsPublic,
      updateDto.tags ?? media.tags,
      updateDto.status ?? media.status,
      media.createdAt,
      new Date(),
    );
  }
}

