import { Injectable } from '@nestjs/common';
import type { IMediaInteractionRepository } from '../../../../domain/media_interaction/repositories/media_interaction.repository.interface';
import { MediaInteraction } from '../../../../domain/media_interaction/entities/media_interaction.entity';

@Injectable()
export class MediaInteractionRepository implements IMediaInteractionRepository {
  private interactions: Map<string, MediaInteraction> = new Map();

  async create(mediaInteraction: MediaInteraction): Promise<MediaInteraction> {
    this.interactions.set(mediaInteraction.id, mediaInteraction);
    return mediaInteraction;
  }

  async findById(id: string): Promise<MediaInteraction | null> {
    return this.interactions.get(id) || null;
  }

  async findByMediaId(mediaId: string, page: number, limit: number): Promise<{ interactions: MediaInteraction[]; total: number }> {
    const allInteractions = Array.from(this.interactions.values()).filter(
      (interaction) => interaction.mediaId === mediaId,
    );
    const total = allInteractions.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const interactions = allInteractions.slice(start, end);
    return { interactions, total };
  }

  async findByUserId(userId: number, page: number, limit: number): Promise<{ interactions: MediaInteraction[]; total: number }> {
    const allInteractions = Array.from(this.interactions.values()).filter(
      (interaction) => interaction.userId === userId,
    );
    const total = allInteractions.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const interactions = allInteractions.slice(start, end);
    return { interactions, total };
  }

  async findByMediaIdAndType(mediaId: string, type: number): Promise<MediaInteraction | null> {
    for (const interaction of this.interactions.values()) {
      if (interaction.mediaId === mediaId && interaction.mediaInteractionType === type) {
        return interaction;
      }
    }
    return null;
  }

  async update(mediaInteraction: MediaInteraction): Promise<MediaInteraction> {
    if (!this.interactions.has(mediaInteraction.id)) {
      throw new Error('Media interaction not found');
    }
    this.interactions.set(mediaInteraction.id, mediaInteraction);
    return mediaInteraction;
  }

  async delete(id: string): Promise<boolean> {
    return this.interactions.delete(id);
  }

  async findAll(page: number, limit: number): Promise<{ interactions: MediaInteraction[]; total: number }> {
    const allInteractions = Array.from(this.interactions.values());
    const total = allInteractions.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const interactions = allInteractions.slice(start, end);
    return { interactions, total };
  }
}

