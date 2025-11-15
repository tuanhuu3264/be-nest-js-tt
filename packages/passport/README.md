# @packages/passport

Passport package for NestJS with rule-based configuration loader.

## Features

- **Rule-based Config Loader**: Dynamic configuration based on rules (environment, context, etc.)
- **JWT Strategy**: Pre-configured JWT authentication
- **Local Strategy**: Pre-configured local authentication

## Installation

```bash
npm install @packages/passport
```

## Usage

### Module Setup

```typescript
import { Module } from '@nestjs/common';
import { PassportModule } from '@packages/passport';

@Module({
  imports: [PassportModule.forRoot()],
})
export class AppModule {}
```

### Using JWT Strategy

```typescript
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private jwtService: JwtService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'your-secret-key',
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
```

### Custom Configuration Rules

```typescript
import { PassportConfigLoaderService } from '@packages/passport';

export class MyService {
  constructor(
    private readonly configLoader: PassportConfigLoaderService,
  ) {
    // Add custom rule
    this.configLoader.addRule({
      name: 'custom-rule',
      condition: (context) => context.region === 'asia',
      config: {
        jwt: {
          secret: 'asia-secret-key',
          signOptions: {
            expiresIn: '2h',
          },
        },
      },
    });
  }
}
```

## Configuration

The package uses rule-based configuration. Default rules include:
- `development`: Development setup with longer token expiration
- `production`: Production setup with shorter token expiration
- `test`: Test environment setup

Rules are evaluated in order, and the first matching rule is used.

