import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MinIOHealthService } from './infrastructure/storage/minio/minio.health';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly minioHealthService: MinIOHealthService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async getHealth() {
    const minioHealth = await this.minioHealthService.checkHealth();
    
    return {
      status: 'ok',
      service: 'material-worker',
      timestamp: new Date().toISOString(),
      dependencies: {
        minio: minioHealth,
      },
    };
  }
}

