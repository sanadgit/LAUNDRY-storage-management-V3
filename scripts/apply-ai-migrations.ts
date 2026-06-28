import 'dotenv/config';
import { readFileSync } from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { Pool } from 'pg';

const DB_PROVIDER = String(process.env.DB_PROVIDER ?? 'sqlite').trim().toLowerCase();
const POSTGRES_URL = String(process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? '').trim();

const migrationPath = (name: string) =>
  path.resolve(process.cwd(), 'database', 'migrations', name);

const run = async () => {
  if (DB_PROVIDER === 'postgres') {
    if (!POSTGRES_URL) {
      throw new Error('POSTGRES_URL or DATABASE_URL is required when DB_PROVIDER=postgres.');
    }
    const pool = new Pool({ connectionString: POSTGRES_URL });
    try {
      const sql = readFileSync(migrationPath('20260628_ai_operations_agent_phase1.postgres.sql'), 'utf8');
      await pool.query(sql);
      console.log('AI Phase 1 PostgreSQL migration applied.');
    } finally {
      await pool.end();
    }
    return;
  }

  const sqlitePath = path.resolve(process.cwd(), process.env.SQLITE_DB_PATH ?? 'blanket_storage.db');
  const db = new Database(sqlitePath);
  try {
    const sql = readFileSync(migrationPath('20260628_ai_operations_agent_phase1.sqlite.sql'), 'utf8');
    db.exec(sql);
    console.log(`AI Phase 1 SQLite migration applied: ${sqlitePath}`);
  } finally {
    db.close();
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
