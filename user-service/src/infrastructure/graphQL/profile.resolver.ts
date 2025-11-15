import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ProfileService } from '../../application/services/profile.service';
import {
  CreateProfileDto,
  UpdateProfileDto,
  ProfileResponseDto,
} from '../../application/dtos/profile.dto';

@Resolver(() => ProfileResponseDto)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Mutation(() => ProfileResponseDto)
  async createProfile(@Args('input') createDto: CreateProfileDto): Promise<ProfileResponseDto> {
    return this.profileService.create(createDto);
  }

  @Query(() => ProfileResponseDto)
  async getProfile(@Args('id') id: string): Promise<ProfileResponseDto> {
    return this.profileService.findById(id);
  }

  @Query(() => ProfileResponseDto)
  async getProfileByUserId(@Args('userId', { type: () => Int }) userId: number): Promise<ProfileResponseDto> {
    return this.profileService.findByUserId(userId);
  }

  @Mutation(() => ProfileResponseDto)
  async updateProfile(
    @Args('id') id: string,
    @Args('input') updateDto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    return this.profileService.update(id, updateDto);
  }

  @Mutation(() => Boolean)
  async deleteProfile(@Args('id') id: string): Promise<boolean> {
    const result = await this.profileService.delete(id);
    return result.success;
  }
}

