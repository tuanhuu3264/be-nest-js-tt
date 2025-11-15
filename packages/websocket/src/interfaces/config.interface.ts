import { GatewayMetadata } from '@nestjs/websockets';

export interface WebSocketConfigRule {
  name: string;
  condition: (context: any) => boolean;
  config: WebSocketConnectionConfig;
}

export interface WebSocketConnectionConfig extends GatewayMetadata {
  namespace?: string;
  cors?: {
    origin: string | string[];
    credentials?: boolean;
  };
  transports?: string[];
  allowEIO3?: boolean;
  pingTimeout?: number;
  pingInterval?: number;
  maxHttpBufferSize?: number;
  allowRequest?: (origin: string, callback: (err: string | null, allow: boolean) => void) => void;
  path?: string;
  serveClient?: boolean;
  connectTimeout?: number;
}

