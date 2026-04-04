/**
 * Configuration constants for the WhatsApp service
 * Loaded from environment variables with fallback defaults
 */

const CONFIG = {
  PORT: parseInt(process.env.PORT || '3002', 10),
  HOST: process.env.HOST || '0.0.0.0',

  GEMINI_URL: process.env.GEMINI_ROBOT_URL || 'http://localhost:3001',
  DATABASE_URL: process.env.DATABASE_ROBOT_URL || 'http://localhost:3000',

  AUTHORIZED_NUMBERS: (process.env.AUTHORIZED_NUMBERS || '').split(',').map(n => n.trim()).filter(Boolean),
  MAX_CONCURRENT_CONVERSATIONS: parseInt(process.env.MAX_CONCURRENT_CONVERSATIONS || '3', 10),
  SESSION_SAVE_PATH: process.env.SESSION_SAVE_PATH || '/tmp/whatsapp-sessions',

  CONVERSATION_TIMEOUT_MS: parseInt(process.env.CONVERSATION_TIMEOUT_MS || '1800000', 10),

  HTTP_TIMEOUT_MS: parseInt(process.env.HTTP_TIMEOUT_MS || '60000', 10),
  HTTP_MAX_RETRIES: parseInt(process.env.HTTP_MAX_RETRIES || '5', 10),
  HTTP_RETRY_DELAY_MS: parseInt(process.env.HTTP_RETRY_DELAY_MS || '1000', 10),
  HTTP_CIRCUIT_BREAKER_THRESHOLD: parseInt(process.env.HTTP_CIRCUIT_BREAKER_THRESHOLD || '5', 10),
  HTTP_CIRCUIT_BREAKER_COOLDOWN_MS: parseInt(process.env.HTTP_CIRCUIT_BREAKER_COOLDOWN_MS || '60000', 10),

  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_MAX_FILES: 14,
  LOG_MAX_SIZE: '20M',

  API_KEY: process.env.WHATSAPP_ROBOT_API_KEY || 'shared-secret-key',
  API_KEY_HEADER: 'X-API-Key',

  PUPPETEER_HEADLESS: process.env.PUPPETEER_HEADLESS !== 'false',
  PUPPETEER_TIMEOUT_MS: parseInt(process.env.PUPPETEER_TIMEOUT_MS || '30000', 10),
  PUPPETEER_EXECUTABLE_PATH: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',

  MESSAGE_QUEUE_MAX_SIZE: parseInt(process.env.MESSAGE_QUEUE_MAX_SIZE || '1000', 10),
  MESSAGE_RETRY_MAX_ATTEMPTS: parseInt(process.env.MESSAGE_RETRY_MAX_ATTEMPTS || '3', 10),
};

export { CONFIG };
export default CONFIG;
