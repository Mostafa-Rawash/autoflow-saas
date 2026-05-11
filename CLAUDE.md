# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AutoFlow SaaS — Arabic-first, multi-channel communication platform for MENA businesses. Unifies WhatsApp, Messenger, Instagram, Telegram into a single dashboard. Pure JavaScript, no TypeScript.

## Development Commands

```bash
# Backend (from backend/)
npm run dev              # nodemon server.js (port 5000)
npm test                 # Jest with coverage
npm run test:auth        # Single test file
npm run test:queue       # Single test file
npm run seed             # Seed database

# Frontend (from frontend/)
npm start                # CRA dev server (port 3000)
npm run build            # Production build
```

## Architecture

Two services, each with its own `package.json`. No shared code.

| Service | Port | Path | Module System | Framework |
|---|---|---|---|---|
| Backend API | 5000 | `backend/` | CommonJS | Express 4.x |
| Frontend | 3000 | `frontend/` | CRA (ES modules) | React 18 |

## Key Architectural Patterns

- **Multi-tenant**: All Mongoose models scope data by `user` field
- **Dual-layer caching**: Redis (ioredis) with in-memory fallback (node-cache) via `backend/services/cache.service.js`
- **RBAC**: 5 roles (owner/admin/manager/agent/viewer) with 27 granular permissions, auto-seeded from `Role.seedDefaults()`. Role hierarchy enforced: owner > admin > manager > agent > viewer. Users cannot modify/remove users with equal or higher roles.
- **Role hierarchy**: `ROLE_HIERARCHY` in `middleware/auth.js` — `authorize()` middleware supports hierarchy (e.g., `authorize('admin')` allows owner too). Team member removal and invitation enforce hierarchy checks.
- **Subscription enforcement**: `checkSubscription` + `checkLimit` middleware chain before resource creation
- **Standardized API responses**: All endpoints use `utils/response.js` helpers (`successResponse`, `errorResponse`, `asyncHandler`, `ERROR_CODES`)
- **Real-time**: Socket.io with user rooms (`user-{userId}`) and conversation rooms
- **JWT auth**: Access tokens (15min) + refresh tokens (30d), super admin identified by `SUPER_ADMIN_EMAILS` env var
- **RTL-first**: Arabic default, Cairo font, right-to-left sidebar layout
- **WhatsApp**: Built directly into the backend via `whatsapp-web.js` (no separate service). Multi-tenant: each user gets their own client instance via `WhatsAppService.clients` Map keyed by userId.
- **Telegram**: Bot-based integration via `backend/services/telegram.service.js` + `backend/routes/telegram.js`. Uses webhooks for incoming messages. Each user connects their own bot token.

## Database

MongoDB via Mongoose 8.x. Models in `backend/models/`: User, Conversation, Message, Template, Integration, Subscription, Role, TeamInvitation. All have compound indexes.

If `MONGODB_URI` is unset or unreachable, the backend falls back to mongodb-memory-server (data lost on restart).

## Frontend Conventions

- React Router v6 with ProtectedRoute, AdminRoute, PublicRoute wrappers
- Zustand store with persist middleware for auth (`store/authStore.js`)
- Axios client in `api/index.js` — all API modules (auth, users, conversations, channels, templates, analytics, subscriptions, whatsapp, telegram, logs) with token injection interceptors and 401 redirect
- Tailwind CSS 3.x — primary color `#00D4AA` (teal) in `tailwind.config.js`
- Arabic-first UI: RTL, Cairo font, dark/light mode toggle in `components/Layout.js`

## Testing

- **Backend**: Jest + Supertest + mongodb-memory-server. Config in `backend/package.json` jest section. Tests in `backend/tests/`
- **Frontend**: react-scripts test (CRA default, @testing-library/react)
- **Root level**: `tests/` has api, e2e (Cypress), frontend, advanced, permissions test suites + CSV test data in `tests/data/`
- **QA runner**: `node qa-check.js` — syntax checks, build checks, dep counts

## Environment Variables

Each service has its own `.env.example`. Critical vars:
- **Backend**: `MONGODB_URI`, `JWT_SECRET` (required), `REDIS_URL`, `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`
- **Frontend**: `REACT_APP_API_URL`, `REACT_APP_SOCKET_URL`

## Subscription Plans

Free (100 conversations, EGP 0) → Basic (1K convos, EGP 299/mo) → Standard (5K convos, EGP 599/mo) → Premium (unlimited, EGP 999/mo). 14-day free trial on new accounts. Currency: Egyptian Pound (EGP). Payment methods include Fawry and Vodafone Cash.

## Gotchas

- **Seed script paths**: Uses `../models/User` (not `./models/User`) since it runs from `backend/` via `node seeders/seed.js`
- **In-memory MongoDB fallback**: If `MONGODB_URI` is empty, data is lost on restart
- **User role enum**: Must be one of `['owner', 'admin', 'manager', 'agent', 'viewer']` — matches the Role model. Default is `agent`.
- **Theme**: `.card` and `.glass` CSS classes use `[data-theme="dark"]` attribute selectors for dark mode. Layout.js sets `data-theme` on `<html>`. All theme-aware components import `useTheme` from `context/ThemeContext` and check `theme === 'light'` or `theme === 'dark'`. Never use `bg-dark-*` or `text-gray-400` alone — always pair with a light-mode alternative.
- **Telegram bot token**: Never expose bot tokens in frontend logs. The API masks tokens with `••••••••` after initial connection.