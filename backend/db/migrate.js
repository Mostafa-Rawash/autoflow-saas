require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { query } = require('./index');

async function ensureMigrationsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id serial PRIMARY KEY,
      filename text NOT NULL UNIQUE,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);
}

async function runMigrations() {
  await ensureMigrationsTable();

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const already = await query('SELECT 1 FROM schema_migrations WHERE filename = $1 LIMIT 1', [file]);
    if (already.rowCount) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    await query(sql);
    await query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
    console.log(`applied migration ${file}`);
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = {
  runMigrations
};
