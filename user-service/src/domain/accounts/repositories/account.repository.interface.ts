import { Account } from '../entities/account.entity';

export interface IAccountRepository {
  create(account: Account): Promise<Account>;
  findById(id: string): Promise<Account | null>;
  findByUserId(userId: number): Promise<Account[]>;
  update(account: Account): Promise<Account>;
  delete(id: string): Promise<boolean>;
  findAllByUserId(userId: number, page: number, limit: number): Promise<{ accounts: Account[]; total: number }>;
}

