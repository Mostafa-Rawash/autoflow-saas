const { query } = require('../db');

async function storeMemory(organizationId, payload) {
  const result = await query(
    `INSERT INTO agent_memory (
      organization_id, ai_agent_id, conversation_id, memory_type,
      memory_key, memory_value, source_message_id,
      confidence_score, expires_at, is_pinned, embedding
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING *`,
    [
      organizationId,
      payload.agentId || null,
      payload.conversationId || null,
      payload.memoryType || 'episodic',
      payload.memoryKey,
      payload.memoryValue,
      payload.sourceMessageId || null,
      payload.confidenceScore || 0,
      payload.expiresAt || null,
      payload.isPinned || false,
      payload.embedding || null
    ]
  );
  return result.rows[0];
}

async function retrieveMemory(organizationId, agentId, conversationId) {
  const result = await query(
    `SELECT * FROM agent_memory
     WHERE organization_id = $1
       AND ($2::uuid IS NULL OR ai_agent_id = $2)
       AND ($3::uuid IS NULL OR conversation_id = $3)
       AND (expires_at IS NULL OR expires_at > now())
     ORDER BY is_pinned DESC, created_at DESC
     LIMIT 20`,
    [organizationId, agentId || null, conversationId || null]
  );
  return result.rows;
}

module.exports = {
  storeMemory,
  retrieveMemory
};
