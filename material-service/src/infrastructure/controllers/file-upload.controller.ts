import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { FileUploadService } from '../../application/services/file-upload.service';
import { CreateFileUploadDto, FileUploadResponseDto } from '../../application/dtos/file-upload.dto';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('create-upload-url')
  @HttpCode(HttpStatus.OK)
  async createUploadUrl(@Body() dto: CreateFileUploadDto): Promise<FileUploadResponseDto> {
    return this.fileUploadService.createUploadUrl(dto);
  }

  @Get('status/:mediaId')
  async getUploadStatus(@Param('mediaId') mediaId: string) {
    return this.fileUploadService.getUploadStatus(mediaId);
  }
}
