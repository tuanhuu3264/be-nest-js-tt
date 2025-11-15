export interface ICassandraConsumer {
  consume<T>(query: string, params?: any[], config?: any): Promise<T[]>;
  consumeOne<T>(query: string, params?: any[], config?: any): Promise<T | null>;
  stream(query: string, params?: any[], config?: any): AsyncIterable<any>;
  close(): Promise<void>;
}

