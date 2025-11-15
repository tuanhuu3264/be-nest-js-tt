import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { Profile } from '../../domain/profiles/entities/profile.entity';
import type { IProfileRepository } from '../../domain/profiles/repositories/profile.repository.interface';
import { CreateProfileDto, UpdateProfileDto, ProfileResponseDto } from '../dtos/profile.dto';
import { ProfileMapper } from '../mappers/profile.mapper';

@Injectable()
export class ProfileService {
  constructor(
    @Inject('IProfileRepository')
    private readonly profileRepository: IProfileRepository,
  ) {}

  async create(createDto: CreateProfileDto): Promise<ProfileResponseDto> {
    // Check if profile already exists for this user
    const existingProfile = await this.profileRepository.findByUserId(createDto.userId);
    if (existingProfile) {
      throw new ConflictException('Profile already exists for this user');
    }

    const now = new Date();
    const profile = ProfileMapper.toEntity(createDto, uuidv4(), now, now);
    const createdProfile = await this.profileRepository.create(profile);
    return ProfileMapper.toResponseDto(createdProfile);
  }

  async findById(id: string): Promise<ProfileResponseDto> {
    const profile = await this.profileRepository.findById(id);
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }
    return ProfileMapper.toResponseDto(profile);
  }

  async findByUserId(userId: number): Promise<ProfileResponseDto> {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException(`Profile for user ${userId} not found`);
    }
    return ProfileMapper.toResponseDto(profile);
  }

  async update(id: string, updateDto: UpdateProfileDto): Promise<ProfileResponseDto> {
    const profile = await this.profileRepository.findById(id);
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }

    const updatedProfile = ProfileMapper.updateEntity(profile, updateDto);
    const savedProfile = await this.profileRepository.update(updatedProfile);
    return ProfileMapper.toResponseDto(savedProfile);
  }

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const profile = await this.profileRepository.findById(id);
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }

    const deleted = await this.profileRepository.delete(id);
    return {
      success: deleted,
      message: deleted ? `Profile ${id} deleted successfully` : `Failed to delete profile ${id}`,
    };
  }
}

