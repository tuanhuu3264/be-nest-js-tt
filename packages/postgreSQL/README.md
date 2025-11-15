# @packages/postgresql

PostgreSQL package for NestJS with rule-based configuration loader.

## Features

- **Rule-based Config Loader**: Dynamic configuration based on rules (environment, context, etc.)
- **TypeORM Integration**: Pre-configured TypeORM module for PostgreSQL

## Installation

```bash
npm install @packages/postgresql
```

## Usage

### Module Setup

```typescript
import { Module } from '@nestjs/common';
import { PostgreSQLModule } from '@packages/postgresql';

@Module({
  imports: [PostgreSQLModule.forRoot()],
})
export class AppModule {}
```

### Using TypeORM

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}

export class MyService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll() {
    return await this.userRepository.find();
  }
}
```

### Custom Configuration Rules

```typescript
import { PostgreSQLConfigLoaderService } from '@packages/postgresql';

export class MyService {
  constructor(
    private readonly configLoader: PostgreSQLConfigLoaderService,
  ) {
    // Add custom rule
    this.configLoader.addRule({
      name: 'custom-rule',
      condition: (context) => context.region === 'asia',
      config: {
        type: 'postgres',
        host: 'asia-postgres',
        port: 5432,
        username: 'postgres',
        password: 'password',
        database: 'asia_db',
      },
    });
  }
}
```

## Configuration

The package uses rule-based configuration. Default rules include:
- `development`: Local development setup
- `production`: Production cluster setup with SSL
- `test`: Test environment setup

Rules are evaluated in order, and the first matching rule is used.

