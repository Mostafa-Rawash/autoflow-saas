# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AutoFlow SaaS — Arabic-first, multi-channel communication platform for MENA businesses. Unifies WhatsApp, Messenger, Instagram, Telegram into a single dashboard. Pure JavaScript, no TypeScript.

## Development Commands

```bash
# Backend (from backend/)
npm run dev              # nodemon server.js (port 5000)
npm test                 # Jest with coverage
npm run test:watch       # Jest --watch
npm run test:auth        # jest tests/auth.test.js
npm run test:queue       # jest tests/queue.test.js
npm run seed             # node seeders/seed.js — seeds roles + super admin

# Frontend (from frontend/)
npm start                # CRA dev server (port 3000)
npm run build            # Production build

# Root level
node qa-check.js         # Syntax checks, build checks, dep counts
node health-check.js     # Service health check
```

To run a single backend test file: `cd backend && npx jest tests/auth.test.js`

## Architecture

Two services, each with its own `package.json`. No shared code.

| Service | Port | Path | Module System | Framework |
|---|---|---|---|---|
| Backend API | 5000 | `backend/` | CommonJS | Express 4.x |
| Frontend | 3000 | `frontend/` | CRA (ES modules) | React 18 |

## Key Architectural Patterns

- **Multi-tenant**: All Mongoose models scope data by `user` field
- **Dual-layer caching**: Redis (ioredis) with in-memory fallback (node-cache) via `backend/services/cache.service.js`. Cache middleware in `middleware/cache.js` uses `cacheMiddleware(ttl, keyFn?)` for GET routes and `invalidateCache(pattern)` after mutations. Keys follow `route:{userId}:{path}` convention.
- **RBAC**: 5 roles (owner/admin/manager/agent/viewer) with 30 granular permissions across 10 categories (dashboard, conversations, templates, channels, analytics, team, settings, billing, API, webhooks), auto-seeded from `Role.seedDefaults()`. Role hierarchy enforced via `ROLE_LEVELS` numeric mapping in `middleware/auth.js`: owner(100) > admin(80) > manager(60) > agent(40) > viewer(20). `authorize()` checks minimum level, so `authorize('admin')` also allows owner.
- **Two auth middleware types**: `middleware/auth.js` has `auth` (JWT verification) + `authorize` (role hierarchy) used for normal routes. `middleware/admin.js` has `adminAuth` (super-admin-only, checks `SUPER_ADMIN_EMAILS` env) used for `/api/admin/*` routes. These are separate — super admin != tenant admin.
- **Subscription enforcement**: `checkSubscription` + `checkLimit` middleware chain before resource creation. `checkLimit` increments usage counter. Use `canAdd` to check without incrementing.
- **Standardized API responses**: All endpoints use `utils/response.js` helpers (`successResponse`, `errorResponse`, `asyncHandler`, `ERROR_CODES`). Always use `asyncHandler` wrapper on route handlers — it catches Mongoose ValidationError, duplicate key (11000), and CastError automatically.
- **Real-time**: Socket.io with user rooms (`user-{userId}`) and conversation rooms. `global.io` set in `server.js` for service access. Events defined in `constants/socketEvents.js`.
- **JWT auth**: Access tokens (15min) + refresh tokens (30d). Refresh via `x-refresh-token` header on `/api/auth/refresh`. Super admin identified by `SUPER_ADMIN_EMAILS` env var (comma-separated).
- **RTL-first**: Arabic default, Cairo font, right-to-left sidebar layout
- **WhatsApp**: Built directly into the backend via `whatsapp-web.js` (no separate service). Multi-tenant: each user gets their own client instance via `WhatsAppService.clients` Map keyed by userId. Session data persisted in `backend/sessions/`. On startup, `messageQueueService.startProcessor()` runs with 5s interval.
- **Telegram**: Bot-based integration via `backend/services/telegram.service.js` + `backend/routes/telegram.js`. Uses polling for incoming messages. Each user connects their own bot token. On server restart, `Integration.find({type:'telegram', status:'connected'})` resumes polling.
- **Auto-replies**: `backend/services/autoReply.service.js` + `backend/routes/autoReplies.js` for automated reply rules.
- **Message queue**: `backend/services/messageQueue.service.js` processes queued messages with 5s interval on startup.
- **Audit logging**: `middleware/admin.js` exports `auditLog(action)` middleware that logs to console. Has TODO for saving to AuditLog model.

## Typical Middleware Chain

```
router.post('/resource', auth, authorize('admin'), checkSubscription, checkLimit('conversations'), asyncHandler(handler))
router.get('/resource', auth, cacheMiddleware(300), asyncHandler(handler))
router.put('/resource/:id', auth, authorize('manager'), invalidateCache('route:*'), asyncHandler(handler))
```

## Database

MongoDB via Mongoose 8.x. Models in `backend/models/`: User, Conversation, Message, Template, Integration, Subscription, Role, TeamInvitation, AutoReply. All have compound indexes.

