const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.PGPOOL_MAX || 20),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

async function query(text, params = []) {
  const result = await pool.query(text, params);
  return result;
}

async function withClient(fn) {
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

async function setTenant(client, organizationId) {
  await client.query('SELECT set_config($1, $2, true)', ['app.current_org', organizationId]);
}

async function healthcheck() {
  const result = await pool.query('SELECT 1 AS ok');
  return result.rows[0];
}

module.exports = {
  pool,
  query,
  withClient,
  setTenant,
  healthcheck
};