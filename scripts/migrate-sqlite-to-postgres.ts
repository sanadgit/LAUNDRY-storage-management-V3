import 'dotenv/config';
import Database from 'better-sqlite3';
import { Pool } from 'pg';

type TableMigrationConfig = {
  name: string;
  createSql: string;
  conflictColumns: string[];
};

const POSTGRES_URL = String(process.env.POSTGRES_URL ?? '').trim();
const SQLITE_PATH = String(process.env.SQLITE_PATH ?? 'blanket_storage.db').trim();
const BATCH_SIZE = Math.max(100, Number(process.env.PG_MIGRATE_BATCH_SIZE ?? 1000) || 1000);

if (!POSTGRES_URL) {
  throw new Error('POSTGRES_URL is required. Add it to .env before migration.');
}

const tables: TableMigrationConfig[] = [
  {
    name: 'users',
    createSql: `
      CREATE TABLE IF NOT EXISTS users (
        id integer PRIMARY KEY,
        username text UNIQUE NOT NULL,
        role text DEFAULT 'cashier',
        password text NOT NULL DEFAULT '',
        full_name text,
        email text,
        phone text,
        avatar_url text,
        is_active integer DEFAULT 1,
        created_at timestamptz,
        updated_at timestamptz,
        last_login_at timestamptz
      );
    `,
    conflictColumns: ['id'],
  },
  {
    name: 'stores',
    createSql: `
      CREATE TABLE IF NOT EXISTS stores (
        store_name text PRIMARY KEY,
        position_x double precision DEFAULT 0,
        position_y double precision DEFAULT 0,
        position_z double precision DEFAULT 0,
        width double precision DEFAULT 5,
        depth double precision DEFAULT 5,
        height double precision DEFAULT 3,
        rows integer DEFAULT 10,
        columns integer DEFAULT 10,
        rotation_y double precision DEFAULT 0,
        auto_settle integer DEFAULT 1,
        store_type text DEFAULT 'grid',
        hanger_slots integer DEFAULT 0,
        slot_capacity integer DEFAULT 1,
        require_pick_scan integer DEFAULT 0,
        store_color text DEFAULT '#3b82f6',
        store_opacity double precision DEFAULT 1,
        cell_width double precision DEFAULT 0.5,
        cell_depth double precision DEFAULT 0.5,
        cell_height double precision DEFAULT 0.11
      );
    `,
    conflictColumns: ['store_name'],
  },
  {
    name: 'blankets',
    createSql: `
      CREATE TABLE IF NOT EXISTS blankets (
        id integer PRIMARY KEY,
        blanket_number text NOT NULL,
        store text NOT NULL,
        row integer NOT NULL,
        "column" integer NOT NULL,
        status text DEFAULT 'stored',
        created_at timestamptz DEFAULT CURRENT_TIMESTAMP
      );
    `,
    conflictColumns: ['id'],
  },
  {
    name: 'logs',
    createSql: `
      CREATE TABLE IF NOT EXISTS logs (
        id integer PRIMARY KEY,
        blanket_number text NOT NULL,
        action text NOT NULL,
        "user" text DEFAULT 'system',
        store text,
        row integer,
        "column" integer,
        status text,
        request_id text,
        device text,
        ip text,
        notes text,
        "timestamp" timestamptz DEFAULT CURRENT_TIMESTAMP
      );
    `,
    conflictColumns: ['id'],
  },
  {
    name: 'customer_orders',
    createSql: `
      CREATE TABLE IF NOT EXISTS customer_orders (
        id text PRIMARY KEY,
        status text NOT NULL DEFAULT 'new',
        payload text NOT NULL,
        created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
      );
    `,
    conflictColumns: ['id'],
  },
  {
    name: 'customer_site_config',
    createSql: `
      CREATE TABLE IF NOT EXISTS customer_site_config (
        id integer PRIMARY KEY,
        payload text NOT NULL,
        updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
      );
    `,
    conflictColumns: ['id'],
  },
  {
    name: 'customer_users',
    createSql: `
      CREATE TABLE IF NOT EXISTS customer_users (
        id text PRIMARY KEY,
        name text NOT NULL,
        phone text,
        phone_normalized text,
        email text,
        email_normalized text,
        password_hash text NOT NULL,
        customer_type text DEFAULT 'individual',
        area text,
        pref_service integer DEFAULT 1,
        notif_type text DEFAULT 'whatsapp',
        is_active integer DEFAULT 1,
        created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
        last_login_at timestamptz
      );
    `,
    conflictColumns: ['id'],
  },
  {
    name: 'customer_sessions',
    createSql: `
      CREATE TABLE IF NOT EXISTS customer_sessions (
        token text PRIMARY KEY,
        user_id text NOT NULL,
        expires_at bigint NOT NULL,
        created_at timestamptz DEFAULT CURRENT_TIMESTAMP
      );
    `,
    conflictColumns: ['token'],
  },
  {
    name: 'app_sessions',
    createSql: `
      CREATE TABLE IF NOT EXISTS app_sessions (
        token text PRIMARY KEY,
        user_id integer NOT NULL,
        username text NOT NULL,
        role text NOT NULL,
        expires_at bigint NOT NULL,
        created_at timestamptz DEFAULT CURRENT_TIMESTAMP
      );
    `,
    conflictColumns: ['token'],
  },
  {
    name: 'customer_driver_sessions',
    createSql: `
      CREATE TABLE IF NOT EXISTS customer_driver_sessions (
        token text PRIMARY KEY,
        payload text NOT NULL,
        expires_at bigint NOT NULL,
        created_at timestamptz DEFAULT CURRENT_TIMESTAMP
      );
    `,
    conflictColumns: ['token'],
  },
  {
    name: 'sorting_tables',
    createSql: `
      CREATE TABLE IF NOT EXISTS sorting_tables (
        id integer PRIMARY KEY,
        name text NOT NULL UNIQUE,
        rows integer NOT NULL DEFAULT 2,
        cols integer NOT NULL DEFAULT 6,
        sort_order integer NOT NULL DEFAULT 0,
        is_active integer NOT NULL DEFAULT 1,
        created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
      );
    `,
    conflictColumns: ['id'],
  },
  {
    name: 'sorting_cells',
    createSql: `
      CREATE TABLE IF NOT EXISTS sorting_cells (
        id integer PRIMARY KEY,
        table_id integer NOT NULL,
        row_no integer NOT NULL,
        col_no integer NOT NULL,
        active_order_no text,
        status text NOT NULL DEFAULT 'empty',
        updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(table_id, row_no, col_no)
      );
    `,
    conflictColumns: ['id'],
  },
  {
    name: 'sorting_orders',
    createSql: `
      CREATE TABLE IF NOT EXISTS sorting_orders (
        order_no text PRIMARY KEY,
        customer_name text NOT NULL DEFAULT '',
        total_required integer NOT NULL DEFAULT 0,
        total_sorted integer NOT NULL DEFAULT 0,
        total_ironed integer NOT NULL DEFAULT 0,
        status text NOT NULL DEFAULT 'sorting_pending',
        table_id integer,
        row_no integer,
        col_no integer,
        source_orders_id text,
        source_invoice_id text,
        created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
        completed_at timestamptz
      );
    `,
    conflictColumns: ['order_no'],
  },
  {
    name: 'sorting_items',
    createSql: `
      CREATE TABLE IF NOT EXISTS sorting_items (
        id integer PRIMARY KEY,
        order_no text NOT NULL,
        item_name text NOT NULL,
        qty_required integer NOT NULL DEFAULT 0,
        qty_sorted integer NOT NULL DEFAULT 0,
        qty_ironed integer NOT NULL DEFAULT 0,
        qty_packed integer NOT NULL DEFAULT 0,
        status text NOT NULL DEFAULT 'missing',
        UNIQUE(order_no, item_name)
      );
    `,
    conflictColumns: ['id'],
  },
  {
    name: 'sorting_ironing_events',
    createSql: `
      CREATE TABLE IF NOT EXISTS sorting_ironing_events (
        id integer PRIMARY KEY,
        order_no text NOT NULL,
        item_name text,
        qty integer NOT NULL DEFAULT 1,
        "user" text DEFAULT 'system',
        request_id text,
        "timestamp" timestamptz DEFAULT CURRENT_TIMESTAMP
      );
    `,
    conflictColumns: ['id'],
  },
  {
    name: 'sorting_blanket_packing_events',
    createSql: `
      CREATE TABLE IF NOT EXISTS sorting_blanket_packing_events (
        id integer PRIMARY KEY,
        order_no text NOT NULL,
        item_name text,
        qty integer NOT NULL DEFAULT 1,
        "user" text DEFAULT 'system',
        request_id text,
        "timestamp" timestamptz DEFAULT CURRENT_TIMESTAMP
      );
    `,
    conflictColumns: ['id'],
  },
  {
    name: 'sorting_scans',
    createSql: `
      CREATE TABLE IF NOT EXISTS sorting_scans (
        id integer PRIMARY KEY,
        order_no text NOT NULL,
        scanned_code text NOT NULL,
        table_id integer,
        row_no integer,
        col_no integer,
        item_name text,
        qty integer NOT NULL DEFAULT 1,
        "user" text DEFAULT 'system',
        request_id text,
        "timestamp" timestamptz DEFAULT CURRENT_TIMESTAMP
      );
    `,
    conflictColumns: ['id'],
  },
];

