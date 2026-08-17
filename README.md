# Werewolf

A web application for running in-person Werewolf games: create rooms, invite players, update the lobby in real time, configure roles, and distribute secret roles.

## Components

- `frontend/app`: React, TypeScript, and Vite.
- `api-gateway`: shared entry point for the REST API and WebSocket, running on port `8080`.
- `services/room/app`: manages rooms, players, and realtime events, running on port `8081`.
- `services/distribution/app`: configures and distributes roles, running on port `8082`.
- Redis: stores room state, player sessions, and room locks, running on port `6379`.

```text
Frontend -> API Gateway -> Room Service --------> Redis
                       -> Distribution Service -> Redis
```

## Requirements

- Docker Desktop to run Redis or the full application.
- JDK 21.
- Node.js 20+ and npm.

Maven does not need to be installed because every backend service includes Maven Wrapper.

## Configuration

Create `.env` from the example file in the project root:

```powershell
Copy-Item .env.example .env
```

Replace `INTERNAL_REALTIME_TOKEN` in `.env` with a secure secret. The backend services and Vite load this file automatically.

## Run Services for Development

Open a separate terminal for each step and run the commands from the project root.

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

Open [http://localhost:5173](http://localhost:5173) to use the application. The REST API and WebSocket are available through the Gateway at `http://localhost:8080`.

## Run Everything with Docker

```powershell
docker compose up --build
```

Using the values from `.env.example`:

- Frontend: [http://localhost:5173](http://localhost:5173)
- API Gateway: [http://localhost:8080](http://localhost:8080)

Stop all containers:

```powershell
docker compose down
```

## Tests

```powershell
.\services\room\app\mvnw.cmd -f services/room/app/pom.xml test
.\services\distribution\app\mvnw.cmd -f services/distribution/app/pom.xml test
.\api-gateway\mvnw.cmd -f api-gateway/pom.xml test
npm --prefix frontend/app test
npm --prefix frontend/app run build
```

## Project Structure

```text
Werewolf/
├── api-gateway/
├── frontend/app/
├── services/room/app/
├── services/distribution/app/
├── .env.example
└── docker-compose.yml
```

> Do not commit `.env`, real tokens, or runtime data to Git.
