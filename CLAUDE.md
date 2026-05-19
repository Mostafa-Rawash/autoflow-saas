# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AutoFlow SaaS — Arabic-first, multi-channel communication platform for MENA businesses. Unifies WhatsApp, Messenger, Instagram, Telegram into a single dashboard with AI automation, contact management, departments, workflows, and live chat. Pure JavaScript, no TypeScript.

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
- **Auto-replies**: `backend/services/autoReply.service.js` + `backend/routes/autoReplies.js` for keyword-triggered instant replies. Supports `templateId` field for template-based responses with variable substitution. `findMatch(userId, text, conversation)` returns `{rule, resolvedResponse}` — always use `resolvedResponse` (not `rule.response`) to get template+variable content.
- **Follow-ups**: `backend/services/followUp.service.js` + `backend/routes/followUps.js` + `backend/models/FollowUp.js` + `backend/models/FollowUpExecution.js` for scheduled/conditional message automation. Four trigger types: `no_reply` (send after X minutes of no reply), `schedule` (recurring), `status_change` (on conversation status transition), `new_conversation` (on first message). Background checker runs every 60s via `startChecker()`. Hooks wired into WhatsApp, Telegram, and conversations routes. Uses `messageQueueService` for delivery. `stopOnReply` cancels pending executions when contact replies.
- **Variable resolution**: `backend/services/variableResolver.service.js` centralizes `{{variable}}` substitution for both auto-replies and follow-ups. Supports: `name`, `phone`, `email`, `channel`, `status`, `last_message` plus Arabic equivalents (`الاسم`, `هاتف`, etc.). Resolved from `Conversation.contact` at send-time.
- **Message queue**: `backend/services/messageQueue.service.js` processes queued messages with 5s interval on startup.
- **AI auto-responder**: `backend/services/aiResponder.service.js` handles automatic AI responses for channel messages. Priority flow: auto-reply keyword match → AI RAG response (if enabled) → no response. Checks user `settings.aiAutoReply.enabled` flag and per-channel filter (`settings.aiAutoReply.channels`). Increments `subscription.usage.aiMessages` on each AI response. Plan limits: free=50, basic=500, standard=2000, premium=unlimited. Hooked into `whatsapp.service.js` and `telegram.service.js` after the auto-reply block.
- **Audit logging**: `middleware/admin.js` exports `auditLog(action)` middleware that logs to console. Has TODO for saving to AuditLog model.

## Helpdesk Features

- **Contacts**: `backend/models/Contact.js` + `backend/services/contact.service.js` + `backend/routes/contacts.js`. Contact management with name, emails (array), phones (array), company, title, tags, customFields, source tracking, externalIds per channel, lastContactAt, conversationCount, satisfactionScore. Supports search, filter by source/tag, merge contacts, and contact-to-conversation lookup. Frontend at `/contacts`.
- **Departments**: `backend/models/Department.js` + `backend/services/department.service.js` + `backend/routes/departments.js`. Department management with agents list, lead, channels filter, assignment modes (`manual`, `round-robin`, `skill-based`, `least-busy`), escalation rules (target department, afterMinutes, notifyLead), and work schedule (timezone, working days/hours, outsideHoursAction). Round-robin tracks `_lastAssignedIndex`; least-busy queries active conversation counts per agent; skill-based filters agents by department channels. Frontend at `/departments`.
- **Workflows**: `backend/models/Workflow.js` + `backend/services/workflow.service.js` + `backend/routes/workflows.js`. Automation engine with 7 trigger types (`conversation_created`, `status_change`, `priority_change`, `keyword_match`, `no_reply`, `department_change`, `csat_received`) and 12 action types (`assign_agent`, `assign_department`, `change_status`, `change_priority`, `send_message`, `send_template`, `add_tag`, `remove_tag`, `escalate`, `notify`, `webhook`, `set_sla`). Conditions use field/operator/value format. Service evaluates triggers and executes actions on matching conversations. Tracks `executionCount` and `lastExecutedAt`. Frontend at `/workflows`.
- **Live Chat**: `backend/models/LiveChat.js` + `backend/services/liveChat.service.js` + `backend/routes/livechat.js`. Configurable widget with title, subtitle, welcomeMessage, offlineMessage, primaryColor, position, avatar, requireUserInfo, preChatForm (custom fields), operatingHours (day-by-day schedule), department routing, autoAssignment. Public widget endpoints (`GET /widget/:userId`, `POST /widget/:userId/initiate`, `POST /widget/message/:conversationId`) require no auth. Authenticated config endpoints (`GET/PUT /config`) for dashboard setup. Embeddable widget JS at `backend/public/livechat-widget.js` — loaded via `<script data-user-id="...">` tag. Frontend settings at `/live-chat`.
- **CSAT**: Conversation model has `csat` field (score 1-5, comment, ratedAt) and `timeline` field (array of action events). Rating submitted via `POST /api/conversations/:id/csat`. Timeline viewed via `GET /api/conversations/:id/timeline`. Frontend shows star rating in ConversationDetail sidebar.
- **Conversation model additions**: `department` (ref to Department), `csat` (score/comment/ratedAt), `timeline` (action/from/to/performedBy/timestamp). Timeline entries: `created`, `assigned`, `unassigned`, `status_change`, `priority_change`, `department_change`, `note_added`, `csat_rated`, `merged`, `escalated`.
- **Help Center**: `backend/models/HelpArticle.js` + `backend/services/helpArticle.service.js` + `backend/routes/helpArticles.js`. Article management with title, slug (auto-generated), content, excerpt, category, tags, isPublished, isFeatured, views, helpfulYes/No voting. Categories endpoint returns distinct categories with article counts. Frontend at `/help-center`.
- **Email Channel**: `backend/models/EmailConfig.js` + `backend/services/email.service.js` + `backend/routes/email.js`. SMTP/IMAP configuration per user with host, port, secure, username, password, fromName, fromEmail. Test connection endpoint verifies SMTP credentials via nodemailer. Send email endpoint for outgoing messages. Password masked in GET responses (`••••••••`). Frontend email config in Settings page (not yet separate page).

