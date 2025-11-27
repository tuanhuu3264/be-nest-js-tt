import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { KafkaService } from '../../infrastructure/queue/kafka/kafka.service';
import { FileProcessingService, FileProcessingMessage } from './file-processing.service';

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaConsumerService.name);

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly fileProcessingService: FileProcessingService,
  ) {}

  async onModuleInit() {
    // Subscribe to file upload processing topic
    await this.kafkaService.subscribe('file-upload-processing');
    
    // Start consuming messages
    await this.kafkaService.run(async ({ topic, message }) => {
      if (topic === 'file-upload-processing' && message.value) {
        try {
          const processingMessage: FileProcessingMessage = JSON.parse(message.value.toString());
          this.logger.log(`Received file processing message for media: ${processingMessage.mediaId}`);
          
          // Process the file
          await this.fileProcessingService.processFile(processingMessage);
        } catch (error) {
          this.logger.error('Error processing Kafka message:', error);
        }
      }
    });

    this.logger.log('Kafka consumer service initialized');
  }
}
