import { KubeConfig } from '@kubernetes/client-node';

export interface KubernetesConfigRule {
  name: string;
  condition: (context: any) => boolean;
  config: KubernetesConnectionConfig;
}

export interface KubernetesConnectionConfig {
  server?: string;
  caData?: string;
  caFile?: string;
  certData?: string;
  certFile?: string;
  keyData?: string;
  keyFile?: string;
  authProvider?: {
    name: string;
    config?: any;
  };
  namespace?: string;
  context?: string;
  currentContext?: string;
  skipTLSVerify?: boolean;
  requestTimeout?: number;
  watchTimeout?: number;
}

