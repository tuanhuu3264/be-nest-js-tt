import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';
import { ObjectType, Field, InputType, Int } from '@nestjs/graphql';
import { MediaInteractionType, MediaInteractionStatus } from '../../domain/media_interaction/entities/media_interaction.entity';

@InputType()
export class CreateMediaInteractionDto {
  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  mediaId: string;

  @Field(() => Int)
  @IsEnum(MediaInteractionType)
  @IsNotEmpty()
  mediaInteractionType: MediaInteractionType;

  @Field(() => Int, { defaultValue: MediaInteractionStatus.ACTIVE })
  @IsEnum(MediaInteractionStatus)
  @IsOptional()
  status?: MediaInteractionStatus;
}

@InputType()
export class UpdateMediaInteractionDto {
  @Field(() => Int, { nullable: true })
  @IsEnum(MediaInteractionType)
  @IsOptional()
  mediaInteractionType?: MediaInteractionType;

  @Field(() => Int, { nullable: true })
  @IsEnum(MediaInteractionStatus)
  @IsOptional()
  status?: MediaInteractionStatus;
}

@ObjectType()
export class MediaInteractionResponseDto {
  @Field(() => String)
  id: string;

  @Field(() => Int)
  userId: number;

  @Field(() => String)
  mediaId: string;

  @Field(() => Int)
  mediaInteractionType: MediaInteractionType;

  @Field(() => Int)
  status: MediaInteractionStatus;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

