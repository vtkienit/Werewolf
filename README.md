# Werewolf

Ứng dụng hỗ trợ quản trò tổ chức một ván Ma Sói trực tiếp: tạo phòng, mời người chơi, cập nhật sảnh chờ theo thời gian thực, cấu hình vai và chia vai bí mật.

## Thành phần

- `frontend/app`: React + TypeScript + Vite.
- `api-gateway`: cổng truy cập chung cho REST API và WebSocket, chạy ở port `8080`.
- `services/room/app`: quản lý phòng, người chơi và realtime, chạy ở port `8081`.
- `services/distribution/app`: cấu hình và phân chia vai, chạy ở port `8082`.
- Redis: lưu trạng thái phòng, phiên người chơi và room lock, chạy ở port `6379`.

```text
Frontend -> API Gateway -> Room Service --------> Redis
                       -> Distribution Service -> Redis
```

## Yêu cầu

- Docker Desktop để chạy Redis hoặc toàn bộ hệ thống.
- JDK 21.
- Node.js 20+ và npm.

Không cần cài Maven vì các backend service đã có Maven Wrapper.

## Cấu hình

Tạo `.env` từ file mẫu tại thư mục gốc:

```powershell
Copy-Item .env.example .env
```

Đổi `INTERNAL_REALTIME_TOKEN` trong `.env` thành một chuỗi bí mật. Các service và Vite sẽ tự đọc file `.env` này.

## Chạy từng service để phát triển

Mở một terminal riêng cho mỗi bước và chạy từ thư mục gốc dự án.

### 1. Redis

```powershell
docker compose up -d redis
```

### 2. Room Service

```powershell
cd services/room/app
.\mvnw.cmd spring-boot:run
```

### 3. Distribution Service

```powershell
cd services/distribution/app
.\mvnw.cmd spring-boot:run
```

### 4. API Gateway

```powershell
cd api-gateway
.\mvnw.cmd spring-boot:run
```

### 5. Frontend

```powershell
cd frontend/app
npm ci --legacy-peer-deps
npm run dev
```

Mở [http://localhost:5173](http://localhost:5173) để sử dụng ứng dụng. REST API và WebSocket đều đi qua Gateway tại `http://localhost:8080`.

## Chạy toàn bộ bằng Docker

```powershell
docker compose up --build
```

Với cấu hình trong `.env.example`:

- Frontend: [http://localhost:5173](http://localhost:5173)
- API Gateway: [http://localhost:8080](http://localhost:8080)

Dừng toàn bộ hệ thống:

```powershell
docker compose down
```

## Kiểm thử

```powershell
.\services\room\app\mvnw.cmd -f services/room/app/pom.xml test
.\services\distribution\app\mvnw.cmd -f services/distribution/app/pom.xml test
.\api-gateway\mvnw.cmd -f api-gateway/pom.xml test
npm --prefix frontend/app test
npm --prefix frontend/app run build
```

## Cấu trúc chính

```text
Werewolf/
├── api-gateway/
├── frontend/app/
├── services/room/app/
├── services/distribution/app/
├── .env.example
└── docker-compose.yml
```

> Không commit file `.env`, token thật hoặc dữ liệu runtime lên Git.
