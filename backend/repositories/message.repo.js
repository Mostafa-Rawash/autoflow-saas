const { query } = require('../db');

async function createMessage(organizationId, data) {
  const sql = `
    INSERT INTO messages (
      organization_id, conversation_id, contact_id, sender_type, sender_user_id,
      message_type, content, content_json, external_id, status, model_name,
      token_usage, trace_id, metadata, created_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,COALESCE($15, now()))
    RETURNING *
  `;
  const params = [
    organizationId,
    data.conversationId,
    data.contactId || null,
    data.senderType,
    data.senderUserId || null,
    data.messageType || 'text',
    data.content || null,
    data.contentJson || {},
    data.externalId || null,
    data.status || 'sent',
    data.modelName || null,
    data.tokenUsage || {},
    data.traceId || null,
    data.metadata || {},
    data.createdAt || null
  ];
  const result = await query(sql, params);
  return result.rows[0];
}

async function listMessages(organizationId, conversationId, limit = 50, offset = 0) {
  const result = await query(
    `SELECT * FROM messages
     WHERE organization_id = $1 AND conversation_id = $2
     ORDER BY created_at ASC
     LIMIT $3 OFFSET $4`,
    [organizationId, conversationId, limit, offset]
  );
  return result.rows;
}

async function getLatestMessage(organizationId, conversationId) {
  const result = await query(
    `SELECT * FROM messages
     WHERE organization_id = $1 AND conversation_id = $2
     ORDER BY created_at DESC
     LIMIT 1`,
    [organizationId, conversationId]
  );
  return result.rows[0] || null;
}

module.exports = {
  createMessage,
  listMessages,
  getLatestMessage
};