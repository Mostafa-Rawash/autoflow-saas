# AutoFlow SaaS 🚀

Arabic-first, multi-channel communication platform for MENA businesses. Unifies WhatsApp, Messenger, Instagram, Telegram into a single dashboard with AI automation, contact management, departments, workflows, and live chat.

## Features

### Core Communication
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

### Helpdesk & Automation
- **Contacts** — Contact management with emails, phones, company, tags, custom fields, source tracking, external IDs per channel, merge contacts
- **Departments** — Department management with agents, leads, assignment modes (manual, round-robin, least-busy, skill-based), escalation rules, work schedules
- **Workflows** — Automation engine with 7 trigger types and 12 action types. Triggers: conversation_created, status_change, priority_change, keyword_match, no_reply, department_change, csat_received. Actions: change status/priority, assign agent/department, add/remove tags, send messages, notify, escalate, set SLA
- **Live Chat Widget** — Configurable chat widget with pre-chat forms, operating hours, department routing, auto-assignment, welcome/offline messages. Public API (no auth required) for widget embedding
- **CSAT Ratings** — Customer satisfaction scores (1-5 stars) on conversations with comments and timestamps
- **Conversation Timeline** — Full activity timeline with events: created, assigned, status_change, priority_change, department_change, note_added, csat_rated, merged, escalated
- **Help Center** — Article management with categories, tags, publish/draft, featured articles, helpful voting, auto-generated slugs. Dashboard at `/help-center`
- **Email Channel** — SMTP/IMAP configuration per user, test connection, send email via nodemailer. Config at `/api/email`
- **Embeddable Chat Widget** — Standalone JS widget (`livechat-widget.js`) for external sites. Loads config from public API, renders chat bubble, handles pre-chat form, sends/receives messages

### AI & Knowledge Base
- **RAG Chat** — Upload documents, auto-chunk, embed via OpenAI, semantic search, AI-generated answers with source citations
- **AI Auto-Response** — Automatic AI responses on WhatsApp/Telegram when no auto-reply rule matches. Tone-configurable (professional, friendly, casual). Plan-based limits (free=50, basic=500, standard=2000, premium=∞)
- **Document Processing** — PDF, DOCX, TXT, MD, CSV, HTML support with 500-token chunks and 50-token overlap

### Automation
- **Auto-Replies** — Keyword-triggered instant replies with template support and variable substitution
- **Follow-Ups** — Scheduled/conditional message automation (no_reply, schedule, status_change, new_conversation triggers)
- **Variable Resolution** — `{{variable}}` substitution with contact data (`name`, `phone`, `email`, `channel`, `status`, `last_message` plus Arabic equivalents)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Zustand |
| Backend | Express.js, MongoDB (Mongoose), Socket.io |
| Auth | JWT (access + refresh tokens) |
| Caching | Redis (optional, falls back to in-memory) |
| AI | OpenAI (GPT-4o-mini for chat, text-embedding-3-small for search) |

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (optional — in-memory mode available for dev)

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env: set JWT_SECRET (required), MONGODB_URI (optional), OPENAI_API_KEY (for AI features)
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

| Plan | Conversations | AI Messages | Team Members | Price |
|------|-------------|------------|-------------|-------|
| Free | 100 | 50 | 2 | EGP 0 |
| Basic | 1,000 | 500 | 5 | EGP 299/mo |
| Standard | 5,000 | 2,000 | 10 | EGP 599/mo |
| Premium | ∞ | ∞ | ∞ | EGP 999/mo |

14-day free trial on new accounts.

## Project Structure

