/**
 * @fileoverview Jest test setup
 * @module tests/setup
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.PORT = '5555'; // Different port for tests

// Increase timeout for integration tests
jest.setTimeout(30000);

// Suppress console logs during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
// };

// Mock WhatsApp service for tests
jest.mock('../services/whatsapp.service', () => ({
  getClient: jest.fn(() => ({
    isConnected: jest.fn(() => false),
    sendMessage: jest.fn(() => Promise.resolve({ id: { _serialized: 'test-id' } }))
  })),
  createMedia: jest.fn(() => Promise.resolve({}))
}));

console.log('🧪 Test environment configured');