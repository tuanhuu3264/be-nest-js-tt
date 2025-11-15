import { Credential } from '../../domain/credentials/entities/credential.entity';
import {
  CreateCredentialDto,
  UpdateCredentialDto,
  CredentialResponseDto,
} from '../dtos/credential.dto';

export class CredentialMapper {
  static toEntity(
    createDto: CreateCredentialDto,
    id: string,
    hashedPassword: string,
    createdAt: Date,
    updatedAt: Date,
  ): Credential {
    return new Credential(
      id,
      createDto.userId,
      createDto.credentialType,
      createDto.ipAddress,
      hashedPassword,
      createdAt,
      updatedAt,
    );
  }

  static toResponseDto(credential: Credential): CredentialResponseDto {
    return {
      id: credential.id,
      userId: credential.userId,
      credentialType: credential.credentialType,
      ipAddress: credential.ipAddress,
      createdAt: credential.createdAt,
      updatedAt: credential.updatedAt,
    };
  }

  static updateEntity(
    credential: Credential,
    updateDto: UpdateCredentialDto,
    hashedPassword: string,
  ): Credential {
    return new Credential(
      credential.id,
      credential.userId,
      credential.credentialType,
      updateDto.ipAddress,
      hashedPassword,
      credential.createdAt,
      new Date(),
    );
  }
}

