# AutoFlow Backend — Postgres Foundation

## Requirements
- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 6

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables (see `.env.example`):
   ```bash
   DATABASE_URL=postgres://postgres:postgres@localhost:5432/autoflow
   REDIS_URL=redis://localhost:6379
   PORT=5000
   NODE_ENV=development
   ```

3. Run migrations:
   ```bash
   npm run migrate
   ```

4. Seed demo data (optional):
   ```bash
   npm run seed
   ```

## Run

API server:
```bash
npm run dev
```

Worker:
```bash
npm run worker
```

## Endpoints

- `GET /health`
- `POST /api/messages/inbound`
- `GET /api/conversations`
- `GET /api/conversations/:id/messages`
- `GET /api/agents/:id`

All tenant-scoped endpoints require:
- `x-organization-id` header
- `x-user-id` header

## Architecture

- `db/`: Postgres connection, migrations, schema
- `repositories/`: scoped data access
- `services/`: AI agent, knowledge, memory, analytics
- `workers/`: BullMQ worker for async processing
- `queues/`: enqueue jobs
- `middleware/`: auth, tenant, idempotency