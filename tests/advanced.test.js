// AutoFlow Advanced Test Suite
// Using Papaparse and other testing utilities

const assert = require('assert');
const {
  CSVUtils,
  ArabicFaker,
  APITest,
  Assertions,
  TestData,
  PerformanceTest,
  ReportGenerator
} = require('./utils');

// Test Configuration
const config = {
  timeout: 30000
};

// Test Results
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: [],
  startTime: Date.now()
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

// ========================================
// CSV/PAPAPARSE TESTS
// ========================================

async function testCSVUtils() {
  log.section('CSV Utilities Tests (Papaparse)');
  
  await test('Parse CSV file', async () => {
    const data = await CSVUtils.parseFile('tests/data/test-users.csv');
    assert(Array.isArray(data), 'Result should be array');
    assert(data.length === 5, 'Should have 5 users');
    assert(data[0].name, 'First user should have name');
  });
  
  await test('Parse CSV string', async () => {
    const csv = 'name,email\nأحمد,ahmed@test.com';
    const data = CSVUtils.parse(csv);
    assert(data[0].name === 'أحمد', 'Should parse Arabic text');
  });
  
  await test('Stringify to CSV', async () => {
    const data = [{ name: 'Test', email: 'test@test.com' }];
    const csv = CSVUtils.stringify(data);
    assert(csv.includes('name,email'), 'Should have headers');
    assert(csv.includes('Test'), 'Should have data');
  });
  
  await test('Import test auto-replies', async () => {
    const data = await CSVUtils.importTestData('test-auto-replies.csv');
    assert(data.length === 5, 'Should have 5 auto-replies');
    assert(data[0].keywords, 'Should have keywords');
  });
  
  await test('Import test templates', async () => {
    const data = await CSVUtils.importTestData('test-templates.csv');
    assert(data.length === 5, 'Should have 5 templates');
    assert(data[0].variables, 'Should have variables');
  });
}

// ========================================
// ARABIC DATA GENERATOR TESTS
// ========================================

async function testArabicFaker() {
  log.section('Arabic Faker Tests');
  
  await test('Generate Arabic name', async () => {
    const name = ArabicFaker.arabicName();
    assert(Assertions.isArabic(name.firstName), 'First name should be Arabic');
    assert(Assertions.isArabic(name.lastName), 'Last name should be Arabic');
    assert(Assertions.isArabic(name.fullName()), 'Full name should be Arabic');
  });
  
  await test('Generate Egyptian phone', async () => {
    const phone = ArabicFaker.egyptianPhone();
    assert(Assertions.isValidEgyptianPhone(phone), 'Should be valid Egyptian phone');
  });
  
  await test('Generate business name', async () => {
    const business = ArabicFaker.businessName();
    assert(Assertions.isArabic(business), 'Business name should be Arabic');
  });
  
  await test('Generate Arabic address', async () => {
    const address = ArabicFaker.arabicAddress();
    assert(Assertions.isArabic(address.city), 'City should be Arabic');
    assert(Assertions.isArabic(address.area), 'Area should be Arabic');
  });
  
  await test('Generate Arabic message by intent', async () => {
    const pricingMsg = ArabicFaker.arabicMessage('pricing');
    assert(Assertions.isArabic(pricingMsg), 'Pricing message should be Arabic');
    
    const bookingMsg = ArabicFaker.arabicMessage('booking');
    assert(Assertions.isArabic(bookingMsg), 'Booking message should be Arabic');
  });
}

// ========================================
// ASSERTION TESTS
// ========================================

async function testAssertions() {
  log.section('Assertion Tests');
  
  await test('Arabic text detection', async () => {
    assert(Assertions.isArabic('مرحبا'), 'Should detect Arabic');
    assert(!Assertions.isArabic('Hello'), 'Should not detect non-Arabic');
  });
  
  await test('Egyptian phone validation', async () => {
    const phone = ArabicFaker.egyptianPhone();
    assert(Assertions.isValidEgyptianPhone(phone), `${phone} should be valid`);
    assert(!Assertions.isValidEgyptianPhone('+201234567890'), 'Should be invalid');
  });
  
  await test('JSON validation', async () => {
    assert(Assertions.isValidJSON('{"test": true}'), 'Should be valid JSON');
    assert(!Assertions.isValidJSON('not json'), 'Should be invalid');
  });
  
  await test('Response time assertion', async () => {
    assert(Assertions.isFast(100, 500), '100ms should be fast');
    assert(!Assertions.isFast(1000, 500), '1000ms should not be fast');
  });
}

// ========================================
// TEST DATA GENERATOR TESTS
// ========================================

async function testTestDataGenerators() {
  log.section('Test Data Generator Tests');
  
  await test('Generate conversation data', async () => {
    const conv = TestData.generateConversation();
    assert(conv.id, 'Should have ID');
    assert(Assertions.isArabic(conv.contact.name), 'Contact name should be Arabic');
    assert(Assertions.isValidEgyptianPhone(conv.contact.phone), 'Phone should be valid');
  });
  
  await test('Generate template data', async () => {
    const template = TestData.generateTemplate();
    assert(template.id, 'Should have ID');
    assert(template.variables, 'Should have variables');
  });
  
  await test('Generate auto-reply data', async () => {
    const reply = TestData.generateAutoReply();
    assert(reply.id, 'Should have ID');
    assert(reply.keywords, 'Should have keywords');
  });
  
  await test('Generate bulk data', async () => {
    const users = TestData.generateBulk(TestData.generateConversation, 10);
    assert(users.length === 10, 'Should generate 10 items');
  });
}

// ========================================
// PERFORMANCE TESTS
// ========================================

async function testPerformance() {
  log.section('Performance Tests');
  
  await test('Measure execution time', async () => {
    const duration = await PerformanceTest.measureTime(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    assert(duration >= 50, 'Should measure at least 50ms');
    assert(duration < 200, 'Should not exceed 200ms');
  });
  
  await test('Check memory usage', async () => {
    const memory = PerformanceTest.checkMemory();
    assert(memory.rss > 0, 'Should have RSS memory');
    assert(memory.heapUsed > 0, 'Should have heap usage');
    console.log(`  Memory: RSS=${memory.rss}MB, Heap=${memory.heapUsed}MB`);
  });
}

// ========================================
// RUN ALL TESTS
// ========================================

async function runAllTests() {
  console.log('\n🧪 AutoFlow Advanced Test Suite\n');
  console.log(`Started: ${new Date().toISOString()}\n`);
  
  try {
    await testCSVUtils();
    await testArabicFaker();
    await testAssertions();
    await testTestDataGenerators();
    await testPerformance();
  } catch (err) {
    log.error(`Test suite error: ${err.message}`);
  }
  
  // Calculate duration
  results.duration = Date.now() - results.startTime;
  
  // Generate report
  const report = ReportGenerator.generate(results);
  
  // Summary
  log.section('Test Summary');
  console.log(`Total: ${results.passed + results.failed + results.skipped}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⏭️  Skipped: ${results.skipped}`);
  console.log(`⏱️  Duration: ${(results.duration / 1000).toFixed(2)}s`);
  console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  // Export results
  CSVUtils.exportResults(results.tests, `test-results-${Date.now()}`);
  console.log(`\n📄 Results exported to tests/results/`);
  
  // Exit code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests();