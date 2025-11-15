export interface LoaderConfigRule {
  name: string;
  condition: (context: any) => boolean;
  config: LoaderConnectionConfig;
}

export interface LoaderConnectionConfig {
  configPath?: string;
  configFile?: string;
  watch?: boolean;
  encoding?: string;
  schema?: any;
  validate?: boolean;
  cache?: boolean;
  expandVariables?: boolean;
  loaders?: {
    yaml?: boolean;
    json?: boolean;
    env?: boolean;
  };
}