## API Route Map

| Route | Description |
|---|---|
| `/api/auth` | Auth (login, register, refresh, me) |
| `/api/users` | User CRUD |
| `/api/conversations` | Conversations + messages + CSAT rating + timeline |
| `/api/channels` | Channel management |
| `/api/templates` | Template CRUD |
| `/api/webhooks` | Webhook management |
| `/api/analytics` | Dashboard analytics |
| `/api/subscriptions` | Subscription plans + billing |
| `/api/whatsapp` | WhatsApp client management |
| `/api/telegram` | Telegram bot management |
| `/api/auto-replies` | Auto-reply rules (keyword-triggered) |
| `/api/follow-ups` | Follow-up automation rules |
| `/api/documents` | Document upload, CRUD, chunks, stats |
| `/api/chat` | RAG chat (ask, search) |
| `/api/settings` | AI configuration (view, test connection) + AI auto-reply settings |
| `/api/logs` | System + frontend error logs |
| `/api/contacts` | Contact CRUD, merge, conversations lookup |
| `/api/departments` | Department CRUD, agent management, assignment |
| `/api/workflows` | Workflow CRUD, toggle, trigger evaluation |
| `/api/livechat` | Widget config (auth) + public widget endpoints (no auth) |
| `/api/help-articles` | Help center articles CRUD + categories + helpful voting |
| `/api/email` | Email channel config + test connection |
| `/api/queue` | Message queue status and processing |
| `/api/admin/*` | Super-admin routes |

## Response Format

