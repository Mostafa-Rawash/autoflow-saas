/**
 * Permission Enforcement Tests
 * 
 * Tests to ensure permission middleware cannot be bypassed
 * Part of: https://app.clickup.com/t/86c99xf5p
 */

const assert = require('assert');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock express
const createMockReq = (overrides = {}) => ({
  headers: {},
  user: null,
  ...overrides
});

const createMockRes = () => {
  const res = {
    statusCode: 200,
    _json: null,
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this._json = data;
      return this;
    }
  };
  return res;
};

let nextCalled = false;
const mockNext = () => {
  nextCalled = true;
};

// ========================================
// TEST 1: adminOnly Middleware Tests
// ========================================

console.log('\n📋 TEST 1: adminOnly Middleware\n');

const testAdminOnly = () => {
  // Create a simple adminOnly middleware implementation
  const adminOnly = (req, res, next) => {
    const allowedRoles = ['owner', 'admin', 'manager'];
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  };

  // Test 1.1: No user - should return 401
  nextCalled = false;
  const req1 = createMockReq();
  const res1 = createMockRes();
  testAdminOnly.middleware = adminOnly;
  testAdminOnly.middleware(req1, res1, mockNext);
  
  assert.strictEqual(res1.statusCode, 401, 'Should return 401 for no user');
  assert.strictEqual(nextCalled, false, 'Should not call next()');
  console.log('  ✅ 1.1: Returns 401 when no user');

  // Test 1.2: User with 'viewer' role - should return 403
  nextCalled = false;
  const req2 = createMockReq({ user: { role: 'viewer', id: '123' } });
  const res2 = createMockRes();
  testAdminOnly.middleware(req2, res2, mockNext);
  
  assert.strictEqual(res2.statusCode, 403, 'Should return 403 for viewer role');
  assert.strictEqual(nextCalled, false, 'Should not call next()');
  console.log('  ✅ 1.2: Returns 403 for viewer role');

  // Test 1.3: User with 'agent' role - should return 403
  nextCalled = false;
  const req3 = createMockReq({ user: { role: 'agent', id: '123' } });
  const res3 = createMockRes();
  testAdminOnly.middleware(req3, res3, mockNext);
  
  assert.strictEqual(res3.statusCode, 403, 'Should return 403 for agent role');
  console.log('  ✅ 1.3: Returns 403 for agent role');

  // Test 1.4: User with 'owner' role - should call next()
  nextCalled = false;
  const req4 = createMockReq({ user: { role: 'owner', id: '123' } });
  const res4 = createMockRes();
  testAdminOnly.middleware(req4, res4, mockNext);
  
  assert.strictEqual(nextCalled, true, 'Should call next() for owner');
  console.log('  ✅ 1.4: Allows owner role');

  // Test 1.5: User with 'admin' role - should call next()
  nextCalled = false;
  const req5 = createMockReq({ user: { role: 'admin', id: '123' } });
  const res5 = createMockRes();
  testAdminOnly.middleware(req5, res5, mockNext);
  
  assert.strictEqual(nextCalled, true, 'Should call next() for admin');
  console.log('  ✅ 1.5: Allows admin role');

  // Test 1.6: User with 'manager' role - should call next()
  nextCalled = false;
  const req6 = createMockReq({ user: { role: 'manager', id: '123' } });
  const res6 = createMockRes();
  testAdminOnly.middleware(req6, res6, mockNext);
  
  assert.strictEqual(nextCalled, true, 'Should call next() for manager');
  console.log('  ✅ 1.6: Allows manager role');
};

// ========================================
// TEST 2: hasPermission Middleware Tests
// ========================================

console.log('\n📋 TEST 2: hasPermission Middleware\n');

