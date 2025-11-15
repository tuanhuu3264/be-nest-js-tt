import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
import { IsInt } from 'class-validator';
import { ObjectType, Field, InputType, Int } from '@nestjs/graphql';
import { AccountType, AccountStatus } from '../../domain/accounts/entities/account.entity';

@InputType()
export class CreateAccountDto {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  accountType: AccountType;

  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  status: AccountStatus;
}

@InputType()
export class UpdateAccountDto {
  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  accountType?: AccountType;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  status?: AccountStatus;
}

@ObjectType()
export class AccountResponseDto {
  @Field(() => String)
  id: string;

  @Field(() => Int)
  userId: number;

  @Field(() => Int)
  accountType: AccountType;

  @Field(() => Int)
  status: AccountStatus;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

