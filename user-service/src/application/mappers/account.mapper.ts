import { Account } from '../../domain/accounts/entities/account.entity';
import { CreateAccountDto, UpdateAccountDto, AccountResponseDto } from '../dtos/account.dto';

export class AccountMapper {
  static toEntity(
    createDto: CreateAccountDto,
    id: string,
    createdAt: Date,
    updatedAt: Date,
  ): Account {
    return new Account(
      id,
      createDto.userId,
      createDto.accountType,
      createDto.status,
      createdAt,
      updatedAt,
    );
  }

  static toResponseDto(account: Account): AccountResponseDto {
    return {
      id: account.id,
      userId: account.userId,
      accountType: account.accountType,
      status: account.status,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }

  static toResponseDtoList(accounts: Account[]): AccountResponseDto[] {
    return accounts.map((account) => this.toResponseDto(account));
  }

  static updateEntity(account: Account, updateDto: UpdateAccountDto): Account {
    return new Account(
      account.id,
      account.userId,
      updateDto.accountType ?? account.accountType,
      updateDto.status ?? account.status,
      account.createdAt,
      new Date(),
    );
  }
}

