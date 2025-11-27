# Search Service

Search service với tích hợp Elasticsearch cho ứng dụng TikTok clone.

## Cấu trúc

```
search-service/
├── src/
│   ├── main.ts                          # Entry point
│   ├── app.module.ts                    # Root module
│   ├── app.controller.ts                # REST API endpoints
│   ├── app.service.ts                   # Application service
│   ├── config/
│   │   ├── config.ts                    # Configuration loader
│   │   └── config.yaml                  # Configuration file
│   └── infrastructure/
│       └── presistences/
│           └── elasticsearch/
│               ├── elasticsearch.module.ts
│               └── elasticsearch.service.ts
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Cấu hình Elasticsearch trong `src/config/config.yaml` hoặc sử dụng environment variables:
```yaml
app:
  elasticsearch:
    node: http://localhost:9200
    nodes:
      - http://localhost:9200
    username: elastic
    password: changeme
```

Hoặc sử dụng environment variables:
```bash
export ELASTICSEARCH_NODE=http://localhost:9200
export ELASTICSEARCH_USERNAME=elastic
export ELASTICSEARCH_PASSWORD=changeme
```

## Chạy ứng dụng

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## API Endpoints

### Health Check
```
GET /health
```

### Tạo Index
```
POST /index/:indexName/create
Body: {
  "mappings": { ... },
  "settings": { ... }
}
```

### Kiểm tra Index tồn tại
```
GET /index/:indexName/exists
```

### Xóa Index
```
POST /index/:indexName/delete
```

### Index Document
```
POST /index/:indexName
Body: {
  "id": "optional-document-id",
  "document": { ... }
}
```

### Lấy Document
```
GET /index/:indexName/:id
```

### Cập nhật Document
```
POST /index/:indexName/:id
Body: {
  "document": { ... }
}
```

### Xóa Document
```
POST /index/:indexName/:id/delete
```

### Bulk Index
```
POST /index/:indexName/bulk
Body: {
  "documents": [
    { "id": "optional-id", "document": { ... } },
    { "document": { ... } }
  ]
}
```

### Tìm kiếm
```
POST /search
Body: {
  "index": "index-name",
  "query": {
    "query": {
      "match": {
        "field": "value"
      }
    }
  },
  "size": 10,
  "from": 0
}
```

## Ví dụ sử dụng

### Tạo index cho videos
```bash
curl -X POST http://localhost:3000/index/videos/create \
  -H "Content-Type: application/json" \
  -d '{
    "mappings": {
      "properties": {
        "title": { "type": "text" },
        "description": { "type": "text" },
        "userId": { "type": "keyword" },
        "createdAt": { "type": "date" }
      }
    }
  }'
```

### Index một video
```bash
curl -X POST http://localhost:3000/index/videos \
  -H "Content-Type: application/json" \
  -d '{
    "document": {
      "title": "My Video",
      "description": "Video description",
      "userId": "123",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }'
```

### Tìm kiếm videos
```bash
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{
    "index": "videos",
    "query": {
      "query": {
        "match": {
          "title": "My Video"
        }
      }
    }
  }'
```

## Environment Variables

- `PORT`: Port cho service (default: 3000)
- `ELASTICSEARCH_NODE`: Elasticsearch node URL (default: http://localhost:9200)
- `ELASTICSEARCH_NODES`: Comma-separated list of Elasticsearch nodes
- `ELASTICSEARCH_USERNAME`: Elasticsearch username
- `ELASTICSEARCH_PASSWORD`: Elasticsearch password
- `ELASTICSEARCH_SSL_REJECT_UNAUTHORIZED`: SSL verification (default: true)
- `ELASTICSEARCH_REQUEST_TIMEOUT`: Request timeout in ms (default: 30000)
- `ELASTICSEARCH_PING_TIMEOUT`: Ping timeout in ms (default: 3000)
- `ELASTICSEARCH_MAX_RETRIES`: Max retries (default: 3)

## Development

```bash
# Run in watch mode
npm run start:dev

# Build
npm run build

# Lint
npm run lint

# Test
npm run test
```

