const analyticsRepo = require('../repositories/analytics.repo');

async function logAIRequest(organizationId, data) {
  const logged = await analyticsRepo.logRequest(organizationId, data);
  await analyticsRepo.upsertDailyUsage(organizationId, new Date().toISOString().slice(0, 10), {
    provider: data.provider || 'mock',
    modelName: data.modelName || 'mock-model',
    inputTokens: data.inputTokens || 0,
    outputTokens: data.outputTokens || 0,
    costUsd: data.costUsd || 0,
    requestCount: 1
  });
  return logged;
}

module.exports = {
  logAIRequest
};
