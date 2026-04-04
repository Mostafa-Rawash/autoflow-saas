const axios = require('axios');

const services = [
  { name: 'Landing Pages', url: 'http://52.249.222.161:8080/health', expected: 200 },
  { name: 'Dashboard', url: 'http://52.249.222.161:8081', expected: 200 },
  { name: 'Backend API', url: 'http://52.249.222.161:5000/health', expected: 200 }
];

async function checkServices() {
  console.log('🏥 AutoFlow Services Health Check\n');
  console.log('Time:', new Date().toISOString());
  console.log('━'.repeat(50));
  
  const results = [];
  
  for (const service of services) {
    const result = { name: service.name, status: 'unknown' };
    
    try {
      const response = await axios.get(service.url, { timeout: 5000 });
      if (response.status === service.expected) {
        result.status = 'healthy';
        result.response = `${response.status} - ${response.statusText}`;
        console.log(`✅ ${service.name}: HEALTHY (${result.response})`);
      } else {
        result.status = 'unhealthy';
        result.response = `${response.status} - ${response.statusText}`;
        console.log(`⚠️  ${service.name}: UNHEALTHY (${result.response})`);
      }
    } catch (error) {
      result.status = 'down';
      result.error = error.message;
      console.log(`❌ ${service.name}: DOWN (${error.message})`);
    }
    
    results.push(result);
  }
  
  console.log('━'.repeat(50));
  
  const healthy = results.filter(r => r.status === 'healthy').length;
  const total = results.length;
  
  console.log(`\n📊 Summary: ${healthy}/${total} services healthy (${Math.round((healthy/total)*100)}% uptime)\n`);
  
  return {
    timestamp: new Date().toISOString(),
    healthy: healthy,
    total: total,
    uptime: Math.round((healthy/total)*100),
    services: results
  };
}

// Run the check
checkServices().then(results => {
  process.exit(results.healthy === results.total ? 0 : 1);
}).catch(err => {
  console.error('Health check failed:', err);
  process.exit(1);
});