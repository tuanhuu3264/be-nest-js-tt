import { Controller, Get, Post, Query, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { MinIOService, PresignedUrlOptions, PresignedUrlResponse } from './minio.service';
import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

class GetPresignedUploadUrlDto {
  @IsString()
  objectName: string;

  @IsOptional()
  @IsNumber()
  @Min(60) // Minimum 1 minute
  @Max(7 * 24 * 60 * 60) // Maximum 7 days
  expiresIn?: number;

  @IsOptional()
  @IsString()
  contentType?: string;

  @IsOptional()
  @IsNumber()
  contentLength?: number;
}

class GetPresignedDownloadUrlDto {
  @IsString()
  objectName: string;

  @IsOptional()
  @IsNumber()
  @Min(60) // Minimum 1 minute
  @Max(7 * 24 * 60 * 60) // Maximum 7 days
  expiresIn?: number;
}

@Controller('storage')
export class MinIOController {
  constructor(private readonly minioService: MinIOService) {}

  @Post('presigned-upload-url')
  @HttpCode(HttpStatus.OK)
  async getPresignedUploadUrl(@Body() dto: GetPresignedUploadUrlDto): Promise<PresignedUrlResponse> {
    const options: PresignedUrlOptions = {
      expiresIn: dto.expiresIn,
      contentType: dto.contentType,
      contentLength: dto.contentLength,
    };
    return this.minioService.getPresignedUploadUrl(dto.objectName, options);
  }

  @Post('presigned-download-url')
  @HttpCode(HttpStatus.OK)
  async getPresignedDownloadUrl(@Body() dto: GetPresignedDownloadUrlDto): Promise<PresignedUrlResponse> {
    const expiresIn = dto.expiresIn || 7 * 24 * 60 * 60;
    return this.minioService.getPresignedDownloadUrl(dto.objectName, expiresIn);
  }

  @Get('presigned-upload-url')
  async getPresignedUploadUrlGet(
    @Query('objectName') objectName: string,
    @Query('expiresIn') expiresIn?: number,
    @Query('contentType') contentType?: string,
    @Query('contentLength') contentLength?: number,
  ): Promise<PresignedUrlResponse> {
    const options: PresignedUrlOptions = {
      expiresIn: expiresIn ? Number(expiresIn) : undefined,
      contentType,
      contentLength: contentLength ? Number(contentLength) : undefined,
    };
    return this.minioService.getPresignedUploadUrl(objectName, options);
  }

  @Get('presigned-download-url')
  async getPresignedDownloadUrlGet(
    @Query('objectName') objectName: string,
    @Query('expiresIn') expiresIn?: number,
  ): Promise<PresignedUrlResponse> {
    const expiresInSeconds = expiresIn ? Number(expiresIn) : 7 * 24 * 60 * 60; // Default 7 days
    return this.minioService.getPresignedDownloadUrl(objectName, expiresInSeconds);
  }
}

