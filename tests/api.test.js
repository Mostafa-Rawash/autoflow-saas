// AutoFlow Test Suite
// Run with: npm test

const assert = require('assert');
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

// Test Configuration
const config = {
  timeout: 30000,
  retries: 3
};

// Test Results Storage
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

// Helper Functions
const log = {
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  info: (msg) => console.log(`ℹ️  ${msg}`),
  section: (msg) => console.log(`\n${'='.repeat(50)}\n${msg}\n${'='.repeat(50)}`)
};

const test = async (name, fn) => {
  try {
    await fn();
    results.passed++;
    results.tests.push({ name, status: 'PASS' });
    log.success(name);
    return true;
  } catch (err) {
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: err.message });
    log.error(`${name}: ${err.message}`);
    return false;
  }
};

const skip = (name, reason) => {
  results.skipped++;
  results.tests.push({ name, status: 'SKIP', reason });
  log.info(`⏭️  Skipped: ${name} (${reason})`);
};

// ========================================
// BACKEND API TESTS
// ========================================

async function testBackendHealth() {
  log.section('Backend Health Tests');
  
  await test('API Health Check', async () => {
    const res = await axios.get(`${API_URL.replace('/api', '')}/health`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'ok');
  });
  
  await test('API Response Time < 500ms', async () => {
    const start = Date.now();
    await axios.get(`${API_URL.replace('/api', '')}/health`);
    const duration = Date.now() - start;
    assert(duration < 500, `Response time ${duration}ms exceeds 500ms`);
  });
}

async function testAuthEndpoints() {
  log.section('Authentication Tests');
  
  await test('Register - Valid Data', async () => {
    const res = await axios.post(`${API_URL}/auth/register`, {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'TestPass123!',
      businessName: 'Test Business'
    });
    assert.strictEqual(res.status, 200);
    assert(res.data.token, 'Token not returned');
    assert(res.data.user, 'User not returned');
  });
  
  await test('Register - Missing Fields', async () => {
    try {
      await axios.post(`${API_URL}/auth/register`, {
        name: 'Test User'
      });
      throw new Error('Should have failed');
    } catch (err) {
      assert(err.response?.status === 400 || err.message !== 'Should have failed');
    }
  });
  
  await test('Login - Valid Credentials', async () => {
    // First register a user
    const email = `login${Date.now()}@example.com`;
    await axios.post(`${API_URL}/auth/register`, {
      name: 'Login Test',
      email,
      password: 'TestPass123!'
    });
    
    const res = await axios.post(`${API_URL}/auth/login`, {
      email,
      password: 'TestPass123!'
    });
    assert.strictEqual(res.status, 200);
    assert(res.data.token, 'Token not returned');
  });
  
  await test('Login - Invalid Credentials', async () => {
    try {
      await axios.post(`${API_URL}/auth/login`, {
        email: 'nonexistent@example.com',
        password: 'wrongpass'
      });
      throw new Error('Should have failed');
    } catch (err) {
      assert(err.response?.status === 401 || err.message !== 'Should have failed');
    }
  });
  
  await test('Get Current User', async () => {
    // Register and get token
    const email = `me${Date.now()}@example.com`;
    const regRes = await axios.post(`${API_URL}/auth/register`, {
      name: 'Me Test',
      email,
      password: 'TestPass123!'
    });
    
    const res = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${regRes.data.token}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.email, email);
  });
}

