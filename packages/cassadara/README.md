# @packages/cassadara

Cassandra package for NestJS with producer, consumer and rule-based configuration loader.

## Features

- **Producer Service**: Execute INSERT, UPDATE, DELETE queries
- **Consumer Service**: Execute SELECT queries with streaming support
- **Rule-based Config Loader**: Dynamic configuration based on rules (environment, context, etc.)

## Installation

```bash
npm install @packages/cassadara
```

## Usage

### Module Setup

```typescript
import { Module } from '@nestjs/common';
import { CassandraModule } from '@packages/cassadara';

@Module({
  imports: [CassandraModule.forRoot()],
})
export class AppModule {}
```

### Using Producer

```typescript
import { Inject } from '@nestjs/common';
import { CASSANDRA_PRODUCER, ICassandraProducer } from '@packages/cassadara';

export class MyService {
  constructor(
    @Inject(CASSANDRA_PRODUCER)
    private readonly producer: ICassandraProducer,
  ) {}

  async createUser(user: User) {
    await this.producer.produce(
      'INSERT INTO users (id, name, email) VALUES (?, ?, ?)',
      [user.id, user.name, user.email],
    );
  }
}
```

### Using Consumer

```typescript
import { Inject } from '@nestjs/common';
import { CASSANDRA_CONSUMER, ICassandraConsumer } from '@packages/cassadara';

export class MyService {
  constructor(
    @Inject(CASSANDRA_CONSUMER)
    private readonly consumer: ICassandraConsumer,
  ) {}

  async getUser(id: string) {
    return await this.consumer.consumeOne<User>(
      'SELECT * FROM users WHERE id = ?',
      [id],
    );
  }
}
```

### Custom Configuration Rules

```typescript
import { CassandraConfigLoaderService } from '@packages/cassadara';

export class MyService {
  constructor(
    private readonly configLoader: CassandraConfigLoaderService,
  ) {
    // Add custom rule
    this.configLoader.addRule({
      name: 'custom-rule',
      condition: (context) => context.region === 'asia',
      config: {
        contactPoints: ['asia-cassandra-1', 'asia-cassandra-2'],
        localDataCenter: 'asia-datacenter',
        keyspace: 'asia_keyspace',
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

