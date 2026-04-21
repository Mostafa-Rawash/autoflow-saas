-- 001_init.sql
-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS citext;

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active',
  plan text NOT NULL DEFAULT 'free',
  default_language text NOT NULL DEFAULT 'ar',
  timezone text NOT NULL DEFAULT 'Africa/Cairo',
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  email citext NOT NULL,
  phone text,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'agent',
  status text NOT NULL DEFAULT 'active',
  language text NOT NULL DEFAULT 'ar',
  timezone text NOT NULL DEFAULT 'Africa/Cairo',
  avatar_url text,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, email)
);

-- AI Agents
CREATE TABLE IF NOT EXISTS ai_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  agent_type text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  provider_policy jsonb NOT NULL DEFAULT '{}'::jsonb,
  model_policy jsonb NOT NULL DEFAULT '{}'::jsonb,
  tool_policy jsonb NOT NULL DEFAULT '{}'::jsonb,
  memory_policy jsonb NOT NULL DEFAULT '{}'::jsonb,
  language text NOT NULL DEFAULT 'ar',
  tone text NOT NULL DEFAULT 'professional',
  capabilities text[] NOT NULL DEFAULT '{}',
  active_prompt_version_id uuid,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Contacts
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  channel_type text NOT NULL,
  external_id text NOT NULL,
  name text,
  phone text,
  email text,
  language text,
  tags text[] NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, channel_type, external_id)
);

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  channel_type text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'normal',
  assigned_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  assigned_agent_id uuid REFERENCES ai_agents(id) ON DELETE SET NULL,
  last_message_at timestamptz,
  last_message_preview text,
  unread_count int NOT NULL DEFAULT 0,
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Messages (partitioned)
CREATE TABLE IF NOT EXISTS messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  sender_type text NOT NULL,
  sender_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  message_type text NOT NULL DEFAULT 'text',
  content text,
  content_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  external_id text,
  status text NOT NULL DEFAULT 'sent',
  model_name text,
  token_usage jsonb NOT NULL DEFAULT '{}'::jsonb,
  trace_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Request logs (partitioned)
CREATE TABLE IF NOT EXISTS request_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  agent_id uuid REFERENCES ai_agents(id) ON DELETE SET NULL,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  request_type text NOT NULL,
  provider text,
  model_name text,
  status text NOT NULL,
  latency_ms int,
  input_tokens int NOT NULL DEFAULT 0,
  output_tokens int NOT NULL DEFAULT 0,
  cost_usd numeric(12,6) NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Knowledge documents
CREATE TABLE IF NOT EXISTS knowledge_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  source_type text NOT NULL,
  source_url text,
  file_url text,
  language text NOT NULL DEFAULT 'ar',
  category text,
  tags text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Document chunks (with pgvector)
CREATE TABLE IF NOT EXISTS document_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  knowledge_document_id uuid NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  chunk_index int NOT NULL,
  section_path text,
  content text NOT NULL,
  content_tsv tsvector,
  chunk_summary text,
  language text NOT NULL DEFAULT 'ar',
  category text,
  tags text[] NOT NULL DEFAULT '{}',
  token_count int NOT NULL DEFAULT 0,
  quality_score numeric(5,4) NOT NULL DEFAULT 0,
  embedding_model text,
  embedding vector(1536),
  embedding_status text NOT NULL DEFAULT 'pending',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (knowledge_document_id, chunk_index)
);

-- Agent memory (with pgvector)
CREATE TABLE IF NOT EXISTS agent_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ai_agent_id uuid REFERENCES ai_agents(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  memory_type text NOT NULL,
  memory_key text NOT NULL,
  memory_value jsonb NOT NULL,
  source_message_id uuid,
  confidence_score numeric(5,4) NOT NULL DEFAULT 0,
  expires_at timestamptz,
  is_pinned boolean NOT NULL DEFAULT false,
  embedding vector(1536),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Agent runs
CREATE TABLE IF NOT EXISTS agent_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ai_agent_id uuid NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  message_id uuid,
  prompt_version_id uuid,
  provider text NOT NULL,
  model_name text NOT NULL,
  status text NOT NULL DEFAULT 'started',
  input_text text,
  retrieved_context jsonb NOT NULL DEFAULT '[]'::jsonb,
  tool_plan jsonb NOT NULL DEFAULT '{}'::jsonb,
  final_response text,
  output_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  trace_id uuid NOT NULL DEFAULT gen_random_uuid(),
  latency_ms int,
  input_tokens int NOT NULL DEFAULT 0,
  output_tokens int NOT NULL DEFAULT 0,
  cost_usd numeric(12,6) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);

-- Tool definitions
CREATE TABLE IF NOT EXISTS tool_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  input_schema jsonb NOT NULL,
  output_schema jsonb,
  permission_key text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name)
);

