import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CredentialService } from '../../application/services/credential.service';
import {
  CreateCredentialDto,
  UpdateCredentialDto,
  VerifyCredentialDto,
} from '../../application/dtos/credential.dto';
import { CredentialType } from '../../domain/credentials/entities/credential.entity';

interface CreateCredentialRequest {
  userId: number;
  password: string;
  credentialType: number;
  ipAddress: string;
}

interface GetCredentialRequest {
  id: string;
}

interface UpdateCredentialRequest {
  id: string;
  password: string;
  ipAddress: string;
}

interface DeleteCredentialRequest {
  id: string;
}

interface DeleteCredentialResponse {
  success: boolean;
  message: string;
}

interface VerifyCredentialRequest {
  userId: number;
  password: string;
}

interface VerifyCredentialResponse {
  isValid: boolean;
  message: string;
}

interface CredentialResponse {
  id: string;
  userId: number;
  credentialType: number;
  ipAddress: string;
  createdAt: string;
  updatedAt: string;
}

@Controller()
export class CredentialController {
  constructor(private readonly credentialService: CredentialService) {}

  @GrpcMethod('CredentialService', 'CreateCredential')
  async createCredential(data: CreateCredentialRequest): Promise<CredentialResponse> {
    const createDto: CreateCredentialDto = {
      userId: data.userId,
      password: data.password,
      credentialType: data.credentialType as CredentialType,
      ipAddress: data.ipAddress,
    };
    const result = await this.credentialService.create(createDto);
    return {
      id: result.id,
      userId: result.userId,
      credentialType: result.credentialType,
      ipAddress: result.ipAddress,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  }

  @GrpcMethod('CredentialService', 'GetCredential')
  async getCredential(data: GetCredentialRequest): Promise<CredentialResponse> {
    const result = await this.credentialService.findById(data.id);
    return {
      id: result.id,
      userId: result.userId,
      credentialType: result.credentialType,
      ipAddress: result.ipAddress,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  }

  @GrpcMethod('CredentialService', 'UpdateCredential')
  async updateCredential(data: UpdateCredentialRequest): Promise<CredentialResponse> {
    const updateDto: UpdateCredentialDto = {
      password: data.password,
      ipAddress: data.ipAddress,
    };
    const result = await this.credentialService.update(data.id, updateDto);
    return {
      id: result.id,
      userId: result.userId,
      credentialType: result.credentialType,
      ipAddress: result.ipAddress,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  }

  @GrpcMethod('CredentialService', 'DeleteCredential')
  async deleteCredential(data: DeleteCredentialRequest): Promise<DeleteCredentialResponse> {
    return await this.credentialService.delete(data.id);
  }

  @GrpcMethod('CredentialService', 'VerifyCredential')
  async verifyCredential(data: VerifyCredentialRequest): Promise<VerifyCredentialResponse> {
    const verifyDto: VerifyCredentialDto = {
      userId: data.userId,
      password: data.password,
    };
    return await this.credentialService.verify(verifyDto);
  }
}

