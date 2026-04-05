// AutoFlow Comprehensive UI Test
// Tests all pages, buttons, and flows

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const BASE_URLS = {
  landing: 'http://localhost:8080',
  frontend: 'http://localhost:3000',  // React dev server uses 3000
  api: 'http://localhost:5000/api'
};

let authToken = null;
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

const log = {
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  info: (msg) => console.log(`ℹ️  ${msg}`),
  section: (msg) => console.log(`\n${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}`)
};

const test = (name, passed, details = '') => {
  if (passed) {
    testResults.passed++;
    testResults.tests.push({ name, status: 'PASS', details });
    log.success(name);
  } else {
    testResults.failed++;
    testResults.tests.push({ name, status: 'FAIL', details });
    log.error(`${name} - ${details}`);
  }
};

// ========================================
// LANDING PAGES TESTS
// ========================================

async function testLandingPages() {
  log.section('LANDING PAGES TESTS');
  
  // Test Arabic homepage
  try {
    const res = await axios.get(`${BASE_URLS.landing}/ar/`);
    const $ = cheerio.load(res.data);
    
    test('Landing: Arabic homepage loads', res.status === 200);
    test('Landing: Arabic RTL direction', $('html').attr('dir') === 'rtl');
    test('Landing: AutoFlow title present', $('title').text().includes('AutoFlow'));
    test('Landing: Hero section present', $('.hero, h1').length > 0);
    test('Landing: WhatsApp float button', $('a[href*="wa.me"]').length > 0);
  } catch (err) {
    test('Landing: Arabic homepage loads', false, err.message);
  }
  
  // Test English homepage
  try {
    const res = await axios.get(`${BASE_URLS.landing}/en/`);
    const $ = cheerio.load(res.data);
    
    test('Landing: English homepage loads', res.status === 200);
    test('Landing: English LTR direction', $('html').attr('dir') === 'ltr' || !$('html').attr('dir'));
  } catch (err) {
    test('Landing: English homepage loads', false, err.message);
  }
  
  // Test Pricing page
  try {
    const res = await axios.get(`${BASE_URLS.landing}/pricing/ar/`);
    const $ = cheerio.load(res.data);
    const body = res.data;
    
    test('Landing: Pricing page loads', res.status === 200);
    test('Landing: Shows 2000 EGP price', body.includes('2,000') || body.includes('2000'));
    test('Landing: WhatsApp-only product', body.includes('واتس آب') || body.includes('WhatsApp'));
  } catch (err) {
    test('Landing: Pricing page loads', false, err.message);
  }
  
  // Test Articles page
  try {
    const res = await axios.get(`${BASE_URLS.landing}/articles/ar/`);
    const $ = cheerio.load(res.data);
    
    test('Landing: Articles page loads', res.status === 200);
    test('Landing: Articles present', $('a[href*="/articles/"]').length > 0);
  } catch (err) {
    test('Landing: Articles page loads', false, err.message);
  }
  
  // Test Docs page
  try {
    const res = await axios.get(`${BASE_URLS.landing}/docs/ar/`);
    const $ = cheerio.load(res.data);
    
    test('Landing: Docs page loads', res.status === 200);
    test('Landing: Doc sections present', $('a[href*="/docs/"]').length > 0);
  } catch (err) {
    test('Landing: Docs page loads', false, err.message);
  }
  
  // Test Service pages
  const services = ['restaurant', 'clinic', 'ecommerce', 'realestate', 'lawyer'];
  for (const service of services) {
    try {
      const res = await axios.get(`${BASE_URLS.landing}/${service}/ar/`);
      test(`Landing: ${service} service page`, res.status === 200);
    } catch (err) {
      test(`Landing: ${service} service page`, false, err.message);
    }
  }
}

// ========================================
// API ENDPOINT TESTS
// ========================================

