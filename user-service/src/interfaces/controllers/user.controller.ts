import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from '../../application/services/user.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../../application/dtos/user.dto';

interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
  phone: string;
}

interface GetUserRequest {
  id: number;
}

interface UpdateUserRequest {
  id: number;
  email?: string;
  username?: string;
  phone?: string;
}

interface DeleteUserRequest {
  id: number;
}

interface DeleteUserResponse {
  success: boolean;
  message: string;
}

interface ListUsersRequest {
  page?: number;
  limit?: number;
}

interface ListUsersResponse {
  users: UserResponse[];
  total: number;
  page: number;
  limit: number;
}

interface UserResponse {
  id: number;
  email: string;
  username: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod('UserService', 'CreateUser')
  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    const createDto: CreateUserDto = {
      email: data.email,
      username: data.username,
      password: data.password,
      phone: data.phone,
    };
    const result = await this.userService.create(createDto);
    return {
      id: result.id,
      email: result.email,
      username: result.username,
      phone: result.phone,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  }

  @GrpcMethod('UserService', 'GetUser')
  async getUser(data: GetUserRequest): Promise<UserResponse> {
    const result = await this.userService.findById(data.id);
    return {
      id: result.id,
      email: result.email,
      username: result.username,
      phone: result.phone,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  }

  @GrpcMethod('UserService', 'UpdateUser')
  async updateUser(data: UpdateUserRequest): Promise<UserResponse> {
    const updateDto: UpdateUserDto = {
      email: data.email,
      username: data.username,
      phone: data.phone,
    };
    const result = await this.userService.update(data.id, updateDto);
    return {
      id: result.id,
      email: result.email,
      username: result.username,
      phone: result.phone,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  }

  @GrpcMethod('UserService', 'DeleteUser')
  async deleteUser(data: DeleteUserRequest): Promise<DeleteUserResponse> {
    return await this.userService.delete(data.id);
  }

  @GrpcMethod('UserService', 'ListUsers')
  async listUsers(data: ListUsersRequest): Promise<ListUsersResponse> {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const result = await this.userService.findAll(page, limit);
    return {
      users: result.users.map((user) => ({
        id: user.id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}

