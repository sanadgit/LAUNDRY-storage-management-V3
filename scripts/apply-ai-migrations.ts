import 'dotenv/config';
import { readFileSync } from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { Pool } from 'pg';

const DB_PROVIDER = String(process.env.DB_PROVIDER ?? 'sqlite').trim().toLowerCase();
const POSTGRES_URL = String(process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? '').trim();

const migrationPath = (name: string) =>
  path.resolve(process.cwd(), 'database', 'migrations', name);

const AI_MIGRATIONS = [
  {
    label: 'AI Phase 1',
    sqlite: '20260628_ai_operations_agent_phase1.sqlite.sql',
    postgres: '20260628_ai_operations_agent_phase1.postgres.sql',
  },
  {
    label: 'AI Customer Service Agent foundation',
    sqlite: '20260717_ai_customer_service_agent_foundation.sqlite.sql',
    postgres: '20260717_ai_customer_service_agent_foundation.postgres.sql',
  },
];

const run = async () => {
  if (DB_PROVIDER === 'postgres') {
    if (!POSTGRES_URL) {
      throw new Error('POSTGRES_URL or DATABASE_URL is required when DB_PROVIDER=postgres.');
    }
    const pool = new Pool({ connectionString: POSTGRES_URL });
    try {
      for (const migration of AI_MIGRATIONS) {
        const sql = readFileSync(migrationPath(migration.postgres), 'utf8');
        await pool.query(sql);
        console.log(`${migration.label} PostgreSQL migration applied.`);
      }
    } finally {
      await pool.end();
    }
    return;
  }

  const sqlitePath = path.resolve(process.cwd(), process.env.SQLITE_DB_PATH ?? 'blanket_storage.db');
  const db = new Database(sqlitePath);
  try {
    for (const migration of AI_MIGRATIONS) {
      const sql = readFileSync(migrationPath(migration.sqlite), 'utf8');
      db.exec(sql);
      console.log(`${migration.label} SQLite migration applied: ${sqlitePath}`);
    }
  } finally {
    db.close();
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