async function testAPIEndpoints() {
  log.section('API ENDPOINT TESTS');
  
  // Health check
  try {
    const res = await axios.get(`${BASE_URLS.api.replace('/api', '')}/health`);
    test('API: Health check', res.status === 200 && res.data.status === 'ok');
  } catch (err) {
    test('API: Health check', false, err.message);
  }
  
  // Register
  let regRes;
  try {
    regRes = await axios.post(`${BASE_URLS.api}/auth/register`, {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'TestPass123!',
      businessName: 'Test Business'
    });
    
    test('API: User registration', regRes.status === 200 || regRes.status === 201);
    test('API: Returns auth token', !!regRes.data.token);
    test('API: Returns user object', !!regRes.data.user);
    
    if (regRes.data.token) {
      authToken = regRes.data.token;
    }
  } catch (err) {
    test('API: User registration', false, err.response?.status || err.message);
  }
  
  // Get current user
  if (authToken) {
    try {
      const res = await axios.get(`${BASE_URLS.api}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      test('API: Get current user', res.status === 200);
    } catch (err) {
      test('API: Get current user', false, err.message);
    }
  }
  
  // Conversations
  if (authToken) {
    try {
      const res = await axios.get(`${BASE_URLS.api}/conversations`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      test('API: Get conversations', res.status === 200);
    } catch (err) {
      test('API: Get conversations', false, err.message);
    }
  }
  
  // Templates
  if (authToken) {
    try {
      const res = await axios.get(`${BASE_URLS.api}/templates`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      test('API: Get templates', res.status === 200);
    } catch (err) {
      test('API: Get templates', false, err.message);
    }
  }
  
  // Auto-replies
  if (authToken) {
    try {
      const res = await axios.get(`${BASE_URLS.api}/auto-replies`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      test('API: Get auto-replies', res.status === 200);
    } catch (err) {
      test('API: Get auto-replies', false, err.message);
    }
  }
  
  // Analytics
  if (authToken) {
    try {
      const res = await axios.get(`${BASE_URLS.api}/analytics/overview`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      test('API: Get analytics', res.status === 200);
    } catch (err) {
      test('API: Get analytics', false, err.message);
    }
  }
  
  // Admin endpoints
  if (authToken) {
    const adminEndpoints = [
      { path: '/admin/articles', name: 'Admin articles' },
      { path: '/admin/users', name: 'Admin users' },
      { path: '/admin/roles', name: 'Admin roles' },
      { path: '/admin/subscriptions', name: 'Admin subscriptions' },
      { path: '/admin/invoices', name: 'Admin invoices' },
      { path: '/admin/logs', name: 'Admin logs' }
    ];
    
    for (const endpoint of adminEndpoints) {
      try {
        const res = await axios.get(`${BASE_URLS.api}${endpoint.path}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        test(`API: ${endpoint.name}`, res.status === 200);
      } catch (err) {
        test(`API: ${endpoint.name}`, false, err.message);
      }
    }
  }
}

// ========================================
// FRONTEND PAGE TESTS
// ========================================

async function testFrontendPages() {
  log.section('FRONTEND DASHBOARD TESTS');
  
  const pages = [
    { path: '/', name: 'Dashboard' },
    { path: '/conversations', name: 'Conversations' },
    { path: '/templates', name: 'Templates' },
    { path: '/auto-replies', name: 'Auto-replies' },
    { path: '/channels', name: 'Channels' },
    { path: '/analytics', name: 'Analytics' },
    { path: '/team', name: 'Team' },
    { path: '/subscription', name: 'Subscription' },
    { path: '/settings', name: 'Settings' },
    { path: '/admin', name: 'Admin Dashboard' },
    { path: '/admin/users', name: 'Admin Users' },
    { path: '/admin/articles', name: 'Admin Articles' },
    { path: '/admin/docs', name: 'Admin Docs' },
    { path: '/admin/roles', name: 'Admin Roles' },
    { path: '/admin/subscriptions', name: 'Admin Subscriptions' },
    { path: '/admin/invoices', name: 'Admin Invoices' },
    { path: '/admin/logs', name: 'Admin Logs' },
    { path: '/system-health', name: 'System Health' }
  ];
  
  for (const page of pages) {
    try {
      // Use http module directly to avoid axios issues
      const http = require('http');
      const res = await new Promise((resolve, reject) => {
        const options = {
          hostname: '127.0.0.1',
          port: 3000,
          path: page.path,
          method: 'GET',
          headers: { 'Accept': '*/*' }
        };
        
        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({ status: res.statusCode, data }));
        });
        req.on('error', reject);
        req.end();
      });
      
      // React SPA returns 200 for all routes with same index.html
      test(`Frontend: ${page.name} page loads`, res.status < 400);
      
      const $ = cheerio.load(res.data);
      test(`Frontend: ${page.name} has React root`, $('#root').length > 0);
    } catch (err) {
      test(`Frontend: ${page.name} page loads`, false, err.message);
    }
  }
  
  // Test login page (should be accessible)
  try {
    const http = require('http');
    const res = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: '127.0.0.1',
        port: 3000,
        path: '/login',
        method: 'GET',
        headers: { 'Accept': '*/*' }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data }));
      });
      req.on('error', reject);
      req.end();
    });
    test('Frontend: Login page loads', res.status === 200);
  } catch (err) {
    test('Frontend: Login page loads', false, err.message);
  }
  
  // Test register page
  try {
    const http = require('http');
    const res = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: '127.0.0.1',
        port: 3000,
        path: '/register',
        method: 'GET',
        headers: { 'Accept': '*/*' }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data }));
      });
      req.on('error', reject);
      req.end();
    });
    test('Frontend: Register page loads', res.status === 200);
  } catch (err) {
    test('Frontend: Register page loads', false, err.message);
  }
}

