import { MediaInteraction } from '../entities/media_interaction.entity';

export interface IMediaInteractionRepository {
  create(mediaInteraction: MediaInteraction): Promise<MediaInteraction>;
  findById(id: string): Promise<MediaInteraction | null>;
  findByMediaId(mediaId: string, page: number, limit: number): Promise<{ interactions: MediaInteraction[]; total: number }>;
  findByUserId(userId: number, page: number, limit: number): Promise<{ interactions: MediaInteraction[]; total: number }>;
  findByMediaIdAndType(mediaId: string, type: number): Promise<MediaInteraction | null>;
  update(mediaInteraction: MediaInteraction): Promise<MediaInteraction>;
  delete(id: string): Promise<boolean>;
  findAll(page: number, limit: number): Promise<{ interactions: MediaInteraction[]; total: number }>;
}