const q = (identifier: string) => `"${identifier.replaceAll('"', '""')}"`;

const chunk = <T,>(items: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

const getPostgresVersionNum = async (pool: Pool): Promise<number> => {
  const result = await pool.query('SHOW server_version_num');
  const raw = Number(result.rows?.[0]?.server_version_num ?? 0);
  return Number.isFinite(raw) ? raw : 0;
};

const indexDefinitions: Array<{ name: string; sql: string }> = [
  { name: 'idx_blankets_store', sql: 'CREATE INDEX idx_blankets_store ON blankets(store)' },
  { name: 'idx_blankets_number', sql: 'CREATE INDEX idx_blankets_number ON blankets(blanket_number)' },
  { name: 'idx_blankets_slot_status', sql: 'CREATE INDEX idx_blankets_slot_status ON blankets(store, row, "column", status)' },
  { name: 'idx_logs_timestamp', sql: 'CREATE INDEX idx_logs_timestamp ON logs("timestamp")' },
  { name: 'idx_logs_request_id', sql: 'CREATE INDEX idx_logs_request_id ON logs(request_id)' },
  { name: 'idx_customer_orders_status', sql: 'CREATE INDEX idx_customer_orders_status ON customer_orders(status)' },
  { name: 'idx_customer_orders_updated_at', sql: 'CREATE INDEX idx_customer_orders_updated_at ON customer_orders(updated_at)' },
  { name: 'idx_customer_users_phone_norm', sql: 'CREATE UNIQUE INDEX idx_customer_users_phone_norm ON customer_users(phone_normalized)' },
  { name: 'idx_customer_users_email_norm', sql: 'CREATE UNIQUE INDEX idx_customer_users_email_norm ON customer_users(email_normalized)' },
  { name: 'idx_customer_sessions_user_id', sql: 'CREATE INDEX idx_customer_sessions_user_id ON customer_sessions(user_id)' },
  { name: 'idx_customer_sessions_expires_at', sql: 'CREATE INDEX idx_customer_sessions_expires_at ON customer_sessions(expires_at)' },
  { name: 'idx_app_sessions_user_id', sql: 'CREATE INDEX idx_app_sessions_user_id ON app_sessions(user_id)' },
  { name: 'idx_app_sessions_expires_at', sql: 'CREATE INDEX idx_app_sessions_expires_at ON app_sessions(expires_at)' },
  { name: 'idx_customer_driver_sessions_expires_at', sql: 'CREATE INDEX idx_customer_driver_sessions_expires_at ON customer_driver_sessions(expires_at)' },
  { name: 'idx_sorting_cells_table', sql: 'CREATE INDEX idx_sorting_cells_table ON sorting_cells(table_id, row_no, col_no)' },
  { name: 'idx_sorting_orders_status', sql: 'CREATE INDEX idx_sorting_orders_status ON sorting_orders(status, updated_at)' },
  { name: 'idx_sorting_scans_order_no', sql: 'CREATE INDEX idx_sorting_scans_order_no ON sorting_scans(order_no, "timestamp")' },
  { name: 'idx_sorting_ironing_events_order_no', sql: 'CREATE INDEX idx_sorting_ironing_events_order_no ON sorting_ironing_events(order_no, "timestamp")' },
  { name: 'idx_sorting_ironing_events_user', sql: 'CREATE INDEX idx_sorting_ironing_events_user ON sorting_ironing_events("user", "timestamp")' },
  { name: 'idx_sorting_blanket_events_order_no', sql: 'CREATE INDEX idx_sorting_blanket_events_order_no ON sorting_blanket_packing_events(order_no, "timestamp")' },
  { name: 'idx_sorting_blanket_events_user', sql: 'CREATE INDEX idx_sorting_blanket_events_user ON sorting_blanket_packing_events("user", "timestamp")' },
];

const createIndexes = async (pool: Pool, supportsIfNotExists: boolean) => {
  for (const indexDef of indexDefinitions) {
    if (supportsIfNotExists) {
      const sqlWithIfNotExists = indexDef.sql.startsWith('CREATE UNIQUE INDEX ')
        ? indexDef.sql.replace('CREATE UNIQUE INDEX ', 'CREATE UNIQUE INDEX IF NOT EXISTS ')
        : indexDef.sql.replace('CREATE INDEX ', 'CREATE INDEX IF NOT EXISTS ');
      await pool.query(sqlWithIfNotExists);
      continue;
    }

    const existsResult = await pool.query(
      `SELECT 1 FROM pg_indexes WHERE schemaname = current_schema() AND indexname = $1 LIMIT 1`,
      [indexDef.name]
    );
    if ((existsResult.rowCount ?? 0) > 0) continue;
    await pool.query(indexDef.sql);
  }
};

const migrateTable = async (
  sqlite: Database.Database,
  pool: Pool,
  config: TableMigrationConfig,
  supportsOnConflict: boolean
) => {
  const rows = sqlite.prepare(`SELECT * FROM ${config.name}`).all() as Record<string, unknown>[];
  if (rows.length === 0) {
    console.log(`- ${config.name}: 0 rows (skipped)`);
    return;
  }

  const columns = Object.keys(rows[0]);
  const conflictSet = new Set(config.conflictColumns);
  const updateColumns = columns.filter((col) => !conflictSet.has(col));
  const columnsSql = columns.map((col) => q(col)).join(', ');
  const conflictSql = config.conflictColumns.map((col) => q(col)).join(', ');
  const updateSql =
    updateColumns.length > 0
      ? updateColumns.map((col) => `${q(col)} = EXCLUDED.${q(col)}`).join(', ')
      : `${q(config.conflictColumns[0])} = EXCLUDED.${q(config.conflictColumns[0])}`;

  const batches = chunk(rows, BATCH_SIZE);
  let inserted = 0;
  for (const batchRows of batches) {
    if (supportsOnConflict) {
      const values: unknown[] = [];
      const placeholders = batchRows
        .map((row, rowIndex) => {
          const rowPlaceholders = columns.map((_col, colIndex) => {
            values.push(row[columns[colIndex]]);
            return `$${rowIndex * columns.length + colIndex + 1}`;
          });
          return `(${rowPlaceholders.join(', ')})`;
        })
        .join(', ');

      const sql = `
        INSERT INTO ${q(config.name)} (${columnsSql})
        VALUES ${placeholders}
        ON CONFLICT (${conflictSql})
        DO UPDATE SET ${updateSql};
      `;
      await pool.query(sql, values);
      inserted += batchRows.length;
      continue;
    }

    // PostgreSQL 9.3 compatibility path: delete conflicting rows then insert.
    await pool.query('BEGIN');
    try {
      for (const row of batchRows) {
        const whereSql = config.conflictColumns.map((col, idx) => `${q(col)} = $${idx + 1}`).join(' AND ');
        const whereValues = config.conflictColumns.map((col) => row[col]);
        await pool.query(`DELETE FROM ${q(config.name)} WHERE ${whereSql}`, whereValues);
      }

      const insertValues: unknown[] = [];
      const insertPlaceholders = batchRows
        .map((row, rowIndex) => {
          const rowPlaceholders = columns.map((_col, colIndex) => {
            insertValues.push(row[columns[colIndex]]);
            return `$${rowIndex * columns.length + colIndex + 1}`;
          });
          return `(${rowPlaceholders.join(', ')})`;
        })
        .join(', ');
      const insertSql = `INSERT INTO ${q(config.name)} (${columnsSql}) VALUES ${insertPlaceholders};`;
      await pool.query(insertSql, insertValues);
      await pool.query('COMMIT');
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }

    inserted += batchRows.length;
  }

  console.log(`- ${config.name}: ${inserted} rows`);
};

const syncSequences = async (pool: Pool) => {
  const sequenceTargets: Array<{ table: string; idColumn: string }> = [
    { table: 'users', idColumn: 'id' },
    { table: 'blankets', idColumn: 'id' },
    { table: 'logs', idColumn: 'id' },
    { table: 'sorting_tables', idColumn: 'id' },
    { table: 'sorting_cells', idColumn: 'id' },
    { table: 'sorting_items', idColumn: 'id' },
    { table: 'sorting_ironing_events', idColumn: 'id' },
    { table: 'sorting_blanket_packing_events', idColumn: 'id' },
    { table: 'sorting_scans', idColumn: 'id' },
  ];

  for (const target of sequenceTargets) {
    const sql = `
      SELECT setval(
        pg_get_serial_sequence('${target.table}', '${target.idColumn}'),
        COALESCE((SELECT MAX(${q(target.idColumn)}) FROM ${q(target.table)}), 1),
        true
      );
    `;
    try {
      await pool.query(sql);
    } catch {
      // Some environments may not have serial sequence attached; safe to ignore.
    }
  }
};

async function main() {
  console.log('Starting SQLite -> PostgreSQL migration...');
  console.log(`- SQLite: ${SQLITE_PATH}`);
  console.log(`- Batch size: ${BATCH_SIZE}`);

  const sqlite = new Database(SQLITE_PATH, { readonly: true });
  const pool = new Pool({
    connectionString: POSTGRES_URL,
    max: 8,
  });

  try {
    await pool.query('SELECT 1');
    const versionNum = await getPostgresVersionNum(pool);
    const supportsOnConflict = versionNum >= 90500;
    const supportsIfNotExistsForIndex = versionNum >= 90500;
    console.log(`- PostgreSQL server_version_num: ${versionNum || 'unknown'}`);
    if (!supportsOnConflict) {
      console.log('- Legacy mode enabled for PostgreSQL < 9.5 (compatibility path).');
    }

    for (const table of tables) {
      await pool.query(table.createSql);
    }
    await createIndexes(pool, supportsIfNotExistsForIndex);

    for (const table of tables) {
      await migrateTable(sqlite, pool, table, supportsOnConflict);
    }

    await syncSequences(pool);
    console.log('Migration completed successfully.');
  } finally {
    sqlite.close();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
