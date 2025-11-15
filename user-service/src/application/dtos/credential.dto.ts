import { IsNotEmpty, IsNumber, IsString, IsInt } from 'class-validator';
import { ObjectType, Field, InputType, Int } from '@nestjs/graphql';
import { CredentialType } from '../../domain/credentials/entities/credential.entity';

@InputType()
export class CreateCredentialDto {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  password: string;

  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  credentialType: CredentialType;

  @Field()
  @IsString()
  @IsNotEmpty()
  ipAddress: string;
}

@InputType()
export class UpdateCredentialDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  password: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  ipAddress: string;
}

@InputType()
export class VerifyCredentialDto {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  password: string;
}

@ObjectType()
export class CredentialResponseDto {
  @Field(() => String)
  id: string; 

  @Field(() => Int)
  userId: number;

  @Field(() => Int)
  credentialType: CredentialType;

  @Field(() => String)
  ipAddress: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class VerifyCredentialResponseDto {
  @Field(() => Boolean)
  isValid: boolean;

  @Field(() => String)
  message: string;
}

