# Hướng dẫn Test User Service

## ✅ Trạng thái hiện tại

Ứng dụng đã sẵn sàng để test với:
- ✅ HTTP Server (GraphQL) - Port 3000
- ✅ gRPC Server - Port 5000
- ✅ Repositories (In-memory) - Hoạt động
- ✅ GraphQL Schema đã được generate
- ✅ Tất cả controllers và resolvers đã được implement

## 🚀 Cách chạy ứng dụng

```bash
npm run start:dev
```

Sau khi chạy, bạn sẽ thấy:
```
HTTP Server running on: 3000
gRPC Server running on: 0.0.0.0:5000
```

## 📝 Test GraphQL (HTTP)

### 1. Truy cập GraphQL Playground
Mở trình duyệt: `http://localhost:3000/graphql`

### 2. Test Mutations

#### Create User
```graphql
mutation {
  createUser(input: {
    email: "test@example.com"
    username: "testuser"
    password: "password123"
    phone: "0123456789"
  }) {
    id
    email
    username
    phone
    createdAt
  }
}
```

#### Update User
```graphql
mutation {
  updateUser(
    id: 1234567890123456789
    input: {
      email: "newemail@example.com"
      username: "newusername"
    }
  ) {
    id
    email
    username
  }
}
```

#### Delete User
```graphql
mutation {
  deleteUser(id: 1234567890123456789)
}
```

### 3. Test Queries

#### Get User
```graphql
query {
  getUser(id: 1234567890123456789) {
    id
    email
    username
    phone
    createdAt
    updatedAt
  }
}
```

#### List Users
```graphql
query {
  listUsers(page: 1, limit: 10) {
    id
    email
    username
    phone
  }
}
```

### 4. Test Profile

#### Create Profile
```graphql
mutation {
  createProfile(input: {
    userId: 1234567890123456789
    firstName: "John"
    lastName: "Doe"
    bio: "Software Developer"
    phone: "0123456789"
    email: "john@example.com"
  }) {
    id
    firstName
    lastName
    bio
    phone
    email
  }
}
```

#### Get Profile by User ID
```graphql
query {
  getProfileByUserId(userId: 1234567890123456789) {
    id
    firstName
    lastName
    bio
    phone
    email
  }
}
```

### 5. Test Account

#### Create Account
```graphql
mutation {
  createAccount(input: {
    userId: 1234567890123456789
    accountType: 1
    status: 1
  }) {
    id
    userId
    accountType
    status
  }
}
```

#### List Accounts by User ID
```graphql
query {
  listAccounts(userId: 1234567890123456789, page: 1, limit: 10) {
    id
    userId
    accountType
    status
  }
}
```

### 6. Test Credential

#### Create Credential
```graphql
mutation {
  createCredential(input: {
    userId: 1234567890123456789
    password: "password123"
    credentialType: 1
    ipAddress: "192.168.1.1"
  }) {
    id
    userId
    credentialType
    ipAddress
  }
}
```

#### Verify Credential
```graphql
mutation {
  verifyCredential(input: {
    userId: 1234567890123456789
    password: "password123"
  }) {
    isValid
    message
  }
}
```

## 🔌 Test gRPC

### Sử dụng grpcurl (cần cài đặt)

#### Install grpcurl
```bash
# Windows (choco)
choco install grpcurl

# Mac
brew install grpcurl

# Linux
# Download from https://github.com/fullstorydev/grpcurl/releases
```

#### List Services
```bash
grpcurl -plaintext localhost:5000 list
```

#### Test Create User
```bash
grpcurl -plaintext -d '{
  "email": "test@example.com",
  "username": "testuser",
  "password": "password123",
  "phone": "0123456789"
}' localhost:5000 user.UserService/CreateUser
```

#### Test Get User
```bash
grpcurl -plaintext -d '{
  "id": 1234567890123456789
}' localhost:5000 user.UserService/GetUser
```

#### Test List Users
```bash
grpcurl -plaintext -d '{
  "page": 1,
  "limit": 10
}' localhost:5000 user.UserService/ListUsers
```

### Sử dụng Postman (có hỗ trợ gRPC)

1. Mở Postman
2. Tạo request mới → chọn gRPC
3. URL: `localhost:5000`
4. Import proto files từ thư mục `proto/`
5. Chọn service và method
6. Gửi request

## 🧪 Test với cURL (HTTP REST)

### Test Hello World endpoint
```bash
curl http://localhost:3000/
```

Response: `Hello World!`

## 📊 Kiểm tra Health

### GraphQL Introspection
```graphql
query {
  __schema {
    types {
      name
    }
  }
}
```

## ⚠️ Lưu ý

1. **Repositories hiện tại dùng In-Memory**: Dữ liệu sẽ mất khi restart server
2. **User ID**: Sử dụng Snowflake ID (số lớn), ví dụ: `1234567890123456789`
3. **Account Type**: 
   - 1 = BASIC
   - 2 = PREMIUM
   - 3 = VERIFIED
   - 4 = NOT_VERIFIED
4. **Account Status**:
   - 1 = ACTIVE
   - 2 = INACTIVE
   - 3 = SUSPENDED
5. **Credential Type**:
   - 1 = PASSWORD
   - 2 = GOOGLE_OAUTH
   - 3 = FACEBOOK_OAUTH

## 🐛 Troubleshooting

### Lỗi kết nối PostgreSQL
- Repositories hiện dùng in-memory, không cần PostgreSQL để test
- Nếu muốn dùng PostgreSQL, cần implement TypeORM entities

### Lỗi gRPC connection
- Kiểm tra port 5000 có bị chiếm không
- Kiểm tra firewall settings

### GraphQL không load
- Kiểm tra port 3000
- Xem console logs để biết lỗi cụ thể

