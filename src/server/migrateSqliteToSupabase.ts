import Database from 'better-sqlite3';
import { ensureAuthUser, supabaseAdmin, upsertPublicUser } from './supabaseAdmin';

interface SQLiteUser {
  username: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: 'super-admin' | 'admin' | 'cashier';
  is_active: number;
  last_login_at: string | null;
  password: string;
}

interface SQLiteStore {
  store_name: string;
  position_x: number;
  position_y: number;
  position_z: number;
  width: number;
  depth: number;
  height: number;
  rows: number;
  columns: number;
  rotation_y: number;
  auto_settle: number;
  store_type: 'grid' | 'hanger';
  hanger_slots: number;
  slot_capacity?: number | null;
}

interface SQLiteBlanket {
  blanket_number: string;
  store: string;
  row: number;
  column: number;
  status: string;
  created_at: string;
}

interface SQLiteLog {
  blanket_number: string;
  action: string;
  user: string;
  store: string | null;
  row: number | null;
  column: number | null;
  status: string | null;
  timestamp: string;
}

export interface MigrationSummary {
  usersUpserted: number;
  storesUpserted: number;
  blanketsInserted: number;
  blanketsSkipped: number;
  logsInserted: number;
  logsSkipped: number;
}

const BATCH_SIZE = 100;

const normalizeDateKey = (value: string | null | undefined) => {
  if (!value) return '';

  const normalizedValue = /z|[+-]\d{2}:\d{2}$/i.test(value)
    ? value
    : `${value.replace(' ', 'T')}Z`;

  return new Date(normalizedValue).toISOString();
};

const blanketKey = (blanket: SQLiteBlanket) =>
  JSON.stringify([
    blanket.blanket_number,
    blanket.store,
    blanket.row,
    blanket.column,
    blanket.status,
    normalizeDateKey(blanket.created_at),
  ]);

const logKey = (log: SQLiteLog) =>
  JSON.stringify([
    log.blanket_number,
    log.action,
    log.user ?? 'system',
    log.store ?? '',
    log.row ?? '',
    log.column ?? '',
    log.status ?? '',
    normalizeDateKey(log.timestamp),
  ]);

const insertInBatches = async <T>(items: T[], insert: (batch: T[]) => Promise<void>) => {
  for (let index = 0; index < items.length; index += BATCH_SIZE) {
    await insert(items.slice(index, index + BATCH_SIZE));
  }
};

const fetchAllSupabaseRows = async <T>(fetch: (from: number, to: number) => Promise<T[]>) => {
  const results: T[] = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const batch = await fetch(from, from + pageSize - 1);
    results.push(...batch);
    if (batch.length < pageSize) break;
    from += pageSize;
  }

  return results;
};

export const migrateSqliteToSupabase = async (dbPath = 'blanket_storage.db'): Promise<MigrationSummary> => {
  if (!supabaseAdmin) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required to migrate SQLite data to Supabase.');
  }

  const db = new Database(dbPath, { readonly: true });

  const users = db
    .prepare('SELECT username, full_name, email, phone, avatar_url, role, is_active, last_login_at, password FROM users ORDER BY id')
    .all() as SQLiteUser[];
  let stores: SQLiteStore[] = [];
  try {
    stores = db
      .prepare(
        'SELECT store_name, position_x, position_y, position_z, width, depth, height, rows, columns, rotation_y, auto_settle, store_type, hanger_slots, slot_capacity FROM stores ORDER BY store_name'
      )
      .all() as SQLiteStore[];
  } catch {
    stores = db
      .prepare(
        'SELECT store_name, position_x, position_y, position_z, width, depth, height, rows, columns, rotation_y, auto_settle, store_type, hanger_slots FROM stores ORDER BY store_name'
      )
      .all()
      .map((store: any) => ({ ...store, slot_capacity: null })) as SQLiteStore[];
  }
  const blankets = db
    .prepare('SELECT blanket_number, store, row, column, status, created_at FROM blankets ORDER BY created_at')
    .all() as SQLiteBlanket[];
  const logs = db
    .prepare('SELECT blanket_number, action, user, store, row, column, status, timestamp FROM logs ORDER BY timestamp')
    .all() as SQLiteLog[];

  let usersUpserted = 0;
  for (const user of users) {
    const normalizedUser = {
      ...user,
      is_active: user.is_active !== 0,
    };
    const authUserId = await ensureAuthUser(normalizedUser);
    await upsertPublicUser(normalizedUser, authUserId);
    usersUpserted += 1;
  }

  if (stores.length > 0) {
    const { error } = await supabaseAdmin
      .from('stores')
      .upsert(
        stores.map((store) => ({
          ...store,
          auto_settle: Boolean(store.auto_settle),
          slot_capacity:
            store.store_type === 'hanger'
              ? 1
              : Math.max(
                  1,
                  Number(store.slot_capacity ?? (/^folding\\b/i.test(store.store_name) ? 20 : 1))
                ),
        })),
        { onConflict: 'store_name' }
      );

    if (error) throw error;
  }

  const existingBlankets = await fetchAllSupabaseRows<SQLiteBlanket>(async (from, to) => {
    const { data, error } = await supabaseAdmin
      .from('blankets')
      .select('blanket_number, store, row, column, status, created_at')
      .order('id', { ascending: true })
      .range(from, to);
    if (error) throw error;
    return (data ?? []) as SQLiteBlanket[];
  });

  const blanketKeys = new Set(
    existingBlankets.map((blanket) => blanketKey(blanket))
  );

  const blanketsToInsert = blankets
    .filter((blanket) => !blanketKeys.has(blanketKey(blanket)))
    .map((blanket) => ({
      blanket_number: blanket.blanket_number,
      store: blanket.store,
      row: blanket.row,
      column: blanket.column,
      status: blanket.status,
      created_at: blanket.created_at,
    }));

  await insertInBatches(blanketsToInsert, async (batch) => {
    const { error } = await supabaseAdmin.from('blankets').insert(batch);
    if (error) throw error;
  });

  const existingLogs = await fetchAllSupabaseRows<SQLiteLog>(async (from, to) => {
    const { data, error } = await supabaseAdmin
      .from('logs')
      .select('blanket_number, action, user, store, row, column, status, timestamp')
      .order('id', { ascending: true })
      .range(from, to);
    if (error) throw error;
    return (data ?? []) as SQLiteLog[];
  });

  const logKeys = new Set(existingLogs.map((log) => logKey(log)));

  const logsToInsert = logs
    .filter((log) => !logKeys.has(logKey(log)))
    .map((log) => ({
      blanket_number: log.blanket_number,
      action: log.action,
      user: log.user ?? 'system',
      store: log.store,
      row: log.row,
      column: log.column,
      status: log.status,
      timestamp: log.timestamp,
    }));

  await insertInBatches(logsToInsert, async (batch) => {
    const { error } = await supabaseAdmin.from('logs').insert(batch);
    if (error) throw error;
  });

  db.close();

  return {
    usersUpserted,
    storesUpserted: stores.length,
    blanketsInserted: blanketsToInsert.length,
    blanketsSkipped: blankets.length - blanketsToInsert.length,
    logsInserted: logsToInsert.length,
    logsSkipped: logs.length - logsToInsert.length,
  };
};
