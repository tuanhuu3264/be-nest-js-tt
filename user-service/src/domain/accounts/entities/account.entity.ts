export enum AccountType {
  BASIC = 1,
  PREMIUM = 2,
  VERIFIED = 3,
  NOT_VERIFIED = 4,
}

export enum AccountStatus {
  ACTIVE = 1,
  INACTIVE = 2,
  SUSPENDED = 3,
}

export class Account {
  constructor(
    public readonly id: string,
    public readonly userId: number,
    public readonly accountType: AccountType,
    public readonly status: AccountStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}

