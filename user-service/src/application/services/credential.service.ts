import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import type { Credential } from '../../domain/credentials/entities/credential.entity';
import type { ICredentialRepository } from '../../domain/credentials/repositories/credential.repository.interface';
import {
  CreateCredentialDto,
  UpdateCredentialDto,
  VerifyCredentialDto,
  CredentialResponseDto,
  VerifyCredentialResponseDto,
} from '../dtos/credential.dto';
import { CredentialMapper } from '../mappers/credential.mapper';

@Injectable()
export class CredentialService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    @Inject('ICredentialRepository')
    private readonly credentialRepository: ICredentialRepository,
  ) {}

  async create(createDto: CreateCredentialDto): Promise<CredentialResponseDto> {
    // Check if credential already exists for this user
    const existingCredential = await this.credentialRepository.findByUserId(createDto.userId);
    if (existingCredential) {
      throw new ConflictException('Credential already exists for this user');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createDto.password, this.SALT_ROUNDS);

    const now = new Date();
    const credential = CredentialMapper.toEntity(
      createDto,
      uuidv4(),
      hashedPassword,
      now,
      now,
    );
    const createdCredential = await this.credentialRepository.create(credential);
    return CredentialMapper.toResponseDto(createdCredential);
  }

  async findById(id: string): Promise<CredentialResponseDto> {
    const credential = await this.credentialRepository.findById(id);
    if (!credential) {
      throw new NotFoundException(`Credential with ID ${id} not found`);
    }
    return CredentialMapper.toResponseDto(credential);
  }

  async update(id: string, updateDto: UpdateCredentialDto): Promise<CredentialResponseDto> {
    const credential = await this.credentialRepository.findById(id);
    if (!credential) {
      throw new NotFoundException(`Credential with ID ${id} not found`);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(updateDto.password, this.SALT_ROUNDS);

    const updatedCredential = CredentialMapper.updateEntity(credential, updateDto, hashedPassword);
    const savedCredential = await this.credentialRepository.update(updatedCredential);
    return CredentialMapper.toResponseDto(savedCredential);
  }

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const credential = await this.credentialRepository.findById(id);
    if (!credential) {
      throw new NotFoundException(`Credential with ID ${id} not found`);
    }

    const deleted = await this.credentialRepository.delete(id);
    return {
      success: deleted,
      message: deleted
        ? `Credential ${id} deleted successfully`
        : `Failed to delete credential ${id}`,
    };
  }

  async verify(verifyDto: VerifyCredentialDto): Promise<VerifyCredentialResponseDto> {
    const credential = await this.credentialRepository.findByUserId(verifyDto.userId);
    if (!credential) {
      return {
        isValid: false,
        message: 'Credential not found for this user',
      };
    }

    if (!credential.hashedPassword) {
      return {
        isValid: false,
        message: 'Password credential not found',
      };
    }

    const isValid = await bcrypt.compare(verifyDto.password, credential.hashedPassword);
    return {
      isValid,
      message: isValid ? 'Credential verified successfully' : 'Invalid password',
    };
  }
}

