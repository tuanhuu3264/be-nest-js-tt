export enum MediaStatus {
  ACTIVE = 1,
  INACTIVE = 2,
  SUSPENDED = 3,
}

export enum MediaType {
  IMAGE = 1,
  VIDEO = 2,
  AUDIO = 3,
  DOCUMENT = 4,
}

export class Media {
  constructor(
    public readonly id: string,
    public readonly userId: number,
    public readonly fileName: string,
    public readonly mediaType: MediaType,
    public readonly mediaUrl: string,
    public readonly mediaSize: number,
    public readonly mediaLastExpiration: Date,
    public readonly mediaIsPublic: boolean,
    public readonly tags: string[],
    public readonly status: MediaStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
