import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure body parser - MUST be before other middleware
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // Enable CORS
  app.enableCors();

  // Enable validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Connect gRPC microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: ['user', 'account', 'profile', 'credential'],
      protoPath: [
        join(__dirname, '../proto/user.proto'),
        join(__dirname, '../proto/account.proto'),
        join(__dirname, '../proto/profile.proto'),
        join(__dirname, '../proto/credential.proto'),
      ],
      url: process.env.GRPC_URL || '0.0.0.0:5000',
    },
  });

  await app.startAllMicroservices();

  await app.listen(process.env.PORT ?? 3000);

  console.log(`HTTP Server running on: ${process.env.PORT ?? 3000}`);
  console.log(`gRPC Server running on: ${process.env.GRPC_URL || '0.0.0.0:5000'}`);
}
bootstrap();
