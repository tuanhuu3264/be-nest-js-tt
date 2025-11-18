import { Media } from '../entities/media.entity';

export interface IMediaRepository {
  create(media: Media): Promise<Media>;
  findById(id: string): Promise<Media | null>;
  findByUserId(userId: number, page: number, limit: number): Promise<{ medias: Media[]; total: number }>;
  findByMediaType(mediaType: number, page: number, limit: number): Promise<{ medias: Media[]; total: number }>;
  update(media: Media): Promise<Media>;
  delete(id: string): Promise<boolean>;
  findAll(page: number, limit: number): Promise<{ medias: Media[]; total: number }>;
}