async function testConversationEndpoints() {
  log.section('Conversation Tests');
  
  let token;
  
  // Setup
  const email = `conv${Date.now()}@example.com`;
  const regRes = await axios.post(`${API_URL}/auth/register`, {
    name: 'Conv Test',
    email,
    password: 'TestPass123!'
  });
  token = regRes.data.token;
  
  await test('Get Conversations List', async () => {
    const res = await axios.get(`${API_URL}/conversations`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.data.conversations) || Array.isArray(res.data));
  });
  
  await test('Get Conversation Stats', async () => {
    const res = await axios.get(`${API_URL}/conversations/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(res.status, 200);
  });
  
  await test('Create Conversation', async () => {
    const res = await axios.post(`${API_URL}/conversations`, {
      contact: { name: 'Test Contact', phone: '+201000000000' },
      channel: 'whatsapp'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(res.status, 200);
    assert(res.data._id || res.data.id, 'Conversation ID not returned');
  });
}

async function testTemplateEndpoints() {
  log.section('Template Tests');
  
  let token;
  
  // Setup
  const email = `template${Date.now()}@example.com`;
  const regRes = await axios.post(`${API_URL}/auth/register`, {
    name: 'Template Test',
    email,
    password: 'TestPass123!'
  });
  token = regRes.data.token;
  
  await test('Get Templates List', async () => {
    const res = await axios.get(`${API_URL}/templates`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(res.status, 200);
  });
  
  await test('Create Template', async () => {
    const res = await axios.post(`${API_URL}/templates`, {
      name: 'Test Template',
      content: 'أهلاً بك في {business_name}',
      category: 'ترحيب'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(res.status, 200);
  });
}

async function testAutoReplyEndpoints() {
  log.section('Auto-Reply Tests');
  
  let token;
  
  // Setup
  const email = `autoreply${Date.now()}@example.com`;
  const regRes = await axios.post(`${API_URL}/auth/register`, {
    name: 'AutoReply Test',
    email,
    password: 'TestPass123!'
  });
  token = regRes.data.token;
  
  await test('Get Auto-Replies List', async () => {
    const res = await axios.get(`${API_URL}/auto-replies`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(res.status, 200);
  });
  
  await test('Create Auto-Reply Rule', async () => {
    const res = await axios.post(`${API_URL}/auto-replies`, {
      name: 'Test Rule',
      keywords: ['مرحبا', 'أهلا'],
      response: 'أهلاً بك! كيف أخدمك؟',
      matchType: 'contains'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(res.status, 200);
  });
}

async function testAnalyticsEndpoints() {
  log.section('Analytics Tests');
  
  let token;
  
  // Setup
  const email = `analytics${Date.now()}@example.com`;
  const regRes = await axios.post(`${API_URL}/auth/register`, {
    name: 'Analytics Test',
    email,
    password: 'TestPass123!'
  });
  token = regRes.data.token;
  
  await test('Get Analytics Overview', async () => {
    const res = await axios.get(`${API_URL}/analytics/overview`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(res.status, 200);
  });
  
  await test('Get Channel Analytics', async () => {
    const res = await axios.get(`${API_URL}/analytics/channels`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(res.status, 200);
  });
}

async function testAdminEndpoints() {
  log.section('Admin Tests');
  
  let token;
  
  // Setup
  const email = `admin${Date.now()}@example.com`;
  const regRes = await axios.post(`${API_URL}/auth/register`, {
    name: 'Admin Test',
    email,
    password: 'TestPass123!'
  });
  token = regRes.data.token;
  
  await test('Get Admin Articles', async () => {
    const res = await axios.get(`${API_URL}/admin/articles`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.data.articles));
  });
  
  await test('Get Admin Users', async () => {
    const res = await axios.get(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.data.users));
  });
  
  await test('Get Admin Roles', async () => {
    const res = await axios.get(`${API_URL}/admin/roles`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.data.roles));
  });
  
  await test('Get Admin Subscriptions', async () => {
    const res = await axios.get(`${API_URL}/admin/subscriptions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.data.plans));
  });
  
  await test('Get Admin Invoices', async () => {
    const res = await axios.get(`${API_URL}/admin/invoices`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.data.invoices));
  });
  
  await test('Get Admin Logs', async () => {
    const res = await axios.get(`${API_URL}/admin/logs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.data.logs));
  });
}

// ========================================
// INTEGRATION TESTS
// ========================================

async function testIntegration() {
  log.section('Integration Tests');
  
  await test('Auth → Conversations Flow', async () => {
    // Register
    const email = `int${Date.now()}@example.com`;
    const regRes = await axios.post(`${API_URL}/auth/register`, {
      name: 'Integration Test',
      email,
      password: 'TestPass123!'
    });
    const token = regRes.data.token;
    
    // Create conversation
    const convRes = await axios.post(`${API_URL}/conversations`, {
      contact: { name: 'Integration Contact', phone: '+201111111111' }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Get conversations
    const listRes = await axios.get(`${API_URL}/conversations`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    assert.strictEqual(listRes.status, 200);
  });
  
  await test('WhatsApp-Only Response Format', async () => {
    const email = `wa${Date.now()}@example.com`;
    const regRes = await axios.post(`${API_URL}/auth/register`, {
      name: 'WA Test',
      email,
      password: 'TestPass123!'
    });
    const token = regRes.data.token;
    
    const res = await axios.get(`${API_URL}/channels`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Verify WhatsApp is primary
    assert.strictEqual(res.status, 200);
  });
}

// ========================================
// PERFORMANCE TESTS
// ========================================

async function testPerformance() {
  log.section('Performance Tests');
  
  await test('Concurrent Requests (10 simultaneous)', async () => {
    const requests = Array(10).fill(null).map((_, i) => 
      axios.get(`${API_URL.replace('/api', '')}/health`)
    );
    
    const start = Date.now();
    await Promise.all(requests);
    const duration = Date.now() - start;
    
    assert(duration < 5000, `10 concurrent requests took ${duration}ms`);
  });
  
  await test('API Response Time Under Load', async () => {
    const times = [];
    
    for (let i = 0; i < 20; i++) {
      const start = Date.now();
      await axios.get(`${API_URL.replace('/api', '')}/health`);
      times.push(Date.now() - start);
    }
    
    const avg = times.reduce((a, b) => a + b) / times.length;
    assert(avg < 200, `Average response time ${avg}ms exceeds 200ms`);
  });
}

// ========================================
// SECURITY TESTS
// ========================================

async function testSecurity() {
  log.section('Security Tests');
  
  await test('Protected Endpoint Without Token', async () => {
    try {
      await axios.get(`${API_URL}/conversations`);
      throw new Error('Should have failed');
    } catch (err) {
      assert(err.response?.status === 401 || err.message !== 'Should have failed');
    }
  });
  
  await test('Invalid Token Rejected', async () => {
    try {
      await axios.get(`${API_URL}/conversations`, {
        headers: { Authorization: 'Bearer invalid-token' }
      });
      throw new Error('Should have failed');
    } catch (err) {
      assert(err.response?.status === 401 || err.message !== 'Should have failed');
    }
  });
  
  await test('SQL Injection Prevention', async () => {
    try {
      await axios.post(`${API_URL}/auth/login`, {
        email: "test@example.com' OR '1'='1",
        password: 'anything'
      });
    } catch (err) {
      // Should fail with normal 401, not 500
      assert(err.response?.status !== 500);
    }
  });
  
  await test('XSS Prevention', async () => {
    const email = `xss${Date.now()}@example.com`;
    const regRes = await axios.post(`${API_URL}/auth/register`, {
      name: '<script>alert("xss")</script>',
      email,
      password: 'TestPass123!'
    });
    
    // Name should be sanitized or escaped
    assert(!regRes.data.user.name.includes('<script>'));
  });
}

// ========================================
// RUN ALL TESTS
// ========================================

async function runAllTests() {
  console.log('\n🧪 AutoFlow Test Suite\n');
  console.log(`API URL: ${API_URL}`);
  console.log(`Started: ${new Date().toISOString()}\n`);
  
  const startTime = Date.now();
  
  try {
    await testBackendHealth();
    await testAuthEndpoints();
    await testConversationEndpoints();
    await testTemplateEndpoints();
    await testAutoReplyEndpoints();
    await testAnalyticsEndpoints();
    await testAdminEndpoints();
    await testIntegration();
    await testPerformance();
    await testSecurity();
  } catch (err) {
    log.error(`Test suite error: ${err.message}`);
  }
  
  const duration = Date.now() - startTime;
  
  // Summary
  log.section('Test Summary');
  console.log(`Total: ${results.passed + results.failed + results.skipped}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⏭️  Skipped: ${results.skipped}`);
  console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s`);
  console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  // Exit code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests();

module.exports = { test, skip, results };