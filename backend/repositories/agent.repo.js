const { query } = require('../db');

async function findAgentById(organizationId, agentId) {
  const result = await query(
    'SELECT * FROM ai_agents WHERE organization_id = $1 AND id = $2 LIMIT 1',
    [organizationId, agentId]
  );
  return result.rows[0] || null;
}

async function getActivePromptVersion(organizationId, agentId) {
  const result = await query(
    `SELECT pv.*
     FROM ai_agents a
     JOIN prompt_versions pv ON pv.id = a.active_prompt_version_id
     WHERE a.organization_id = $1 AND a.id = $2
     LIMIT 1`,
    [organizationId, agentId]
  );
  return result.rows[0] || null;
}

module.exports = {
  findAgentById,
  getActivePromptVersion
};
