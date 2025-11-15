# @packages/loader

Loader package for NestJS with rule-based configuration loader.

## Features

- **Rule-based Config Loader**: Dynamic configuration based on rules (environment, context, etc.)
- **File Loading**: Load configuration from YAML or JSON files
- **Auto-loading**: Automatically load configuration on module initialization

## Installation

```bash
npm install @packages/loader
```

## Usage

### Module Setup

```typescript
import { Module } from '@nestjs/common';
import { LoaderModule } from '@packages/loader';

@Module({
  imports: [LoaderModule.forRoot()],
})
export class AppModule {}
```

### Using Loader Service

```typescript
import { Inject } from '@nestjs/common';
import { LoaderConfigLoaderService } from '@packages/loader';

export class MyService {
  constructor(
    private readonly configLoader: LoaderConfigLoaderService,
  ) {
    // Load configuration
    const config = this.configLoader.load();
    console.log('Loaded config:', config);

    // Get loaded configuration
    const loadedConfig = this.configLoader.getLoadedConfig();
  }
}
```

### Custom Configuration Rules

```typescript
import { LoaderConfigLoaderService } from '@packages/loader';

export class MyService {
  constructor(
    private readonly configLoader: LoaderConfigLoaderService,
  ) {
    // Add custom rule
    this.configLoader.addRule({
      name: 'custom-rule',
      condition: (context) => context.region === 'asia',
      config: {
        configPath: './config/asia',
        configFile: 'config.asia.yaml',
        watch: true,
      },
    });
  }
}
```

## Configuration

The package uses rule-based configuration. Default rules include:
- `development`: Local config file with watch enabled
- `production`: Production config file with caching
- `test`: Test config file without watch

Rules are evaluated in order, and the first matching rule is used.

## Supported File Formats

- YAML (`.yaml`, `.yml`)
- JSON (`.json`)

