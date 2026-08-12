# Ignify Werewolf

Ứng dụng web hỗ trợ quản trò tổ chức một ván **Ma Sói trực tiếp**: tạo phòng, mời người chơi bằng mã hoặc QR, theo dõi sảnh chờ theo thời gian thực, cấu hình bộ vai, chia vai bí mật và kết thúc ván để chơi lại.

> Dự án hiện là công cụ điều phối ván chơi, không phải game engine tự động xử lý toàn bộ hành động ban đêm, bỏ phiếu ban ngày hoặc năng lực riêng của từng vai.

## Mục lục

- [Tính năng chính](#tính-năng-chính)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Bắt đầu nhanh với Docker](#bắt-đầu-nhanh-với-docker)
- [Chạy từng service để phát triển](#chạy-từng-service-để-phát-triển)
- [Biến môi trường](#biến-môi-trường)
- [REST API](#rest-api)
- [WebSocket](#websocket)
- [Kiểm thử](#kiểm-thử)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Bảo mật và tính nhất quán](#bảo-mật-và-tính-nhất-quán)
- [Triển khai](#triển-khai)
- [Tài liệu kỹ thuật](#tài-liệu-kỹ-thuật)
- [Phạm vi hiện tại](#phạm-vi-hiện-tại)
- [Đóng góp](#đóng-góp)

## Tính năng chính

### Dành cho quản trò

- Tạo phòng với mã 6 ký tự, `hostId` bí mật và đường dẫn QR để mời người chơi.
- Xem danh sách thành viên, trạng thái kết nối và trạng thái sẵn sàng theo thời gian thực.
- Điều chỉnh giới hạn phòng từ 6 đến 12 người.
- Chọn, kiểm tra và xác nhận cấu hình vai trước khi bắt đầu.
- Chỉ bắt đầu khi có ít nhất 6 người, mọi người đã sẵn sàng và bộ vai đã được xác nhận.
- Nhận danh sách phân vai riêng tư cho toàn bộ người chơi.
- Theo dõi tóm tắt các vai đang hoạt động mà không công khai vai của từng người.
- Ghi chú diễn biến theo vòng và lưu cục bộ trên trình duyệt.
- Chọn phe chiến thắng, kết thúc ván và đưa phòng về sảnh chờ để chơi lại.

### Dành cho người chơi

- Tham gia phòng bằng URL `/join/{roomCode}` hoặc mã phòng.
- Nhận `playerId` và `playerToken` riêng sau khi tham gia thành công.
- Xem sảnh chờ, thành viên và trạng thái kết nối.
- Bật hoặc tắt trạng thái sẵn sàng.
- Nhận vai cá nhân qua subscription WebSocket riêng tư.
- Xem thẻ vai, phe, năng lực và hướng dẫn bằng tiếng Việt hoặc tiếng Anh.
- Khôi phục phiên, reconnect trong thời gian ân hạn và trở lại sảnh khi ván kết thúc.

### Giao diện

- Các trang Home, tạo phòng, phòng Host, thiết lập vai, ghi chú vòng, tham gia phòng, phòng chờ, thẻ vai và trang lỗi.
- Giao diện “Midnight Phantasm” responsive cho desktop và thiết bị di động.
- Chế độ sáng/tối, chuyển đổi ngôn ngữ, layout và footer dùng chung.
- Danh mục 35 vai thuộc các phe Dân làng, Ma Sói, Ma cà rồng và phe độc lập.
- SPA routing cho Nginx và Vercel.

## Kiến trúc hệ thống

```text
Trình duyệt
    |
    | HTTP / STOMP over SockJS
    v
Frontend (React + Nginx)
    |
    v
API Gateway :8080
    |------------------------------|
    |                              |
    v                              v
Room Service :8081          Distribution Service :8082
    |                              |
    |<---- internal realtime ------|
    |                              |
    |-------------- Redis ---------|
```

### Trách nhiệm của từng thành phần

| Thành phần | Trách nhiệm |
| --- | --- |
| Frontend | Giao diện Host/Player, quản lý phiên trình duyệt, kết nối REST và STOMP |
| API Gateway | Public entry point, CORS, định tuyến Room API, Distribution API và WebSocket |
| Room Service | Phòng, thành viên, trạng thái sẵn sàng, presence, reconnect và phát sự kiện realtime |
| Distribution Service | Xác nhận bộ vai, chia vai, bắt đầu/kết thúc và lưu vòng đời ván |
| Redis | Room state, player authentication, presence và distributed room lock |

Distribution Service gọi các endpoint nội bộ của Room Service để phát vai và sự kiện kết thúc. Các endpoint này không được API Gateway public ra ngoài.

## Công nghệ sử dụng

### Frontend

- React 19, TypeScript 6 và Vite 8.
- React Router 7.
- STOMP.js và SockJS Client.
- Tailwind CSS 4, CSS design tokens và Lucide icons.
- Vitest, Testing Library và jsdom.
- Nginx cho production container.

### Backend

- Java 21 và Spring Boot 4.1.
- Spring MVC, Spring Security, Spring WebSocket và Spring Data Redis.
- Spring Cloud Gateway WebFlux.
- Maven 3.9.
- JUnit/Spring Boot Test.

### Hạ tầng

- Redis 7 Alpine.
- Docker và Docker Compose.
- Vercel SPA rewrite cho phương án deploy frontend độc lập.

## Bắt đầu nhanh với Docker

### Yêu cầu

- Git.
- Docker Desktop hoặc Docker Engine có Docker Compose.

### 1. Clone dự án

```bash
git clone https://github.com/nvtqx1/Ignify_Werewolf.git
cd Ignify_Werewolf
```

### 2. Tạo file cấu hình môi trường

Linux/macOS:

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

Thay `INTERNAL_REALTIME_TOKEN` trong `.env` bằng một chuỗi bí mật đủ mạnh. Không commit file `.env` hoặc token thật lên Git.

### 3. Build và chạy toàn bộ hệ thống

```bash
docker compose up --build
```

Sau khi các health check hoàn tất:

- Giao diện: [http://localhost](http://localhost)
- API Gateway: [http://localhost:8080](http://localhost:8080)
- WebSocket/SockJS: `http://localhost:8080/ws`

### 4. Dừng hệ thống

```bash
docker compose down
```

Redis trong cấu hình hiện tại không gắn volume, vì vậy dữ liệu phòng chỉ tồn tại trong vòng đời container.

## Chạy từng service để phát triển

### Yêu cầu

- Node.js 20 trở lên và npm 10 trở lên.
- JDK 21.
- Maven 3.9 cho API Gateway; Room và Distribution Service có Maven Wrapper.
- Redis đang chạy tại `localhost:6379`.

Bạn có thể chỉ chạy Redis bằng Docker:

```bash
docker run --name ignify-redis -p 6379:6379 redis:7-alpine
```

Mở một terminal riêng cho mỗi thành phần. Tất cả backend service phải dùng cùng một `INTERNAL_REALTIME_TOKEN`.

### Room Service

PowerShell:

```powershell
$env:ROOM_SERVICE_PORT="8081"
$env:REDIS_HOST="localhost"
$env:REDIS_PORT="6379"
$env:PUBLIC_FRONTEND_URL="http://localhost:5173"
$env:WEBSOCKET_ALLOWED_ORIGINS="http://localhost:5173"
$env:INTERNAL_REALTIME_TOKEN="local-development-secret"
Set-Location services/room/app
.\mvnw.cmd spring-boot:run
```

Linux/macOS:

```bash
cd services/room/app
ROOM_SERVICE_PORT=8081 \
REDIS_HOST=localhost \
REDIS_PORT=6379 \
PUBLIC_FRONTEND_URL=http://localhost:5173 \
WEBSOCKET_ALLOWED_ORIGINS=http://localhost:5173 \
INTERNAL_REALTIME_TOKEN=local-development-secret \
./mvnw spring-boot:run
```

### Distribution Service

PowerShell:

```powershell
$env:DISTRIBUTION_SERVICE_PORT="8082"
$env:REDIS_HOST="localhost"
$env:REDIS_PORT="6379"
$env:ROOM_SERVICE_URL="http://localhost:8081"
$env:PUBLIC_FRONTEND_URL="http://localhost:5173"
$env:INTERNAL_REALTIME_TOKEN="local-development-secret"
Set-Location services/distribution/app
.\mvnw.cmd spring-boot:run
```

Linux/macOS:

```bash
cd services/distribution/app
DISTRIBUTION_SERVICE_PORT=8082 \
REDIS_HOST=localhost \
REDIS_PORT=6379 \
ROOM_SERVICE_URL=http://localhost:8081 \
PUBLIC_FRONTEND_URL=http://localhost:5173 \
INTERNAL_REALTIME_TOKEN=local-development-secret \
./mvnw spring-boot:run
```

### API Gateway

PowerShell:

```powershell
$env:API_GATEWAY_PORT="8080"
$env:ROOM_SERVICE_URL="http://localhost:8081"
$env:DISTRIBUTION_SERVICE_URL="http://localhost:8082"
$env:WEBSOCKET_SERVICE_URL="http://localhost:8081"
$env:CORS_ALLOWED_ORIGINS="http://localhost:5173"
Set-Location api-gateway
mvn spring-boot:run
```

Linux/macOS:

```bash
cd api-gateway
API_GATEWAY_PORT=8080 \
ROOM_SERVICE_URL=http://localhost:8081 \
DISTRIBUTION_SERVICE_URL=http://localhost:8082 \
WEBSOCKET_SERVICE_URL=http://localhost:8081 \
CORS_ALLOWED_ORIGINS=http://localhost:5173 \
mvn spring-boot:run
```

### Frontend

```bash
cd frontend/app
npm ci --legacy-peer-deps
npm run dev
```

Vite chạy mặc định tại [http://localhost:5173](http://localhost:5173). Các giá trị mặc định của frontend đã trỏ tới Gateway tại `http://localhost:8080`.

## Biến môi trường

| Biến | Mặc định | Mô tả |
| --- | --- | --- |
| `API_GATEWAY_PORT` | `8080` | Cổng public của Gateway |
| `FRONTEND_PORT` | `80` | Cổng frontend khi chạy Docker Compose |
| `PUBLIC_FRONTEND_URL` | `http://localhost` | Base URL dùng để tạo link tham gia và QR |
| `CORS_ALLOWED_ORIGINS` | `http://localhost` | Origin được Gateway và WebSocket cho phép |
| `INTERNAL_REALTIME_TOKEN` | không nên dùng mặc định | Credential service-to-service |
| `ROOM_LOCK_ACQUISITION_TIMEOUT` | `2s` | Thời gian chờ lấy room lock |
| `ROOM_LOCK_LEASE_DURATION` | `10s` | Thời hạn giữ room lock |
| `ROOM_LOCK_RETRY_INTERVAL` | `50ms` | Khoảng nghỉ giữa các lần thử lấy lock |
| `DISCONNECT_GRACE_PERIOD` | `10s` | Thời gian giữ thành viên khi mất kết nối |
| `VITE_API_URL` | `http://localhost:8080` | Base URL REST được nhúng lúc build frontend |
| `VITE_WS_URL` | `http://localhost:8080/ws` | SockJS endpoint được nhúng lúc build frontend |

Ngoài các biến trong `.env.example`, từng backend service còn nhận `REDIS_HOST`, `REDIS_PORT`, `ROOM_SERVICE_URL`, `DISTRIBUTION_SERVICE_URL`, `WEBSOCKET_SERVICE_URL` và `MANAGEMENT_PORT` như cấu hình trong `docker-compose.yml`.

## REST API

Các endpoint public đi qua API Gateway tại `http://localhost:8080`.

| Method | Endpoint | Credential | Chức năng |
| --- | --- | --- | --- |
| `POST` | `/api/rooms` | Không | Tạo phòng mới |
| `PATCH` | `/api/rooms/{roomCode}/max-players` | `X-Host-Id` | Thay đổi giới hạn người chơi |
| `POST` | `/api/rooms/{roomCode}/players` | Không | Tham gia phòng |
| `PATCH` | `/api/rooms/{roomCode}/players/{playerId}/ready` | `X-Player-Token` | Cập nhật trạng thái sẵn sàng |
| `POST` | `/api/distribution/rooms/{roomCode}/setup` | `hostId` trong body | Xác nhận cấu hình vai |
| `POST` | `/api/distribution/rooms/{roomCode}` | `hostId` trong body | Bắt đầu và chia vai |
| `POST` | `/api/distribution/rooms/{roomCode}/end-game` | `hostId` trong body | Kết thúc ván và ghi phe thắng |

### Ví dụ tạo phòng

```bash
curl -X POST http://localhost:8080/api/rooms
```

Response `201 Created`:

```json
{
  "roomCode": "A7K9Q2",
  "hostId": "host-secret-id",
  "qrUrl": "http://localhost/join/A7K9Q2"
}
```

### Ví dụ tham gia phòng

```bash
curl -X POST http://localhost:8080/api/rooms/A7K9Q2/players \
  -H "Content-Type: application/json" \
  -d '{"playerName":"An"}'
```

Response `201 Created`:

```json
{
  "playerId": "player-id",
  "playerName": "An",
  "playerToken": "player-secret-token"
}
```

### Ví dụ xác nhận bộ vai

```bash
curl -X POST http://localhost:8080/api/distribution/rooms/A7K9Q2/setup \
  -H "Content-Type: application/json" \
  -d '{
    "hostId":"host-secret-id",
    "roles":[
      {"roleId":"werewolf","quantity":2},
      {"roleId":"seer","quantity":1},
      {"roleId":"villager","quantity":3}
    ]
  }'
```

Chi tiết request, response và mã lỗi nằm trong [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md).

## WebSocket

- SockJS endpoint: `/ws`
- Client publish bootstrap: `/app/rooms/{roomCode}/connect`
- Lobby snapshot: `/broadcast/rooms/{roomCode}/players`
- Vai riêng của người chơi: `/broadcast/distribution/rooms/{roomCode}/start-game/{playerId}`
- Sự kiện kết thúc: `/broadcast/rooms/{roomCode}/end-game`

Player bootstrap:

```json
{
  "playerId": "player-id",
  "playerToken": "player-secret-token"
}
```

Host bootstrap:

```json
{
  "hostId": "host-secret-id"
}
```

Subscription vai riêng yêu cầu native STOMP header `X-Player-Token`. Người chơi reconnect trong thời gian ân hạn vẫn giữ thành viên và có thể được phát lại vai đang hoạt động.

Chi tiết destination, payload và quy tắc reconnect nằm trong [`docs/WEBSOCKET_CONTRACT.md`](docs/WEBSOCKET_CONTRACT.md).

## Kiểm thử

Repository hiện có 107 file kiểm thử trên frontend và backend.

### Frontend

```bash
cd frontend/app
npm ci --legacy-peer-deps
npm test
npm run lint
npm run build
```

### Room Service

PowerShell:

```powershell
Set-Location services/room/app
.\mvnw.cmd test
```

Linux/macOS:

```bash
cd services/room/app
./mvnw test
```

### Distribution Service

PowerShell:

```powershell
Set-Location services/distribution/app
.\mvnw.cmd test
```

Linux/macOS:

```bash
cd services/distribution/app
./mvnw test
```

### API Gateway

```bash
cd api-gateway
mvn test
```

Các Dockerfile backend build với `-DskipTests`; hãy chạy test riêng trước khi tạo image phát hành.

## Cấu trúc thư mục

```text
Ignify_Werewolf/
|-- api-gateway/                 # Spring Cloud Gateway
|-- docs/
|   |-- API_CONTRACT.md          # Hợp đồng REST API
|   |-- REDIS_SCHEMA.md          # Hợp đồng dữ liệu Redis
|   `-- WEBSOCKET_CONTRACT.md    # Hợp đồng STOMP/WebSocket
|-- frontend/
|   |-- app/                     # React application
|   |-- reference-screens/       # Ảnh tham chiếu giao diện
|   |-- role-card-reference/     # Tham chiếu thẻ vai
|   `-- roles/                   # Artwork vai nguồn
|-- services/
|   |-- distribution/app/        # Chia vai và vòng đời game
|   `-- room/app/                # Phòng, lobby và realtime
|-- .env.example
|-- docker-compose.yml
|-- PROJECT_SUMMARY.md
`-- README.md
```

## Bảo mật và tính nhất quán

- `hostId`, `playerToken` và `INTERNAL_REALTIME_TOKEN` là credential bí mật; không đưa chúng vào URL, log hoặc payload công khai.
- Vai cá nhân chỉ được gửi tới subscription đã xác thực đúng phòng, đúng người chơi và đúng socket đang sở hữu presence.
- Gateway không expose endpoint `/internal/realtime/**`.
- Các mutation của phòng dùng Redis lock với owner token để giảm race condition và lost update.
- Request quan trọng được kiểm tra chặt về JSON shape, kiểu dữ liệu, room code và role ID.
- Disconnect không xóa người chơi ngay; hệ thống có grace period và chống stale socket xóa session mới.
- Start/end event và xử lý phía client được thiết kế idempotent để an toàn khi retry hoặc nhận trùng.

Schema và chính sách khóa Redis được mô tả trong [`docs/REDIS_SCHEMA.md`](docs/REDIS_SCHEMA.md).

## Triển khai

### Docker Compose

`docker-compose.yml` là cấu hình triển khai đầy đủ hiện có. Gateway là public backend entry point; Room Service, Distribution Service và Redis chỉ giao tiếp qua Docker network `masoi`.

### Frontend trên Vercel

`frontend/app/vercel.json` rewrite mọi route về `index.html` để React Router hoạt động khi tải trực tiếp URL con. Khi build, cấu hình:

```text
VITE_API_URL=https://api.example.com
VITE_WS_URL=https://api.example.com/ws
```

Backend cần đặt `PUBLIC_FRONTEND_URL`, `CORS_ALLOWED_ORIGINS` và `WEBSOCKET_ALLOWED_ORIGINS` khớp với domain frontend thực tế.

### Health check

| Service | Management port trong Docker | Endpoint |
| --- | ---: | --- |
| API Gateway | 9080 | `/actuator/health` |
| Room Service | 9081 | `/actuator/health` |
| Distribution Service | 9082 | `/actuator/health` |

Các management port chỉ được dùng bên trong Docker network trong cấu hình hiện tại.

## Tài liệu kỹ thuật

- [`PROJECT_SUMMARY.md`](PROJECT_SUMMARY.md): tổng hợp tiến độ và chức năng đã hoàn thành.
- [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md): hợp đồng REST API và mã lỗi.
- [`docs/WEBSOCKET_CONTRACT.md`](docs/WEBSOCKET_CONTRACT.md): kết nối realtime, presence và game event.
- [`docs/REDIS_SCHEMA.md`](docs/REDIS_SCHEMA.md): dữ liệu phòng, player auth, presence và room lock.

Các contract trong `docs/` là nguồn chuẩn cho ranh giới tích hợp. Không tự ý đổi endpoint, destination hoặc public thêm dữ liệu riêng tư nếu chưa cập nhật và review contract liên quan.

## Phạm vi hiện tại

Đã hoàn thành:

- Room lifecycle `WAITING`/`PLAYING`.
- Tạo và tham gia phòng, ready state, realtime lobby và reconnect.
- Xác nhận bộ vai, chia vai bí mật, kết thúc và chơi lại.
- Giao diện Host/Player, theme, đa ngôn ngữ và ghi chú vòng.
- Redis locking, authentication boundary, Gateway và Docker Compose.

Chưa có game engine tự động cho:

- Hành động ban đêm của từng vai.
- Bỏ phiếu, loại người chơi và trạng thái sống/chết.
- Điều phối chu kỳ ngày/đêm.
- Tính điều kiện thắng đầy đủ theo năng lực đặc biệt.

Một số module auth/chat cũ vẫn còn trong Distribution Service, nhưng Gateway không public các route này và chúng không phải nguồn chuẩn của luồng Ma Sói hiện tại.

## Đóng góp

1. Tạo branch ngắn hạn từ `main`, ví dụ `feature/<ten-tinh-nang>` hoặc `fix/<ten-loi>`.
2. Giữ thay đổi tập trung vào một mục tiêu và không trộn refactor không liên quan.
3. Cập nhật contract trong `docs/` nếu thay đổi API, WebSocket hoặc Redis schema.
4. Chạy test, lint và build phù hợp trước khi mở pull request.
5. Không commit `.env`, credential, build output hoặc dữ liệu runtime.
6. Dùng commit message có chủ đích, ví dụ `feat: ...`, `fix: ...`, `test: ...`, `docs: ...`.

## Trạng thái dự án

- Nhánh mặc định: `main`.
- Phiên bản hiện tại trong các module: `0.0.1-SNAPSHOT`.
- Giấy phép: chưa được khai báo trong repository.
