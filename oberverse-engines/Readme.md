# Oberverse Engines Service

NestJS microservice với GraphQL.

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

### Environment Variables

```bash
# HTTP Server
PORT=3003
```

## Endpoints

### HTTP Server
- Port: `3003` (mặc định)
- GraphQL Playground: `http://localhost:3003/graphql`

## Scripts

- `npm run start` - Chạy ứng dụng
- `npm run start:dev` - Chạy với watch mode (hot reload)
- `npm run start:debug` - Chạy với debug mode
- `npm run start:prod` - Chạy production build
- `npm run build` - Build ứng dụng
- `npm run lint` - Chạy linter
- `npm run test` - Chạy unit tests
- `npm run test:e2e` - Chạy e2e tests

