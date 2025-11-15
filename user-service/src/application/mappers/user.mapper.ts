import { User } from '../../domain/users/entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dtos/user.dto';

export class UserMapper {
  static toEntity(createDto: CreateUserDto, id: number, createdAt: Date, updatedAt: Date): User {
    return new User(
      id,
      createDto.email,
      createDto.username,
      createDto.phone,
      createdAt,
      updatedAt,
    );
  }

  static toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toResponseDtoList(users: User[]): UserResponseDto[] {
    return users.map((user) => this.toResponseDto(user));
  }

  static updateEntity(user: User, updateDto: UpdateUserDto): User {
    return new User(
      user.id,
      updateDto.email ?? user.email,
      updateDto.username ?? user.username,
      updateDto.phone ?? user.phone,
      user.createdAt,
      new Date(),
    );
  }
}