-- Tool executions
CREATE TABLE IF NOT EXISTS tool_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_run_id uuid NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
  tool_definition_id uuid NOT NULL REFERENCES tool_definitions(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'planned',
  approval_required boolean NOT NULL DEFAULT false,
  approved_by uuid REFERENCES users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  input_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  output_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  executed_at timestamptz
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Analytics daily
CREATE TABLE IF NOT EXISTS analytics_daily (
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  usage_date date NOT NULL,
  conversations_started bigint NOT NULL DEFAULT 0,
  messages_in bigint NOT NULL DEFAULT 0,
  messages_out bigint NOT NULL DEFAULT 0,
  agent_runs bigint NOT NULL DEFAULT 0,
  escalations bigint NOT NULL DEFAULT 0,
  kb_queries bigint NOT NULL DEFAULT 0,
  resolved_count bigint NOT NULL DEFAULT 0,
  avg_latency_ms numeric(12,2) NOT NULL DEFAULT 0,
  avg_cost_usd numeric(12,6) NOT NULL DEFAULT 0,
  PRIMARY KEY (organization_id, usage_date)
);

-- Token usage daily
CREATE TABLE IF NOT EXISTS token_usage_daily (
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  usage_date date NOT NULL,
  provider text NOT NULL,
  model_name text NOT NULL,
  input_tokens bigint NOT NULL DEFAULT 0,
  output_tokens bigint NOT NULL DEFAULT 0,
  cost_usd numeric(14,6) NOT NULL DEFAULT 0,
  request_count bigint NOT NULL DEFAULT 0,
  PRIMARY KEY (organization_id, usage_date, provider, model_name)
);

-- Idempotency keys
CREATE TABLE IF NOT EXISTS idempotency_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  key text NOT NULL,
  scope text NOT NULL,
  request_hash text NOT NULL,
  response_json jsonb,
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, key, scope)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_org_role ON users (organization_id, role);
CREATE INDEX IF NOT EXISTS idx_conversations_org_status_updated ON conversations (organization_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_org_channel_external ON contacts (organization_id, channel_type, external_id);
CREATE INDEX IF NOT EXISTS idx_documents_org_status ON knowledge_documents (organization_id, status);
CREATE INDEX IF NOT EXISTS idx_chunks_org_doc ON document_chunks (organization_id, knowledge_document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_org_category ON document_chunks (organization_id, category);
CREATE INDEX IF NOT EXISTS idx_chunks_tsv ON document_chunks USING gin (content_tsv);
CREATE INDEX IF NOT EXISTS idx_chunks_embedding_hnsw ON document_chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_memory_embedding_hnsw ON agent_memory USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_agent_runs_org_created ON agent_runs (organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_request_logs_org_created ON request_logs (organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created ON audit_logs (organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_usage_daily_org_date ON token_usage_daily (organization_id, usage_date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_org_date ON analytics_daily (organization_id, usage_date DESC);
CREATE INDEX IF NOT EXISTS idx_idempotency_org_scope_key ON idempotency_keys (organization_id, scope, key);

-- Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_usage_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY org_isolation_organizations ON organizations
  USING (id = current_setting('app.current_org', true)::uuid);

CREATE POLICY org_isolation_users ON users
  USING (organization_id = current_setting('app.current_org', true)::uuid);

CREATE POLICY org_isolation_agents ON ai_agents
  USING (organization_id = current_setting('app.current_org', true)::uuid);

CREATE POLICY org_isolation_contacts ON contacts
  USING (organization_id = current_setting('app.current_org', true)::uuid);

CREATE POLICY org_isolation_conversations ON conversations
  USING (organization_id = current_setting('app.current_org', true)::uuid);

CREATE POLICY org_isolation_messages ON messages
  USING (organization_id = current_setting('app.current_org', true)::uuid);

CREATE POLICY org_isolation_request_logs ON request_logs
  USING (organization_id = current_setting('app.current_org', true)::uuid);

CREATE POLICY org_isolation_documents ON knowledge_documents
  USING (organization_id = current_setting('app.current_org', true)::uuid);

CREATE POLICY org_isolation_chunks ON document_chunks
  USING (organization_id = current_setting('app.current_org', true)::uuid);

CREATE POLICY org_isolation_memory ON agent_memory
  USING (organization_id = current_setting('app.current_org', true)::uuid);

CREATE POLICY org_isolation_runs ON agent_runs
  USING (organization_id = current_setting('app.current_org', true)::uuid);

CREATE POLICY org_isolation_tools ON tool_definitions
  USING (organization_id = current_setting('app.current_org', true)::uuid);

CREATE POLICY org_isolation_tool_execs ON tool_executions
  USING (organization_id = current_setting('app.current_org', true)::uuid);

CREATE POLICY org_isolation_audit ON audit_logs
  USING (organization_id = current_setting('app.current_org', true)::uuid);

CREATE POLICY org_isolation_analytics ON analytics_daily
  USING (organization_id = current_setting('app.current_org', true)::uuid);

CREATE POLICY org_isolation_token_usage ON token_usage_daily
  USING (organization_id = current_setting('app.current_org', true)::uuid);

CREATE POLICY org_isolation_idempotency ON idempotency_keys
  USING (organization_id = current_setting('app.current_org', true)::uuid);