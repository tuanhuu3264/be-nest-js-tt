# @packages/kafka

Kafka package for NestJS with producer, consumer and rule-based configuration loader.

## Features

- **Producer Service**: Send messages to Kafka topics
- **Consumer Service**: Consume messages from Kafka topics
- **Rule-based Config Loader**: Dynamic configuration based on rules (environment, context, etc.)

## Installation

```bash
npm install @packages/kafka
```

## Usage

### Module Setup

```typescript
import { Module } from '@nestjs/common';
import { KafkaModule } from '@packages/kafka';

@Module({
  imports: [KafkaModule.forRoot()],
})
export class AppModule {}
```

### Using Producer

```typescript
import { Inject } from '@nestjs/common';
import { KAFKA_PRODUCER, IKafkaProducer } from '@packages/kafka';

export class MyService {
  constructor(
    @Inject(KAFKA_PRODUCER)
    private readonly producer: IKafkaProducer,
  ) {}

  async sendMessage(topic: string, message: any) {
    await this.producer.send(topic, [
      {
        key: message.id,
        value: JSON.stringify(message),
      },
    ]);
  }
}
```

### Using Consumer

```typescript
import { Inject } from '@nestjs/common';
import { KAFKA_CONSUMER, IKafkaConsumer } from '@packages/kafka';

export class MyService {
  constructor(
    @Inject(KAFKA_CONSUMER)
    private readonly consumer: IKafkaConsumer,
  ) {}

  async startConsuming() {
    await this.consumer.subscribe(['user-events']);
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const value = JSON.parse(message.value.toString());
        console.log('Received message:', value);
      },
    });
  }
}
```

### Custom Configuration Rules

```typescript
import { KafkaConfigLoaderService } from '@packages/kafka';

export class MyService {
  constructor(
    private readonly configLoader: KafkaConfigLoaderService,
  ) {
    // Add custom rule
    this.configLoader.addRule({
      name: 'custom-rule',
      condition: (context) => context.region === 'asia',
      config: {
        clientId: 'asia-client',
        brokers: ['asia-kafka-1:9092', 'asia-kafka-2:9092'],
      },
    });
  }
}
```

## Configuration

The package uses rule-based configuration. Default rules include:
- `development`: Local development setup
- `production`: Production cluster setup
- `test`: Test environment setup

Rules are evaluated in order, and the first matching rule is used.

