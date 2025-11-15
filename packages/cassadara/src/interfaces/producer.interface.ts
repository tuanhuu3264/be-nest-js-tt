export interface ICassandraProducer {
  produce<T>(query: string, params?: any[], config?: any): Promise<T>;
  produceBatch(queries: Array<{ query: string; params?: any[] }>): Promise<void>;
  close(): Promise<void>;
}

