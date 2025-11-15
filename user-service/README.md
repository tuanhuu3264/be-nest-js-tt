# User Service

NestJS microservice với gRPC, GraphQL, PostgreSQL, Cassandra, Redis và Kafka.

## Cài đặt

```bash
npm install
```

## Chạy ứng dụng

### Development mode (với hot reload)
```bash
npm run start:dev
```

### Production mode
```bash
# Build trước
npm run build

# Chạy
npm run start:prod
```

### Debug mode
```bash
npm run start:debug
```

## Cấu hình

### File config.yaml
Cấu hình trong `src/config/config.yaml` sẽ được ưu tiên. Nếu không có trong YAML, sẽ đọc từ environment variables.

### Environment Variables
Bạn có thể override config bằng các biến môi trường:

```bash
# HTTP Server
PORT=3000

# gRPC Server
GRPC_URL=0.0.0.0:5000

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=user_service
POSTGRES_SYNC=false
POSTGRES_LOGGING=false

# Cassandra
CASSANDRA_CONTACT_POINTS=localhost
CASSANDRA_DATA_CENTER=datacenter1
CASSANDRA_KEYSPACE=user_service
CASSANDRA_USER=cassandra
CASSANDRA_PASSWORD=cassandra

# Kafka
KAFKA_CLIENT_ID=user-service
KAFKA_BROKERS=localhost:9092
KAFKA_GROUP_ID=user-service-group
KAFKA_RETRIES=8
KAFKA_INITIAL_RETRY_TIME=100

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Snowflake
SNOWFLAKE_MACHINE_ID=1
```

## Endpoints

### HTTP Server
- Port: `3000` (mặc định)
- GraphQL Playground: `http://localhost:3000/graphql`

### gRPC Server
- Port: `5000` (mặc định)
- URL: `0.0.0.0:5000`

## Scripts

- `npm run start` - Chạy ứng dụng
- `npm run start:dev` - Chạy với watch mode (hot reload)
- `npm run start:debug` - Chạy với debug mode
- `npm run start:prod` - Chạy production build
- `npm run build` - Build ứng dụng
- `npm run lint` - Chạy linter
- `npm run test` - Chạy unit tests
- `npm run test:e2e` - Chạy e2e tests
