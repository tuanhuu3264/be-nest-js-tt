
  
  export enum MediaFileStatus {
    ACTIVE = 1,
    INACTIVE = 2,
    DELETED = 3,
  }
  
  export class MediaFile {
    constructor(
      public readonly id: string,
      public readonly mediaId: string,
      public readonly mediaKey: string,
      public readonly status: MediaFileStatus,
      public readonly createdAt: Date,
      public readonly updatedAt: Date,
    ) {}
  }
  