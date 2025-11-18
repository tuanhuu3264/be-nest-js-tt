import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as MinIO from 'minio';

export const MINIO_CLIENT = 'MINIO_CLIENT';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: MINIO_CLIENT,
      useFactory: (configService: ConfigService): MinIO.Client => {
        const endPoint = process.env.MINIO_ENDPOINT || configService.get<string>('app.minio.endPoint', 'localhost');
        const port = process.env.MINIO_PORT
          ? parseInt(process.env.MINIO_PORT, 10)
          : configService.get<number>('app.minio.port', 9000);
        const useSSL = process.env.MINIO_USE_SSL === 'true' || configService.get<boolean>('app.minio.useSSL', false);
        const accessKey = process.env.MINIO_ACCESS_KEY || configService.get<string>('app.minio.accessKey', 'minioadmin');
        const secretKey = process.env.MINIO_SECRET_KEY || configService.get<string>('app.minio.secretKey', 'minioadmin');
        const region = process.env.MINIO_REGION || configService.get<string>('app.minio.region', 'us-east-1');

        const minioClient = new MinIO.Client({
          endPoint,
          port,
          useSSL,
          accessKey,
          secretKey,
          region,
        });

        return minioClient;
      },
      inject: [ConfigService],
    },
  ],
  exports: [MINIO_CLIENT],
})
export class MinIOModule {}

