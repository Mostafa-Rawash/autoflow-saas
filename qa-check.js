const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const results = {
  timestamp: new Date().toISOString(),
  checks: []
};

function runCheck(name, fn) {
  console.log(`\n🔍 Running: ${name}`);
  try {
    const result = fn();
    results.checks.push({
      name,
      status: 'pass',
      ...result
    });
    console.log(`✅ ${name}: PASSED`);
    return true;
  } catch (error) {
    results.checks.push({
      name,
      status: 'fail',
      error: error.message
    });
    console.log(`❌ ${name}: FAILED - ${error.message}`);
    return false;
  }
}

// 1. Frontend Build Check
runCheck('Frontend Build', () => {
  const frontendDir = path.join(__dirname, 'frontend/frontend');
  execSync('npm run build', { cwd: frontendDir, stdio: 'pipe' });
  const buildDir = path.join(frontendDir, 'build');
  if (!fs.existsSync(buildDir)) throw new Error('Build directory not created');
  return { output: 'Build successful' };
});

// 2. Backend Syntax Check
runCheck('Backend Syntax', () => {
  const backendDir = path.join(__dirname, 'frontend/backend');
  const files = ['server.js', 'routes/auth.js', 'routes/conversations.js', 'routes/channels.js', 'routes/analytics.js'];
  for (const file of files) {
    execSync(`node --check ${file}`, { cwd: backendDir, stdio: 'pipe' });
  }
  return { output: 'All backend files have valid syntax' };
});

// 3. WhatsApp Service Check
runCheck('WhatsApp Service', () => {
  const waDir = path.join(__dirname, 'whatsapp-service/src');
  const files = ['conversation-manager.js', 'app.js', 'server.js'];
  for (const file of files) {
    execSync(`node --check ${file}`, { cwd: waDir, stdio: 'pipe' });
  }
  return { output: 'WhatsApp service files valid' };
});

// 4. Landing Pages Check
runCheck('Landing Pages', () => {
  const landingDir = path.join(__dirname, 'landing-pages/src');
  const files = fs.readdirSync(landingDir).filter(f => f.endsWith('.js'));
  return { output: `${files.length} landing page generators found` };
});

// 5. Environment Variables Check
runCheck('Environment Config', () => {
  const envExample = path.join(__dirname, 'frontend/backend/.env.example');
  if (fs.existsSync(envExample)) {
    const content = fs.readFileSync(envExample, 'utf8');
    const vars = content.split('\n').filter(line => line.includes('='));
    return { output: `${vars.length} env vars documented` };
  }
  return { output: 'No .env.example found (using defaults)' };
});

// 6. Package Dependencies Check
runCheck('Dependencies', () => {
  const frontendPkg = require('./frontend/frontend/package.json');
  const backendPkg = require('./frontend/backend/package.json');
  return { 
    output: `Frontend: ${Object.keys(frontendPkg.dependencies || {}).length} deps, Backend: ${Object.keys(backendPkg.dependencies || {}).length} deps`
  };
});

// 7. Model Schema Check
runCheck('Database Models', () => {
  const modelsDir = path.join(__dirname, 'frontend/backend/models');
  const models = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js'));
  return { output: `${models.length} models found: ${models.join(', ')}` };
});

// 8. Routes Check
runCheck('API Routes', () => {
  const routesDir = path.join(__dirname, 'frontend/backend/routes');
  const routes = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));
  return { output: `${routes.length} routes found: ${routes.join(', ')}` };
});

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 QA CHECK SUMMARY');
console.log('='.repeat(50));

const passed = results.checks.filter(c => c.status === 'pass').length;
const failed = results.checks.filter(c => c.status === 'fail').length;

console.log(`\n✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📋 Total: ${results.checks.length}`);
console.log(`\n📈 Pass Rate: ${Math.round((passed / results.checks.length) * 100)}%`);

// Write results to file
fs.writeFileSync(
  path.join(__dirname, 'qa-results.json'),
  JSON.stringify(results, null, 2)
);

console.log('\n💾 Results saved to qa-results.json');

// Exit with error code if any checks failed
process.exit(failed > 0 ? 1 : 0);