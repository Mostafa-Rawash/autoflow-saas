// AutoFlow Test Utilities
// Comprehensive testing helpers using Papaparse and other tools

const axios = require('axios');
const Papaparse = require('papaparse');
const { faker } = require('@faker-js/faker/locale/ar');
const MockDate = require('mockdate');
const nock = require('nock');
const fs = require('fs');
const path = require('path');

// ========================================
// CONFIGURATION
// ========================================

const config = {
  API_URL: process.env.API_URL || 'http://localhost:5000/api',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3001',
  TIMEOUT: 30000
};

// ========================================
// CSV/DATA UTILITIES (Papaparse)
// ========================================

const CSVUtils = {
  // Parse CSV file
  parseFile: (filePath) => {
    return new Promise((resolve, reject) => {
      const file = fs.readFileSync(filePath, 'utf8');
      Papaparse.parse(file, {
        header: true,
        complete: (results) => resolve(results.data),
        error: (error) => reject(error)
      });
    });
  },
  
  // Parse CSV string
  parse: (csvString) => {
    return Papaparse.parse(csvString, { header: true }).data;
  },
  
  // Convert data to CSV
  stringify: (data) => {
    return Papaparse.unparse(data);
  },
  
  // Export test results to CSV
  exportResults: (results, filename) => {
    const csv = Papaparse.unparse(results);
    fs.writeFileSync(`tests/results/${filename}.csv`, csv);
    return csv;
  },
  
  // Import test data from CSV
  importTestData: async (filename) => {
    return await CSVUtils.parseFile(path.join('tests', 'data', filename));
  }
};

// ========================================
// ARABIC FAKE DATA GENERATOR
// ========================================

const ArabicFaker = {
  // Arabic names
  arabicName: () => {
    const firstNames = ['أحمد', 'محمد', 'علي', 'سارة', 'فاطمة', 'مريم', 'خالد', 'عمر', 'محمود', 'يوسف'];
    const lastNames = ['محمد', 'أحمد', 'علي', 'حسن', 'محمود', 'عبدالله', 'إبراهيم', 'عثمان'];
    
    return {
      firstName: faker.helpers.arrayElement(firstNames),
      lastName: faker.helpers.arrayElement(lastNames),
      fullName: () => `${faker.helpers.arrayElement(firstNames)} ${faker.helpers.arrayElement(lastNames)}`
    };
  },
  
  // Egyptian phone numbers
  egyptianPhone: () => {
    const prefixes = ['010', '011', '012', '015'];
    const prefix = faker.helpers.arrayElement(prefixes);
    const number = faker.string.numeric(8);
    return `+20${prefix}${number}`;
  },
  
  // Arabic business names
  businessName: () => {
    const prefixes = ['مطعم', 'عيادة', 'متجر', 'شركة', 'مكتب', 'مركز'];
    const suffixes = ['السعادة', 'النور', 'الأمل', 'السلام', 'النجاح', 'الراحة'];
    
    return `${faker.helpers.arrayElement(prefixes)} ${faker.helpers.arrayElement(suffixes)}`;
  },
  
  // Arabic addresses
  arabicAddress: () => {
    const cities = ['القاهرة', 'الإسكندرية', 'الجيزة', 'طنطا', 'المحلة', 'المنصورة', 'أسوان'];
    const areas = ['وسط البلد', 'القصر العيني', 'المهندسين', 'الدقي', 'الزمالك', 'مصر الجديدة'];
    
    return {
      city: faker.helpers.arrayElement(cities),
      area: faker.helpers.arrayElement(areas),
      street: `شارع ${faker.location.street()}`,
      building: `عمارة ${faker.number.int({ min: 1, max: 100 })}`,
      floor: `الدور ${faker.number.int({ min: 1, max: 20 })}`
    };
  },
  
  // Arabic messages for testing
  arabicMessage: (intent) => {
    const messages = {
      pricing: ['عايز أعرف الأسعار', 'كام الباقة دي؟', 'قديش الاشتراك؟'],
      booking: ['عايز أحجز موعد', 'متاح بكرة؟', 'في ميعاد فاضي؟'],
      hours: ['متى بتفتحوا؟', 'ساعات الدوام؟', 'فاكس لحد امتى؟'],
      location: ['فين موقعكم؟', 'عايز أوصلكم', 'في فرع في الاسكندرية؟'],
      contact: ['أتواصل معاكم ازاي؟', 'رقم التواصل؟', 'في واتس آب؟'],
      greeting: ['مرحبا', 'أهلا', 'السلام عليكم', 'صباح الخير'],
      support: ['عايز مساعدة', 'عندي مشكلة', 'مش راضي يشتغل']
    };
    
    return faker.helpers.arrayElement(messages[intent] || messages.greeting);
  }
};

// ========================================
// API TESTING UTILITIES
// ========================================

const APITest = {
  // Create authenticated request
  withAuth: async (token) => {
    return axios.create({
      baseURL: config.API_URL,
      headers: { Authorization: `Bearer ${token}` },
      timeout: config.TIMEOUT
    });
  },
  
  // Register test user
  registerTestUser: async () => {
    const email = `test${Date.now()}@autoflow.test`;
    const response = await axios.post(`${config.API_URL}/auth/register`, {
      name: ArabicFaker.arabicName().fullName(),
      email,
      password: 'TestPass123!',
      businessName: ArabicFaker.businessName()
    });
    
    return {
      user: response.data.user,
      token: response.data.token
    };
  },
  
  // Mock external API
  mockAPI: (domain, path, response) => {
    return nock(domain).get(path).reply(200, response);
  },
  
  // Clear all mocks
  clearMocks: () => {
    nock.cleanAll();
  }
};

