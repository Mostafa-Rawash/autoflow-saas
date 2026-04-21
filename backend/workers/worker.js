require('dotenv').config();
const { Worker } = require('bullmq');
const { connection } = require('../queues/queue');
const messageRepo = require('../repositories/message.repo');
const conversationRepo = require('../repositories/conversation.repo');
const aiAgentService = require('../services/ai-agent.service');
const memoryService = require('../services/memory.service');

const worker = new Worker(
  'message-processing',
  async (job) => {
    const { organizationId, conversationId, agentId, messageId, message, category, language } = job.data;

    const response = await aiAgentService.runAgent({
      organizationId,
      agentId,
      conversationId,
      messageId,
      message,
      category,
      language
    });

    const saved = await messageRepo.createMessage(organizationId, {
      conversationId,
      senderType: 'agent',
      messageType: 'text',
      content: response.answer,
      contentJson: { citations: response.knowledge },
      status: 'sent',
      modelName: 'mock-model',
      tokenUsage: response.tokens,
      metadata: { costUsd: response.costUsd, source: 'worker' }
    });

    await conversationRepo.updateConversationLastMessage(organizationId, conversationId, {
      lastMessageAt: new Date(),
      preview: response.answer.slice(0, 120),
      unreadCount: 0
    });

    await memoryService.storeMemory(organizationId, {
      agentId,
      conversationId,
      memoryType: 'episodic',
      memoryKey: `last_reply:${messageId}`,
      memoryValue: { response: response.answer.slice(0, 500) },
      sourceMessageId: messageId,
      confidenceScore: 0.7,
      isPinned: false
    });

    return {
      response,
      savedMessageId: saved.id
    };
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log(`job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`job ${job?.id} failed`, err.message);
});

module.exports = worker;
