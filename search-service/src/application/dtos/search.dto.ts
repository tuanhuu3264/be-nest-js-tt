import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsArray, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchDto {
  @IsString()
  @IsNotEmpty()
  index: string;

  @IsObject()
  @IsNotEmpty()
  query: any;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  size?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  from?: number;
}

export class IndexDocumentDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsObject()
  @IsNotEmpty()
  document: any;
}

export class UpdateDocumentDto {
  @IsObject()
  @IsNotEmpty()
  document: any;
}

export class BulkIndexDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkIndexItemDto)
  documents: BulkIndexItemDto[];
}

export class BulkIndexItemDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsObject()
  @IsNotEmpty()
  document: any;
}

export class CreateIndexDto {
  @IsOptional()
  @IsObject()
  mappings?: any;

  @IsOptional()
  @IsObject()
  settings?: any;
}

