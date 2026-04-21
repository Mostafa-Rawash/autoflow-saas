const { getJson, setJson } = require('../utils/cache');
const agentRepo = require('../repositories/agent.repo');
const knowledgeRepo = require('../repositories/knowledge.repo');

async function getCachedAgent(organizationId, agentId) {
  const key = `agent:${organizationId}:${agentId}`;
  const cached = await getJson(key);
  if (cached) return cached;
  const agent = await agentRepo.findAgentById(organizationId, agentId);
  if (agent) await setJson(key, agent, 300);
  return agent;
}

async function getCachedPromptVersion(organizationId, agentId) {
  const key = `prompt:${organizationId}:${agentId}`;
  const cached = await getJson(key);
  if (cached) return cached;
  const prompt = await agentRepo.getActivePromptVersion(organizationId, agentId);
  if (prompt) await setJson(key, prompt, 300);
  return prompt;
}

async function getCachedKbSearch(organizationId, category, language, queryVector, searchFn) {
  const key = `kb:${organizationId}:${category || 'all'}:${language || 'all'}:${String(queryVector).slice(0, 64)}`;
  const cached = await getJson(key);
  if (cached) return cached;
  const result = await searchFn();
  await setJson(key, result, 120);
  return result;
}

module.exports = {
  getCachedAgent,
  getCachedPromptVersion,
  getCachedKbSearch
};
