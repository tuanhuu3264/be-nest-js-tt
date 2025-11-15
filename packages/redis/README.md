# @packages/redis

Redis package for NestJS with rule-based configuration loader.

## Features

- **Rule-based Config Loader**: Dynamic configuration based on rules (environment, context, etc.)
- **Redis Client**: Pre-configured Redis client with connection management

## Installation

```bash
npm install @packages/redis
```

## Usage

### Module Setup

```typescript
import { Module } from '@nestjs/common';
import { RedisModule } from '@packages/redis';

@Module({
  imports: [RedisModule.forRoot()],
})
export class AppModule {}
```

### Using Redis Client

```typescript
import { Inject } from '@nestjs/common';
import { REDIS_CLIENT } from '@packages/redis';
import Redis from 'ioredis';

export class MyService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async setValue(key: string, value: string) {
    await this.redis.set(key, value);
  }

  async getValue(key: string) {
    return await this.redis.get(key);
  }
}
```

### Custom Configuration Rules

```typescript
import { RedisConfigLoaderService } from '@packages/redis';

export class MyService {
  constructor(
    private readonly configLoader: RedisConfigLoaderService,
  ) {
    // Add custom rule
    this.configLoader.addRule({
      name: 'custom-rule',
      condition: (context) => context.region === 'asia',
      config: {
        host: 'asia-redis',
        port: 6379,
        db: 0,
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

