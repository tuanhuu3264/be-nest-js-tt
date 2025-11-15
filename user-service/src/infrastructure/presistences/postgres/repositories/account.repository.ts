import { Injectable } from '@nestjs/common';
import type { IAccountRepository } from '../../../../domain/accounts/repositories/account.repository.interface';
import { Account } from '../../../../domain/accounts/entities/account.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AccountRepository implements IAccountRepository {
  // TODO: Implement with PostgreSQL using TypeORM
  private accounts: Map<string, Account> = new Map();

  async create(account: Account): Promise<Account> {
    const accountWithId = new Account(
      account.id || uuidv4(),
      account.userId,
      account.accountType,
      account.status,
      account.createdAt,
      account.updatedAt,
    );
    this.accounts.set(accountWithId.id, accountWithId);
    return accountWithId;
  }

  async findById(id: string): Promise<Account | null> {
    return this.accounts.get(id) || null;
  }

  async findByUserId(userId: number): Promise<Account[]> {
    const userAccounts: Account[] = [];
    for (const account of this.accounts.values()) {
      if (account.userId === userId) {
        userAccounts.push(account);
      }
    }
    return userAccounts;
  }

  async update(account: Account): Promise<Account> {
    if (!this.accounts.has(account.id)) {
      throw new Error('Account not found');
    }
    this.accounts.set(account.id, account);
    return account;
  }

  async delete(id: string): Promise<boolean> {
    return this.accounts.delete(id);
  }

  async findAllByUserId(userId: number, page: number, limit: number): Promise<{ accounts: Account[]; total: number }> {
    const userAccounts = await this.findByUserId(userId);
    const total = userAccounts.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const accounts = userAccounts.slice(start, end);
    return { accounts, total };
  }
}

