import { MediaProcessing } from '../entities/media-processing.entity';

export interface IMediaProcessingRepository {
  create(mediaProcessing: MediaProcessing): Promise<MediaProcessing>;
  findById(id: string): Promise<MediaProcessing | null>;
  findByMediaId(mediaId: string): Promise<MediaProcessing | null>;
  findByUploadKey(uploadKey: string): Promise<MediaProcessing | null>;
  update(mediaProcessing: MediaProcessing): Promise<MediaProcessing>;
  delete(id: string): Promise<boolean>;
}
