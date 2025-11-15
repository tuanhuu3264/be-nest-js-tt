import { Injectable } from '@nestjs/common';
import type { ICredentialRepository } from '../../../../domain/credentials/repositories/credential.repository.interface';
import { Credential } from '../../../../domain/credentials/entities/credential.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CredentialRepository implements ICredentialRepository {
  // TODO: Implement with PostgreSQL using TypeORM
  private credentials: Map<string, Credential> = new Map();

  async create(credential: Credential): Promise<Credential> {
    const credentialWithId = new Credential(
      credential.id || uuidv4(),
      credential.userId,
      credential.credentialType,
      credential.ipAddress,
      credential.hashedPassword,
      credential.createdAt,
      credential.updatedAt,
    );
    this.credentials.set(credentialWithId.id, credentialWithId);
    return credentialWithId;
  }

  async findById(id: string): Promise<Credential | null> {
    return this.credentials.get(id) || null;
  }

  async findByUserId(userId: number): Promise<Credential | null> {
    for (const credential of this.credentials.values()) {
      if (credential.userId === userId) {
        return credential;
      }
    }
    return null;
  }

  async update(credential: Credential): Promise<Credential> {
    if (!this.credentials.has(credential.id)) {
      throw new Error('Credential not found');
    }
    this.credentials.set(credential.id, credential);
    return credential;
  }

  async delete(id: string): Promise<boolean> {
    return this.credentials.delete(id);
  }
}

