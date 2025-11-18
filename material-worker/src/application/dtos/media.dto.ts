import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ObjectType, Field, InputType, Int } from '@nestjs/graphql';
import { MediaType, MediaStatus } from '../../domain/media/entities/media.entity';

@InputType()
export class CreateMediaDto {
  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @Field(() => Int)
  @IsEnum(MediaType)
  @IsNotEmpty()
  mediaType: MediaType;

  @Field()
  @IsString()
  @IsNotEmpty()
  mediaUrl: string;

  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  mediaSize: number;

  @Field({ nullable: true })
  @IsOptional()
  mediaLastExpiration?: Date;

  @Field({ defaultValue: false })
  @IsBoolean()
  @IsOptional()
  mediaIsPublic?: boolean;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @Field(() => Int, { defaultValue: MediaStatus.ACTIVE })
  @IsEnum(MediaStatus)
  @IsOptional()
  status?: MediaStatus;
}

@InputType()
export class UpdateMediaDto {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  fileName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  mediaUrl?: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  mediaSize?: number;

  @Field({ nullable: true })
  @IsOptional()
  mediaLastExpiration?: Date;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  mediaIsPublic?: boolean;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @Field(() => Int, { nullable: true })
  @IsEnum(MediaStatus)
  @IsOptional()
  status?: MediaStatus;
}

@ObjectType()
export class MediaResponseDto {
  @Field(() => String)
  id: string;

  @Field(() => Int)
  userId: number;

  @Field(() => String)
  fileName: string;

  @Field(() => Int)
  mediaType: MediaType;

  @Field(() => String)
  mediaUrl: string;

  @Field(() => Int)
  mediaSize: number;

  @Field({ nullable: true })
  mediaLastExpiration?: Date;

  @Field(() => Boolean)
  mediaIsPublic: boolean;

  @Field(() => [String])
  tags: string[];

  @Field(() => Int)
  status: MediaStatus;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

