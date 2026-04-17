import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import {
  AppUserRole,
  ensureAuthUser,
  isSupabaseAdminEnabled,
  listAllAuthUsers,
  normalizeManagedEmail,
  supabaseAdmin,
  updateAuthLoginStamp,
  upsertPublicUser,
} from './src/server/supabaseAdmin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_LOCAL_FOOTPRINT = 5;

const db = new Database('blanket_storage.db');

type BackupSnapshot = {
  version: 1;
  created_at: string;
  sqlite: {
    stores: any[];
    blankets: any[];
    logs: any[];
  };
  supabase: {
    enabled: boolean;
    error?: string;
    stores?: any[];
    blankets?: any[];
    logs?: any[];
  };
};

type SQLiteUserRecord = {
  id: number;
  username: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: AppUserRole;
  password: string;
  is_active: number;
  created_at: string | null;
  updated_at: string | null;
  last_login_at: string | null;
};

type ApiUser = {
  id: number;
  username: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  role: AppUserRole;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
  last_login_at: string | null;
};

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'cashier',
    password TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS stores (
    store_name TEXT PRIMARY KEY,
    position_x REAL DEFAULT 0,
    position_y REAL DEFAULT 0,
    position_z REAL DEFAULT 0,
    width REAL DEFAULT 5,
    depth REAL DEFAULT 5,
    height REAL DEFAULT 3,
    rows INTEGER DEFAULT 10,
    columns INTEGER DEFAULT 10,
    rotation_y REAL DEFAULT 0,
    auto_settle INTEGER DEFAULT 1,
    store_type TEXT DEFAULT 'grid',
    hanger_slots INTEGER DEFAULT 0,
    slot_capacity INTEGER DEFAULT 1,
    store_color TEXT DEFAULT '#3b82f6',
    store_opacity REAL DEFAULT 1,
    cell_width REAL DEFAULT 0.5,
    cell_depth REAL DEFAULT 0.5
  );

  CREATE TABLE IF NOT EXISTS blankets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blanket_number TEXT NOT NULL,
    store TEXT NOT NULL,
    row INTEGER NOT NULL,
    column INTEGER NOT NULL,
    status TEXT DEFAULT 'stored',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blanket_number TEXT NOT NULL,
    action TEXT NOT NULL,
    user TEXT DEFAULT 'system',
    store TEXT,
    row INTEGER,
    column INTEGER,
    status TEXT,
    request_id TEXT,
    device TEXT,
    ip TEXT,
    notes TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_blankets_store ON blankets(store);
  CREATE INDEX IF NOT EXISTS idx_blankets_number ON blankets(blanket_number);
  CREATE INDEX IF NOT EXISTS idx_blankets_slot_status ON blankets(store, row, column, status);
  CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
  CREATE INDEX IF NOT EXISTS idx_logs_request_id ON logs(request_id);
`);

const ensureColumn = (table: string, column: string, sqlType: string) => {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all().map((col: any) => col.name);
  if (!columns.includes(column)) {
    db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${sqlType}`).run();
  }
};

ensureColumn('stores', 'auto_settle', 'INTEGER DEFAULT 1');
ensureColumn('stores', 'store_type', "TEXT DEFAULT 'grid'");
ensureColumn('stores', 'hanger_slots', 'INTEGER DEFAULT 0');
ensureColumn('stores', 'slot_capacity', 'INTEGER DEFAULT 1');
ensureColumn('stores', 'store_color', "TEXT DEFAULT '#3b82f6'");
ensureColumn('stores', 'store_opacity', 'REAL DEFAULT 1');
ensureColumn('stores', 'cell_width', 'REAL DEFAULT 0.5');
ensureColumn('stores', 'cell_depth', 'REAL DEFAULT 0.5');

// Backfill: folded shelves can hold multiple bags per cell.
// If you already use a different capacity, edit it from the Management UI.
db.prepare(
  "UPDATE stores SET slot_capacity = 20 WHERE lower(store_name) LIKE 'folding%' AND (slot_capacity IS NULL OR slot_capacity <= 1)"
).run();
db.prepare(
  `UPDATE stores
   SET cell_width = ${STORE_LOCAL_FOOTPRINT}.0 / CASE WHEN COALESCE(columns, 0) <= 0 THEN 1 ELSE columns END
   WHERE cell_width IS NULL OR cell_width <= 0`
).run();
db.prepare(
  `UPDATE stores
   SET cell_depth = ${STORE_LOCAL_FOOTPRINT}.0 / CASE WHEN COALESCE(rows, 0) <= 0 THEN 1 ELSE rows END
   WHERE cell_depth IS NULL OR cell_depth <= 0`
).run();

ensureColumn('users', 'password', "TEXT DEFAULT ''");
ensureColumn('users', 'full_name', 'TEXT');
ensureColumn('users', 'email', 'TEXT');
ensureColumn('users', 'phone', 'TEXT');
ensureColumn('users', 'avatar_url', 'TEXT');
ensureColumn('users', 'is_active', 'INTEGER DEFAULT 1');
ensureColumn('users', 'created_at', 'DATETIME');
ensureColumn('users', 'updated_at', 'DATETIME');
ensureColumn('users', 'last_login_at', 'DATETIME');

ensureColumn('logs', 'user', "TEXT DEFAULT 'system'");
ensureColumn('logs', 'store', 'TEXT');
ensureColumn('logs', 'row', 'INTEGER');
ensureColumn('logs', 'column', 'INTEGER');
ensureColumn('logs', 'status', 'TEXT');
ensureColumn('logs', 'request_id', 'TEXT');
ensureColumn('logs', 'device', 'TEXT');
ensureColumn('logs', 'ip', 'TEXT');
ensureColumn('logs', 'notes', 'TEXT');

const chunk = <T,>(arr: T[], size: number) => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

const isAdminUsername = async (username: unknown) => {
  if (typeof username !== 'string' || username.trim().length === 0) return false;
  const row = db.prepare('SELECT role FROM users WHERE username = ?').get(username.trim()) as { role?: string } | undefined;
  const role = String(row?.role ?? '').toLowerCase();
  return role === 'admin' || role === 'super-admin';
};

const readSqliteSnapshot = (opts: { logsLimit: number; blanketsLimit: number }) => {
  const stores = db.prepare('SELECT * FROM stores ORDER BY store_name ASC').all();
  const blankets = db
    .prepare('SELECT * FROM blankets ORDER BY datetime(created_at) DESC, id DESC LIMIT ?')
    .all(opts.blanketsLimit);
  const logs = db
    .prepare('SELECT * FROM logs ORDER BY datetime(timestamp) DESC, id DESC LIMIT ?')
    .all(opts.logsLimit);

  return { stores, blankets, logs };
};

const fetchSupabaseRows = async (table: 'stores' | 'blankets' | 'logs', opts: { limit: number }) => {
  if (!supabaseAdmin) throw new Error('Supabase admin is not configured.');
  const pageSize = 1000;
  const limit = Math.max(0, Math.min(opts.limit, 200000));
  const out: any[] = [];

  for (let offset = 0; offset < limit; offset += pageSize) {
    const end = Math.min(limit - 1, offset + pageSize - 1);
    let q = supabaseAdmin.from(table).select('*');

    if (table === 'stores') {
      q = q.order('store_name', { ascending: true });
    } else if (table === 'blankets') {
      q = q.order('created_at', { ascending: false }).order('id', { ascending: false });
    } else {
      q = q.order('timestamp', { ascending: false }).order('id', { ascending: false });
    }

    const { data, error } = await q.range(offset, end);
    if (error) throw error;
    const batch = data ?? [];
    out.push(...batch);
    if (batch.length < pageSize) break;
  }

  return out;
};

