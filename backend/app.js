require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { healthcheck, withClient, setTenant } = require('./db');
const authMiddleware = require('./middleware/auth');
const tenantMiddleware = require('./middleware/tenant');
const idempotencyMiddleware = require('./middleware/idempotency');
const { enqueueMessage } = require('./queues/queue');
const messageRepo = require('./repositories/message.repo');
const conversationRepo = require('./repositories/conversation.repo');
const agentRepo = require('./repositories/agent.repo');
const conversationService = require('./services/conversation.service');

const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }));

app.get('/health', async (req, res) => {
  const db = await healthcheck();
  res.json({ ok: true, db });
});

app.post('/api/messages/inbound', authMiddleware, tenantMiddleware, idempotencyMiddleware, async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { contactId, channelType, content, externalId, category, language, assignedAgentId } = req.body;

    const { conversation, message } = await withClient(async (client) => {
      await setTenant(client, organizationId);
      return conversationService.receiveInboundMessage(organizationId, {
        contactId,
        channelType,
        content,
        externalId,
        assignedAgentId,
        metadata: { channel: channelType, category, language }
      });
    });

    const effectiveAgentId = conversation.assigned_agent_id || conversation.assignedAgentId || assignedAgentId || null;

    await enqueueMessage({
      organizationId,
      conversationId: conversation.id,
      agentId: effectiveAgentId,
      messageId: message.id,
      message: content,
      category,
      language
    });

    res.status(202).json({ queued: true, conversationId: conversation.id, messageId: message.id, agentId: effectiveAgentId });
  } catch (error) {
    next(error);
  }
});

app.get('/api/conversations', authMiddleware, tenantMiddleware, async (req, res, next) => {
  try {
    const conversations = await conversationRepo.listConversations(req.organizationId, 50, 0);
    res.json({ data: conversations });
  } catch (error) {
    next(error);
  }
});

app.get('/api/conversations/:id/messages', authMiddleware, tenantMiddleware, async (req, res, next) => {
  try {
    const messages = await messageRepo.listMessages(req.organizationId, req.params.id, 100, 0);
    res.json({ data: messages });
  } catch (error) {
    next(error);
  }
});

app.get('/api/agents/:id', authMiddleware, tenantMiddleware, async (req, res, next) => {
  try {
    const agent = await agentRepo.findAgentById(req.organizationId, req.params.id);
    if (!agent) return res.status(404).json({ error: 'Not found' });
    res.json({ data: agent });
  } catch (error) {
    next(error);
  }
});

app.use('/api/ai-agents', require('./routes/ai-agents'));
app.use('/api/prompts', require('./routes/prompts'));
app.use('/api/knowledge', require('./routes/knowledge'));
app.use('/api/tool-logs', require('./routes/tool-logs'));
app.use('/api/feedback', require('./routes/feedback'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const port = Number(process.env.PORT || 5000);
app.listen(port, () => {
  console.log(`backend listening on ${port}`);
});

module.exports = app;
