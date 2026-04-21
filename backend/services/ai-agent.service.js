const agentRepo = require('../repositories/agent.repo');
const knowledgeService = require('./knowledge.service');
const memoryService = require('./memory.service');
const analyticsService = require('./analytics.service');

async function buildPrompt({ basePrompt, knowledge, memory, message }) {
  const knowledgeBlock = knowledge.map((k, idx) => `[#${idx + 1}] ${k.content}`).join('\n\n');
  const memoryBlock = memory.map((m) => JSON.stringify(m.memory_value)).join('\n');
  return [
    basePrompt || '',
    '--- MEMORY ---',
    memoryBlock,
    '--- KNOWLEDGE ---',
    knowledgeBlock,
    '--- USER MESSAGE ---',
    message
  ].join('\n');
}

async function callProviderMock(prompt) {
  return {
    text: `MOCK_AI_RESPONSE:\n${prompt.slice(0, 500)}`,
    inputTokens: Math.ceil(prompt.length / 4),
    outputTokens: 120,
    costUsd: 0.002
  };
}

async function getPromptBase(organizationId, agentId) {
  try {
    const promptVersion = await agentRepo.getActivePromptVersion(organizationId, agentId);
    return promptVersion?.content || 'You are a helpful AI assistant.';
  } catch (error) {
    return 'You are a helpful AI assistant.';
  }
}

async function runAgent({ organizationId, agentId, conversationId, messageId, message, category, language }) {
  const agent = await agentRepo.findAgentById(organizationId, agentId);
  if (!agent) throw new Error('Agent not found');

  const basePrompt = await getPromptBase(organizationId, agentId);
  const memory = await memoryService.retrieveMemory(organizationId, agentId, conversationId);

  const queryVector = knowledgeService.mockEmbedding(message);
  const knowledge = await knowledgeService.searchKnowledge({
    organizationId,
    queryVector,
    category: category || null,
    language: language || null,
    limit: 6
  });

  const prompt = await buildPrompt({
    basePrompt,
    knowledge,
    memory,
    message
  });

  const ai = await callProviderMock(prompt);
  const runLog = await analyticsService.logAIRequest(organizationId, {
    userId: null,
    agentId,
    conversationId,
    requestType: 'agent_message',
    provider: 'mock',
    modelName: 'mock-model',
    status: 'succeeded',
    latencyMs: 20,
    inputTokens: ai.inputTokens,
    outputTokens: ai.outputTokens,
    costUsd: ai.costUsd,
    metadata: { messageId, knowledgeHits: knowledge.length }
  });

  return {
    answer: ai.text,
    knowledge,
    memory,
    runLog,
    tokens: {
      input: ai.inputTokens,
      output: ai.outputTokens
    },
    costUsd: ai.costUsd
  };
}

module.exports = {
  buildPrompt,
  callProviderMock,
  runAgent
};
