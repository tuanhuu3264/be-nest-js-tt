import { Credential } from '../entities/credential.entity';

export interface ICredentialRepository {
  create(credential: Credential): Promise<Credential>;
  findById(id: string): Promise<Credential | null>;
  findByUserId(userId: number): Promise<Credential | null>;
  update(credential: Credential): Promise<Credential>;
  delete(id: string): Promise<boolean>;
}

