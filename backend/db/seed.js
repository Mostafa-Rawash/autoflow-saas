require('dotenv').config();
const { query } = require('./index');

async function seedDemo() {
  const orgResult = await query(
    `INSERT INTO organizations (name, slug, status, plan, default_language, timezone)
     VALUES ('Demo Org', 'demo-org', 'active', 'premium', 'ar', 'Africa/Cairo')
     ON CONFLICT (slug) DO UPDATE SET updated_at = now()
     RETURNING id`
  );
  const organizationId = orgResult.rows[0].id;

  const agentResult = await query(
    `INSERT INTO ai_agents (organization_id, name, description, agent_type, status, provider_policy, model_policy, tool_policy, memory_policy)
     VALUES ($1, 'Support Agent', 'Demo support agent', 'support', 'active', '{}', '{}', '{}', '{}')
     RETURNING id, active_prompt_version_id`,
    [organizationId]
  );
  const agentId = agentResult.rows[0].id;

  const promptResult = await query(
    `INSERT INTO prompt_versions (organization_id, ai_agent_id, version_number, name, content, status)
     VALUES ($1, $2, 1, 'Default Support Prompt', 'You are a helpful AI assistant.', 'active')
     ON CONFLICT (organization_id, ai_agent_id, version_number)
     DO UPDATE SET content = EXCLUDED.content, status = EXCLUDED.status, updated_at = now()
     RETURNING id`,
    [organizationId, agentId]
  );

  await query(
    `UPDATE ai_agents
     SET active_prompt_version_id = $3, updated_at = now()
     WHERE organization_id = $1 AND id = $2`,
    [organizationId, agentId, promptResult.rows[0].id]
  );

  const contactResult = await query(
    `INSERT INTO contacts (organization_id, channel_type, external_id, name, phone, language)
     VALUES ($1, 'whatsapp', '+201099129550', 'Mostafa', '+201099129550', 'ar')
     ON CONFLICT (organization_id, channel_type, external_id) DO UPDATE SET updated_at = now()
     RETURNING id`,
    [organizationId]
  );
  const contactId = contactResult.rows[0].id;

  const docResult = await query(
    `INSERT INTO knowledge_documents (organization_id, title, source_type, language, status)
     VALUES ($1, 'Demo FAQ', 'faq', 'ar', 'ready')
     RETURNING id`,
    [organizationId]
  );
  const documentId = docResult.rows[0].id;

  await query(
    `INSERT INTO document_chunks (organization_id, knowledge_document_id, chunk_index, content, language, token_count, embedding_status)
     VALUES
       ($1, $2, 0, 'مرحبا بك في AutoFlow. كيف يمكنني مساعدتك؟', 'ar', 15, 'ready'),
       ($1, $2, 1, 'يمكنك الاتصال بنا عبر الواتساب على الرقم +201099129550.', 'ar', 20, 'ready')
     ON CONFLICT (knowledge_document_id, chunk_index) DO UPDATE SET content = EXCLUDED.content, updated_at = now()`,
    [organizationId, documentId]
  );

  console.log('seed done', { organizationId, agentId, contactId, documentId, promptVersionId: promptResult.rows[0].id });
}

if (require.main === module) {
  seedDemo()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seedDemo };
