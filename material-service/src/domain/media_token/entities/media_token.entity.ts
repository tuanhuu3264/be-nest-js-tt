export enum MediaTokenStatus {
  ACTIVE = 1,
  INACTIVE = 2,
  DELETED = 3,
}

export class MediaToken {
  constructor(
    public readonly id: string,
    public readonly mediaId: string,
    public readonly status: MediaTokenStatus,
    public readonly ipAddress: string,
    public readonly expiresAt: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}

