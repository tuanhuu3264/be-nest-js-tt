import { Injectable } from '@nestjs/common';
import type { IMediaRepository } from '../../../../domain/media/repositories/media.repository.interface';
import { Media } from '../../../../domain/media/entities/media.entity';

@Injectable()
export class MediaRepository implements IMediaRepository {
  private medias: Map<string, Media> = new Map();

  async create(media: Media): Promise<Media> {
    this.medias.set(media.id, media);
    return media;
  }

  async findById(id: string): Promise<Media | null> {
    return this.medias.get(id) || null;
  }

  async findByUserId(userId: number, page: number, limit: number): Promise<{ medias: Media[]; total: number }> {
    const allMedias = Array.from(this.medias.values()).filter((media) => media.userId === userId);
    const total = allMedias.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const medias = allMedias.slice(start, end);
    return { medias, total };
  }

  async findByMediaType(mediaType: number, page: number, limit: number): Promise<{ medias: Media[]; total: number }> {
    const allMedias = Array.from(this.medias.values()).filter((media) => media.mediaType === mediaType);
    const total = allMedias.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const medias = allMedias.slice(start, end);
    return { medias, total };
  }

  async update(media: Media): Promise<Media> {
    if (!this.medias.has(media.id)) {
      throw new Error('Media not found');
    }
    this.medias.set(media.id, media);
    return media;
  }

  async delete(id: string): Promise<boolean> {
    return this.medias.delete(id);
  }

  async findAll(page: number, limit: number): Promise<{ medias: Media[]; total: number }> {
    const allMedias = Array.from(this.medias.values());
    const total = allMedias.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const medias = allMedias.slice(start, end);
    return { medias, total };
  }
}

