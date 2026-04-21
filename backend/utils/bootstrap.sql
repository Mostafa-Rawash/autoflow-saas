INSERT INTO organizations (name, slug, status, plan, default_language, timezone)
VALUES ('AutoFlow', 'autoflow', 'active', 'premium', 'ar', 'Africa/Cairo')
ON CONFLICT (slug) DO NOTHING;