```
autoflow-saas/
├── backend/
│   ├── models/             # Mongoose models
│   │   ├── User.js          # User with settings.aiAutoReply
│   │   ├── Conversation.js  # Conversations + CSAT + timeline + department
│   │   ├── Message.js       # Messages (text, media, buttons)
│   │   ├── Contact.js       # Contact management (emails[], phones[], tags, externalIds)
│   │   ├── Department.js    # Departments (agents, lead, assignment, escalation, schedule)
│   │   ├── Workflow.js      # Workflow automation (triggers + actions)
│   │   ├── LiveChat.js      # Live chat widget config (LiveChatConfig model)
│   │   ├── HelpArticle.js   # Help center articles with slugs + voting
│   │   ├── EmailConfig.js   # SMTP/IMAP email channel config
│   │   ├── Subscription.js  # Plans + usage (including aiMessages)
│   │   ├── AutoReply.js     # Keyword-triggered replies
│   │   ├── FollowUp.js      # Scheduled/conditional automation
│   │   ├── FollowUpExecution.js
│   │   ├── Template.js      # Message templates
│   │   ├── Integration.js   # Channel integrations
│   │   ├── Document.js      # Knowledge base documents
│   │   ├── Chunk.js         # Document chunks with embeddings
│   │   ├── Role.js          # RBAC roles + permissions
│   │   ├── TeamInvitation.js
│   │   └── Log.js           # System/frontend logs
│   ├── routes/              # API routes
│   │   ├── auth.js          # Login, register, refresh, me
│   │   ├── users.js         # User CRUD
│   │   ├── conversations.js # Conversations + messages + CSAT + timeline
│   │   ├── contacts.js      # Contact CRUD + merge
│   │   ├── departments.js   # Department CRUD + agent management + assignment
│   │   ├── workflows.js     # Workflow CRUD + toggle
│   │   ├── livechat.js      # Widget config (auth) + public widget endpoints
│   │   ├── helpArticles.js  # Help center articles CRUD + categories + voting
│   │   ├── email.js         # Email channel config + test connection
│   │   ├── channels.js      # Channel management
│   │   ├── templates.js     # Template CRUD
│   │   ├── autoReplies.js   # Auto-reply rules
│   │   ├── followUps.js     # Follow-up automation
│   │   ├── documents.js     # Document upload + CRUD + chunks
│   │   ├── chat.js          # RAG chat (ask, search)
│   │   ├── settings.js      # AI config + AI auto-reply settings
│   │   ├── whatsapp.js      # WhatsApp client management
│   │   ├── telegram.js      # Telegram bot management
│   │   ├── subscriptions.js # Plans + billing
│   │   ├── analytics.js     # Dashboard analytics
│   │   ├── webhooks.js      # Webhook management
│   │   ├── logs.js          # System + frontend logs
│   │   ├── queue.js         # Message queue
│   │   └── admin.js         # Super-admin routes
│   ├── services/            # Business logic
│   │   ├── aiResponder.service.js    # AI auto-response for channels
│   │   ├── autoReply.service.js      # Keyword matching + template resolution
│   │   ├── cache.service.js          # Redis + in-memory cache
│   │   ├── contact.service.js        # Contact CRUD + merge + search
│   │   ├── department.service.js      # Department + assignment (round-robin, least-busy, skill-based)
│   │   ├── documentProcessor.service.js # PDF/DOCX extraction + chunking
│   │   ├── followUp.service.js       # Follow-up checker + hooks
│   │   ├── liveChat.service.js       # Widget config + visitor chat
│   │   ├── helpArticle.service.js    # Help center article CRUD + voting
│   │   ├── email.service.js          # SMTP config + send email
│   │   ├── logger.service.js         # Logging service
│   │   ├── messageQueue.service.js   # Queued message processing
│   │   ├── rag.service.js            # RAG pipeline + auto-reply generation
│   │   ├── telegram.service.js       # Telegram bot integration
│   │   ├── variableResolver.service.js # {{variable}} substitution
│   │   ├── vectorStore.service.js    # Embedding storage + cosine search
│   │   ├── whatsapp.service.js       # WhatsApp multi-tenant client
│   │   └── workflow.service.js      # Workflow trigger evaluation + action execution
│   ├── middleware/          # Auth, admin, cache middleware
│   ├── seeders/             # Database seed script
│   ├── utils/               # Response helpers, error codes
│   └── tests/               # Jest + Supertest tests
├── frontend/
│   └── src/
│       ├── api/             # Axios client (auth, users, conversations, contacts,
│       │                     #   departments, workflows, livechat, csat, documents, chat,
│       │                     #   settings, whatsapp, telegram, logs, followUps, autoReplies)
│       ├── components/      # Layout (sidebar + theme)
│       ├── pages/           # All page components
│       │   ├── Contacts.js       # Contact management with merge
│       │   ├── Departments.js    # Department CRUD + assignment modes
│       │   ├── Workflows.js      # Workflow automation builder
│       │   ├── HelpCenter.js    # Help article management
│       │   ├── LiveChatSettings.js  # Live chat widget config + embed code
│       │   ├── ConversationDetail.js  # Chat + CSAT rating + timeline
│       │   ├── KnowledgeBase.js   # Document management
│       │   ├── AIChat.js         # RAG chat with citations
│       │   ├── Settings.js       # AI config + auto-reply toggle
│       │   └── ... (other pages)
│       ├── store/           # Zustand auth store
│       ├── context/         # ThemeContext (useTheme returns string)
│       └── utils/           # Error catcher
├── scripts/                # Process management & deployment
├── tests/                  # Root-level integration & E2E tests
└── health-check.js         # Service health check
```