All API responses follow `{success: boolean, ...}`. Use `utils/response.js` helpers:
- `successResponse(data, message?)` → `{success: true, ...data, message?}`
- `errorResponse(error, code, status, details?)` → returns `{response: {success: false, error, code, details?}, status}`
- `asyncHandler(fn)` — wraps Express handlers, catches Mongoose ValidationError, duplicate key (11000), CastError automatically
- `ERROR_CODES` — constants like `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, etc.

## Typical Middleware Chain

```
router.post('/resource', auth, authorize('admin'), checkSubscription, checkLimit('conversations'), asyncHandler(handler))
router.get('/resource', auth, cacheMiddleware(300), asyncHandler(handler))
router.put('/resource/:id', auth, authorize('manager'), invalidateCache('route:*'), asyncHandler(handler))
```

## Database

MongoDB via Mongoose 8.x. Models in `backend/models/`: User, Conversation, Message, Template, Integration, Subscription, Role, TeamInvitation, AutoReply, FollowUp, FollowUpExecution, Document, Chunk, Contact, Department, Workflow, LiveChat (model name `LiveChatConfig`), HelpArticle, EmailConfig. All have compound indexes. Subscription model has `aiMessages` in both `usage` and `limits` (free:50, basic:500, standard:2000, premium:∞). Conversation model has `csat`, `department`, and `timeline` fields. Department model has `escalationRules` and `workSchedule`. Contact model has arrays for emails, phones, tags, and `externalIds` per channel. HelpArticle has auto-generated slug from title.

If `MONGODB_URI` is unset or unreachable, the backend falls back to mongodb-memory-server (data lost on restart).

## Frontend Conventions

- React Router v6 with ProtectedRoute, AdminRoute, PublicRoute wrappers (all in `App.js`). AdminRoute checks `user.role` against `['owner', 'admin', 'manager']`.
- Zustand store with persist middleware for auth (`store/authStore.js`). Token stored in localStorage (remember me) or sessionStorage.
- Single Axios client in `api/index.js` — all API modules (auth, users, conversations, channels, templates, analytics, subscriptions, whatsapp, telegram, logs, followUps, autoReplies, documents, chat, settings, contacts, departments, workflows, livechat, csat, helpArticles, email) with token injection interceptors and 401 redirect to `/login`
- Tailwind CSS 3.x — primary color palette is teal (`#14b8a6` for primary-500) in `tailwind.config.js`. Channel brand colors defined: whatsapp(`#22c55e`), messenger(`#0ea5e9`), instagram(`#f43f5e`), telegram(`#06b6d4`).
- Arabic-first UI: RTL, Cairo font, dark/light mode toggle in `components/Layout.js`
- Onboarding gate: root route redirects to `/onboarding` unless `localStorage.getItem('autoflow_onboarded') === 'true'`

### Frontend Pages

| Path | Component | Description |
|---|---|---|
| `/` | Dashboard | Main dashboard |
| `/conversations` | Conversations | Conversation list |
| `/conversations/:id` | ConversationDetail | Chat view with CSAT rating + timeline |
| `/contacts` | Contacts | Contact management with merge |
| `/departments` | Departments | Department CRUD with assignment modes |
| `/auto-replies` | AutoReplies | Keyword-triggered auto-reply rules |
| `/follow-ups` | FollowUps | Scheduled/conditional message automation |
| `/workflows` | Workflows | Workflow automation with triggers + actions |
| `/help-center` | HelpCenter | Help article management with categories |
| `/live-chat` | LiveChatSettings | Live chat widget config + embed code |
| `/knowledge-base` | KnowledgeBase | Document upload and management |
| `/ai-chat` | AIChat | RAG chat with citations |
| `/templates` | Templates | Message template CRUD |
| `/channels` | Channels | Channel connections |
| `/analytics` | Analytics | Dashboard analytics (coming soon) |
| `/team` | Team | Team management (coming soon) |
| `/subscription` | Subscription | Plan management |
| `/settings` | Settings | AI config, AI auto-reply, general settings |

## Testing

- **Backend**: Jest + Supertest + mongodb-memory-server. Config in `backend/package.json` jest section. Tests in `backend/tests/`. Setup file: `backend/tests/setup.js`.
- **Frontend**: react-scripts test (CRA default, @testing-library/react)
- **Root level**: `tests/` has api, e2e (Cypress), frontend, advanced, permissions test suites + CSV test data in `tests/data/`
- **QA runner**: `node qa-check.js` — syntax checks, build checks, dep counts

## Environment Variables

