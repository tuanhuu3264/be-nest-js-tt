import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { FileProcessingStatus } from '../../../../application/dtos/file-upload.dto';

@Entity('media_processing')
export class MediaProcessingEntity {
  @PrimaryColumn('varchar', { length: 255 })
  id: string;

  @Column('varchar', { length: 255 })
  mediaId: string;

  @Column('varchar', { length: 500 })
  uploadKey: string;

  @Column('varchar', { length: 50 })
  status: FileProcessingStatus;

  @Column('varchar', { length: 500, nullable: true })
  originalFileUrl?: string;

  @Column('text', { nullable: true })
  errorMessage?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ProcessedFileEntity, processedFile => processedFile.mediaProcessing)
  processedFiles?: ProcessedFileEntity[];
}

@Entity('processed_files')
export class ProcessedFileEntity {
  @PrimaryColumn('varchar', { length: 255 })
  id: string;

  @Column('varchar', { length: 255 })
  mediaProcessingId: string;

  @Column('varchar', { length: 50 })
  quality: string;

  @Column('varchar', { length: 500 })
  fileUrl: string;

  @Column('bigint')
  fileSize: number;

  @Column('int', { nullable: true })
  width?: number;

  @Column('int', { nullable: true })
  height?: number;

  @Column('int', { nullable: true })
  duration?: number;

  @Column('int', { nullable: true })
  bitrate?: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => MediaProcessingEntity, mediaProcessing => mediaProcessing.processedFiles)
  @JoinColumn({ name: 'mediaProcessingId' })
  mediaProcessing: MediaProcessingEntity;
}