If `MONGODB_URI` is unset or unreachable, the backend falls back to mongodb-memory-server (data lost on restart).

## Frontend Conventions

- React Router v6 with ProtectedRoute, AdminRoute, PublicRoute wrappers (all in `App.js`). AdminRoute checks `user.role` against `['owner', 'admin', 'manager']`.
- Zustand store with persist middleware for auth (`store/authStore.js`). Token stored in localStorage (remember me) or sessionStorage.
- Single Axios client in `api/index.js` — all API modules (auth, users, conversations, channels, templates, analytics, subscriptions, whatsapp, telegram, logs) with token injection interceptors and 401 redirect to `/login`
- Tailwind CSS 3.x — primary color palette is teal (`#14b8a6` for primary-500) in `tailwind.config.js`. Channel brand colors defined: whatsapp(`#22c55e`), messenger(`#0ea5e9`), instagram(`#f43f5e`), telegram(`#06b6d4`).
- Arabic-first UI: RTL, Cairo font, dark/light mode toggle in `components/Layout.js`
- Onboarding gate: root route redirects to `/onboarding` unless `localStorage.getItem('autoflow_onboarded') === 'true'`

## Testing

- **Backend**: Jest + Supertest + mongodb-memory-server. Config in `backend/package.json` jest section. Tests in `backend/tests/`. Setup file: `backend/tests/setup.js`.
- **Frontend**: react-scripts test (CRA default, @testing-library/react)
- **Root level**: `tests/` has api, e2e (Cypress), frontend, advanced, permissions test suites + CSV test data in `tests/data/`
- **QA runner**: `node qa-check.js` — syntax checks, build checks, dep counts

## Environment Variables

Each service has its own `.env.example`. Critical vars:
- **Backend**: `JWT_SECRET` (required, 64+ chars), `MONGODB_URI` (optional, empty=in-memory), `REDIS_URL` (optional), `FRONTEND_URL` (CORS, default localhost:3000), `SUPER_ADMIN_EMAIL` + `SUPER_ADMIN_PASSWORD` (seed), `SUPER_ADMIN_EMAILS` (comma-separated, for adminAuth middleware), `MAX_WHATSAPP_CLIENTS` (default 10), `MAX_TELEGRAM_BOTS` (default 20), `PORT` (default 5000)
- **Frontend**: `REACT_APP_API_URL` (default http://localhost:5000/api), `REACT_APP_SOCKET_URL` (default http://localhost:5000)

## Subscription Plans

Free (100 conversations, EGP 0) → Basic (1K convos, EGP 299/mo) → Standard (5K convos, EGP 599/mo) → Premium (unlimited, EGP 999/mo). 14-day free trial on new accounts. Currency: Egyptian Pound (EGP). Payment methods include Fawry and Vodafone Cash.

## Gotchas

- **Seed script paths**: Uses `../models/User` (not `./models/User`) since it runs from `backend/` via `node seeders/seed.js`. Default admin password: `Admin123!`
- **In-memory MongoDB fallback**: If `MONGODB_URI` is empty or points to localhost:27017, data is lost on restart
- **User role enum**: Must be one of `['owner', 'admin', 'manager', 'agent', 'viewer']` — matches the Role model. Default is `agent`.
- **Theme**: `.card` and `.glass` CSS classes use `[data-theme="dark"]` attribute selectors for dark mode. Layout.js sets `data-theme` on `<html>`. All theme-aware components import `useTheme` from `context/ThemeContext` — **`useTheme()` returns a plain string** (`'light'` or `'dark'`), NOT an object, so use `const theme = useTheme()` (not destructuring). Auth pages (`.auth-bg`, `.auth-card`, `.input-glass`) use solid white/dark backgrounds, not glassmorphism. Never use `bg-dark-*` or `text-gray-400` alone — always pair with a light-mode alternative.
- **Dynamic Tailwind classes**: Never use template-literal class names like `bg-${color}-500` or `text-${color}-400` — Tailwind's JIT compiler can't detect them. Use static lookup maps instead (e.g., `const colorMap = { owner: 'bg-red-500', admin: 'bg-purple-500' }`).
- **Telegram bot token**: Never expose bot tokens in frontend logs. The API masks tokens with `••••••••` after initial connection.
- **RAG platform**: `autoflow-rag-platform/` directory contains the architecture design for a NestJS microservices-based RAG platform (TypeScript). This is a **separate future system** from the current Express/JS monolith — do not merge code patterns.
- **Super admin vs tenant admin**: `adminAuth` middleware (super admin, `SUPER_ADMIN_EMAILS`) is different from `authorize('admin')` (tenant admin role). The `/api/admin/*` routes use `adminAuth`, not `authorize`.
- **Auth rate limiting**: Auth routes (`/api/auth/*`) are excluded from the 15-min/1000-req rate limiter.
- **Cache key format**: Cache middleware auto-generates keys as `route:{userId}:{originalUrl}`. Use `invalidateCache('route:*')` after mutations — the `*` gets replaced with `req.user.id`.