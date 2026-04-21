CREATE TABLE IF NOT EXISTS prompt_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ai_agent_id uuid NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  version_number int NOT NULL,
  name text NOT NULL,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, ai_agent_id, version_number)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_ai_agents_active_prompt_version'
  ) THEN
    ALTER TABLE ai_agents
      ADD CONSTRAINT fk_ai_agents_active_prompt_version
      FOREIGN KEY (active_prompt_version_id) REFERENCES prompt_versions(id) ON DELETE SET NULL;
  END IF;
END $$;

ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_isolation_prompt_versions ON prompt_versions
  USING (organization_id = current_setting('app.current_org', true)::uuid);

CREATE INDEX IF NOT EXISTS idx_prompt_versions_org_agent ON prompt_versions (organization_id, ai_agent_id, status, version_number DESC);

DO $$
DECLARE
  start_date date := date_trunc('month', now())::date;
  end_date date := (date_trunc('month', now()) + interval '1 month')::date;
  next_end_date date := (date_trunc('month', now()) + interval '2 month')::date;
BEGIN
  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS messages_%s PARTITION OF messages FOR VALUES FROM (%L) TO (%L)',
    to_char(start_date, 'YYYY_MM'), start_date, end_date
  );
  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS request_logs_%s PARTITION OF request_logs FOR VALUES FROM (%L) TO (%L)',
    to_char(start_date, 'YYYY_MM'), start_date, end_date
  );
  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS messages_%s PARTITION OF messages FOR VALUES FROM (%L) TO (%L)',
    to_char(end_date, 'YYYY_MM'), end_date, next_end_date
  );
  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS request_logs_%s PARTITION OF request_logs FOR VALUES FROM (%L) TO (%L)',
    to_char(end_date, 'YYYY_MM'), end_date, next_end_date
  );
END $$;
