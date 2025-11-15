import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CredentialService } from '../../application/services/credential.service';
import {
  CreateCredentialDto,
  UpdateCredentialDto,
  VerifyCredentialDto,
  CredentialResponseDto,
  VerifyCredentialResponseDto,
} from '../../application/dtos/credential.dto';

@Resolver(() => CredentialResponseDto)
export class CredentialResolver {
  constructor(private readonly credentialService: CredentialService) {}

  @Mutation(() => CredentialResponseDto)
  async createCredential(
    @Args('input') createDto: CreateCredentialDto,
  ): Promise<CredentialResponseDto> {
    return this.credentialService.create(createDto);
  }

  @Query(() => CredentialResponseDto)
  async getCredential(@Args('id') id: string): Promise<CredentialResponseDto> {
    return this.credentialService.findById(id);
  }

  @Mutation(() => CredentialResponseDto)
  async updateCredential(
    @Args('id') id: string,
    @Args('input') updateDto: UpdateCredentialDto,
  ): Promise<CredentialResponseDto> {
    return this.credentialService.update(id, updateDto);
  }

  @Mutation(() => Boolean)
  async deleteCredential(@Args('id') id: string): Promise<boolean> {
    const result = await this.credentialService.delete(id);
    return result.success;
  }

  @Query(() => VerifyCredentialResponseDto)
  async verifyCredential(
    @Args('input') verifyDto: VerifyCredentialDto,
  ): Promise<VerifyCredentialResponseDto> {
    return this.credentialService.verify(verifyDto);
  }
}

