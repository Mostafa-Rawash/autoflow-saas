# AutoFlow SaaS 🚀

Arabic-first, multi-channel communication platform for MENA businesses. Unifies WhatsApp, Messenger, Instagram, Telegram into a single dashboard with AI automation.

## Features

- **Multi-tenant** — Each user has isolated data and workspace
- **Team Management** — Invite members, manage roles and permissions
- **Subscription System** — 4 plans (Free → Premium) with clear limits
- **Admin Dashboard** — Manage users, subscriptions, and activity logs
- **Role-Based Access** — 5 roles with 30 granular permissions
- **WhatsApp Integration** — Connect via QR code, multi-client support
- **Telegram Integration** — Bot-based messaging with webhook support
- **Real-time Messaging** — Socket.io for instant message delivery
- **RTL Support** — Full Arabic interface with Cairo font
- **Dark Mode** — Modern dark/light theme toggle

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Zustand |
| Backend | Express.js, MongoDB (Mongoose), Socket.io |
| Auth | JWT (access + refresh tokens) |
| Caching | Redis (optional, falls back to in-memory) |

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (optional — in-memory mode available for dev)

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env: set JWT_SECRET (required), MONGODB_URI (optional)
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

### Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/health

### Admin Access
Set `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` in `backend/.env`, then:
```bash
cd backend && npm run seed
```
Default password: `Admin123!`

## Subscription Plans

| Plan | Conversations | Messages | Team Members | Price |
|------|-------------|----------|-------------|-------|
| Free | 100 | 1,000 | 2 | EGP 0 |
| Basic | 1,000 | 10,000 | 5 | EGP 299/mo |
| Standard | 5,000 | 50,000 | 10 | EGP 599/mo |
| Premium | ∞ | ∞ | ∞ | EGP 999/mo |

14-day free trial on new accounts.

## Project Structure

```
autoflow-saas/
├── backend/               # Express API + MongoDB + Socket.io
│   ├── models/             # Mongoose models (User, Conversation, Message, etc.)
│   ├── routes/             # API routes (auth, users, conversations, etc.)
│   ├── middleware/          # Auth, admin, cache middleware
│   ├── services/           # WhatsApp, Telegram, message queue, cache services
│   ├── seeders/            # Database seed script
│   ├── utils/              # Response helpers, error codes
│   └── tests/              # Jest + Supertest tests
├── frontend/               # React dashboard
│   ├── src/
│   │   ├── api/            # Axios client with interceptors
│   │   ├── components/     # Layout, ErrorBoundary
│   │   ├── pages/          # All page components + admin/
│   │   ├── store/          # Zustand auth store
│   │   └── utils/          # Error catcher
│   └── public/
├── scripts/                # Process management & deployment
├── tests/                  # Root-level integration & E2E tests
└── health-check.js         # Service health check
```

## API Endpoints

### Public
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Login
- `GET /api/subscriptions/plans` — List plans

### Protected (Auth Required)
- `GET /api/auth/me` — Current user
- `GET /api/conversations` — List conversations
- `POST /api/whatsapp/connect` — Initialize WhatsApp
- `GET /api/whatsapp/qr` — Get QR code
- `POST /api/telegram/connect` — Connect Telegram bot
- `GET /api/telegram/status` — Telegram bot status

### Admin (Super Admin Only)
- `GET /api/admin/dashboard` — Admin stats
- `GET /api/admin/users` — List all users
- `GET /api/admin/roles` — List roles with user counts
- `PUT /api/admin/roles/:name` — Update role permissions

## Environment Variables

### Backend (`backend/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | 64+ char random string |
| `MONGODB_URI` | No | MongoDB URI (empty = in-memory) |
| `FRONTEND_URL` | No | CORS origin (default: http://localhost:3000) |
| `REDIS_URL` | No | Redis URL (optional caching) |
| `SUPER_ADMIN_EMAIL` | No | Auto-create admin on seed |
| `SUPER_ADMIN_PASSWORD` | No | Admin password (default: Admin123!) |
| `MAX_WHATSAPP_CLIENTS` | No | Max concurrent WhatsApp connections (default: 10) |
| `MAX_TELEGRAM_BOTS` | No | Max concurrent Telegram bots (default: 20) |
| `API_URL` | No | Public URL for Telegram webhooks (default: http://localhost:5000) |
| `PORT` | No | Server port (default: 5000) |

### Frontend (`frontend/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_API_URL` | No | API URL (default: http://localhost:5000/api) |
| `REACT_APP_SOCKET_URL` | No | Socket URL (default: http://localhost:5000) |

## Deployment

See `scripts/deploy.sh` for production deployment with PM2, nginx, and SSL.

### Key Points
- Build frontend: `cd frontend && npm run build`
- Serve frontend with nginx (SPA routing: all routes → index.html)
- Use PM2 for process management
- Socket.io requires WebSocket support in nginx config
- Each WhatsApp client uses ~150-200MB RAM

## License

MIT License — Mostafa Rawash (mostafa@rawash.com)