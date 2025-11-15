import { Injectable } from '@nestjs/common';
import type { IProfileRepository } from '../../../../domain/profiles/repositories/profile.repository.interface';
import { Profile } from '../../../../domain/profiles/entities/profile.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProfileRepository implements IProfileRepository {
  // TODO: Implement with PostgreSQL using TypeORM
  private profiles: Map<string, Profile> = new Map();

  async create(profile: Profile): Promise<Profile> {
    const profileWithId = new Profile(
      profile.id || uuidv4(),
      profile.userId,
      profile.firstName,
      profile.lastName,
      profile.bio,
      profile.avatar,
      profile.phone,
      profile.email,
      profile.dateOfBirth,
      profile.createdAt,
      profile.updatedAt,
    );
    this.profiles.set(profileWithId.id, profileWithId);
    return profileWithId;
  }

  async findById(id: string): Promise<Profile | null> {
    return this.profiles.get(id) || null;
  }

  async findByUserId(userId: number): Promise<Profile | null> {
    for (const profile of this.profiles.values()) {
      if (profile.userId === userId) {
        return profile;
      }
    }
    return null;
  }

  async update(profile: Profile): Promise<Profile> {
    if (!this.profiles.has(profile.id)) {
      throw new Error('Profile not found');
    }
    this.profiles.set(profile.id, profile);
    return profile;
  }

  async delete(id: string): Promise<boolean> {
    return this.profiles.delete(id);
  }
}

