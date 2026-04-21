const conversationRepo = require('../repositories/conversation.repo');
const messageRepo = require('../repositories/message.repo');

async function receiveInboundMessage(organizationId, payload) {
  const conversation = await conversationRepo.upsertConversation(organizationId, {
    contactId: payload.contactId,
    channelType: payload.channelType,
    assignedUserId: payload.assignedUserId || null,
    assignedAgentId: payload.assignedAgentId || null,
    lastMessageAt: new Date(),
    lastMessagePreview: payload.content.slice(0, 120),
    unreadCount: 1,
    state: payload.state || {},
    metadata: payload.metadata || {}
  });

  const message = await messageRepo.createMessage(organizationId, {
    conversationId: conversation.id,
    contactId: payload.contactId,
    senderType: 'contact',
    messageType: payload.messageType || 'text',
    content: payload.content,
    externalId: payload.externalId || null,
    status: 'received',
    metadata: payload.metadata || {}
  });

  return { conversation, message };
}

module.exports = {
  receiveInboundMessage
};
