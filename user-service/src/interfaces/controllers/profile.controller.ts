import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Profile } from '../../domain/profiles/entities/profile.entity';

interface CreateProfileRequest {
  userId: number;
  firstName: string;
  lastName: string;
  bio?: string;
  avatar?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
}

interface GetProfileRequest {
  id: string;
}

interface UpdateProfileRequest {
  id: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
}

interface DeleteProfileRequest {
  id: string;
}

interface DeleteProfileResponse {
  success: boolean;
  message: string;
}

interface GetProfileByUserIdRequest {
  userId: number;
}

interface ProfileResponse {
  id: string;
  userId: number;
  firstName: string;
  lastName: string;
  bio: string;
  avatar: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  createdAt: string;
  updatedAt: string;
}

@Controller()
export class ProfileController {
  @GrpcMethod('ProfileService', 'CreateProfile')
  createProfile(data: CreateProfileRequest): ProfileResponse {
    // TODO: Implement create profile logic
    const profile = new Profile(
      'generated-id',
      data.userId,
      data.firstName,
      data.lastName,
      data.bio || null,
      data.avatar || null,
      data.phone || null,
      data.email || null,
      data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      new Date(),
      new Date(),
    );

    return {
      id: profile.id,
      userId: profile.userId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      bio: profile.bio || '',
      avatar: profile.avatar || '',
      phone: profile.phone || '',
      email: profile.email || '',
      dateOfBirth: profile.dateOfBirth?.toISOString() || '',
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }

  @GrpcMethod('ProfileService', 'GetProfile')
  getProfile(data: GetProfileRequest): ProfileResponse {
    // TODO: Implement get profile logic
    const profile = new Profile(
      data.id,
      0, // user-id placeholder
      'John',
      'Doe',
      null,
      null,
      null,
      null,
      null,
      new Date(),
      new Date(),
    );

    return {
      id: profile.id,
      userId: profile.userId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      bio: profile.bio || '',
      avatar: profile.avatar || '',
      phone: profile.phone || '',
      email: profile.email || '',
      dateOfBirth: profile.dateOfBirth?.toISOString() || '',
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }

  @GrpcMethod('ProfileService', 'UpdateProfile')
  updateProfile(data: UpdateProfileRequest): ProfileResponse {
    const profile = new Profile(
      data.id,
      0, // user-id placeholder
      data.firstName || 'John',
      data.lastName || 'Doe',
      data.bio || null,
      data.avatar || null,
      data.phone || null,
      data.email || null,
      data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      new Date(),
      new Date(),
    );

    return {
      id: profile.id,
      userId: profile.userId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      bio: profile.bio || '',
      avatar: profile.avatar || '',
      phone: profile.phone || '',
      email: profile.email || '',
      dateOfBirth: profile.dateOfBirth?.toISOString() || '',
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }

  @GrpcMethod('ProfileService', 'DeleteProfile')
  deleteProfile(data: DeleteProfileRequest): DeleteProfileResponse {
    // TODO: Implement delete profile logic
    return {
      success: true,
      message: `Profile ${data.id} deleted successfully`,
    };
  }

  @GrpcMethod('ProfileService', 'GetProfileByUserId')
  getProfileByUserId(data: GetProfileByUserIdRequest): ProfileResponse {
    // TODO: Implement get profile by user id logic
    const profile = new Profile(
      'profile-id',
      data.userId,
      'John',
      'Doe',
      null,
      null,
      null,
      null,
      null,
      new Date(),
      new Date(),
    );

    return {
      id: profile.id,
      userId: profile.userId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      bio: profile.bio || '',
      avatar: profile.avatar || '',
      phone: profile.phone || '',
      email: profile.email || '',
      dateOfBirth: profile.dateOfBirth?.toISOString() || '',
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }
}