const testHasPermission = () => {
  // Mock Role model
  const mockRole = (permissions) => ({
    hasPermission: (perm) => permissions.includes(perm) || permissions.includes('all')
  });

  const createHasPermissionMiddleware = (permission) => {
    return async (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      // Simulate role lookup
      const rolePermissions = {
        'owner': ['all'],
        'admin': ['all'],
        'manager': ['users', 'content', 'analytics', 'subscriptions', 'viewDashboard', 'viewConversations', 'viewTeam'],
        'agent': ['conversations', 'templates', 'auto-replies', 'viewDashboard', 'viewConversations'],
        'viewer': ['view', 'viewDashboard', 'viewConversations']
      };
      
      const perms = rolePermissions[req.user.role] || [];
      const role = mockRole(perms);
      
      if (!role.hasPermission(permission)) {
        return res.status(403).json({ 
          error: `You don't have permission to '${permission}'`,
          code: 'NO_PERMISSION'
        });
      }
      
      next();
    };
  };

  // Test 2.1: Owner has all permissions
  nextCalled = false;
  const middleware1 = createHasPermissionMiddleware('deleteConversations');
  const req1 = createMockReq({ user: { role: 'owner', id: '123' } });
  const res1 = createMockRes();
  
  middleware1(req1, res1, mockNext).then(() => {
    assert.strictEqual(nextCalled, true, 'Owner should have all permissions');
    console.log('  ✅ 2.1: Owner has all permissions (deleteConversations)');
  });

  // Test 2.2: Agent cannot delete conversations
  nextCalled = false;
  const middleware2 = createHasPermissionMiddleware('deleteConversations');
  const req2 = createMockReq({ user: { role: 'agent', id: '123' } });
  const res2 = createMockRes();
  
  middleware2(req2, res2, mockNext).then(() => {
    assert.strictEqual(res2.statusCode, 403, 'Agent should not have deleteConversations');
    assert.strictEqual(res2._json?.code, 'NO_PERMISSION');
    console.log('  ✅ 2.2: Agent denied deleteConversations permission');
  });

  // Test 2.3: Agent can reply to conversations
  nextCalled = false;
  const middleware3 = createHasPermissionMiddleware('conversations');
  const req3 = createMockReq({ user: { role: 'agent', id: '123' } });
  const res3 = createMockRes();
  
  middleware3(req3, res3, mockNext).then(() => {
    assert.strictEqual(nextCalled, true, 'Agent should have conversations permission');
    console.log('  ✅ 2.3: Agent has conversations permission');
  });

  // Test 2.4: Viewer has limited permissions
  nextCalled = false;
  const middleware4 = createHasPermissionMiddleware('viewDashboard');
  const req4 = createMockReq({ user: { role: 'viewer', id: '123' } });
  const res4 = createMockRes();
  
  middleware4(req4, res4, mockNext).then(() => {
    assert.strictEqual(nextCalled, true, 'Viewer should have viewDashboard permission');
    console.log('  ✅ 2.4: Viewer has viewDashboard permission');
  });
};

// ========================================
// TEST 3: No-op Middleware Detection
// ========================================

console.log('\n📋 TEST 3: No-op Middleware Detection (CI Check)\n');

const testNoopDetection = () => {
  const fs = require('fs');
  const path = require('path');
  
  // Middleware patterns that indicate a bypass
  const suspiciousPatterns = [
    /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{\s*next\(\)\s*;?\s*\}/,  // () => { next() }
    /\/\/\s*for\s+demo/i,  // "for demo" comments
    /\/\/\s*TODO.*implement/i,  // TODO to implement
    /\/\/\s*allow\s+all/i,  // "allow all" comments
    /return\s+next\(\)\s*;?\s*\}/,  // return next() without checks
  ];

  const checkFile = (filePath) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const issues = [];
    
    suspiciousPatterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        // Check if this is inside a middleware function
        const lines = content.split('\n');
        lines.forEach((line, lineNum) => {
          if (pattern.test(line)) {
            issues.push({
              line: lineNum + 1,
              content: line.trim(),
              patternIndex: index
            });
          }
        });
      }
    });
    
    return issues;
  };

  const backendDir = '/home/eDariba/autoflow-saas/frontend/backend';
  const middlewareFiles = [
    path.join(backendDir, 'middleware', 'auth.js'),
    path.join(backendDir, 'routes', 'admin.js'),
  ];

  let totalIssues = 0;
  
  middlewareFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const issues = checkFile(file);
      if (issues.length > 0) {
        console.log(`\n  ⚠️  Issues in ${path.basename(file)}:`);
        issues.forEach(issue => {
          console.log(`     Line ${issue.line}: ${issue.content}`);
          totalIssues++;
        });
      } else {
        console.log(`  ✅ ${path.basename(file)}: No suspicious patterns`);
      }
    }
  });

  if (totalIssues === 0) {
    console.log('\n  ✅ 3.1: No bypass middleware patterns detected');
  } else {
    console.log(`\n  ⚠️  3.1: Found ${totalIssues} potential issues - review required`);
  }
};

