# Material Worker Service

Service xử lý file upload với 4 quality levels cho TikTok clone.

## Tính năng

- **File Processing**: Xử lý video, image, audio thành 4 quality levels
- **Kafka Consumer**: Nhận message từ material-service
- **MinIO Integration**: Download/upload files
- **FFmpeg**: Video/audio processing
- **Sharp**: Image processing

## Cài đặt

### 1. Dependencies
```bash
npm install
```

### 2. Infrastructure Setup

#### Option 1: Full Stack (Recommended)
```bash
# Start all services (Kafka + MinIO + PostgreSQL + Redis)
docker-compose -f docker-compose.full.yml up -d

# Services available:
# - Kafka UI: http://localhost:8080
# - MinIO Console: http://localhost:9001 (admin/StrongPassword123!)
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
```

#### Option 2: Individual Services
```bash
# Kafka only
docker-compose -f docker-compose.kafka.yml up -d

# MinIO only  
docker-compose -f docker-compose.minio.yml up -d
```

### 3. Environment Variables
```bash
# Kafka - No ACL
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=material-worker
KAFKA_GROUP_ID=material-worker-group
KAFKA_SSL=false
KAFKA_SASL=

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=StrongPassword123!
MINIO_BUCKET_NAME=material-worker
MINIO_REGION=us-east-1
MINIO_CONNECT_TIMEOUT=5000
MINIO_REQUEST_TIMEOUT=10000
MINIO_MAX_RETRIES=3
MINIO_PART_SIZE=64MB
MINIO_PUBLIC_READ=false

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin123
POSTGRES_DB=mydb

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## Chạy service

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Kafka Configuration (No ACL)

### Config trong `config.yaml`:
```yaml
kafka:
  clientId: material-worker
  brokers:
    - localhost:9092
  groupId: material-worker-group
  # Security - No ACL
  ssl: false
  sasl: null
  # Performance settings
  connectionTimeout: 3000
  requestTimeout: 30000
  sessionTimeout: 30000
  heartbeatInterval: 3000
  maxWaitTimeInMs: 5000
  acks: 1
  compression: gzip
```

### Topics được sử dụng:
- **`file-upload-processing`**: Nhận từ material-service
- **`file-processing-completed`**: Gửi về material-service

## File Processing

### Quality Levels:
1. **Original**: File gốc
2. **High**: 1920x1080 (video), 320k (audio), 90% (image)
3. **Medium**: 1280x720 (video), 192k (audio), 80% (image)  
4. **Low**: 854x480 (video), 128k (audio), 60% (image)

### Supported Formats:
- **Video**: MP4, AVI, MOV, MKV
- **Audio**: MP3, WAV, AAC, FLAC
- **Image**: JPG, PNG, GIF, WEBP
- **Document**: PDF, DOC, TXT (original only)

## Monitoring

### Web UIs
- **Kafka UI**: http://localhost:8080
  - Topics, Consumer groups, Messages
- **MinIO Console**: http://localhost:9001 (admin/StrongPassword123!)
  - Buckets, Objects, Policies
- **Health Check**: http://localhost:3002/health
  - Service status, Dependencies

### Logs
```bash
# View logs
docker logs material-worker

# Follow logs
docker logs -f material-worker

# All services logs
docker-compose -f docker-compose.full.yml logs -f
```

## Troubleshooting

### Infrastructure Issues:
```bash
# Check all services
docker-compose -f docker-compose.full.yml ps

# Restart specific service
docker-compose -f docker-compose.full.yml restart kafka
docker-compose -f docker-compose.full.yml restart minio

# Check service logs
docker-compose -f docker-compose.full.yml logs kafka
docker-compose -f docker-compose.full.yml logs minio
```

### Kafka Issues:
```bash
# Check topics
docker exec -it kafka kafka-topics --bootstrap-server localhost:9092 --list

# Test producer
docker exec -it kafka kafka-console-producer --bootstrap-server localhost:9092 --topic test

# Test consumer
docker exec -it kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic test --from-beginning
```

### MinIO Issues:
```bash
# Check buckets
docker exec -it minio-init mc ls minio/

# Test upload
docker exec -it minio-init mc cp /etc/hosts minio/material-worker/test.txt

# Test download
docker exec -it minio-init mc cp minio/material-worker/test.txt /tmp/test.txt

# Check bucket policy
docker exec -it minio-init mc policy get minio/material-worker
```

### FFmpeg Issues:
```bash
# Install FFmpeg (Ubuntu/Debian)
sudo apt update
sudo apt install ffmpeg

# Install FFmpeg (macOS)
brew install ffmpeg

# Check FFmpeg
ffmpeg -version
```

### Sharp Issues:
```bash
# Rebuild Sharp
npm rebuild sharp

# Clear node_modules
rm -rf node_modules package-lock.json
npm install
```

## Development

### Test Kafka Message:
```bash
# Send test message
docker exec -it kafka kafka-console-producer --bootstrap-server localhost:9092 --topic file-upload-processing

# Consume messages
docker exec -it kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic file-processing-completed --from-beginning
```

### Debug Mode:
```bash
npm run start:debug
```

## Architecture

```
Material Service → Kafka → Material Worker
     ↓                           ↓
  Database              File Processing
                              ↓
                        MinIO Storage
                              ↓
                    Kafka → Material Service
                              ↓
                          Database
```