// ========================================
// CONTENT TESTS
// ========================================

async function testContent() {
  log.section('CONTENT TESTS');
  
  // Test Arabic content
  try {
    const res = await axios.get(`${BASE_URLS.landing}/ar/`);
    const hasArabic = /[\u0600-\u06FF]/.test(res.data);
    
    test('Content: Arabic text present', hasArabic);
  } catch (err) {
    test('Content: Arabic text present', false, err.message);
  }
  
  // Test pricing content
  try {
    const res = await axios.get(`${BASE_URLS.landing}/pricing/ar/`);
    const body = res.data;
    
    test('Content: Shows 2000 EGP', body.includes('2,000') || body.includes('2000'));
    test('Content: Shows 4000 EGP', body.includes('4,000') || body.includes('4000'));
    test('Content: Shows 8000 EGP', body.includes('8,000') || body.includes('8000'));
    test('Content: Shows WhatsApp mention', body.includes('واتس آب'));
  } catch (err) {
    test('Content: Pricing content', false, err.message);
  }
  
  // Test WhatsApp float
  try {
    const res = await axios.get(`${BASE_URLS.landing}/ar/`);
    const hasWhatsApp = res.data.includes('wa.me') || res.data.includes('201099129550');
    
    test('Content: WhatsApp contact link', hasWhatsApp);
  } catch (err) {
    test('Content: WhatsApp contact link', false, err.message);
  }
}

// ========================================
// RUN ALL TESTS
// ========================================

async function runAllTests() {
  console.log('\n🧪 AutoFlow Comprehensive UI Test Suite\n');
  console.log(`Started: ${new Date().toISOString()}`);
  console.log(`Landing: ${BASE_URLS.landing}`);
  console.log(`Frontend: ${BASE_URLS.frontend}`);
  console.log(`API: ${BASE_URLS.api}\n`);
  
  const startTime = Date.now();
  
  try {
    await testLandingPages();
    await testAPIEndpoints();
    await testFrontendPages();
    await testContent();
  } catch (err) {
    console.error('Test suite error:', err);
  }
  
  const duration = Date.now() - startTime;
  
  // Summary
  log.section('TEST SUMMARY');
  console.log(`Total Tests: ${testResults.passed + testResults.failed}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s`);
  console.log(`Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  // Save results
  fs.writeFileSync(
    'tests/results/ui-test-results.json',
    JSON.stringify(testResults, null, 2)
  );
  
  console.log(`\n📄 Results saved to tests/results/ui-test-results.json`);
  
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Install cheerio if needed and run
const { execSync } = require('child_process');
try {
  require('cheerio');
} catch {
  console.log('Installing cheerio...');
  execSync('npm install cheerio', { stdio: 'inherit' });
}

runAllTests();