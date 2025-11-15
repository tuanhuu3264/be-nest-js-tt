import { Injectable } from '@nestjs/common';
import type { IUserRepository } from '../../../../domain/users/repositories/user.repository.interface';
import { User } from '../../../../domain/users/entities/user.entity';

@Injectable()
export class UserRepository implements IUserRepository {
  private users: Map<number, User> = new Map();

  async create(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  async findById(id: number): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async findByUsername(username: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return null;
  }

  async update(user: User): Promise<User> {
    if (!this.users.has(user.id)) {
      throw new Error('User not found');
    }
    this.users.set(user.id, user);
    return user;
  }

  async delete(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async findAll(page: number, limit: number): Promise<{ users: User[]; total: number }> {
    const allUsers = Array.from(this.users.values());
    const total = allUsers.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const users = allUsers.slice(start, end);
    return { users, total };
  }
}