const restoreSqliteFromSnapshot = (snapshot: { stores: any[]; blankets: any[]; logs: any[] }) => {
  db.exec('BEGIN');
  try {
    db.prepare('DELETE FROM logs').run();
    db.prepare('DELETE FROM blankets').run();
    db.prepare('DELETE FROM stores').run();

    const insertStore = db.prepare(`
      INSERT OR REPLACE INTO stores (
        store_name, position_x, position_y, position_z, width, depth, height,
        rows, columns, rotation_y, auto_settle, store_type, hanger_slots, slot_capacity, store_color, store_opacity, cell_width, cell_depth
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const s of snapshot.stores ?? []) {
      insertStore.run(
        s.store_name,
        s.position_x ?? 0,
        s.position_y ?? 0,
        s.position_z ?? 0,
        s.width ?? 5,
        s.depth ?? 5,
        s.height ?? 3,
        s.rows ?? 10,
        s.columns ?? 10,
        s.rotation_y ?? 0,
        s.auto_settle ?? 1,
        s.store_type ?? 'grid',
        s.hanger_slots ?? 0,
        s.slot_capacity ?? 1,
        normalizeStoreColor(s.store_color),
        normalizeStoreOpacity(s.store_opacity),
        normalizeStoreCellDimension(s.cell_width, deriveDefaultCellWidth(s.columns ?? 10)),
        normalizeStoreCellDimension(s.cell_depth, deriveDefaultCellDepth(s.rows ?? 10))
      );
    }

    const insertBlanket = db.prepare(`
      INSERT INTO blankets (blanket_number, store, row, column, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const b of snapshot.blankets ?? []) {
      insertBlanket.run(
        b.blanket_number,
        b.store,
        b.row,
        b.column,
        b.status ?? 'stored',
        b.created_at ?? new Date().toISOString()
      );
    }

    const insertLog = db.prepare(`
      INSERT INTO logs (blanket_number, action, user, store, row, column, status, request_id, device, ip, notes, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const l of snapshot.logs ?? []) {
      insertLog.run(
        l.blanket_number,
        l.action,
        l.user ?? 'system',
        l.store ?? null,
        l.row ?? null,
        l.column ?? null,
        l.status ?? null,
        l.request_id ?? null,
        l.device ?? null,
        l.ip ?? null,
        l.notes ?? null,
        l.timestamp ?? new Date().toISOString()
      );
    }

    db.exec('COMMIT');
    return { stores: snapshot.stores?.length ?? 0, blankets: snapshot.blankets?.length ?? 0, logs: snapshot.logs?.length ?? 0 };
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
};

const storeCount = db.prepare('SELECT COUNT(*) as count FROM stores').get() as { count: number };

const requiredUsers = [
  { username: 'sanad', full_name: 'Sanad', role: 'super-admin' as AppUserRole, password: '05687' },
  { username: 'anglica', full_name: 'Anglica', role: 'admin' as AppUserRole, password: '0123' },
  { username: 'cris', full_name: 'Cris', role: 'cashier' as AppUserRole, password: '123' },
  { username: 'bilal', full_name: 'Bilal', role: 'cashier' as AppUserRole, password: '123' },
  { username: 'suhibe', full_name: 'Suhibe', role: 'admin' as AppUserRole, password: '0123' },
  { username: 'steven', full_name: 'Steven', role: 'cashier' as AppUserRole, password: '123' },
  { username: 'ritaz', full_name: 'Ritaz', role: 'cashier' as AppUserRole, password: '123' },
  { username: 'maaz', full_name: 'Maaz', role: 'admin' as AppUserRole, password: '0123' },
  { username: 'muhanad', full_name: 'Muhanad', role: 'admin' as AppUserRole, password: '0123' },
];

const seedUserStatement = db.prepare(`
  INSERT OR IGNORE INTO users (username, full_name, email, role, password, is_active)
  VALUES (?, ?, ?, ?, ?, 1)
`);

requiredUsers.forEach((user) => {
  seedUserStatement.run(
    user.username,
    user.full_name,
    normalizeManagedEmail({ username: user.username }),
    user.role,
    user.password
  );
});

db.prepare(`
  UPDATE users
  SET
    full_name = COALESCE(NULLIF(full_name, ''), username),
    email = COALESCE(NULLIF(email, ''), username || '@laundrywarehouse.local'),
    is_active = COALESCE(is_active, 1),
    updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP),
    created_at = COALESCE(created_at, CURRENT_TIMESTAMP)
`).run();

const defaultStoreSlots = [
  { x: -10, z: -10 },
  { x: -10, z: 0 },
  { x: 0, z: -10 },
  { x: 0, z: 0 },
  { x: 10, z: -10 },
  { x: 10, z: 0 },
  { x: 20, z: 0 },
];

if (storeCount.count === 0) {
  // Baseline layout captured from the current production arrangement.
  // If DB is reset/empty, seeding restores stores to these exact positions/sizes.
  const initialStores = [
    {
      store_name: 'B1-back',
      position_x: 10.322,
      position_y: 7.759,
      position_z: 1.3754627632033496,
      width: 10.5,
      depth: 7.5,
      height: 1.6,
      rows: 15,
      columns: 8,
      rotation_y: 1.5707963267948966,
      auto_settle: 1,
      store_type: 'grid',
      hanger_slots: 0,
      slot_capacity: 1,
    },
    {
      store_name: 'B1-front',
      position_x: 9.322,
      position_y: 7.759,
      position_z: 1.375,
      width: 10.5,
      depth: 7.5,
      height: 1.6,
      rows: 10,
      columns: 10,
      rotation_y: 1.5707963267948966,
      auto_settle: 1,
      store_type: 'grid',
      hanger_slots: 0,
      slot_capacity: 1,
    },
    {
      store_name: 'B2-back',
      position_x: 1,
      position_y: 7.759,
      position_z: 10.903,
      width: 10,
      depth: 7,
      height: 1.6,
      rows: 10,
      columns: 10,
      rotation_y: 0,
      auto_settle: 1,
      store_type: 'grid',
      hanger_slots: 0,
      slot_capacity: 1,
    },
    {
      store_name: 'B2-front',
      position_x: 1,
      position_y: 7.759,
      position_z: 10.2,
      width: 10,
      depth: 7,
      height: 1.6,
      rows: 10,
      columns: 10,
      rotation_y: 0,
      auto_settle: 1,
      store_type: 'grid',
      hanger_slots: 0,
      slot_capacity: 1,
    },
    {
      store_name: 'B3-back',
      position_x: -7.590821757612656,
      position_y: 7.759000000000001,
      position_z: 0.299,
      width: 8,
      depth: 7,
      height: 1.6,
      rows: 10,
      columns: 10,
      rotation_y: -1.5707963267948966,
      auto_settle: 1,
      store_type: 'grid',
      hanger_slots: 0,
      slot_capacity: 1,
    },
    {
      store_name: 'B3-front',
      position_x: -6.891,
      position_y: 7.759,
      position_z: 1.199,
      width: 8,
      depth: 7,
      height: 1.6,
      rows: 10,
      columns: 10,
      rotation_y: -1.5707963267948966,
      auto_settle: 1,
      store_type: 'grid',
      hanger_slots: 0,
      slot_capacity: 1,
    },
    {
      store_name: 'B4',
      position_x: 1.456,
      position_y: 7.759,
      position_z: 1.182,
      width: 8,
      depth: 7,
      height: 1.6,
      rows: 5,
      columns: 5,
      rotation_y: 0,
      auto_settle: 1,
      store_type: 'grid',
      hanger_slots: 0,
      slot_capacity: 1,
    },
    {
      store_name: 'Folding ',
      position_x: 16,
      position_y: 0,
      position_z: 0,
      width: 10,
      depth: 10,
      height: 3,
      rows: 10,
      columns: 10,
      rotation_y: 0,
      auto_settle: 1,
      store_type: 'grid',
      hanger_slots: 0,
      slot_capacity: 20,
    },
    {
      store_name: 'Folding 3',
      position_x: 6.497718771320222,
      position_y: -0.8,
      position_z: 11.332,
      width: 1.7,
      depth: 8,
      height: 3.9,
      rows: 7,
      columns: 2,
      rotation_y: 0,
      auto_settle: 0,
      store_type: 'grid',
      hanger_slots: 0,
      slot_capacity: 20,
    },
    {
      store_name: 'conveyer  ',
      position_x: 32.348,
      position_y: 0,
      position_z: 0,
      width: 10,
      depth: 1,
      height: 3,
      rows: 1,
      columns: 10,
      rotation_y: 0,
      auto_settle: 1,
      store_type: 'grid',
      hanger_slots: 0,
      slot_capacity: 1,
    },
    {
      store_name: 'folding 2',
      position_x: 12.048,
      position_y: -1.1,
      position_z: 3.592,
      width: 3.8,
      depth: 7,
      height: 3.8,
      rows: 5,
      columns: 2,
      rotation_y: 1.5707963267948966,
      auto_settle: 0,
      store_type: 'grid',
      hanger_slots: 0,
      slot_capacity: 20,
    },
  ];

  const insertStore = db.prepare(`
    INSERT INTO stores (
      store_name, position_x, position_y, position_z, width, depth, height,
      rows, columns, rotation_y, auto_settle, store_type, hanger_slots, slot_capacity, store_color, store_opacity, cell_width, cell_depth
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  initialStores.forEach((store) => {
    insertStore.run(
      store.store_name,
      store.position_x,
      store.position_y,
      store.position_z,
      store.width,
      store.depth,
      store.height,
      store.rows,
      store.columns,
      store.rotation_y,
      store.auto_settle,
      store.store_type,
      store.hanger_slots,
      store.slot_capacity,
      normalizeStoreColor((store as any).store_color),
      normalizeStoreOpacity((store as any).store_opacity),
      normalizeStoreCellDimension((store as any).cell_width, deriveDefaultCellWidth(store.columns)),
      normalizeStoreCellDimension((store as any).cell_depth, deriveDefaultCellDepth(store.rows))
    );
  });
}

const normalizeSQLiteUser = (user: SQLiteUserRecord): ApiUser => ({
  id: user.id,
  username: user.username,
  full_name: user.full_name?.trim() || user.username,
  email: user.email?.trim() || normalizeManagedEmail({ username: user.username }),
  phone: user.phone?.trim() || '',
  avatar_url: user.avatar_url?.trim() || '',
  role: user.role,
  is_active: user.is_active !== 0,
  created_at: user.created_at ?? null,
  updated_at: user.updated_at ?? null,
  last_login_at: user.last_login_at ?? null,
});

const deriveBlanketAction = (
  previous: {
    store: string;
    row: number;
    column: number;
    status: string;
  } | undefined,
  next: {
    store: string;
    row: number;
    column: number;
    status: string;
  }
) => {
  if (!previous) {
    return next.status || 'stored';
  }

  if (previous.status !== next.status) {
    return next.status;
  }

  if (
    previous.store !== next.store ||
    previous.row !== next.row ||
    previous.column !== next.column
  ) {
    return 'moved';
  }

  return 'updated';
};

const getClientIp = (req: express.Request) => {
  const forwarded = req.headers['x-forwarded-for'];
  const headerValue = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (typeof headerValue === 'string' && headerValue.trim()) {
    return headerValue.split(',')[0].trim();
  }
  return req.socket.remoteAddress || req.ip || '';
};

const clampText = (value: unknown, maxLength: number) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed;
};

const normalizeStoreColor = (value: unknown) => {
  const raw = typeof value === 'string' ? value.trim() : '';
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw) ? raw : '#3b82f6';
};

const normalizeStoreOpacity = (value: unknown) => {
  return Math.min(1, Math.max(0.1, Number(value ?? 1) || 1));
};

const deriveDefaultCellWidth = (columns: unknown) =>
  STORE_LOCAL_FOOTPRINT / Math.max(1, Number(columns ?? 1) || 1);

const deriveDefaultCellDepth = (rows: unknown) =>
  STORE_LOCAL_FOOTPRINT / Math.max(1, Number(rows ?? 1) || 1);

const normalizeStoreCellDimension = (value: unknown, fallback: number) =>
  Math.min(20, Math.max(0.1, Number(value ?? fallback) || fallback));

const getLogMeta = (req: express.Request) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const headerRequestId = req.headers['x-request-id'];
  const requestId =
    clampText(body.request_id, 80) ||
    (Array.isArray(headerRequestId) ? headerRequestId[0] : clampText(headerRequestId, 80)) ||
    randomUUID();

  const device = clampText(body.device, 300) || clampText(req.headers['user-agent'], 300);
  const ip = clampText(body.ip, 80) || clampText(getClientIp(req), 80);
  const notes = clampText(body.notes, 1000);

  return {
    request_id: requestId,
    device: device || null,
    ip: ip || null,
    notes: notes || null,
  };
};