Each service has its own `.env.example`. Critical vars:
- **Backend**: `JWT_SECRET` (required, 64+ chars), `MONGODB_URI` (optional, empty=in-memory), `REDIS_URL` (optional), `FRONTEND_URL` (CORS, default localhost:3000), `SUPER_ADMIN_EMAIL` + `SUPER_ADMIN_PASSWORD` (seed), `SUPER_ADMIN_EMAILS` (comma-separated, for adminAuth middleware), `MAX_WHATSAPP_CLIENTS` (default 10), `MAX_TELEGRAM_BOTS` (default 20), `PORT` (default 5000), `OPENAI_API_KEY` (required for RAG/AI features), `OPENAI_MODEL` (default gpt-4o-mini), `OPENAI_EMBEDDING_MODEL` (default text-embedding-3-small), `MAX_CHUNK_TOKENS` (default 500), `CHUNK_OVERLAP_TOKENS` (default 50)
- **Frontend**: `REACT_APP_API_URL` (default http://localhost:5000/api), `REACT_APP_SOCKET_URL` (default http://localhost:5000)

## Subscription Plans

Free (100 conversations, EGP 0) → Basic (1K convos, EGP 299/mo) → Standard (5K convos, EGP 599/mo) → Premium (unlimited, EGP 999/mo). 14-day free trial on new accounts. Currency: Egyptian Pound (EGP). Payment methods include Fawry and Vodafone Cash.

## Gotchas

- **Seed script paths**: Uses `../models/User` (not `./models/User`) since it runs from `backend/` via `node seeders/seed.js`. Default admin password: `Admin123!`
- **In-memory MongoDB fallback**: If `MONGODB_URI` is empty or points to localhost:27017, data is lost on restart
- **User role enum**: Must be one of `['owner', 'admin', 'manager', 'agent', 'viewer']` — matches the Role model. Default is `agent`.
- **Theme**: `.card` and `.glass` CSS classes use `[data-theme="dark"]` attribute selectors for dark mode. Layout.js sets `data-theme` on `<html>`. **`useTheme()` returns a plain string** (`'light'` or `'dark'`), NOT an object — use `const theme = useTheme()`. Auth pages (`.auth-bg`, `.auth-card`, `.input-glass`) use solid white/dark backgrounds, not glassmorphism. Never use `bg-dark-*` or `text-gray-400` alone — always pair with a light-mode alternative.
- **Dynamic Tailwind classes**: Never use template-literal class names like `bg-${color}-500` — Tailwind's JIT compiler can't detect them. Use static lookup maps instead.
- **Telegram bot token**: Never expose bot tokens in frontend logs. The API masks tokens with `••••••••` after initial connection.
- **Super admin vs tenant admin**: `adminAuth` middleware (super admin, `SUPER_ADMIN_EMAILS`) is different from `authorize('admin')` (tenant admin role). The `/api/admin/*` routes use `adminAuth`, not `authorize`.
- **Auth rate limiting**: Auth routes (`/api/auth/*`) are excluded from the 15-min/1000-req rate limiter.
- **Cache key format**: Cache middleware auto-generates keys as `route:{userId}:{originalUrl}`. Use `invalidateCache('route:*')` after mutations — the `*` gets replaced with `req.user.id`.
- **AutoReply + template resolution**: `autoReplyService.findMatch()` returns `{rule, resolvedResponse}` — always use `resolvedResponse` (not `rule.response`) to get template+variable content.
- **FollowUp validation**: The `/api/follow-ups` routes use `sanitizeBody` middleware that strips `null`/`undefined` values from `req.body` before express-validator runs. The frontend sends `content: null` when using a template instead of direct text.
- **FollowUp trigger hooks**: WhatsApp and Telegram services call `followUpService.handleConversationCreated()` on new conversations and `handleContactReply()` on incoming messages. Conversations route calls `handleStatusChange()` on PUT status changes. Checker runs every 60s for idle `no_reply` rules.
- **LiveChatConfig model**: Mongoose model name is `LiveChatConfig` (file is `LiveChat.js`). Require as `require('../models/LiveChat')` — use the file name, not the model name.
- **HelpArticle slug**: Auto-generated from title on save. Strips non-Arabic/non-alphanumeric chars, replaces spaces with hyphens. Compound unique index on `{user, slug}` prevents duplicates.
- **EmailConfig password masking**: GET returns `••••••••` for password. PUT detects this mask and preserves the existing password.
- **Contact model**: Emails and phones are arrays (not strings). `externalIds` stores channel-specific IDs per channel.
- **File upload limit**: `express.json({ limit: '10mb' })` in server.js. Document uploads use `multer` with storage in `backend/uploads/documents/` (gitignored).
- **Server startup order**: MongoDB → seed roles → mount routes → HTTP server → message queue processor (5s) → follow-up checker (60s) → resume Telegram polling. `global.io` set for Socket.io service access.
- **Socket event names**: Defined in `backend/constants/socketEvents.js`. User rooms use `user-{userId}` prefix.