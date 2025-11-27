import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { FileUploadService } from '../../application/services/file-upload.service';
import { CreateFileUploadDto } from '../../application/dtos/file-upload.dto';

@Resolver('FileUpload')
export class FileUploadResolver {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Mutation('createUploadUrl')
  async createUploadUrl(
    @Args('input') input: CreateFileUploadDto,
  ) {
    const result = await this.fileUploadService.createUploadUrl(input);
    return {
      id: result.id,
      uploadKey: result.uploadKey,
      uploadUrl: result.uploadUrl,
      expiresAt: result.expiresAt,
      status: result.status,
    };
  }

  @Query('getUploadStatus')
  async getUploadStatus(
    @Args('mediaId') mediaId: string,
  ) {
    return this.fileUploadService.getUploadStatus(mediaId);
  }
}

