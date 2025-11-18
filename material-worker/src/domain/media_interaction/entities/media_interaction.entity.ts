

export enum MediaInteractionStatus {
  ACTIVE = 1,
  INACTIVE = 2,
  DELETED = 3,
}

export enum MediaInteractionType {
  LIKE = 1,
  COMMENT = 2,
  SHARE = 3,
  SAVE = 4,
  DOWNLOAD = 5,
  VIEW = 6,
  REPORT = 7,
}

export class MediaInteraction {
  constructor(
    public readonly id: string,
    public readonly userId: number,
    public readonly mediaId: string,
    public readonly mediaInteractionType: MediaInteractionType,
    public readonly status: MediaInteractionStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
