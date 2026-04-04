# AGENTS.md - Development Guidelines for Agents

## Project Overview

This is a WhatsApp Web.js service with Express API. It provides an HTTP API for WhatsApp messaging with QR code authentication, conversation management, and Gemini AI integration.

## Build, Lint, and Test Commands

```bash
# Build
npm run build              # Compile TypeScript to dist/
npm run clean              # Remove dist/ directory

# Development
npm run dev                # Run with hot reload (ts-node-dev)
npm start                  # Build and run production

# Testing
npm test                   # Run all tests with coverage
npm run test:watch         # Run tests in watch mode
npm run test:unit          # Run only unit tests
npm run test:integration   # Run only integration tests
npm run test:e2e           # Run only e2e tests

# Run a single test file
npx jest --testPathPattern=filename.test.ts

# Run a single test
npx jest --testNamePattern="test name"

# Linting
npm run lint               # Run ESLint
npm run lint:fix           # Fix ESLint issues

# Formatting
npm run format             # Format code with Prettier
npm run format:check       # Check formatting only

# Type checking
npm run typecheck          # TypeScript type check (no emit)
```

## Code Style Guidelines

### General

- Language: TypeScript (strict mode enabled)
- Target: ES2020, Node.js
- All source code in `src/` directory

### Imports and Path Aliases

- Use path alias `@/` for internal imports: `import { X } from '@/services/x'`
- Group imports in order: external libs, internal modules, relative paths
- Use explicit relative imports for local files: `import { X } from './utils/logger'`

```typescript
// Correct
import express from 'express';
import { createServiceLogger } from '@/utils/logger';
import { CONFIG } from '../config/constants';
import { WhatsAppClientWrapper } from './client';

// Avoid
import { X } from '../../utils/logger';  // Use @/ instead
```

### Formatting (Prettier)

- Semi-colons: yes
- Single quotes: yes
- Print width: 100 characters
- Arrow functions: parentheses always
- Trailing comma: es5 style

### Naming Conventions

- Classes: PascalCase (`WhatsAppClientWrapper`)
- Functions/variables: camelCase (`createServiceLogger`, `isReady`)
- Constants: SCREAMING_SNAKE_CASE (`LOCK_TIMEOUT_MS`)
- Interfaces/Types: PascalCase with descriptive names
- Files: kebab-case (`message-formatter.ts`)

### TypeScript Rules (Strict)

- `any` is forbidden - use proper types
- Explicit return types required on functions
- Explicit member accessibility (public/private) required
- No non-null assertions (`!`) unless absolutely necessary
- Use nullish coalescing (`??`) instead of `||`
- Strict boolean expressions (no implicit boolean coercion)

### Error Handling

Use custom error classes from `src/utils/error-handler.ts`:

```typescript
import { AppError, ValidationError, NotFoundError } from '@/utils/error-handler';

// Throw specific errors
throw new ValidationError('Invalid phone number', { field: 'phone' });
throw new NotFoundError('Conversation not found', { id: conversationId });

// In API handlers, use serializeError for responses
import { serializeError } from '@/utils/error-handler';
res.status(error.statusCode).json(serializeError(error));
```

Error class hierarchy:
- `AppError` - base class with statusCode, code, details
- `ValidationError` (400)
- `AuthorizationError` (401)
- `NotFoundError` (404)
- `RateLimitError` (429)
- `ServiceUnavailableError` (503)
- `CircuitBreakerOpenError` (503)
- `ConversationTimeoutError` (408)
- `MaxConversationsError` (429)

### Logging

Use the structured logger from `@/utils/logger`:

```typescript
import { createServiceLogger } from '@/utils/logger';

const log = createServiceLogger('ServiceName');

log.info('Operation started');
log.warn('Potential issue');
log.error('Operation failed', error as Error);
```

### Async/Await

- Always handle promises properly - no floating promises
- Never ignore returned promises
- Use try/catch for async operations that can fail

```typescript
// Correct
await this.initializeClientWrapper();

// Wrong
this.initializeClientWrapper();  // Floating promise

// With error handling
try {
  await this.sendMessage(phone, message);
} catch (error) {
  log.error('Failed to send message', error as Error);
  throw error;
}
```

### Configuration

All config in `src/config/constants.ts`. Use `CONFIG` object, never hardcode values.

### API Routes

- Use Express 5.x
- Validate inputs with Zod
- Return consistent JSON response format:
```typescript
// Success
{ success: true, data: { ... } }

// Error
{ success: false, error: { code: '...', message: '...' } }
```

### Puppeteer/WhatsApp Web.js

- Chrome path: `/usr/bin/google-chrome` (configured in client.ts)
- Headless mode enabled
- Use `WhatsAppClientWrapper` class for client operations
- Event handlers must be set up via `.on()` method

### Git/Development Workflow

- No commits unless explicitly requested
- Run `npm run lint` and `npm run typecheck` before submitting code
- Ensure tests pass: `npm test`

## Project Structure

```
src/
├── api/
│   ├── routes/           # Express route handlers
│   │   ├── health.ts
│   │   └── whatsapp.ts
│   └── server.ts         # Express server setup
├── config/
│   └── constants.ts      # All configuration values
├── services/
│   ├── whatsapp/         # WhatsApp client wrapper
│   ├── conversation/     # Conversation management
│   └── integration/      # External integrations (Gemini)
├── types/                # TypeScript type definitions
├── utils/
│   ├── logger.ts         # Winston logger
│   ├── error-handler.ts  # Custom error classes
│   └── message-formatter.ts
└── app.ts                # Application entry point
```

## Environment Variables

Configuration via `src/config/constants.ts`:
- `PORT` - Server port
- `NODE_ENV` - Environment (development/production)
- `GEMINI_API_KEY` - Gemini AI API key
- Session data stored in `.wwebjs_auth/` directory

## Testing Patterns

- Unit tests in `tests/unit/`
- Integration tests in `tests/integration/`
- E2E tests in `tests/e2e/`
- Use Jest matchers and mock WhatsApp client for unit tests
