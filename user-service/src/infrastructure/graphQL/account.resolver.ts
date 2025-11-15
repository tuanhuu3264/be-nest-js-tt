import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AccountService } from '../../application/services/account.service';
import {
  CreateAccountDto,
  UpdateAccountDto,
  AccountResponseDto,
} from '../../application/dtos/account.dto';

@Resolver(() => AccountResponseDto)
export class AccountResolver {
  constructor(private readonly accountService: AccountService) {}

  @Mutation(() => AccountResponseDto)
  async createAccount(@Args('input') createDto: CreateAccountDto): Promise<AccountResponseDto> {
    return this.accountService.create(createDto);
  }

  @Query(() => AccountResponseDto)
  async getAccount(@Args('id') id: string): Promise<AccountResponseDto> {
    return this.accountService.findById(id);
  }

  @Mutation(() => AccountResponseDto)
  async updateAccount(
    @Args('id') id: string,
    @Args('input') updateDto: UpdateAccountDto,
  ): Promise<AccountResponseDto> {
    return this.accountService.update(id, updateDto);
  }

  @Mutation(() => Boolean)
  async deleteAccount(@Args('id') id: string): Promise<boolean> {
    const result = await this.accountService.delete(id);
    return result.success;
  }

  @Query(() => [AccountResponseDto])
  async listAccounts(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ): Promise<AccountResponseDto[]> {
    const result = await this.accountService.findAllByUserId(userId, page, limit);
    return result.accounts;
  }
}