const insertSupabaseLog = async (entry: Record<string, unknown>) => {
  if (!supabaseAdmin) {
    return { error: { message: 'Supabase admin is not configured.' } as any };
  }

  const { error } = await supabaseAdmin.from('logs').insert(entry);
  if (!error) return { error: null };

  // Backwards compatibility: if the Supabase schema hasn't been updated yet, retry without new columns.
  const code = (error as any).code;
  if (code === '42703' || code === 'PGRST204') {
    const { request_id: _requestId, device: _device, ip: _ip, notes: _notes, ...fallback } = entry;
    const retry = await supabaseAdmin.from('logs').insert(fallback);
    return { error: retry.error ?? error };
  }

  return { error };
};

const assertSqliteBlanketSlot = (storeName: string, row: number, column: number, status: string, excludeBlanketId?: number) => {
  const store = db
    .prepare('SELECT store_name, rows, columns, store_type, slot_capacity FROM stores WHERE store_name = ?')
    .get(storeName) as
    | { store_name: string; rows: number; columns: number; store_type: string; slot_capacity: number }
    | undefined;

  if (!store) {
    const error = new Error(`Store not found: ${storeName}`);
    (error as any).status = 400;
    throw error;
  }

  const maxRows = Number(store.rows ?? 0);
  const maxCols = Number(store.columns ?? 0);

  if (row < 1 || row > maxRows) {
    const error = new Error(`Row out of bounds (1..${maxRows})`);
    (error as any).status = 400;
    throw error;
  }

  if (column < 1 || column > maxCols) {
    const error = new Error(`Column out of bounds (1..${maxCols})`);
    (error as any).status = 400;
    throw error;
  }

  if (status !== 'stored') return;

  const capacity = store.store_type === 'hanger' ? 1 : Math.max(1, Number(store.slot_capacity ?? 1));
  const stmt =
    typeof excludeBlanketId === 'number'
      ? db.prepare(
          'SELECT COUNT(*) as c FROM blankets WHERE store = ? AND row = ? AND column = ? AND status = ? AND id <> ?'
        )
      : db.prepare('SELECT COUNT(*) as c FROM blankets WHERE store = ? AND row = ? AND column = ? AND status = ?');

  const countRow =
    typeof excludeBlanketId === 'number'
      ? (stmt.get(storeName, row, column, 'stored', excludeBlanketId) as { c: number })
      : (stmt.get(storeName, row, column, 'stored') as { c: number });

  if (Number(countRow?.c ?? 0) >= capacity) {
    const error = new Error(`Slot is full (capacity ${capacity})`);
    (error as any).status = 400;
    throw error;
  }
};

