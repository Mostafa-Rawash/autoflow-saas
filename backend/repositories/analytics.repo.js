const { query } = require('../db');

async function logRequest(organizationId, data) {
  const result = await query(
    `INSERT INTO request_logs (
      organization_id, user_id, agent_id, conversation_id,
      request_type, provider, model_name, status, latency_ms,
      input_tokens, output_tokens, cost_usd, metadata
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    RETURNING *`,
    [
      organizationId,
      data.userId || null,
      data.agentId || null,
      data.conversationId || null,
      data.requestType,
      data.provider || null,
      data.modelName || null,
      data.status,
      data.latencyMs || null,
      data.inputTokens || 0,
      data.outputTokens || 0,
      data.costUsd || 0,
      data.metadata || {}
    ]
  );
  return result.rows[0];
}

async function upsertDailyUsage(organizationId, usageDate, data) {
  const result = await query(
    `INSERT INTO token_usage_daily (
      organization_id, usage_date, provider, model_name,
      input_tokens, output_tokens, cost_usd, request_count
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    ON CONFLICT (organization_id, usage_date, provider, model_name)
    DO UPDATE SET
      input_tokens = token_usage_daily.input_tokens + EXCLUDED.input_tokens,
      output_tokens = token_usage_daily.output_tokens + EXCLUDED.output_tokens,
      cost_usd = token_usage_daily.cost_usd + EXCLUDED.cost_usd,
      request_count = token_usage_daily.request_count + EXCLUDED.request_count
    RETURNING *`,
    [
      organizationId,
      usageDate,
      data.provider,
      data.modelName,
      data.inputTokens || 0,
      data.outputTokens || 0,
      data.costUsd || 0,
      data.requestCount || 1
    ]
  );
  return result.rows[0];
}

module.exports = {
  logRequest,
  upsertDailyUsage
};
