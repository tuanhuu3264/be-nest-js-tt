import { Profile } from '../entities/profile.entity';

export interface IProfileRepository {
  create(profile: Profile): Promise<Profile>;
  findById(id: string): Promise<Profile | null>;
  findByUserId(userId: number): Promise<Profile | null>;
  update(profile: Profile): Promise<Profile>;
  delete(id: string): Promise<boolean>;
}

