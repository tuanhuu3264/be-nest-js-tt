import { Profile } from '../../domain/profiles/entities/profile.entity';
import { CreateProfileDto, UpdateProfileDto, ProfileResponseDto } from '../dtos/profile.dto';

export class ProfileMapper {
  static toEntity(
    createDto: CreateProfileDto,
    id: string,
    createdAt: Date,
    updatedAt: Date,
  ): Profile {
    return new Profile(
      id,
      createDto.userId,
      createDto.firstName,
      createDto.lastName,
      createDto.bio || null,
      createDto.avatar || null,
      createDto.phone || null,
      createDto.email || null,
      createDto.dateOfBirth ? new Date(createDto.dateOfBirth) : null,
      createdAt,
      updatedAt,
    );
  }

  static toResponseDto(profile: Profile): ProfileResponseDto {
    return {
      id: profile.id,
      userId: profile.userId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      bio: profile.bio,
      avatar: profile.avatar,
      phone: profile.phone,
      email: profile.email,
      dateOfBirth: profile.dateOfBirth,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  static updateEntity(profile: Profile, updateDto: UpdateProfileDto): Profile {
    return new Profile(
      profile.id,
      profile.userId,
      updateDto.firstName ?? profile.firstName,
      updateDto.lastName ?? profile.lastName,
      updateDto.bio !== undefined ? updateDto.bio : profile.bio,
      updateDto.avatar !== undefined ? updateDto.avatar : profile.avatar,
      updateDto.phone !== undefined ? updateDto.phone : profile.phone,
      updateDto.email !== undefined ? updateDto.email : profile.email,
      updateDto.dateOfBirth
        ? new Date(updateDto.dateOfBirth)
        : profile.dateOfBirth,
      profile.createdAt,
      new Date(),
    );
  }
}

