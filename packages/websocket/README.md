# @packages/websocket

WebSocket package for NestJS with rule-based configuration loader.

## Features

- **Rule-based Config Loader**: Dynamic configuration based on rules (environment, context, etc.)
- **WebSocket Gateway Support**: Pre-configured WebSocket module

## Installation

```bash
npm install @packages/websocket
```

## Usage

### Module Setup

```typescript
import { Module } from '@nestjs/common';
import { WebSocketModule } from '@packages/websocket';

@Module({
  imports: [WebSocketModule.forRoot()],
})
export class AppModule {}
```

### Using WebSocket Gateway

```typescript
import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
```

### Custom Configuration Rules

```typescript
import { WebSocketConfigLoaderService } from '@packages/websocket';

export class MyService {
  constructor(
    private readonly configLoader: WebSocketConfigLoaderService,
  ) {
    // Add custom rule
    this.configLoader.addRule({
      name: 'custom-rule',
      condition: (context) => context.region === 'asia',
      config: {
        namespace: '/asia',
        cors: {
          origin: 'https://asia.example.com',
          credentials: true,
        },
        transports: ['websocket'],
      },
    });
  }
}
```

## Configuration

The package uses rule-based configuration. Default rules include:
- `development`: Local development setup with polling fallback
- `production`: Production setup with websocket only
- `test`: Test environment setup

Rules are evaluated in order, and the first matching rule is used.

