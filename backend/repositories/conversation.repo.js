const { query } = require('../db');

async function createConversation(organizationId, data) {
  const sql = `
    INSERT INTO conversations (
      organization_id, contact_id, channel_type, status, priority,
      assigned_user_id, assigned_agent_id, last_message_at, last_message_preview,
      unread_count, state, metadata
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING *
  `;
  const params = [
    organizationId,
    data.contactId,
    data.channelType,
    data.status || 'open',
    data.priority || 'normal',
    data.assignedUserId || null,
    data.assignedAgentId || null,
    data.lastMessageAt || null,
    data.lastMessagePreview || null,
    data.unreadCount || 0,
    data.state || {},
    data.metadata || {}
  ];
  const result = await query(sql, params);
  return result.rows[0];
}

async function findConversationById(organizationId, conversationId) {
  const result = await query(
    'SELECT * FROM conversations WHERE organization_id = $1 AND id = $2 LIMIT 1',
    [organizationId, conversationId]
  );
  return result.rows[0] || null;
}

async function updateConversationLastMessage(organizationId, conversationId, payload) {
  const result = await query(
    `UPDATE conversations
     SET last_message_at = $3,
         last_message_preview = $4,
         unread_count = $5,
         updated_at = now()
     WHERE organization_id = $1 AND id = $2
     RETURNING *`,
    [organizationId, conversationId, payload.lastMessageAt, payload.preview, payload.unreadCount]
  );
  return result.rows[0] || null;
}

async function listConversations(organizationId, limit = 50, offset = 0) {
  const result = await query(
    `SELECT * FROM conversations
     WHERE organization_id = $1
     ORDER BY updated_at DESC
     LIMIT $2 OFFSET $3`,
    [organizationId, limit, offset]
  );
  return result.rows;
}

async function upsertConversation(organizationId, data) {
  const existing = await query(
    `SELECT * FROM conversations
     WHERE organization_id = $1 AND contact_id = $2 AND channel_type = $3
     LIMIT 1`,
    [organizationId, data.contactId, data.channelType]
  );
  
  if (existing.rows[0]) {
    // Update assigned_agent_id if provided and different
    if (data.assignedAgentId && existing.rows[0].assigned_agent_id !== data.assignedAgentId) {
      const updated = await query(
        `UPDATE conversations
         SET assigned_agent_id = $3,
             last_message_at = $4,
             last_message_preview = $5,
             unread_count = unread_count + 1,
             updated_at = now()
         WHERE organization_id = $1 AND id = $2
         RETURNING *`,
        [organizationId, existing.rows[0].id, data.assignedAgentId, data.lastMessageAt, data.lastMessagePreview]
      );
      return updated.rows[0];
    }
    return existing.rows[0];
  }
  
  return createConversation(organizationId, data);
}

module.exports = {
  createConversation,
  findConversationById,
  updateConversationLastMessage,
  listConversations,
  upsertConversation
};