// ========================================
// TIME TESTING UTILITIES
// ========================================

const TimeTest = {
  // Mock current date
  mockDate: (date) => {
    MockDate.set(date);
  },
  
  // Reset date
  resetDate: () => {
    MockDate.reset();
  },
  
  // Mock specific time
  mockTime: (hour, minute = 0) => {
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    MockDate.set(date);
  },
  
  // Test business hours
  isBusinessHours: () => {
    const hour = new Date().getHours();
    return hour >= 9 && hour < 18;
  }
};

// ========================================
// ASSERTION UTILITIES
// ========================================

const Assertions = {
  // Assert Arabic text
  isArabic: (text) => {
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(text);
  },
  
  // Assert RTL
  isRTL: (element) => {
    return element.dir === 'rtl' || element.style.direction === 'rtl';
  },
  
  // Assert phone format
  isValidEgyptianPhone: (phone) => {
    const pattern = /^(\+20|0)(010|011|012|015)\d{8}$/;
    return pattern.test(phone);
  },
  
  // Assert response time
  isFast: (duration, threshold = 500) => {
    return duration < threshold;
  },
  
  // Assert valid JSON
  isValidJSON: (text) => {
    try {
      JSON.parse(text);
      return true;
    } catch {
      return false;
    }
  },
  
  // Assert API response structure
  hasValidStructure: (response, fields) => {
    return fields.every(field => field in response);
  }
};

// ========================================
// TEST DATA GENERATORS
// ========================================

const TestData = {
  // Generate conversation test data
  generateConversation: () => ({
    id: faker.string.uuid(),
    contact: {
      name: ArabicFaker.arabicName().fullName(),
      phone: ArabicFaker.egyptianPhone()
    },
    channel: 'whatsapp',
    status: faker.helpers.arrayElement(['active', 'pending', 'resolved']),
    lastMessage: {
      content: ArabicFaker.arabicMessage('pricing'),
      timestamp: faker.date.recent()
    }
  }),
  
  // Generate template test data
  generateTemplate: () => ({
    id: faker.string.uuid(),
    name: faker.lorem.words(3),
    content: ArabicFaker.arabicMessage('greeting'),
    category: faker.helpers.arrayElement(['ترحيب', 'معلومات', 'حجز', 'متابعة']),
    variables: ['{business_name}', '{customer_name}']
  }),
  
  // Generate auto-reply test data
  generateAutoReply: () => ({
    id: faker.string.uuid(),
    name: `رد ${faker.word.noun()}`,
    keywords: [ArabicFaker.arabicMessage('pricing').split(' ')[0]],
    response: ArabicFaker.arabicMessage('pricing'),
    matchType: faker.helpers.arrayElement(['exact', 'contains', 'startsWith']),
    active: true
  }),
  
  // Generate bulk test data
  generateBulk: (generator, count) => {
    return Array.from({ length: count }, generator);
  },
  
  // Export to CSV
  exportToCSV: (data, filename) => {
    return CSVUtils.exportResults(data, filename);
  }
};

// ========================================
// PERFORMANCE TESTING
// ========================================

const PerformanceTest = {
  // Measure execution time
  measureTime: async (fn) => {
    const start = process.hrtime.bigint();
    await fn();
    const end = process.hrtime.bigint();
    return Number(end - start) / 1_000_000; // Convert to milliseconds
  },
  
  // Run concurrent requests
  concurrentRequests: async (requestFn, count) => {
    const promises = Array.from({ length: count }, requestFn);
    const start = Date.now();
    await Promise.all(promises);
    return Date.now() - start;
  },
  
  // Memory usage check
  checkMemory: () => {
    const used = process.memoryUsage();
    return {
      rss: Math.round(used.rss / 1024 / 1024),
      heapTotal: Math.round(used.heapTotal / 1024 / 1024),
      heapUsed: Math.round(used.heapUsed / 1024 / 1024),
      external: Math.round(used.external / 1024 / 1024)
    };
  }
};

// ========================================
// REPORT GENERATOR
// ========================================

const ReportGenerator = {
  // Generate test report
  generate: (results) => {
    const timestamp = new Date().toISOString();
    const report = {
      timestamp,
      summary: {
        total: results.passed + results.failed + results.skipped,
        passed: results.passed,
        failed: results.failed,
        skipped: results.skipped,
        duration: results.duration
      },
      tests: results.tests,
      coverage: results.coverage || 'N/A'
    };
    
    // Export to CSV
    CSVUtils.exportResults([report.summary], `test-summary-${Date.now()}`);
    
    return report;
  },
  
  // Generate markdown report
  generateMarkdown: (results) => {
    return `# AutoFlow Test Report
    
**Generated:** ${new Date().toISOString()}

## Summary

| Metric | Value |
|--------|-------|
| Total Tests | ${results.passed + results.failed + results.skipped} |
| Passed | ${results.passed} |
| Failed | ${results.failed} |
| Skipped | ${results.skipped} |
| Duration | ${results.duration}ms |
| Success Rate | ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}% |

## Test Results

${results.tests.map(t => `- ${t.status === 'PASS' ? '✅' : '❌'} ${t.name}`).join('\n')}
`;
  }
};

// ========================================
// EXPORTS
// ========================================

module.exports = {
  config,
  CSVUtils,
  ArabicFaker,
  APITest,
  TimeTest,
  Assertions,
  TestData,
  PerformanceTest,
  ReportGenerator,
  faker
};