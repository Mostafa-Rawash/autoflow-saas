# AGENTS.md - WhatsApp Service Development Guidelines

## Project Overview

WhatsApp Web.js service with Express API. Provides HTTP API for WhatsApp messaging with QR code authentication, conversation management, and Gemini AI integration.

## Commands

```bash
# Development
npm run dev                # Run with nodemon (hot reload)
npm start                  # Run production server

# Linting
npm run lint               # Run ESLint on src/
npm run lint:fix           # Fix ESLint issues

# Testing
npm test                   # Run Jest tests

# Build
npm run clean              # Remove dist/ (if exists)
```

## Tech Stack

- **Language**: JavaScript (ES Modules)
- **Runtime**: Node.js
- **Module System**: ES Modules (`"type": "module"` in package.json)
- **Framework**: Express 5.x
- **WhatsApp**: whatsapp-web.js with Puppeteer

## Code Style Guidelines

### ES Modules

This project uses ES Modules, not CommonJS:

```javascript
// Correct (ES Modules)
import express from 'express';
import { CONFIG } from './constants.js';
import logger from './logger.js';

// Wrong (CommonJS)
const express = require('express');
```

### File Extensions

Always include `.js` extension in imports:

```javascript
// Correct
import { foo } from './utils/foo.js';

// Wrong
import { foo } from './utils/foo';
```

### Naming Conventions

- Files: `kebab-case.js` (e.g., `message-formatter.js`, `conversation-manager.js`)
- Classes: `PascalCase` (e.g., `WhatsAppClientWrapper`, `ConversationManager`)
- Functions/variables: `camelCase` (e.g., `handleMessage`, `processAudio`)
- Constants: `SCREAMING_SNAKE_CASE` (e.g., `LOCK_FILE`, `PORT`)

### Error Handling

Use custom error classes from `src/error-handler.js`:

```javascript
import { ValidationError, NotFoundError } from './error-handler.js';

throw new ValidationError('Invalid phone number');
throw new NotFoundError('Conversation not found');
```

### Logging

Use the winston logger from `src/logger.js`:

```javascript
import logger from './logger.js';

logger.info('Message sent successfully');
logger.error('Failed to send message', error);
logger.warn('Rate limit approaching');
```

### Async/Await

Always handle promises properly:

```javascript
// Correct
try {
  await this.sendMessage(phone, message);
} catch (error) {
  logger.error('Failed', error);
  throw error;
}

// Wrong - floating promise
this.sendMessage(phone, message);  // No await, no catch
```

## Project Structure

```
src/
├── app.js                # Application entry point
├── server.js             # Express server setup
├── constants.js          # Configuration constants
├── logger.js             # Winston logger
├── error-handler.js      # Custom error classes
├── message-formatter.js  # Message formatting utilities
├── whatsapp-client.js    # WhatsApp client wrapper
├── conversation-manager.js  # Conversation state management
└── constants.js          # All configuration values
```

## Configuration

All config in `src/constants.js`. Environment variables:

- `PORT` - Server port (default: 3002)
- `GEMINI_ROBOT_URL` - AI service URL (default: http://localhost:3001)
- `AUTHORIZED_NUMBERS` - Comma-separated allowed phone numbers (empty = all allowed)
- `NODE_ENV` - Environment (development/production)

## Puppeteer/WhatsApp Web.js

- Chrome path: `/usr/bin/google-chrome`
- Headless mode: enabled by default
- Session data stored in `.wwebjs_auth/` directory
- Process lock prevents multiple instances (`.app-lock` file)

## Error Classes

From `src/error-handler.js`:

- `AppError` - Base class
- `ValidationError` (400)
- `AuthorizationError` (401)
- `NotFoundError` (404)
- `RateLimitError` (429)
- `ServiceUnavailableError` (503)
- `CircuitBreakerOpenError` (503)
- `ConversationTimeoutError` (408)
- `MaxConversationsError` (429)

## API Response Format

Consistent JSON responses:

```javascript
// Success
{ success: true, data: { ... } }

// Error
{ success: false, error: { code: '...', message: '...' } }
```

## Testing

- Jest for testing framework
- Mock WhatsApp client for unit tests
- Unit tests in `tests/unit/`
- Integration tests in `tests/integration/`

## Common Gotchas

1. **ES Modules**: Must use `.js` extensions in imports
2. **No TypeScript**: This is JavaScript only
3. **Process Lock**: Only one instance can run at a time (production mode skips lock)
4. **Puppeteer**: Requires Chrome/Chromium installed
5. **Session Persistence**: WhatsApp session stored in `.wwebjs_auth/`