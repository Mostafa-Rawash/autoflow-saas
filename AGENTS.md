# AGENTS.md - AutoFlow SaaS

## Repository Structure

Monorepo with 4 independent packages. Each has its own `package.json`:

| Package              | Port | Description                         |
| -------------------- | ---- | ----------------------------------- |
| `frontend/backend/`  | 5000 | Express API + MongoDB + Socket.io   |
| `frontend/frontend/` | 3001 | React dashboard (Tailwind, Zustand) |
| `whatsapp-service/`  | 3002 | WhatsApp Web.js + Puppeteer         |
| `ai-service/`        | 3001 | Gemini AI processing                |

> **Note:** Landing pages have been moved to a separate repository: `autoflow-landing-pages`

## Development Commands

```bash
# Process management (from root)
npm run start [backend|frontend|whatsapp|all]
npm run stop [service]
npm run status
npm run health

# Build all
npm run build

# Testing (from root)
npm test                    # All tests via tests/run-tests.sh
npm run test:api           # API tests only
npm run test:e2e           # Cypress E2E tests

# Per-service development
cd frontend/backend && npm run dev
cd frontend/frontend && npm start
cd whatsapp-service && npm run dev
cd ai-service && npm run dev
```

## Service Dependencies

- **MongoDB**: Required for `frontend/backend` (default: `mongodb://localhost:27017/autoflow`)
- **Chrome/Chromium**: Required for `whatsapp-service` (Puppeteer path: `/usr/bin/google-chrome`)
- **Gemini API key**: Required for `ai-service` and `whatsapp-service`

## Environment Setup

Each service has `.env.example`:

- `frontend/backend/.env.example` - MongoDB URI, JWT secret, channel integrations
- `whatsapp-service/.env.example` - Gemini API key
- `ai-service/.env.example` - Gemini API key, database URL

## Package-Specific Guidelines

- **whatsapp-service**: See `whatsapp-service/AGENTS.md` for code style (ES modules, ESLint, Prettier)
- **frontend/frontend**: RTL support for Arabic, dark mode by default
- No shared code between services - communication via HTTP APIs

## Testing Notes

- Tests auto-start backend if not running
- WhatsApp service optional for health checks (expected down in demo mode)
- Test data: `tests/data/` (CSV files)