const assertSupabaseBlanketSlot = async (
  storeName: string,
  row: number,
  column: number,
  status: string,
  excludeBlanketId?: number
) => {
  if (!supabaseAdmin) return;

  const { data: store, error: storeError } = await supabaseAdmin
    .from('stores')
    .select('store_name, rows, columns, store_type, slot_capacity')
    .eq('store_name', storeName)
    .single();
  if (storeError) throw storeError;
  if (!store) throw new Error(`Store not found: ${storeName}`);

  const maxRows = Number((store as any).rows ?? 0);
  const maxCols = Number((store as any).columns ?? 0);

  if (row < 1 || row > maxRows) {
    const error: any = new Error(`Row out of bounds (1..${maxRows})`);
    error.status = 400;
    throw error;
  }
  if (column < 1 || column > maxCols) {
    const error: any = new Error(`Column out of bounds (1..${maxCols})`);
    error.status = 400;
    throw error;
  }

  if (status !== 'stored') return;

  const capacity =
    (store as any).store_type === 'hanger'
      ? 1
      : Math.max(1, Number((store as any).slot_capacity ?? 1));

  let query = supabaseAdmin
    .from('blankets')
    .select('id', { count: 'exact', head: true })
    .eq('store', storeName)
    .eq('row', row)
    .eq('column', column)
    .eq('status', 'stored');

  if (typeof excludeBlanketId === 'number') {
    query = query.neq('id', excludeBlanketId);
  }

  const { count, error: countError } = await query;
  if (countError) throw countError;

  if ((count ?? 0) >= capacity) {
    const error: any = new Error(`Slot is full (capacity ${capacity})`);
    error.status = 400;
    throw error;
  }
};

const parseUserPayload = (body: any) => ({
  username: String(body?.username ?? '').trim(),
  full_name: typeof body?.full_name === 'string' ? body.full_name.trim() : '',
  email: typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '',
  phone: typeof body?.phone === 'string' ? body.phone.trim() : '',
  avatar_url: typeof body?.avatar_url === 'string' ? body.avatar_url : '',
  role: (body?.role ?? 'cashier') as AppUserRole,
  is_active: body?.is_active !== false,
  password: typeof body?.password === 'string' && body.password.length > 0 ? body.password : undefined,
});