## API Endpoints

### Public (No Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/subscriptions/plans` | List plans |
| GET | `/api/livechat/widget/:userId` | Get widget config |
| POST | `/api/livechat/widget/:userId/initiate` | Start live chat |
| POST | `/api/livechat/widget/message/:conversationId` | Send visitor message |

### Protected (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Current user |
| GET/POST | `/api/conversations` | List/create conversations |
| GET/PUT | `/api/conversations/:id` | Get/update conversation |
| POST | `/api/conversations/:id/messages` | Send message |
| POST | `/api/conversations/:id/csat` | Submit CSAT rating |
| GET | `/api/conversations/:id/timeline` | Get conversation timeline |
| GET/POST | `/api/contacts` | List/create contacts |
| GET/PUT/DELETE | `/api/contacts/:id` | Get/update/delete contact |
| POST | `/api/contacts/:primaryId/merge/:secondaryId` | Merge contacts |
| GET | `/api/contacts/:id/conversations` | Get contact conversations |
| GET/POST | `/api/departments` | List/create departments |
| GET/PUT/DELETE | `/api/departments/:id` | Get/update/delete department |
| POST | `/api/departments/:id/agents` | Add agent to department |
| DELETE | `/api/departments/:id/agents/:agentId` | Remove agent |
| PUT | `/api/departments/:id/lead` | Assign department lead |
| POST | `/api/departments/:id/assign` | Get next agent (auto-assign) |
| GET/POST | `/api/workflows` | List/create workflows |
| GET/PUT/DELETE | `/api/workflows/:id` | Get/update/delete workflow |
| POST | `/api/workflows/:id/toggle` | Enable/disable workflow |
| GET/PUT | `/api/livechat/config` | Get/update widget config |
| GET/POST | `/api/help-articles` | List/create help articles |
| GET/PUT/DELETE | `/api/help-articles/:id` | Get/update/delete article |
| GET | `/api/help-articles/categories` | List article categories |
| POST | `/api/help-articles/:id/helpful` | Vote article helpful/unhelpful |
| GET/PUT | `/api/email/config` | Get/update email config |
| POST | `/api/email/test` | Test email connection |
| DELETE | `/api/email/config` | Delete email config |
| GET/POST | `/api/documents` | List/upload documents |
| POST | `/api/chat` | RAG chat (ask) |
| POST | `/api/chat/search` | RAG search |
| GET/POST | `/api/auto-replies` | Auto-reply rules |
| GET/POST | `/api/follow-ups` | Follow-up automation |
| GET/POST | `/api/whatsapp/*` | WhatsApp management |
| GET/POST | `/api/telegram/*` | Telegram management |
| GET/PUT | `/api/settings/ai` | AI configuration |
| GET/PUT | `/api/settings/ai-auto-reply` | AI auto-reply settings |

### Admin (Super Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Admin stats |
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/roles` | List roles with user counts |
| PUT | `/api/admin/roles/:name` | Update role permissions |

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
| `SUPER_ADMIN_EMAILS` | No | Comma-separated emails for adminAuth |
| `MAX_WHATSAPP_CLIENTS` | No | Max concurrent WhatsApp connections (default: 10) |
| `MAX_TELEGRAM_BOTS` | No | Max concurrent Telegram bots (default: 20) |
| `PORT` | No | Server port (default: 5000) |
| `OPENAI_API_KEY` | No* | Required for RAG/AI features |
| `OPENAI_MODEL` | No | Default gpt-4o-mini |
| `OPENAI_EMBEDDING_MODEL` | No | Default text-embedding-3-small |
| `MAX_CHUNK_TOKENS` | No | Default 500 |
| `CHUNK_OVERLAP_TOKENS` | No | Default 50 |

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