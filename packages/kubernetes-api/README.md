# @packages/kubernetes-api

Kubernetes API package for NestJS with rule-based configuration loader.

## Features

- **Rule-based Config Loader**: Dynamic configuration based on rules (environment, context, etc.)
- **Kubernetes Client**: Pre-configured Kubernetes client

## Installation

```bash
npm install @packages/kubernetes-api
```

## Usage

### Module Setup

```typescript
import { Module } from '@nestjs/common';
import { KubernetesApiModule } from '@packages/kubernetes-api';

@Module({
  imports: [KubernetesApiModule.forRoot()],
})
export class AppModule {}
```

### Using Kubernetes Client

```typescript
import { Inject } from '@nestjs/common';
import { KUBERNETES_CLIENT } from '@packages/kubernetes-api';
import { KubeConfig, CoreV1Api } from '@kubernetes/client-node';

export class MyService {
  private coreV1Api: CoreV1Api;

  constructor(
    @Inject(KUBERNETES_CLIENT)
    private readonly kubeConfig: KubeConfig,
  ) {
    this.coreV1Api = kubeConfig.makeApiClient(CoreV1Api);
  }

  async getPods(namespace: string) {
    const response = await this.coreV1Api.listNamespacedPod(namespace);
    return response.body.items;
  }
}
```

### Custom Configuration Rules

```typescript
import { KubernetesConfigLoaderService } from '@packages/kubernetes-api';

export class MyService {
  constructor(
    private readonly configLoader: KubernetesConfigLoaderService,
  ) {
    // Add custom rule
    this.configLoader.addRule({
      name: 'custom-rule',
      condition: (context) => context.region === 'asia',
      config: {
        server: 'https://asia-k8s.example.com',
        namespace: 'asia',
        skipTLSVerify: false,
      },
    });
  }
}
```

## Configuration

The package uses rule-based configuration. Default rules include:
- `development`: Local kubeconfig setup
- `production`: Production cluster setup with certificates
- `test`: Test environment setup

Rules are evaluated in order, and the first matching rule is used.

