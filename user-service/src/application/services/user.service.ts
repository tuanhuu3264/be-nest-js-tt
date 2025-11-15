import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import type { User } from '../../domain/users/entities/user.entity';
import { SnowflakeService } from '../../infrastructure/common/snowflake.service';
import type { IUserRepository } from '../../domain/users/repositories/user.repository.interface';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dtos/user.dto';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly snowflakeService: SnowflakeService,
  ) {}

  async create(createDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if email already exists
    const existingUserByEmail = await this.userRepository.findByEmail(createDto.email);
    if (existingUserByEmail) {
      throw new ConflictException('Email already exists');
    }

    // Check if username already exists
    const existingUserByUsername = await this.userRepository.findByUsername(createDto.username);
    if (existingUserByUsername) {
      throw new ConflictException('Username already exists');
    }

    const now = new Date();
    const userId = this.snowflakeService.generate();
    const user = UserMapper.toEntity(createDto, userId, now, now);
    const createdUser = await this.userRepository.create(user);
    return UserMapper.toResponseDto(createdUser);
  }

  async findById(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return UserMapper.toResponseDto(user);
  }

  async update(id: number, updateDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check email uniqueness if email is being updated
    if (updateDto.email && updateDto.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(updateDto.email);
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    // Check username uniqueness if username is being updated
    if (updateDto.username && updateDto.username !== user.username) {
      const existingUser = await this.userRepository.findByUsername(updateDto.username);
      if (existingUser) {
        throw new ConflictException('Username already exists');
      }
    }

    const updatedUser = UserMapper.updateEntity(user, updateDto);
    const savedUser = await this.userRepository.update(updatedUser);
    return UserMapper.toResponseDto(savedUser);
  }

  async delete(id: number): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const deleted = await this.userRepository.delete(id);
    return {
      success: deleted,
      message: deleted ? `User ${id} deleted successfully` : `Failed to delete user ${id}`,
    };
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{
    users: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const result = await this.userRepository.findAll(page, limit);
    return {
      users: UserMapper.toResponseDtoList(result.users),
      total: result.total,
      page,
      limit,
    };
  }
}

