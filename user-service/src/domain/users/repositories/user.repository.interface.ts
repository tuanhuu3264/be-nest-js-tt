import { User } from '../entities/user.entity';

export interface IUserRepository {
  create(user: User): Promise<User>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  update(user: User): Promise<User>;
  delete(id: number): Promise<boolean>;
  findAll(page: number, limit: number): Promise<{ users: User[]; total: number }>;
}

