import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UserService } from '../../application/services/user.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../../application/dtos/user.dto';

@Resolver(() => UserResponseDto)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => UserResponseDto)
  async createUser(@Args('input') createDto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(createDto);
  }

  @Query(() => UserResponseDto)
  async getUser(@Args('id', { type: () => Int }) id: number): Promise<UserResponseDto> {
    return this.userService.findById(id);
  }

  @Mutation(() => UserResponseDto)
  async updateUser(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') updateDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, updateDto);
  }

  @Mutation(() => Boolean)
  async deleteUser(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    const result = await this.userService.delete(id);
    return result.success;
  }

  @Query(() => [UserResponseDto])
  async listUsers(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ): Promise<UserResponseDto[]> {
    const result = await this.userService.findAll(page, limit);
    return result.users;
  }
}

