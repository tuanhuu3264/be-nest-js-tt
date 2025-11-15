import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { Account } from '../../domain/accounts/entities/account.entity';
import type { IAccountRepository } from '../../domain/accounts/repositories/account.repository.interface';
import { CreateAccountDto, UpdateAccountDto, AccountResponseDto } from '../dtos/account.dto';
import { AccountMapper } from '../mappers/account.mapper';

@Injectable()
export class AccountService {
  constructor(
    @Inject('IAccountRepository')
    private readonly accountRepository: IAccountRepository,
  ) {}

  async create(createDto: CreateAccountDto): Promise<AccountResponseDto> {
    const now = new Date();
    const account = AccountMapper.toEntity(createDto, uuidv4(), now, now);
    const createdAccount = await this.accountRepository.create(account);
    return AccountMapper.toResponseDto(createdAccount);
  }

  async findById(id: string): Promise<AccountResponseDto> {
    const account = await this.accountRepository.findById(id);
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    return AccountMapper.toResponseDto(account);
  }

  async update(id: string, updateDto: UpdateAccountDto): Promise<AccountResponseDto> {
    const account = await this.accountRepository.findById(id);
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    const updatedAccount = AccountMapper.updateEntity(account, updateDto);
    const savedAccount = await this.accountRepository.update(updatedAccount);
    return AccountMapper.toResponseDto(savedAccount);
  }

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const account = await this.accountRepository.findById(id);
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    const deleted = await this.accountRepository.delete(id);
    return {
      success: deleted,
      message: deleted ? `Account ${id} deleted successfully` : `Failed to delete account ${id}`,
    };
  }

  async findAllByUserId(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    accounts: AccountResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const result = await this.accountRepository.findAllByUserId(userId, page, limit);
    return {
      accounts: AccountMapper.toResponseDtoList(result.accounts),
      total: result.total,
      page,
      limit,
    };
  }
}