const upsertSQLiteUser = (payload: ReturnType<typeof parseUserPayload>, existingId?: number) => {
  if (existingId) {
    if (payload.password) {
      db.prepare(`
        UPDATE users
        SET username = ?, full_name = ?, email = ?, phone = ?, avatar_url = ?, role = ?, is_active = ?, password = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        payload.username,
        payload.full_name || payload.username,
        payload.email || normalizeManagedEmail(payload),
        payload.phone,
        payload.avatar_url,
        payload.role,
        payload.is_active ? 1 : 0,
        payload.password,
        existingId
      );
    } else {
      db.prepare(`
        UPDATE users
        SET username = ?, full_name = ?, email = ?, phone = ?, avatar_url = ?, role = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        payload.username,
        payload.full_name || payload.username,
        payload.email || normalizeManagedEmail(payload),
        payload.phone,
        payload.avatar_url,
        payload.role,
        payload.is_active ? 1 : 0,
        existingId
      );
    }

    return db.prepare('SELECT * FROM users WHERE id = ?').get(existingId) as SQLiteUserRecord;
  }

  db.prepare(`
    INSERT INTO users (username, full_name, email, phone, avatar_url, role, password, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).run(
    payload.username,
    payload.full_name || payload.username,
    payload.email || normalizeManagedEmail(payload),
    payload.phone,
    payload.avatar_url,
    payload.role,
    payload.password || '',
    payload.is_active ? 1 : 0
  );

  return db.prepare('SELECT * FROM users WHERE username = ?').get(payload.username) as SQLiteUserRecord;
};

const touchSQLiteLastLogin = (id: number, timestamp: string) => {
  db.prepare('UPDATE users SET last_login_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(timestamp, id);
};

const getSQLiteUsers = (username?: string) => {
  if (username) {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as SQLiteUserRecord | undefined;
    return user ? [normalizeSQLiteUser(user)] : [];
  }

  const users = db.prepare('SELECT * FROM users ORDER BY username').all() as SQLiteUserRecord[];
  return users.map(normalizeSQLiteUser);
};

const getSupabaseUsers = async (username?: string) => {
  if (!supabaseAdmin) {
    return [];
  }

  const { data: publicUsers, error } = await supabaseAdmin
    .from('users')
    .select('id, username, role, auth_user_id, created_at')
    .order('username', { ascending: true });

  if (error) throw error;

  const authUsers = await listAllAuthUsers();
  const authUsersById = new Map(authUsers.map((user) => [user.id, user]));

  const merged = (publicUsers ?? []).map((user) => {
    const authUser = user.auth_user_id ? authUsersById.get(user.auth_user_id) : undefined;
    const metadata = (authUser?.user_metadata ?? {}) as Record<string, unknown>;

    return {
      id: user.id,
      username: user.username,
      full_name: String(metadata.full_name ?? user.username),
      email: authUser?.email ?? normalizeManagedEmail({ username: user.username }),
      phone: String(metadata.phone ?? ''),
      avatar_url: String(metadata.avatar_url ?? ''),
      role: user.role as AppUserRole,
      is_active: metadata.is_active !== false,
      created_at: authUser?.created_at ?? user.created_at ?? null,
      updated_at: authUser?.updated_at ?? null,
      last_login_at: metadata.last_login_at ? String(metadata.last_login_at) : null,
    } satisfies ApiUser;
  });

  return username ? merged.filter((user) => user.username === username) : merged;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.set('trust proxy', true);
  app.use(cors());
  // Backup/restore payloads can be large (JSON snapshots).
  app.use(express.json({ limit: '50mb' }));

  const asyncHandler =
    (fn: any) =>
    (req: any, res: any, next: any) =>
      Promise.resolve(fn(req, res, next)).catch(next);

  // Runtime config for static clients (optional).
  // Lets the browser read Supabase keys from the server environment without rebuilding `dist`.
  app.get('/runtime-config.js', (_req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    const enabled = process.env.VITE_SUPABASE_ENABLED ?? process.env.VITE_USE_SUPABASE ?? '';
    const url = process.env.VITE_SUPABASE_URL ?? '';
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? '';
    res.send(
      [
        'window.__RUNTIME_CONFIG__ = window.__RUNTIME_CONFIG__ || {};',
        `window.__RUNTIME_CONFIG__.VITE_SUPABASE_ENABLED = ${JSON.stringify(enabled)};`,
        `window.__RUNTIME_CONFIG__.VITE_SUPABASE_URL = ${JSON.stringify(url)};`,
        `window.__RUNTIME_CONFIG__.VITE_SUPABASE_ANON_KEY = ${JSON.stringify(anonKey)};`,
      ].join('\n')
    );
  });

  app.get(
    '/api/backup/snapshot',
    asyncHandler(async (req, res) => {
      const user = typeof req.query.user === 'string' ? req.query.user : '';
      if (!(await isAdminUsername(user))) return res.status(403).json({ error: 'Admin only.' });

      const rawLogsLimit = Number(req.query.logsLimit ?? 20000);
      const rawBlanketsLimit = Number(req.query.blanketsLimit ?? 100000);
      const logsLimit = Number.isFinite(rawLogsLimit) ? Math.min(200000, Math.max(0, rawLogsLimit)) : 20000;
      const blanketsLimit = Number.isFinite(rawBlanketsLimit) ? Math.min(200000, Math.max(0, rawBlanketsLimit)) : 100000;

      const snapshot: BackupSnapshot = {
        version: 1,
        created_at: new Date().toISOString(),
        sqlite: readSqliteSnapshot({ logsLimit, blanketsLimit }),
        supabase: {
          enabled: Boolean(supabaseAdmin),
        },
      };

      if (supabaseAdmin) {
        try {
          const [stores, blankets, logs] = await Promise.all([
            fetchSupabaseRows('stores', { limit: 200000 }),
            fetchSupabaseRows('blankets', { limit: blanketsLimit }),
            fetchSupabaseRows('logs', { limit: logsLimit }),
          ]);
          snapshot.supabase.stores = stores;
          snapshot.supabase.blankets = blankets;
          snapshot.supabase.logs = logs;
        } catch (error: any) {
          snapshot.supabase.error = error?.message ? String(error.message) : String(error);
        }
      } else {
        snapshot.supabase.error = 'Supabase admin is not configured.';
      }

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="backup-snapshot-${new Date().toISOString().replace(/[:.]/g, '-')}.json"`
      );
      return res.json(snapshot);
    })
  );

  // Supabase data proxy.
  // Some environments have trouble connecting to Supabase REST from the browser (HTTP/2 / connection resets).
  // These endpoints let the frontend call the local server, and the server talks to Supabase using the service key.
  app.get('/api/supabase/stores', async (_req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase admin is not configured.' });
    const { data, error } = await supabaseAdmin.from('stores').select('*').order('store_name', { ascending: true });
    if (error) return res.status(500).json({ error: error.message, code: (error as any).code });
    return res.json(data ?? []);
  });

  app.post('/api/supabase/stores', async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase admin is not configured.' });
    const payload = req.body ?? {};
    const visualPayload = {
      ...payload,
      store_color: normalizeStoreColor((payload as any).store_color),
      store_opacity: normalizeStoreOpacity((payload as any).store_opacity),
      cell_width: normalizeStoreCellDimension((payload as any).cell_width, deriveDefaultCellWidth((payload as any).columns ?? 10)),
      cell_depth: normalizeStoreCellDimension((payload as any).cell_depth, deriveDefaultCellDepth((payload as any).rows ?? 10)),
    };
    let { error } = await supabaseAdmin.from('stores').insert(visualPayload);
    // Backwards compatibility with older Supabase schema (without visual columns).
    if (error && ((error as any).code === '42703' || (error as any).code === 'PGRST204')) {
      const {
        store_color: _storeColor,
        store_opacity: _storeOpacity,
        cell_width: _cellWidth,
        cell_depth: _cellDepth,
        ...legacyPayload
      } = visualPayload as any;
      const retry = await supabaseAdmin.from('stores').insert(legacyPayload);
      error = retry.error ?? null;
    }
    if (error) return res.status(500).json({ error: error.message, code: (error as any).code });
    return res.json({ success: true });
  });

  app.put('/api/supabase/stores/:name', async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase admin is not configured.' });
    const name = req.params.name;
    const payload = req.body ?? {};
    const visualPayload = {
      ...payload,
      store_color: normalizeStoreColor((payload as any).store_color),
      store_opacity: normalizeStoreOpacity((payload as any).store_opacity),
      cell_width: normalizeStoreCellDimension((payload as any).cell_width, deriveDefaultCellWidth((payload as any).columns ?? 10)),
      cell_depth: normalizeStoreCellDimension((payload as any).cell_depth, deriveDefaultCellDepth((payload as any).rows ?? 10)),
    };
    let { error } = await supabaseAdmin.from('stores').update(visualPayload).eq('store_name', name);
    // Backwards compatibility with older Supabase schema (without visual columns).
    if (error && ((error as any).code === '42703' || (error as any).code === 'PGRST204')) {
      const {
        store_color: _storeColor,
        store_opacity: _storeOpacity,
        cell_width: _cellWidth,
        cell_depth: _cellDepth,
        ...legacyPayload
      } = visualPayload as any;
      const retry = await supabaseAdmin.from('stores').update(legacyPayload).eq('store_name', name);
      error = retry.error ?? null;
    }
    if (error) return res.status(500).json({ error: error.message, code: (error as any).code });
    return res.json({ success: true });
  });

  app.delete('/api/supabase/stores/:name', async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase admin is not configured.' });
    const name = req.params.name;
    const { count, error: countError } = await supabaseAdmin
      .from('blankets')
      .select('id', { count: 'exact', head: true })
      .eq('store', name);
    if (countError) return res.status(500).json({ error: countError.message, code: (countError as any).code });
    if ((count ?? 0) > 0) return res.status(400).json({ error: 'Cannot delete store with blankets in it.' });

    const { error } = await supabaseAdmin.from('stores').delete().eq('store_name', name);
    if (error) return res.status(500).json({ error: error.message, code: (error as any).code });
    return res.json({ success: true });
  });

  app.get('/api/supabase/blankets', async (_req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase admin is not configured.' });
    const { data, error } = await supabaseAdmin.from('blankets').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message, code: (error as any).code });
    return res.json(data ?? []);
  });

  app.post('/api/supabase/blankets', async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase admin is not configured.' });
    const { blanket_number, store, row, column, status, user } = req.body ?? {};
    const action = status || 'stored';
    const meta = getLogMeta(req);

    try {
      await assertSupabaseBlanketSlot(String(store), Number(row), Number(column), String(status || 'stored'));
    } catch (error: any) {
      return res.status(error.status || 400).json({ error: error.message || 'Invalid slot' });
    }

    const { data: insertedBlanket, error: insertError } = await supabaseAdmin
      .from('blankets')
      .insert({
        blanket_number,
        store,
        row,
        column,
        status: status || 'stored',
      })
      .select('*')
      .single();
    if (insertError) return res.status(500).json({ error: insertError.message, code: (insertError as any).code });

    const { error: logError } = await insertSupabaseLog({
      blanket_number,
      action,
      user: user || 'system',
      store,
      row,
      column,
      status: status || 'stored',
      request_id: meta.request_id,
      device: meta.device,
      ip: meta.ip,
      notes: meta.notes,
    });
    if (logError) return res.status(500).json({ error: logError.message, code: (logError as any).code });

    return res.json({ success: true, blanket: insertedBlanket });
  });

  app.put('/api/supabase/blankets/:id', async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase admin is not configured.' });
    const id = Number(req.params.id);
    const { user, request_id, device, ip, notes, ...payload } = req.body ?? {};
    const meta = getLogMeta(req);

    const { data: previous, error: fetchError } = await supabaseAdmin
      .from('blankets')
      .select('blanket_number, store, row, column, status')
      .eq('id', id)
      .single();
    if (fetchError) return res.status(500).json({ error: fetchError.message, code: (fetchError as any).code });
    if (!previous) return res.status(404).json({ error: 'Blanket not found' });

    const next = {
      store: payload.store ?? previous.store,
      row: payload.row ?? previous.row,
      column: payload.column ?? previous.column,
      status: payload.status ?? previous.status,
    };
    const action = deriveBlanketAction(previous as any, next);

    try {
      await assertSupabaseBlanketSlot(String(next.store), Number(next.row), Number(next.column), String(next.status), id);
    } catch (error: any) {
      return res.status(error.status || 400).json({ error: error.message || 'Invalid slot' });
    }

    const { error: updateError } = await supabaseAdmin.from('blankets').update(payload).eq('id', id);
    if (updateError) return res.status(500).json({ error: updateError.message, code: (updateError as any).code });

    const { error: logError } = await insertSupabaseLog({
      blanket_number: payload.blanket_number ?? previous.blanket_number,
      action,
      user: user || 'system',
      store: next.store,
      row: next.row,
      column: next.column,
      status: next.status,
      request_id: typeof request_id === 'string' && request_id.trim() ? request_id.trim() : meta.request_id,
      device: typeof device === 'string' && device.trim() ? device.trim() : meta.device,
      ip: typeof ip === 'string' && ip.trim() ? ip.trim() : meta.ip,
      notes: typeof notes === 'string' && notes.trim() ? notes.trim() : meta.notes,
    });
    if (logError) return res.status(500).json({ error: logError.message, code: (logError as any).code });

    return res.json({ success: true });
  });

  app.delete('/api/supabase/blankets/:id', async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase admin is not configured.' });
    const id = Number(req.params.id);
    const user = req.body?.user ?? 'system';
    const meta = getLogMeta(req);

    const { data: blanket, error: fetchError } = await supabaseAdmin
      .from('blankets')
      .select('blanket_number, store, row, column, status')
      .eq('id', id)
      .single();
    if (fetchError) return res.status(500).json({ error: fetchError.message, code: (fetchError as any).code });
    if (!blanket) return res.status(404).json({ error: 'Blanket not found' });

    const { error: deleteError } = await supabaseAdmin.from('blankets').delete().eq('id', id);
    if (deleteError) return res.status(500).json({ error: deleteError.message, code: (deleteError as any).code });

    const { error: logError } = await insertSupabaseLog({
      blanket_number: blanket.blanket_number,
      action: 'deleted',
      user,
      store: blanket.store,
      row: blanket.row,
      column: blanket.column,
      status: blanket.status,
      request_id: meta.request_id,
      device: meta.device,
      ip: meta.ip,
      notes: meta.notes,
    });
    if (logError) return res.status(500).json({ error: logError.message, code: (logError as any).code });

    return res.json({ success: true });
  });

  app.get('/api/supabase/logs', async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase admin is not configured.' });
    const limit = Math.min(1000, Math.max(1, Number(req.query.limit ?? 500)));
    const { data, error } = await supabaseAdmin
      .from('logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit);
    if (error) return res.status(500).json({ error: error.message, code: (error as any).code });
    return res.json(data ?? []);
  });

  app.post('/api/supabase/logs', async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase admin is not configured.' });
    const meta = getLogMeta(req);
    const payload = { ...(req.body ?? {}) } as Record<string, unknown>;
    const merged = {
      ...payload,
      request_id: typeof payload.request_id === 'string' && String(payload.request_id).trim() ? payload.request_id : meta.request_id,
      device: typeof payload.device === 'string' && String(payload.device).trim() ? payload.device : meta.device,
      ip: typeof payload.ip === 'string' && String(payload.ip).trim() ? payload.ip : meta.ip,
      notes: typeof payload.notes === 'string' && String(payload.notes).trim() ? payload.notes : meta.notes,
    };

    const { error } = await insertSupabaseLog(merged);
    if (error) return res.status(500).json({ error: error.message, code: (error as any).code });
    return res.json({ success: true });
  });

  app.post(
    '/api/restore/sqlite',
    asyncHandler(async (req, res) => {
      const { snapshot, source, confirm, user } = req.body ?? {};
      if (!(await isAdminUsername(user))) return res.status(403).json({ error: 'Admin only.' });
      if (confirm !== 'RESTORE') return res.status(400).json({ error: 'Confirmation required. Set confirm="RESTORE".' });
      if (!snapshot || (source !== 'sqlite' && source !== 'supabase')) {
        return res.status(400).json({ error: 'Invalid payload. Provide snapshot + source.' });
      }
      const section = snapshot?.[source];
      if (!section?.stores || !section?.blankets || !section?.logs) {
        return res.status(400).json({ error: `Snapshot section "${source}" is missing stores/blankets/logs.` });
      }

      const counts = restoreSqliteFromSnapshot({
        stores: section.stores,
        blankets: section.blankets,
        logs: section.logs,
      });

      return res.json({ success: true, restored: counts });
    })
  );

  app.post(
    '/api/restore/supabase',
    asyncHandler(async (req, res) => {
      if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase admin is not configured.' });
      const { snapshot, source, confirm, user } = req.body ?? {};
      if (!(await isAdminUsername(user))) return res.status(403).json({ error: 'Admin only.' });
      if (confirm !== 'RESTORE') return res.status(400).json({ error: 'Confirmation required. Set confirm="RESTORE".' });
      if (!snapshot || (source !== 'sqlite' && source !== 'supabase')) {
        return res.status(400).json({ error: 'Invalid payload. Provide snapshot + source.' });
      }
      const section = snapshot?.[source];
      if (!section?.stores || !section?.blankets || !section?.logs) {
        return res.status(400).json({ error: `Snapshot section "${source}" is missing stores/blankets/logs.` });
      }

      const { error: delLogsErr } = await supabaseAdmin.from('logs').delete().gt('id', 0);
      if (delLogsErr) throw delLogsErr;
      const { error: delBlanketsErr } = await supabaseAdmin.from('blankets').delete().gt('id', 0);
      if (delBlanketsErr) throw delBlanketsErr;
      // Delete all stores. Use a safe neq filter (PostgREST requires a filter for deletes).
      const { error: delStoresErr } = await supabaseAdmin.from('stores').delete().neq('store_name', '__never__');
      if (delStoresErr) throw delStoresErr;

      const storesPayload = (section.stores as any[]).map((s) => ({
        store_name: s.store_name,
        position_x: s.position_x ?? 0,
        position_y: s.position_y ?? 0,
        position_z: s.position_z ?? 0,
        width: s.width ?? 5,
        depth: s.depth ?? 5,
        height: s.height ?? 3,
        rows: s.rows ?? 10,
        columns: s.columns ?? 10,
        rotation_y: s.rotation_y ?? 0,
        auto_settle: s.auto_settle ?? true,
        store_type: s.store_type ?? 'grid',
        hanger_slots: s.hanger_slots ?? 0,
        slot_capacity: s.slot_capacity ?? 1,
        store_color: normalizeStoreColor(s.store_color),
        store_opacity: normalizeStoreOpacity(s.store_opacity),
        cell_width: normalizeStoreCellDimension(s.cell_width, deriveDefaultCellWidth(s.columns ?? 10)),
        cell_depth: normalizeStoreCellDimension(s.cell_depth, deriveDefaultCellDepth(s.rows ?? 10)),
      }));

      for (const batch of chunk(storesPayload, 500)) {
        const { error } = await supabaseAdmin.from('stores').insert(batch);
        if (error) throw error;
      }

      const blanketsPayload = (section.blankets as any[]).map((b) => ({
        blanket_number: b.blanket_number,
        store: b.store,
        row: b.row,
        column: b.column,
        status: b.status ?? 'stored',
        created_at: b.created_at ?? undefined,
      }));

      for (const batch of chunk(blanketsPayload, 500)) {
        const { error } = await supabaseAdmin.from('blankets').insert(batch);
        if (error) throw error;
      }

      const logsPayload = (section.logs as any[]).map((l) => ({
        blanket_number: l.blanket_number,
        action: l.action,
        user: l.user ?? 'system',
        store: l.store ?? null,
        row: l.row ?? null,
        column: l.column ?? null,
        status: l.status ?? null,
        request_id: l.request_id ?? undefined,
        device: l.device ?? null,
        ip: l.ip ?? null,
        notes: l.notes ?? null,
        timestamp: l.timestamp ?? undefined,
      }));

      for (const batch of chunk(logsPayload, 500)) {
        const { error } = await supabaseAdmin.from('logs').insert(batch);
        if (error) throw error;
      }

      return res.json({
        success: true,
        restored: {
          stores: storesPayload.length,
          blankets: blanketsPayload.length,
          logs: logsPayload.length,
        },
      });
    })
  );

  app.get('/api/users', async (req, res) => {
    try {
      const username = typeof req.query.username === 'string' ? req.query.username : undefined;
      const users = isSupabaseAdminEnabled ? await getSupabaseUsers(username) : getSQLiteUsers(username);

      if (username) {
        const user = users[0];
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        return res.json(user);
      }

      res.json(users);
    } catch (error) {
      console.error('Failed to load users:', error);
      res.status(500).json({ error: 'Failed to load users', details: String(error) });
    }
  });

  app.post('/api/users', async (req, res) => {
    try {
      const payload = parseUserPayload(req.body);

      if (!payload.username || !payload.password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      if (isSupabaseAdminEnabled && payload.password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
      }

      const sqliteUser = upsertSQLiteUser(payload);

      if (isSupabaseAdminEnabled && supabaseAdmin) {
        const authUserId = await ensureAuthUser(payload);
        await upsertPublicUser(payload, authUserId);
        const createdUser = (await getSupabaseUsers(payload.username))[0];
        return res.status(201).json(createdUser);
      }

      res.status(201).json(normalizeSQLiteUser(sqliteUser));
    } catch (error: any) {
      console.error('Failed to create user:', error);
      res.status(500).json({ error: error.message || 'Failed to create user' });
    }
  });

  app.put('/api/users/:id', async (req, res) => {
    try {
      const userId = Number(req.params.id);
      const payload = parseUserPayload(req.body);

      if (!payload.username) {
        return res.status(400).json({ error: 'Username is required' });
      }

      if (isSupabaseAdminEnabled && payload.password && payload.password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
      }

      const sqliteExisting = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as SQLiteUserRecord | undefined;
      if (!sqliteExisting) {
        return res.status(404).json({ error: 'User not found' });
      }

      upsertSQLiteUser(payload, userId);

      if (isSupabaseAdminEnabled && supabaseAdmin) {
        const { data: publicUser, error } = await supabaseAdmin
          .from('users')
          .select('id, username, role, auth_user_id')
          .eq('id', userId)
          .single();

        if (error) throw error;

        const authUserId = await ensureAuthUser(payload, publicUser.auth_user_id);
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({
            username: payload.username,
            role: payload.role,
            auth_user_id: authUserId,
          })
          .eq('id', userId);

        if (updateError) throw updateError;

        const updatedUser = (await getSupabaseUsers(payload.username))[0];
        return res.json(updatedUser);
      }

      const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as SQLiteUserRecord;
      res.json(normalizeSQLiteUser(updatedUser));
    } catch (error: any) {
      console.error('Failed to update user:', error);
      res.status(500).json({ error: error.message || 'Failed to update user' });
    }
  });

  app.delete('/api/users/:id', async (req, res) => {
    try {
      const userId = Number(req.params.id);
      const sqliteExisting = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as SQLiteUserRecord | undefined;
      if (!sqliteExisting) {
        return res.status(404).json({ error: 'User not found' });
      }

      db.prepare('DELETE FROM users WHERE id = ?').run(userId);

      if (isSupabaseAdminEnabled && supabaseAdmin) {
        const { data: publicUser, error } = await supabaseAdmin
          .from('users')
          .select('id, auth_user_id')
          .eq('id', userId)
          .single();

        if (error) throw error;

        const { error: deletePublicError } = await supabaseAdmin.from('users').delete().eq('id', userId);
        if (deletePublicError) throw deletePublicError;

        if (publicUser.auth_user_id) {
          const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(publicUser.auth_user_id);
          if (deleteAuthError) throw deleteAuthError;
        }
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      res.status(500).json({ error: error.message || 'Failed to delete user' });
    }
  });

  app.post('/api/users/:id/touch-login', async (req, res) => {
    try {
      const userId = Number(req.params.id);
      const timestamp = new Date().toISOString();
      touchSQLiteLastLogin(userId, timestamp);

      if (isSupabaseAdminEnabled && supabaseAdmin) {
        const { data: publicUser, error } = await supabaseAdmin
          .from('users')
          .select('auth_user_id')
          .eq('id', userId)
          .single();

        if (error) throw error;
        if (publicUser.auth_user_id) {
          await updateAuthLoginStamp(publicUser.auth_user_id, timestamp);
        }
      }

      res.json({ success: true, last_login_at: timestamp });
    } catch (error: any) {
      console.error('Failed to record last login:', error);
      res.status(500).json({ error: error.message || 'Failed to record last login' });
    }
  });

  app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as SQLiteUserRecord | undefined;

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    if (user.is_active === 0) {
      return res.status(403).json({ error: 'This user is inactive.' });
    }

    const timestamp = new Date().toISOString();
    touchSQLiteLastLogin(user.id, timestamp);

    res.json(normalizeSQLiteUser({ ...user, last_login_at: timestamp }));
  });

  app.get('/api/stores', (_req, res) => {
    const stores = db.prepare('SELECT * FROM stores').all();
    res.json(stores);
  });

  app.post('/api/stores', (req, res) => {
    const { store_name, rows, columns, auto_settle, store_type, hanger_slots, slot_capacity, width, depth, height, store_color, store_opacity, cell_width, cell_depth } = req.body;

    const normalizedRows = store_type === 'hanger' ? 1 : Math.max(1, Number(rows ?? 10) || 1);
    const normalizedHangerSlots = store_type === 'hanger'
      ? Math.max(1, Number(hanger_slots ?? columns ?? 10) || 1)
      : Math.max(0, Number(hanger_slots ?? 0) || 0);
    const normalizedColumns = store_type === 'hanger' ? normalizedHangerSlots : Math.max(1, Number(columns ?? 10) || 1);
    const normalizedWidth = Math.max(0.1, Number(width ?? normalizedColumns) || normalizedColumns);
    const normalizedDepth = Math.max(0.1, Number(depth ?? (store_type === 'hanger' ? 1 : normalizedRows)) || (store_type === 'hanger' ? 1 : normalizedRows));
    const normalizedHeight = Math.max(0.1, Number(height ?? 3) || 3);
    const normalizedStoreColor = normalizeStoreColor(store_color);
    const normalizedStoreOpacity = normalizeStoreOpacity(store_opacity);
    const normalizedCellWidth = normalizeStoreCellDimension(cell_width, deriveDefaultCellWidth(normalizedColumns));
    const normalizedCellDepth = normalizeStoreCellDimension(cell_depth, deriveDefaultCellDepth(normalizedRows));
    const normalizedSlotCapacity =
      store_type === 'hanger'
        ? 1
        : Math.max(1, Number(slot_capacity ?? (/^folding\\b/i.test(String(store_name)) ? 20 : 1)));

    const existingPositions = db.prepare('SELECT position_x, position_z FROM stores').all() as { position_x: number; position_z: number }[];
    const availableSlot = defaultStoreSlots.find(
      (slot) => !existingPositions.some((pos) => pos.position_x === slot.x && pos.position_z === slot.z)
    );

    const position_x = availableSlot ? availableSlot.x : (existingPositions.length ? existingPositions[existingPositions.length - 1].position_x + 15 : 0);
    const position_z = availableSlot ? availableSlot.z : 0;

    db.prepare(`
      INSERT INTO stores (
        store_name, position_x, position_z, width, depth, height, rows, columns,
        auto_settle, store_type, hanger_slots, slot_capacity, store_color, store_opacity, cell_width, cell_depth
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      store_name,
      position_x,
      position_z,
      normalizedWidth,
      normalizedDepth,
      normalizedHeight,
      normalizedRows,
      normalizedColumns,
      auto_settle === false ? 0 : 1,
      store_type || 'grid',
      normalizedHangerSlots,
      normalizedSlotCapacity,
      normalizedStoreColor,
      normalizedStoreOpacity,
      normalizedCellWidth,
      normalizedCellDepth
    );

    res.json({ success: true });
  });

  app.put('/api/stores/:name', (req, res) => {
    const { name } = req.params;
    const { position_x, position_y, position_z, width, depth, height, rows, columns, rotation_y, auto_settle, store_type, hanger_slots, slot_capacity, store_color, store_opacity, cell_width, cell_depth } = req.body;

    const normalizedRows = store_type === 'hanger' ? 1 : Math.max(1, Number(rows ?? 10) || 1);
    const normalizedHangerSlots = store_type === 'hanger'
      ? Math.max(1, Number(hanger_slots ?? columns ?? 10) || 1)
      : Math.max(0, Number(hanger_slots ?? 0) || 0);
    const normalizedColumns = store_type === 'hanger' ? normalizedHangerSlots : Math.max(1, Number(columns ?? 10) || 1);
    const normalizedWidth = Math.max(0.1, Number(width ?? normalizedColumns) || normalizedColumns);
    const normalizedDepth = Math.max(0.1, Number(depth ?? (store_type === 'hanger' ? 1 : normalizedRows)) || (store_type === 'hanger' ? 1 : normalizedRows));
    const normalizedHeight = Math.max(0.1, Number(height ?? 3) || 3);
    const normalizedStoreColor = normalizeStoreColor(store_color);
    const normalizedStoreOpacity = normalizeStoreOpacity(store_opacity);
    const normalizedCellWidth = normalizeStoreCellDimension(cell_width, deriveDefaultCellWidth(normalizedColumns));
    const normalizedCellDepth = normalizeStoreCellDimension(cell_depth, deriveDefaultCellDepth(normalizedRows));
    const normalizedSlotCapacity = store_type === 'hanger' ? 1 : Math.max(1, Number(slot_capacity ?? 1));

    db.prepare(`
      UPDATE stores
      SET position_x = ?, position_y = ?, position_z = ?, width = ?, depth = ?, height = ?, rows = ?, columns = ?, rotation_y = ?, auto_settle = ?, store_type = ?, hanger_slots = ?, slot_capacity = ?, store_color = ?, store_opacity = ?, cell_width = ?, cell_depth = ?
      WHERE store_name = ?
    `).run(
      position_x,
      position_y,
      position_z,
      normalizedWidth,
      normalizedDepth,
      normalizedHeight,
      normalizedRows,
      normalizedColumns,
      rotation_y,
      auto_settle === false ? 0 : 1,
      store_type || 'grid',
      normalizedHangerSlots,
      normalizedSlotCapacity,
      normalizedStoreColor,
      normalizedStoreOpacity,
      normalizedCellWidth,
      normalizedCellDepth,
      name
    );

    res.json({ success: true });
  });

  app.delete('/api/stores/:name', (req, res) => {
    const { name } = req.params;

    const blanketCount = db.prepare('SELECT COUNT(*) as count FROM blankets WHERE store = ?').get(name) as { count: number };
    if (blanketCount.count > 0) {
      return res.status(400).json({ error: 'Cannot delete store with blankets in it.' });
    }

    db.prepare('DELETE FROM stores WHERE store_name = ?').run(name);
    res.json({ success: true });
  });

  app.get('/api/blankets', (_req, res) => {
    const blankets = db.prepare('SELECT * FROM blankets ORDER BY created_at DESC').all();
    res.json(blankets);
  });

  app.post('/api/blankets', (req, res) => {
    const { blanket_number, store, row, column, status, user, notes } = req.body;
    const action = status || 'stored';
    const meta = getLogMeta(req);

    try {
      assertSqliteBlanketSlot(String(store), Number(row), Number(column), String(status || 'stored'));
    } catch (error: any) {
      return res.status(error.status || 400).json({ error: error.message || 'Invalid slot' });
    }

    const result = db.prepare(`
      INSERT INTO blankets (blanket_number, store, row, column, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(blanket_number, store, row, column, status || 'stored');

    db.prepare(
      'INSERT INTO logs (blanket_number, action, user, store, row, column, status, request_id, device, ip, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      blanket_number,
      action,
      user || 'system',
      store,
      row,
      column,
      status || 'stored',
      meta.request_id,
      meta.device,
      meta.ip,
      typeof notes === 'string' && notes.trim().length > 0 ? notes.trim() : meta.notes
    );

    res.json({ id: result.lastInsertRowid });
  });

  app.put('/api/blankets/:id', (req, res) => {
    const { id } = req.params;
    const { blanket_number, store, row, column, status, user, notes } = req.body;
    const meta = getLogMeta(req);
    const previous = db.prepare('SELECT blanket_number, store, row, column, status FROM blankets WHERE id = ?').get(id) as
      | { blanket_number: string; store: string; row: number; column: number; status: string }
      | undefined;

    const action = deriveBlanketAction(previous, { store, row, column, status });

    try {
      assertSqliteBlanketSlot(String(store), Number(row), Number(column), String(status), Number(id));
    } catch (error: any) {
      return res.status(error.status || 400).json({ error: error.message || 'Invalid slot' });
    }

    db.prepare(`
      UPDATE blankets
      SET blanket_number = ?, store = ?, row = ?, column = ?, status = ?
      WHERE id = ?
    `).run(blanket_number, store, row, column, status, id);

    db.prepare(
      'INSERT INTO logs (blanket_number, action, user, store, row, column, status, request_id, device, ip, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      blanket_number,
      action,
      user || 'system',
      store,
      row,
      column,
      status,
      meta.request_id,
      meta.device,
      meta.ip,
      typeof notes === 'string' && notes.trim().length > 0 ? notes.trim() : meta.notes
    );

    res.json({ success: true });
  });

  app.delete('/api/blankets/:id', (req, res) => {
    const { id } = req.params;
    const meta = getLogMeta(req);
    const blanket = db.prepare('SELECT blanket_number, store, row, column, status FROM blankets WHERE id = ?').get(id) as
      | { blanket_number: string; store: string | null; row: number | null; column: number | null; status: string | null }
      | undefined;

    if (blanket) {
      db.prepare('DELETE FROM blankets WHERE id = ?').run(id);
      db.prepare(
        'INSERT INTO logs (blanket_number, action, user, store, row, column, status, request_id, device, ip, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(
        blanket.blanket_number,
        'deleted',
        req.body?.user || 'system',
        blanket.store,
        blanket.row,
        blanket.column,
        blanket.status,
        meta.request_id,
        meta.device,
        meta.ip,
        meta.notes
      );
    }

    res.json({ success: true });
  });

  app.get('/api/logs', (req, res) => {
    // Order by id as a tie-breaker so multiple events in the same second don't appear to "overwrite" each other.
    const rawLimit = Number(req.query.limit ?? 500);
    const limit = Number.isFinite(rawLimit) ? Math.min(1000, Math.max(1, rawLimit)) : 500;
    const logs = db.prepare('SELECT * FROM logs ORDER BY timestamp DESC, id DESC LIMIT ?').all(limit);
    res.json(logs);
  });

  app.post('/api/logs', (req, res) => {
    const { blanket_number, action, user, store, row, column, status, notes } = req.body;
    const meta = getLogMeta(req);
    db.prepare(
      'INSERT INTO logs (blanket_number, action, user, store, row, column, status, request_id, device, ip, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      blanket_number,
      action,
      user || 'system',
      store,
      row ?? null,
      column ?? null,
      status,
      meta.request_id,
      meta.device,
      meta.ip,
      typeof notes === 'string' && notes.trim().length > 0 ? notes.trim() : meta.notes
    );
    res.json({ success: true });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global error handler (ensures JSON responses instead of HTML).
  // Useful for body-parser errors like "request entity too large" and async route failures.
  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error('Unhandled server error:', err);
    if (err?.type === 'entity.too.large') {
      return res.status(413).json({ error: 'Backup file is too large. Reduce logsLimit or split backups.' });
    }
    return res.status(500).json({ error: err?.message ? String(err.message) : 'Internal Server Error' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
