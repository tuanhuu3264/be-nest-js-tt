import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Account, AccountType, AccountStatus } from '../../domain/accounts/entities/account.entity';

interface CreateAccountRequest {
  userId: number;
  accountType: number;
  status: number;
}

interface GetAccountRequest {
  id: string;
}

interface UpdateAccountRequest {
  id: string;
  accountType?: number;
  status?: number;
}

interface DeleteAccountRequest {
  id: string;
}

interface DeleteAccountResponse {
  success: boolean;
  message: string;
}

interface ListAccountsRequest {
  userId: number;
  page?: number;
  limit?: number;
}

interface ListAccountsResponse {
  accounts: AccountResponse[];
  total: number;
  page: number;
  limit: number;
}

interface AccountResponse {
  id: string;
  userId: number;
  accountType: number;
  status: number;
  createdAt: string;
  updatedAt: string;
}

@Controller()
export class AccountController {
  @GrpcMethod('AccountService', 'CreateAccount')
  createAccount(data: CreateAccountRequest): AccountResponse {
    const account = new Account(
      'generated-id',
      data.userId,
      data.accountType as AccountType,
      data.status as AccountStatus,
      new Date(),
      new Date(),
    );

    return {
      id: account.id,
      userId: account.userId,
      accountType: account.accountType,
      status: account.status,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
    };
  }

  @GrpcMethod('AccountService', 'GetAccount')
  getAccount(data: GetAccountRequest): AccountResponse {
  
    const account = new Account(
      data.id,
      0, 
      AccountType.BASIC,
      AccountStatus.ACTIVE,
      new Date(),
      new Date(),
    );

    return {
      id: account.id,
      userId: account.userId,
      accountType: account.accountType,
      status: account.status,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
    };
  }

  @GrpcMethod('AccountService', 'UpdateAccount')
  updateAccount(data: UpdateAccountRequest): AccountResponse {
    const account = new Account(
      data.id,
      0, 
      (data.accountType as AccountType) || AccountType.BASIC,
      (data.status as AccountStatus) || AccountStatus.ACTIVE,
      new Date(),
      new Date(),
    );

    return {
      id: account.id,
      userId: account.userId,
      accountType: account.accountType,
      status: account.status,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
    };
  }

  @GrpcMethod('AccountService', 'DeleteAccount')
  deleteAccount(data: DeleteAccountRequest): DeleteAccountResponse {
    return {
      success: true,
      message: `Account ${data.id} deleted successfully`,
    };
  }

  @GrpcMethod('AccountService', 'ListAccounts')
  listAccounts(data: ListAccountsRequest): ListAccountsResponse {
    const page = data.page || 1;
    const limit = data.limit || 10;

    return {
      accounts: [],
      total: 0,
      page,
      limit,
    };
  }
}

