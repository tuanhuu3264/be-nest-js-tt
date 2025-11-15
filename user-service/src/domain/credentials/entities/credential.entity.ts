export enum CredentialType {
  PASSWORD = 1,
  GOOGLE_OAUTH = 2,
  FACEBOOK_OAUTH = 3,
}

export class Credential {
  constructor(
    public readonly id: string,
    public readonly userId: number,
    public readonly credentialType: CredentialType,
    public readonly ipAddress: string,
    public readonly hashedPassword: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}