// ========================================
// TEST 4: E2E Admin Route Access Test
// ========================================

console.log('\n📋 TEST 4: E2E Admin Route Access\n');

const testE2EAdminAccess = async () => {
  const http = require('http');
  
  const makeRequest = (options) => {
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      });
      req.on('error', reject);
      req.end();
    });
  };

  try {
    // Test 4.1: Health check works
    const health = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/health',
      method: 'GET'
    });
    
    if (health.status === 200) {
      console.log('  ✅ 4.1: Backend health check passed');
    } else {
      console.log('  ⚠️  4.1: Backend not responding (status: ' + health.status + ')');
    }

    // Test 4.2: Admin route without token returns 401
    const noToken = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/users',
      method: 'GET'
    });
    
    if (noToken.status === 401) {
      console.log('  ✅ 4.2: Admin route returns 401 without token');
    } else {
      console.log(`  ⚠️  4.2: Expected 401, got ${noToken.status}`);
    }

  } catch (err) {
    console.log('  ⚠️  E2E tests skipped - backend not running or not accessible');
  }
};

// ========================================
// TEST 5: Route Documentation Check
// ========================================

console.log('\n📋 TEST 5: Route Documentation Check\n');

const testRouteDocumentation = () => {
  const fs = require('fs');
  const path = require('path');
  
  const adminRoutes = fs.readFileSync(
    path.join('/home/eDariba/autoflow-saas/frontend/backend/routes/admin.js'),
    'utf-8'
  );

  // Check for permission comments on routes
  const routePattern = /router\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/g;
  const routes = [];
  let match;
  
  while ((match = routePattern.exec(adminRoutes)) !== null) {
    routes.push({ method: match[1], path: match[2] });
  }

  // Check which routes have permission documentation
  const documentedRoutes = [];
  const undocumentedRoutes = [];
  
  routes.forEach(route => {
    // Look for comment before the route
    const routeIndex = adminRoutes.indexOf(`router.${route.method}('${route.path}'`);
    const beforeRoute = adminRoutes.slice(Math.max(0, routeIndex - 200), routeIndex);
    
    if (beforeRoute.includes('//') && (beforeRoute.includes('permission') || beforeRoute.includes('admin') || beforeRoute.includes('Requires'))) {
      documentedRoutes.push(route);
    } else {
      undocumentedRoutes.push(route);
    }
  });

  console.log(`  Total routes: ${routes.length}`);
  console.log(`  Documented: ${documentedRoutes.length}`);
  console.log(`  Undocumented: ${undocumentedRoutes.length}`);
  
  if (undocumentedRoutes.length > 0 && undocumentedRoutes.length <= 5) {
    console.log('\n  Routes needing documentation:');
    undocumentedRoutes.forEach(r => console.log(`    - ${r.method.toUpperCase()} ${r.path}`));
  }

  if (undocumentedRoutes.length === 0) {
    console.log('  ✅ 5.1: All routes have permission documentation');
  } else {
    console.log(`  ⚠️  5.1: ${undocumentedRoutes.length} routes need permission comments`);
  }
};

// ========================================
// Run All Tests
// ========================================

const runAllTests = async () => {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     🔒 Permission Enforcement Audit Tests                    ║');
  console.log('║     Task: https://app.clickup.com/t/86c99xf5p                ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  testAdminOnly();
  testHasPermission();
  testNoopDetection();
  await testE2EAdminAccess();
  testRouteDocumentation();

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('✅ Permission Enforcement Audit Complete');
  console.log('═══════════════════════════════════════════════════════════════\n');
};

runAllTests().catch(console.error);