import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { existsSync, statSync } from 'fs';
import cors from 'cors';
import Database from 'better-sqlite3';
import { Pool } from 'pg';
import { randomBytes, randomInt, randomUUID, scryptSync, timingSafeEqual } from 'crypto';
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
import { detectSortingItemCategory } from './src/utils/sortingItemCategory';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_LOCAL_FOOTPRINT = 5;

const db = new Database('blanket_storage.db');
const DB_PROVIDER = String(process.env.DB_PROVIDER ?? 'sqlite').trim().toLowerCase();
const POSTGRES_URL = String(process.env.POSTGRES_URL ?? '').trim();
const USE_POSTGRES_LOCAL = DB_PROVIDER === 'postgres' && POSTGRES_URL.length > 0;
const pgPool: Pool | null = USE_POSTGRES_LOCAL
  ? new Pool({
      connectionString: POSTGRES_URL,
      max: 10,
    })
  : null;

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

type SessionRecord = {
  token: string;
  user_id: number;
  username: string;
  role: AppUserRole;
  expires_at: number;
};

type CustomerUserRecord = {
  id: string;
  name: string;
  phone: string | null;
  phone_normalized: string | null;
  email: string | null;
  email_normalized: string | null;
  password_hash: string;
  customer_type: string | null;
  area: string | null;
  pref_service: number | null;
  notif_type: string | null;
  is_active: number;
  created_at: string | null;
  updated_at: string | null;
  last_login_at: string | null;
};

type CustomerSessionRecord = {
  token: string;
  user_id: string;
  expires_at: number;
};

type CustomerOtpPurpose = 'register' | 'login';
type CustomerOtpChannel = 'sms' | 'whatsapp';

type CustomerOtpChallengeRecord = {
  id: string;
  phone_normalized: string;
  phone_e164: string;
  purpose: CustomerOtpPurpose;
  channel: CustomerOtpChannel;
  provider: 'twilio' | 'aipsoft' | 'mock';
  code_hash: string | null;
  expires_at: number;
  attempts: number;
  cooldown_until: number;
};

type CustomerOtpVerificationRecord = {
  token: string;
  phone_normalized: string;
  purpose: CustomerOtpPurpose;
  expires_at: number;
  consumed: boolean;
};

type DriverSessionRecord = {
  token: string;
  driver_id: string;
  driver_name: string;
  driver_phone: string;
  expires_at: number;
};

type PosOrderPreview = {
  orders_id: string;
  order_no: string;
  created_at: string;
  invoice_no: string;
  invoice_date: string;
  delivery_type: string;
  customer_phone: string;
  customer_name: string;
  notes: string;
  total: number;
  paid: number;
  balance: number;
  branch: string;
  cust_head_id: string;
  invoice_id: string;
  status_flags: string[];
};

type PosOrderDetailLineItem = {
  line_key: string;
  sale_entry_id: string;
  product_id: string;
  name: string;
  service: string;
  qty: number;
  unit_price: number;
  sub_total: number;
  tax_amount: number;
  total_with_tax: number;
  barcode: string;
  unit: string;
};

type PosOrderDetailsResult = {
  general: {
    order_id: string;
    order_no: string;
    searched_order_id: string;
    searched_invoice_id: string;
    customer_name: string;
    customer_mobile: string;
    customer_address: string;
    delivery_type: string;
    delivery_date: string;
    delivery_time: string;
    billing_date: string;
    total_amount: number;
    tax_amount: number;
    grand_total: number;
    received_amount: number;
    balance: number;
    status: string;
    branch_id: string;
    salesman_id: string;
    driver_id: string;
    invoice_remark1: string;
    invoice_remark2: string;
  };
  line_items: PosOrderDetailLineItem[];
  dynamic_fields: any[];
  person_count_details: any[];
  product_assigned_tax: any;
  invoice_history: any[];
  raw_counts: {
    rows: number;
    line_items: number;
  };
};

type AlertMatchState = 'complete' | 'missing' | 'extra' | 'unknown';

type CustomerAlertTemplateRecord = {
  id: number;
  name: string;
  channel: string;
  body: string;
  is_active: number;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type CustomerAlertCandidate = {
  order_number: string;
  order_no: string;
  customer_name: string;
  phone: string;
  quantity_in_order: number;
  quantity_in_store: number;
  qty_in_order: number;
  qty_in_store: number;
  matched: 'yes' | 'no';
  match_state: AlertMatchState;
  warnings: string[];
  total_amount: number;
  first_stored_at: string | null;
  store_slots: Array<{
    blanket_id: number;
    store: string;
    row: number;
    column: number;
    status: string;
    created_at: string | null;
  }>;
  pos_error?: string;
  last_alert_status: string | null;
  last_alert_at: string | null;
};

type SortingOrderStatus =
  | 'sorting_pending'
  | 'sorting_partial'
  | 'sorted_complete'
  | 'packing_in_progress'
  | 'packed_complete';

type SortingCellStatus = 'empty' | 'pending' | 'partial' | 'complete';

type SortingTableRecord = {
  id: number;
  name: string;
  rows: number;
  cols: number;
  sort_order: number;
  is_active: number;
  created_at: string;
  updated_at: string;
};

type SortingCellRecord = {
  id: number;
  table_id: number;
  row_no: number;
  col_no: number;
  active_order_no: string | null;
  status: SortingCellStatus;
  updated_at: string;
};

type SortingOrderRecord = {
  order_no: string;
  customer_name: string;
  total_required: number;
  total_sorted: number;
  total_ironed: number;
  status: SortingOrderStatus;
  table_id: number | null;
  row_no: number | null;
  col_no: number | null;
  source_orders_id: string | null;
  source_invoice_id: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

type SortingItemRecord = {
  id: number;
  order_no: string;
  item_name: string;
  qty_required: number;
  qty_sorted: number;
  qty_ironed: number;
  qty_packed: number;
  status: 'missing' | 'partial' | 'complete';
};

type SortingIroningEventRecord = {
  id: number;
  order_no: string;
  item_name: string | null;
  qty: number;
  user: string;
  request_id: string | null;
  timestamp: string;
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
    require_pick_scan INTEGER DEFAULT 0,
    store_color TEXT DEFAULT '#3b82f6',
    store_color_visible INTEGER DEFAULT 1,
    store_opacity REAL DEFAULT 1,
    cell_width REAL DEFAULT 0.5,
    cell_depth REAL DEFAULT 0.5,
    cell_height REAL DEFAULT 0.11
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

  CREATE TABLE IF NOT EXISTS customer_orders (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'new',
    payload TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS customer_site_config (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    payload TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS customer_alert_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'whatsapp',
    body TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS customer_alert_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_no TEXT NOT NULL,
    customer_name TEXT,
    phone TEXT,
    message_body TEXT NOT NULL,
    template_id INTEGER,
    status TEXT NOT NULL DEFAULT 'sent',
    provider_response TEXT,
    error_message TEXT,
    sent_by TEXT DEFAULT 'system',
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS customer_users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    phone_normalized TEXT,
    email TEXT,
    email_normalized TEXT,
    password_hash TEXT NOT NULL,
    customer_type TEXT DEFAULT 'individual',
    area TEXT,
    pref_service INTEGER DEFAULT 1,
    notif_type TEXT DEFAULT 'whatsapp',
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login_at DATETIME
  );

  CREATE TABLE IF NOT EXISTS customer_sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS app_sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    role TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS customer_driver_sessions (
    token TEXT PRIMARY KEY,
    payload TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sorting_tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    rows INTEGER NOT NULL DEFAULT 2,
    cols INTEGER NOT NULL DEFAULT 6,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sorting_cells (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_id INTEGER NOT NULL,
    row_no INTEGER NOT NULL,
    col_no INTEGER NOT NULL,
    active_order_no TEXT,
    status TEXT NOT NULL DEFAULT 'empty',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(table_id, row_no, col_no)
  );

  CREATE TABLE IF NOT EXISTS sorting_orders (
    order_no TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL DEFAULT '',
    total_required INTEGER NOT NULL DEFAULT 0,
    total_sorted INTEGER NOT NULL DEFAULT 0,
    total_ironed INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'sorting_pending',
    table_id INTEGER,
    row_no INTEGER,
    col_no INTEGER,
    source_orders_id TEXT,
    source_invoice_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
  );

  CREATE TABLE IF NOT EXISTS sorting_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_no TEXT NOT NULL,
    item_name TEXT NOT NULL,
    qty_required INTEGER NOT NULL DEFAULT 0,
    qty_sorted INTEGER NOT NULL DEFAULT 0,
    qty_ironed INTEGER NOT NULL DEFAULT 0,
    qty_packed INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'missing',
    UNIQUE(order_no, item_name)
  );

  CREATE TABLE IF NOT EXISTS sorting_ironing_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_no TEXT NOT NULL,
    item_name TEXT,
    qty INTEGER NOT NULL DEFAULT 1,
    user TEXT DEFAULT 'system',
    request_id TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sorting_blanket_packing_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_no TEXT NOT NULL,
    item_name TEXT,
    qty INTEGER NOT NULL DEFAULT 1,
    user TEXT DEFAULT 'system',
    request_id TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sorting_scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_no TEXT NOT NULL,
    scanned_code TEXT NOT NULL,
    table_id INTEGER,
    row_no INTEGER,
    col_no INTEGER,
    item_name TEXT,
    qty INTEGER NOT NULL DEFAULT 1,
    user TEXT DEFAULT 'system',
    request_id TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_blankets_store ON blankets(store);
  CREATE INDEX IF NOT EXISTS idx_blankets_number ON blankets(blanket_number);
  CREATE INDEX IF NOT EXISTS idx_blankets_slot_status ON blankets(store, row, column, status);
  CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
  CREATE INDEX IF NOT EXISTS idx_logs_request_id ON logs(request_id);
  CREATE INDEX IF NOT EXISTS idx_customer_orders_status ON customer_orders(status);
  CREATE INDEX IF NOT EXISTS idx_customer_orders_updated_at ON customer_orders(updated_at);
  CREATE INDEX IF NOT EXISTS idx_customer_alert_templates_active ON customer_alert_templates(is_active, updated_at);
  CREATE INDEX IF NOT EXISTS idx_customer_alert_logs_order_no ON customer_alert_logs(order_no, sent_at);
  CREATE INDEX IF NOT EXISTS idx_customer_alert_logs_status ON customer_alert_logs(status, sent_at);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_users_phone_norm ON customer_users(phone_normalized);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_users_email_norm ON customer_users(email_normalized);
  CREATE INDEX IF NOT EXISTS idx_customer_sessions_user_id ON customer_sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_customer_sessions_expires_at ON customer_sessions(expires_at);
  CREATE INDEX IF NOT EXISTS idx_app_sessions_user_id ON app_sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_app_sessions_expires_at ON app_sessions(expires_at);
  CREATE INDEX IF NOT EXISTS idx_customer_driver_sessions_expires_at ON customer_driver_sessions(expires_at);
  CREATE INDEX IF NOT EXISTS idx_sorting_cells_table ON sorting_cells(table_id, row_no, col_no);
  CREATE INDEX IF NOT EXISTS idx_sorting_orders_status ON sorting_orders(status, updated_at);
  CREATE INDEX IF NOT EXISTS idx_sorting_scans_order_no ON sorting_scans(order_no, timestamp);
  CREATE INDEX IF NOT EXISTS idx_sorting_ironing_events_order_no ON sorting_ironing_events(order_no, timestamp);
  CREATE INDEX IF NOT EXISTS idx_sorting_ironing_events_user ON sorting_ironing_events(user, timestamp);
  CREATE INDEX IF NOT EXISTS idx_sorting_blanket_events_order_no ON sorting_blanket_packing_events(order_no, timestamp);
  CREATE INDEX IF NOT EXISTS idx_sorting_blanket_events_user ON sorting_blanket_packing_events(user, timestamp);
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
ensureColumn('stores', 'require_pick_scan', 'INTEGER');
ensureColumn('stores', 'store_color', "TEXT DEFAULT '#3b82f6'");
ensureColumn('stores', 'store_color_visible', 'INTEGER DEFAULT 1');
ensureColumn('stores', 'store_opacity', 'REAL DEFAULT 1');
ensureColumn('stores', 'cell_width', 'REAL DEFAULT 0.5');
ensureColumn('stores', 'cell_depth', 'REAL DEFAULT 0.5');
ensureColumn('stores', 'cell_height', 'REAL DEFAULT 0.11');

// Backfill: folded shelves can hold multiple bags per cell.
// If you already use a different capacity, edit it from the Management UI.
db.prepare(
  "UPDATE stores SET slot_capacity = 20 WHERE lower(store_name) LIKE 'folding%' AND (slot_capacity IS NULL OR slot_capacity <= 1)"
).run();
db.prepare(
  `UPDATE stores
   SET require_pick_scan = CASE
     WHEN lower(COALESCE(store_type, 'grid')) = 'hanger' THEN 1
     ELSE 0
   END
   WHERE require_pick_scan IS NULL`
).run();
db.prepare(
  `UPDATE stores
   SET store_color_visible = 1
   WHERE store_color_visible IS NULL`
).run();
db.prepare(
  `UPDATE stores
   SET cell_width = ${STORE_LOCAL_FOOTPRINT}.0 / CASE WHEN COALESCE(columns, 0) <= 0 THEN 1 ELSE columns END
   WHERE cell_width IS NULL OR ABS(cell_width) < 0.001`
).run();
db.prepare(
  `UPDATE stores
   SET cell_depth = ${STORE_LOCAL_FOOTPRINT}.0 / CASE WHEN COALESCE(rows, 0) <= 0 THEN 1 ELSE rows END
   WHERE cell_depth IS NULL OR ABS(cell_depth) < 0.001`
).run();
db.prepare(
  `UPDATE stores
   SET cell_height = 0.11
   WHERE cell_height IS NULL OR ABS(cell_height) < 0.001`
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

ensureColumn('customer_users', 'name', "TEXT DEFAULT ''");
ensureColumn('customer_users', 'phone', 'TEXT');
ensureColumn('customer_users', 'phone_normalized', 'TEXT');
ensureColumn('customer_users', 'email', 'TEXT');
ensureColumn('customer_users', 'email_normalized', 'TEXT');
ensureColumn('customer_users', 'password_hash', "TEXT DEFAULT ''");
ensureColumn('customer_users', 'customer_type', "TEXT DEFAULT 'individual'");
ensureColumn('customer_users', 'area', 'TEXT');
ensureColumn('customer_users', 'pref_service', 'INTEGER DEFAULT 1');
ensureColumn('customer_users', 'notif_type', "TEXT DEFAULT 'whatsapp'");
ensureColumn('customer_users', 'is_active', 'INTEGER DEFAULT 1');
ensureColumn('customer_users', 'created_at', 'DATETIME');
ensureColumn('customer_users', 'updated_at', 'DATETIME');
ensureColumn('customer_users', 'last_login_at', 'DATETIME');
ensureColumn('customer_alert_templates', 'name', "TEXT DEFAULT 'Template'");
ensureColumn('customer_alert_templates', 'channel', "TEXT DEFAULT 'whatsapp'");
ensureColumn('customer_alert_templates', 'body', "TEXT DEFAULT ''");
ensureColumn('customer_alert_templates', 'is_active', 'INTEGER DEFAULT 1');
ensureColumn('customer_alert_templates', 'created_by', 'TEXT');
ensureColumn('customer_alert_templates', 'created_at', 'DATETIME');
ensureColumn('customer_alert_templates', 'updated_at', 'DATETIME');
ensureColumn('customer_alert_logs', 'order_no', "TEXT DEFAULT ''");
ensureColumn('customer_alert_logs', 'customer_name', 'TEXT');
ensureColumn('customer_alert_logs', 'phone', 'TEXT');
ensureColumn('customer_alert_logs', 'message_body', "TEXT DEFAULT ''");
ensureColumn('customer_alert_logs', 'template_id', 'INTEGER');
ensureColumn('customer_alert_logs', 'status', "TEXT DEFAULT 'sent'");
ensureColumn('customer_alert_logs', 'provider_response', 'TEXT');
ensureColumn('customer_alert_logs', 'error_message', 'TEXT');
ensureColumn('customer_alert_logs', 'sent_by', "TEXT DEFAULT 'system'");
ensureColumn('customer_alert_logs', 'sent_at', 'DATETIME');

ensureColumn('customer_sessions', 'token', "TEXT DEFAULT ''");
ensureColumn('customer_sessions', 'user_id', "TEXT DEFAULT ''");
ensureColumn('customer_sessions', 'expires_at', 'INTEGER DEFAULT 0');
ensureColumn('customer_sessions', 'created_at', 'DATETIME');

ensureColumn('customer_driver_sessions', 'payload', "TEXT DEFAULT '{}'");
ensureColumn('customer_driver_sessions', 'expires_at', 'INTEGER DEFAULT 0');
ensureColumn('customer_driver_sessions', 'created_at', 'DATETIME');

ensureColumn('sorting_tables', 'name', "TEXT DEFAULT ''");
ensureColumn('sorting_tables', 'rows', 'INTEGER DEFAULT 2');
ensureColumn('sorting_tables', 'cols', 'INTEGER DEFAULT 6');
ensureColumn('sorting_tables', 'sort_order', 'INTEGER DEFAULT 0');
ensureColumn('sorting_tables', 'is_active', 'INTEGER DEFAULT 1');
ensureColumn('sorting_tables', 'created_at', 'DATETIME');
ensureColumn('sorting_tables', 'updated_at', 'DATETIME');

ensureColumn('sorting_cells', 'table_id', 'INTEGER DEFAULT 0');
ensureColumn('sorting_cells', 'row_no', 'INTEGER DEFAULT 1');
ensureColumn('sorting_cells', 'col_no', 'INTEGER DEFAULT 1');
ensureColumn('sorting_cells', 'active_order_no', 'TEXT');
ensureColumn('sorting_cells', 'status', "TEXT DEFAULT 'empty'");
ensureColumn('sorting_cells', 'updated_at', 'DATETIME');

ensureColumn('sorting_orders', 'order_no', "TEXT DEFAULT ''");
ensureColumn('sorting_orders', 'customer_name', "TEXT DEFAULT ''");
ensureColumn('sorting_orders', 'total_required', 'INTEGER DEFAULT 0');
ensureColumn('sorting_orders', 'total_sorted', 'INTEGER DEFAULT 0');
ensureColumn('sorting_orders', 'total_ironed', 'INTEGER DEFAULT 0');
ensureColumn('sorting_orders', 'status', "TEXT DEFAULT 'sorting_pending'");
ensureColumn('sorting_orders', 'table_id', 'INTEGER');
ensureColumn('sorting_orders', 'row_no', 'INTEGER');
ensureColumn('sorting_orders', 'col_no', 'INTEGER');
ensureColumn('sorting_orders', 'source_orders_id', 'TEXT');
ensureColumn('sorting_orders', 'source_invoice_id', 'TEXT');
ensureColumn('sorting_orders', 'created_at', 'DATETIME');
ensureColumn('sorting_orders', 'updated_at', 'DATETIME');
ensureColumn('sorting_orders', 'completed_at', 'DATETIME');

ensureColumn('sorting_items', 'order_no', "TEXT DEFAULT ''");
ensureColumn('sorting_items', 'item_name', "TEXT DEFAULT ''");
ensureColumn('sorting_items', 'qty_required', 'INTEGER DEFAULT 0');
ensureColumn('sorting_items', 'qty_sorted', 'INTEGER DEFAULT 0');
ensureColumn('sorting_items', 'qty_ironed', 'INTEGER DEFAULT 0');
ensureColumn('sorting_items', 'qty_packed', 'INTEGER DEFAULT 0');
ensureColumn('sorting_items', 'status', "TEXT DEFAULT 'missing'");

ensureColumn('sorting_ironing_events', 'order_no', "TEXT DEFAULT ''");
ensureColumn('sorting_ironing_events', 'item_name', 'TEXT');
ensureColumn('sorting_ironing_events', 'qty', 'INTEGER DEFAULT 1');
ensureColumn('sorting_ironing_events', 'user', "TEXT DEFAULT 'system'");
ensureColumn('sorting_ironing_events', 'request_id', 'TEXT');
ensureColumn('sorting_ironing_events', 'timestamp', 'DATETIME');

ensureColumn('sorting_scans', 'order_no', "TEXT DEFAULT ''");
ensureColumn('sorting_scans', 'scanned_code', "TEXT DEFAULT ''");
ensureColumn('sorting_scans', 'table_id', 'INTEGER');
ensureColumn('sorting_scans', 'row_no', 'INTEGER');
ensureColumn('sorting_scans', 'col_no', 'INTEGER');
ensureColumn('sorting_scans', 'item_name', 'TEXT');
ensureColumn('sorting_scans', 'qty', 'INTEGER DEFAULT 1');
ensureColumn('sorting_scans', 'user', "TEXT DEFAULT 'system'");
ensureColumn('sorting_scans', 'request_id', 'TEXT');
ensureColumn('sorting_scans', 'timestamp', 'DATETIME');

ensureColumn('sorting_blanket_packing_events', 'order_no', "TEXT DEFAULT ''");
ensureColumn('sorting_blanket_packing_events', 'item_name', 'TEXT');
ensureColumn('sorting_blanket_packing_events', 'qty', 'INTEGER DEFAULT 1');
ensureColumn('sorting_blanket_packing_events', 'user', "TEXT DEFAULT 'system'");
ensureColumn('sorting_blanket_packing_events', 'request_id', 'TEXT');
ensureColumn('sorting_blanket_packing_events', 'timestamp', 'DATETIME');

const ensureSortingCellsForTable = (tableId: number, rows: number, cols: number) => {
  const normalizedRows = Math.max(1, Number(rows) || 1);
  const normalizedCols = Math.max(1, Number(cols) || 1);
  const existing = db
    .prepare('SELECT row_no, col_no FROM sorting_cells WHERE table_id = ?')
    .all(tableId) as Array<{ row_no: number; col_no: number }>;
  const existingKeys = new Set(existing.map((cell) => `${cell.row_no}:${cell.col_no}`));

  const insertCell = db.prepare(
    `INSERT INTO sorting_cells (table_id, row_no, col_no, active_order_no, status, updated_at)
     VALUES (?, ?, ?, NULL, 'empty', CURRENT_TIMESTAMP)`
  );

  for (let rowNo = 1; rowNo <= normalizedRows; rowNo += 1) {
    for (let colNo = 1; colNo <= normalizedCols; colNo += 1) {
      const key = `${rowNo}:${colNo}`;
      if (existingKeys.has(key)) continue;
      insertCell.run(tableId, rowNo, colNo);
    }
  }

  db.prepare(
    `DELETE FROM sorting_cells
     WHERE table_id = ?
       AND (row_no > ? OR col_no > ?)
       AND active_order_no IS NULL`
  ).run(tableId, normalizedRows, normalizedCols);
};

const sortingTablesCount = db.prepare('SELECT COUNT(*) AS count FROM sorting_tables').get() as { count: number };
if (!sortingTablesCount.count) {
  db.prepare(
    `INSERT INTO sorting_tables (name, rows, cols, sort_order, is_active, created_at, updated_at)
     VALUES ('Table 1', 2, 6, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
  ).run();
}

const allSortingTables = db
  .prepare('SELECT id, rows, cols FROM sorting_tables ORDER BY sort_order ASC, id ASC')
  .all() as Array<{ id: number; rows: number; cols: number }>;
for (const table of allSortingTables) {
  ensureSortingCellsForTable(table.id, table.rows, table.cols);
}

db.prepare(
  `UPDATE customer_users
   SET phone_normalized = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone, '+', ''), '-', ''), ' ', ''), '(', ''), ')', '')
   WHERE phone IS NOT NULL AND TRIM(COALESCE(phone_normalized, '')) = ''`
).run();

db.prepare(
  `UPDATE customer_users
   SET email_normalized = lower(trim(email))
   WHERE email IS NOT NULL AND TRIM(COALESCE(email_normalized, '')) = ''`
).run();

const customerAlertTemplatesCount = db
  .prepare('SELECT COUNT(*) AS count FROM customer_alert_templates')
  .get() as { count: number };

if (!customerAlertTemplatesCount.count) {
  const insertTemplate = db.prepare(
    `INSERT INTO customer_alert_templates (name, channel, body, is_active, created_by, created_at, updated_at)
     VALUES (?, 'whatsapp', ?, 1, 'system', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
  );
  insertTemplate.run(
    'تنبيه استلام الطلب',
    'مرحبا {{name}}، نود تذكيرك باستلام طلبك رقم {{order_no}}. عدد القطع {{pieces}} والإجمالي {{total}}. شكرا لتعاونك.'
  );
  insertTemplate.run(
    'عرض خصومات',
    'مرحبا {{name}}، لدينا خصم مميز لفترة محدودة على خدمات المغسلة. يسعدنا خدمتك دائما.'
  );
  insertTemplate.run(
    'متابعة نهائية',
    'تنبيه أخير: طلبك رقم {{order_no}} جاهز للاستلام. يرجى الاستلام بأقرب وقت ممكن.'
  );
}

db.prepare('DELETE FROM customer_sessions WHERE expires_at <= ?').run(Date.now());
db.prepare('DELETE FROM app_sessions WHERE expires_at <= ?').run(Date.now());
db.prepare('DELETE FROM customer_driver_sessions WHERE expires_at <= ?').run(Date.now());

const chunk = <T,>(arr: T[], size: number) => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

const CUSTOMER_ORDER_STATUSES = new Set([
  'new',
  'accepted',
  'on_the_way',
  'pickup',
  'washing',
  'ready',
  'delivery',
  'completed',
  'delivered',
  'cancelled',
]);

const normalizeCustomerOrderStatus = (value: unknown) => {
  const raw = String(value ?? '').trim().toLowerCase();
  if (CUSTOMER_ORDER_STATUSES.has(raw)) return raw;
  if (raw === 'in progress' || raw === 'ironing') return 'washing';
  return 'new';
};

const parseCustomerOrderPayload = (rawPayload: unknown) => {
  if (!rawPayload || typeof rawPayload !== 'object') return null;
  const payload = rawPayload as Record<string, unknown>;
  const id = String(payload.id ?? '').trim();
  if (!id) return null;
  return {
    ...payload,
    id,
    status: normalizeCustomerOrderStatus(payload.status),
  };
};

const extractBearerToken = (req: any) => {
  const header = String(req.headers?.authorization ?? '').trim();
  if (!header.toLowerCase().startsWith('bearer ')) return null;
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
};

const CUSTOMER_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days
const customerSessionStore = new Map<string, CustomerSessionRecord>();
const DRIVER_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const driverSessionStore = new Map<string, DriverSessionRecord>();
const CUSTOMER_OTP_CODE_TTL_MS = 1000 * 60 * 5; // 5 minutes
const CUSTOMER_OTP_SEND_COOLDOWN_MS = 1000 * 45; // 45 seconds
const CUSTOMER_OTP_MAX_VERIFY_ATTEMPTS = 5;
const CUSTOMER_OTP_VERIFICATION_TTL_MS = 1000 * 60 * 10; // 10 minutes
const customerOtpChallengeStore = new Map<string, CustomerOtpChallengeRecord>();
const customerOtpChallengeByPhonePurpose = new Map<string, string>();
const customerOtpVerificationStore = new Map<string, CustomerOtpVerificationRecord>();

const RAW_CUSTOMER_SMS_PROVIDER = String(process.env.CUSTOMER_SMS_PROVIDER ?? process.env.SMS_PROVIDER ?? 'mock')
  .trim()
  .toLowerCase();
const CUSTOMER_SMS_PROVIDER = RAW_CUSTOMER_SMS_PROVIDER === 'textconnect' ? 'aipsoft' : RAW_CUSTOMER_SMS_PROVIDER;
const TWILIO_ACCOUNT_SID = String(process.env.TWILIO_ACCOUNT_SID ?? '').trim();
const TWILIO_AUTH_TOKEN = String(process.env.TWILIO_AUTH_TOKEN ?? '').trim();
const TWILIO_VERIFY_SERVICE_SID = String(process.env.TWILIO_VERIFY_SERVICE_SID ?? '').trim();
const AIPSOFT_SMS_URL = String(process.env.AIPSOFT_SMS_URL ?? 'https://textconnect.aipsoft.com/api/send/otp').trim();
const AIPSOFT_VERIFY_URL = String(process.env.AIPSOFT_VERIFY_URL ?? 'https://textconnect.aipsoft.com/api/get/otp').trim();
const AIPSOFT_SMS_SECRET = String(process.env.AIPSOFT_SMS_SECRET ?? '').trim();
const AIPSOFT_SMS_TYPE = String(process.env.AIPSOFT_SMS_TYPE ?? 'sms').trim() || 'sms';
const AIPSOFT_SMS_TEMPLATE = String(
  process.env.AIPSOFT_SMS_TEMPLATE ?? 'Your OTP is {{otp}}. It expires in 5 minutes.'
).trim();
const AIPSOFT_SMS_EXPIRE_SECONDS = Math.max(60, Number(process.env.AIPSOFT_SMS_EXPIRE_SECONDS ?? 300) || 300);
const AIPSOFT_SMS_PHONE_MODE = String(process.env.AIPSOFT_SMS_PHONE_MODE ?? 'auto').trim().toLowerCase();
const AIPSOFT_SMS_MODE = String(process.env.AIPSOFT_SMS_MODE ?? '').trim().toLowerCase(); // devices | credits
const AIPSOFT_SMS_DEVICE = String(process.env.AIPSOFT_SMS_DEVICE ?? '').trim();
const AIPSOFT_SMS_GATEWAY = String(process.env.AIPSOFT_SMS_GATEWAY ?? '').trim();
const AIPSOFT_SMS_SIM = String(process.env.AIPSOFT_SMS_SIM ?? '').trim(); // 1 | 2
const AIPSOFT_WHATSAPP_TYPE = String(process.env.AIPSOFT_WHATSAPP_TYPE ?? 'whatsapp').trim() || 'whatsapp';
const AIPSOFT_WHATSAPP_ACCOUNT = String(process.env.AIPSOFT_WHATSAPP_ACCOUNT ?? '').trim();
const AIPSOFT_WHATSAPP_TEMPLATE = String(
  process.env.AIPSOFT_WHATSAPP_TEMPLATE ?? process.env.AIPSOFT_SMS_TEMPLATE ?? 'Your OTP is {{otp}}'
).trim();
const CUSTOMER_ALERT_WHATSAPP_PROVIDER = String(process.env.CUSTOMER_ALERT_WHATSAPP_PROVIDER ?? 'mock').trim().toLowerCase();
const AIPSOFT_WHATSAPP_SEND_URL = String(process.env.AIPSOFT_WHATSAPP_SEND_URL ?? '').trim();
const CUSTOMER_ALERT_SEND_TIMEOUT_MS = Math.max(
  3000,
  Math.min(30000, Number(process.env.CUSTOMER_ALERT_SEND_TIMEOUT_MS ?? 15000) || 15000)
);
const POS_BASE_URL = String(process.env.POS_BASE_URL ?? 'https://magnus.aipsoft.com/inout/sales').trim();
const POS_FIND_ORDERS_PATH = String(process.env.POS_FIND_ORDERS_PATH ?? '/findLaundryOrders').trim();
const POS_FIND_ORDER_DETAILS_PATH = String(process.env.POS_FIND_ORDER_DETAILS_PATH ?? '/findOrderDetails').trim();
const POS_GET_PRODUCTS_PATH = String(process.env.POS_GET_PRODUCTS_PATH ?? '/getProducts').trim();
const POS_REFERER = String(process.env.POS_REFERER ?? POS_BASE_URL).trim();
const POS_ORIGIN = String(process.env.POS_ORIGIN ?? '').trim();
const POS_COOKIE = String(process.env.POS_COOKIE ?? process.env.POS_SESSION_COOKIE ?? '').trim();
const POS_AUTO_REFRESH_ENABLED = /^(1|true|yes)$/i.test(String(process.env.POS_AUTO_REFRESH_ENABLED ?? '').trim());
const POS_LOGIN_USERNAME = String(process.env.POS_LOGIN_USERNAME ?? '').trim();
const POS_LOGIN_PASSWORD = String(process.env.POS_LOGIN_PASSWORD ?? '').trim();
const POS_LOGIN_CLIENT_IDENTIFIER = String(process.env.POS_LOGIN_CLIENT_IDENTIFIER ?? 'inout').trim() || 'inout';
const POS_LOGIN_ENDPOINT = String(
  process.env.POS_LOGIN_ENDPOINT ?? `https://magnus.aipsoft.com/${POS_LOGIN_CLIENT_IDENTIFIER}/login/check`
).trim();
const POS_LOGIN_REFERER = String(
  process.env.POS_LOGIN_REFERER ?? `https://magnus.aipsoft.com/${POS_LOGIN_CLIENT_IDENTIFIER}/`
).trim();
const POS_BRANCH_ID = String(process.env.POS_BRANCH_ID ?? '0').trim();
const POS_PAID_STATUS = String(process.env.POS_PAID_STATUS ?? '0').trim();
const POS_JOB_STATUS = String(process.env.POS_JOB_STATUS ?? '0').trim();
const POS_CUSTOMER_TYPE = String(process.env.POS_CUSTOMER_TYPE ?? '0').trim();
const POS_DELIVERY_TYPE = String(process.env.POS_DELIVERY_TYPE ?? '0').trim();
const POS_PAY_TYPE = String(process.env.POS_PAY_TYPE ?? '0').trim();
const POS_PREVENT_DEPOT_SELECTION = String(process.env.POS_PREVENT_DEPOT_SELECTION ?? '0').trim();
const POS_JOB_PROCESS_COMMISION_OPTION = String(process.env.POS_JOB_PROCESS_COMMISION_OPTION ?? '0').trim();
const POS_INCLUDE_DATATABLE_COLUMNS = /^(1|true|yes)$/i.test(String(process.env.POS_INCLUDE_DATATABLE_COLUMNS ?? '').trim());
const POS_TABLE_COLUMN_COUNT = Math.max(
  1,
  Math.min(40, Number(process.env.POS_TABLE_COLUMN_COUNT ?? 17) || 17)
);
const POS_REQUEST_TIMEOUT_MS = Math.max(3000, Math.min(30000, Number(process.env.POS_REQUEST_TIMEOUT_MS ?? 15000) || 15000));
let posCookieJar = POS_COOKIE;
let posRefreshInFlight: Promise<boolean> | null = null;
let posLastRefreshReason = '';

const normalizeCustomerPhone = (value: unknown) => {
  let digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('971') && digits.length >= 12) digits = `0${digits.slice(3)}`;
  if (digits.length === 9 && digits.startsWith('5')) digits = `0${digits}`;
  return digits.length > 0 ? digits : null;
};

const normalizeCustomerEmail = (value: unknown) => {
  const email = String(value ?? '').trim().toLowerCase();
  return email.includes('@') ? email : null;
};

const normalizeDriverPhone = (value: unknown) => {
  return String(value ?? '').replace(/\D/g, '');
};

const toCustomerPhoneE164 = (normalizedPhone: string) => {
  const normalized = normalizeCustomerPhone(normalizedPhone);
  if (!normalized) return null;
  if (normalized.startsWith('0') && normalized.length === 10) return `+971${normalized.slice(1)}`;
  if (normalized.startsWith('971')) return `+${normalized}`;
  if (normalized.startsWith('5') && normalized.length === 9) return `+971${normalized}`;
  return `+${normalized}`;
};

const parseCustomerOtpPurpose = (value: unknown): CustomerOtpPurpose | null => {
  const purpose = String(value ?? '').trim().toLowerCase();
  if (purpose === 'register' || purpose === 'login') return purpose;
  return null;
};

const parseCustomerOtpChannel = (value: unknown): CustomerOtpChannel => {
  const raw = String(value ?? 'sms').trim().toLowerCase();
  if (raw === 'wa' || raw === 'whatsapp') return 'whatsapp';
  return 'sms';
};

const stripHtml = (value: unknown) => String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const parseMoney = (value: unknown) => {
  const normalized = String(value ?? '').replace(/,/g, '').replace(/[^0-9.-]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const extractHtmlAttribute = (html: unknown, attribute: string) => {
  const pattern = new RegExp(`${attribute}="([^"]*)"`, 'i');
  const match = String(html ?? '').match(pattern);
  return match ? String(match[1]).trim() : '';
};

const rowCellContainsAttr = (cell: unknown, attribute: string) => {
  const haystack = String(cell ?? '').toLowerCase();
  return haystack.includes(`${attribute.toLowerCase()}=`);
};

const toPosRowArray = (row: unknown): any[] => {
  if (Array.isArray(row)) return row;
  if (!row || typeof row !== 'object') return [];

  const entries = Object.entries(row as Record<string, unknown>);
  if (entries.length === 0) return [];

  const numericEntries = entries
    .filter(([key]) => /^\d+$/.test(key))
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([, value]) => value);

  if (numericEntries.length > 0) return numericEntries;
  return entries.map(([, value]) => value);
};

const parseCookieHeader = (cookieHeader: string) => {
  const map = new Map<string, string>();
  for (const part of String(cookieHeader ?? '').split(';')) {
    const segment = part.trim();
    if (!segment) continue;
    const eqIndex = segment.indexOf('=');
    if (eqIndex <= 0) continue;
    const key = segment.slice(0, eqIndex).trim();
    const value = segment.slice(eqIndex + 1).trim();
    if (!key) continue;
    map.set(key, value);
  }
  return map;
};

const mergeCookieHeaders = (baseCookieHeader: string, setCookies: string[]) => {
  const merged = parseCookieHeader(baseCookieHeader);
  for (const setCookie of setCookies) {
    const cookiePart = String(setCookie ?? '').split(';')[0]?.trim();
    if (!cookiePart) continue;
    const eqIndex = cookiePart.indexOf('=');
    if (eqIndex <= 0) continue;
    const key = cookiePart.slice(0, eqIndex).trim();
    const value = cookiePart.slice(eqIndex + 1).trim();
    if (!key) continue;
    merged.set(key, value);
  }
  return Array.from(merged.entries())
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');
};

const updatePosCookieJarFromResponse = (baseCookieHeader: string, response: Response) => {
  const getSetCookie = (response.headers as any)?.getSetCookie;
  if (typeof getSetCookie === 'function') {
    const setCookies = getSetCookie.call(response.headers) as string[];
    if (Array.isArray(setCookies) && setCookies.length > 0) {
      posCookieJar = mergeCookieHeaders(baseCookieHeader, setCookies);
      return;
    }
  }
  const singleSetCookie = response.headers.get('set-cookie');
  if (singleSetCookie) {
    posCookieJar = mergeCookieHeaders(baseCookieHeader, [singleSetCookie]);
  }
};

const hasMinimalPosCookie = (cookieHeader: string) => /ci_session_/i.test(cookieHeader) && /\binout=/i.test(cookieHeader);

const isLikelyPosLoginHtml = (text: string) => {
  const lower = String(text ?? '').toLowerCase();
  return (
    lower.includes('<!doctype') ||
    lower.includes('<html') ||
    lower.includes(':: login') ||
    lower.includes('login/check') ||
    lower.includes('assets/dashboard/css/login.css')
  );
};

const canAutoRefreshPosSession = () =>
  POS_AUTO_REFRESH_ENABLED &&
  POS_LOGIN_USERNAME.length > 0 &&
  POS_LOGIN_PASSWORD.length > 0 &&
  /^https?:\/\//i.test(POS_LOGIN_ENDPOINT);

const refreshPosSession = async (reason: string): Promise<boolean> => {
  if (!canAutoRefreshPosSession()) return false;
  if (posRefreshInFlight) return posRefreshInFlight;

  posRefreshInFlight = (async () => {
    let cookieHeader = String(posCookieJar || POS_COOKIE).trim();
    const withTimeout = async (request: (signal: AbortSignal) => Promise<Response>) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), POS_REQUEST_TIMEOUT_MS);
      try {
        return await request(controller.signal);
      } finally {
        clearTimeout(timer);
      }
    };

    try {
      // Prime POS session cookie from login page first (some setups require this).
      try {
        const preflightResponse = await withTimeout((signal) =>
          fetch(POS_LOGIN_REFERER, {
            method: 'GET',
            headers: {
              Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache',
              ...(cookieHeader ? { Cookie: cookieHeader } : {}),
            },
            signal,
          })
        );
        updatePosCookieJarFromResponse(cookieHeader, preflightResponse);
        cookieHeader = String(posCookieJar || cookieHeader).trim();
      } catch {
        // Continue; login POST may still work without preflight.
      }

      const usernameRaw = String(POS_LOGIN_USERNAME ?? '').trim();
      const usernameBeforeAt = usernameRaw.includes('@') ? usernameRaw.split('@')[0].trim() : usernameRaw;
      const usernameLower = usernameRaw.toLowerCase();
      const usernameBeforeAtLower = usernameBeforeAt.toLowerCase();
      const usernameWithClient = usernameBeforeAt ? `${usernameBeforeAt}@${POS_LOGIN_CLIENT_IDENTIFIER}` : '';
      const usernameWithClientLower = usernameBeforeAtLower
        ? `${usernameBeforeAtLower}@${POS_LOGIN_CLIENT_IDENTIFIER}`
        : '';
      const usernameVariants = Array.from(
        new Set(
          [
            usernameRaw,
            usernameLower,
            usernameBeforeAt,
            usernameBeforeAtLower,
            usernameWithClient,
            usernameWithClientLower,
          ].filter(Boolean)
        )
      );

      let authed = false;
      for (const username of usernameVariants) {
        const payload = new URLSearchParams();
        payload.set('username', username);
        payload.set('password', POS_LOGIN_PASSWORD);
        payload.set('client_identifier', POS_LOGIN_CLIENT_IDENTIFIER);
        payload.set('auto_login', 'null');
        payload.set('connection_path', 'null');

        const loginResponse = await withTimeout((signal) =>
          fetch(POS_LOGIN_ENDPOINT, {
            method: 'POST',
            headers: {
              Accept: 'application/json, text/javascript, */*; q=0.01',
              'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,ar;q=0.7',
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache',
              Origin: resolvePosOrigin(),
              Referer: POS_LOGIN_REFERER,
              'X-Requested-With': 'XMLHttpRequest',
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
              ...(cookieHeader ? { Cookie: cookieHeader } : {}),
            },
            body: payload.toString(),
            signal,
          })
        );
        updatePosCookieJarFromResponse(cookieHeader, loginResponse);
        cookieHeader = String(posCookieJar || cookieHeader).trim();
        const loginText = await loginResponse.text().catch(() => '');
        const lower = String(loginText ?? '').toLowerCase();
        const loginLooksSuccess =
          lower.includes('login_success') ||
          lower.includes('password_ok') ||
          (loginResponse.ok && !isLikelyPosLoginHtml(loginText));
        if (loginLooksSuccess && hasMinimalPosCookie(cookieHeader)) {
          authed = true;
          break;
        }
      }

      if (!authed) {
        posLastRefreshReason = `auto_refresh_failed(${reason})`;
        return false;
      }

      // Validate that /sales is accessible and not redirected to login page.
      const verifyResponse = await withTimeout((signal) =>
        fetch(POS_BASE_URL, {
          method: 'GET',
          headers: {
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            Referer: POS_LOGIN_REFERER,
            ...(cookieHeader ? { Cookie: cookieHeader } : {}),
          },
          signal,
        })
      );
      updatePosCookieJarFromResponse(cookieHeader, verifyResponse);
      cookieHeader = String(posCookieJar || cookieHeader).trim();
      const verifyText = await verifyResponse.text().catch(() => '');
      if (!verifyResponse.ok || isLikelyPosLoginHtml(verifyText) || !hasMinimalPosCookie(cookieHeader)) {
        posLastRefreshReason = `auto_refresh_not_authorized(${reason})`;
        return false;
      }

      posCookieJar = cookieHeader;
      posLastRefreshReason = '';
      return true;
    } catch {
      posLastRefreshReason = `auto_refresh_network_error(${reason})`;
      return false;
    }
  })();

  try {
    return await posRefreshInFlight;
  } finally {
    posRefreshInFlight = null;
  }
};

const resolvePosEndpoint = () => {
  if (!POS_BASE_URL) return '';
  if (/^https?:\/\//i.test(POS_FIND_ORDERS_PATH)) return POS_FIND_ORDERS_PATH;
  const base = POS_BASE_URL.endsWith('/') ? POS_BASE_URL : `${POS_BASE_URL}/`;
  const relative = POS_FIND_ORDERS_PATH.startsWith('/') ? POS_FIND_ORDERS_PATH.slice(1) : POS_FIND_ORDERS_PATH;
  return new URL(relative, base).toString();
};

const resolvePosEndpointFromPath = (endpointPath: string) => {
  if (!POS_BASE_URL) return '';
  if (/^https?:\/\//i.test(endpointPath)) return endpointPath;
  const base = POS_BASE_URL.endsWith('/') ? POS_BASE_URL : `${POS_BASE_URL}/`;
  const relative = endpointPath.startsWith('/') ? endpointPath.slice(1) : endpointPath;
  return new URL(relative, base).toString();
};

const resolvePosOrigin = () => {
  const fallback = () => {
    try {
      return new URL(POS_BASE_URL).origin;
    } catch {
      return 'https://magnus.aipsoft.com';
    }
  };

  if (!POS_ORIGIN) return fallback();
  try {
    return new URL(POS_ORIGIN).origin;
  } catch {
    return fallback();
  }
};

const parsePosOrderPreview = (row: any[]): PosOrderPreview => {
  const rowCell = row.find((cell) => rowCellContainsAttr(cell, 'data-order_no')) ?? row?.[0];
  const printCell = row.find((cell) => rowCellContainsAttr(cell, 'data-orders_id') && String(cell).includes('print-btn')) ?? row?.[15];
  const retrieveCell = row.find((cell) => rowCellContainsAttr(cell, 'data-orders_id') && String(cell).includes('retrive-btn')) ?? row?.[16];
  const statusCell = `${String(rowCell ?? '')} ${String(printCell ?? '')}`.toLowerCase();
  const statusFlags = Array.from(
    new Set(
      ['held', 'not_paid_fully', 'full_paid', 'fully_packed', 'partially_packed', 'delivered']
        .filter((token) => statusCell.includes(token))
    )
  );

  return {
    orders_id:
      extractHtmlAttribute(printCell, 'data-orders_id') ||
      extractHtmlAttribute(retrieveCell, 'data-orders_id') ||
      extractHtmlAttribute(rowCell, 'data-order_no'),
    order_no:
      stripHtml(row?.[2]) ||
      extractHtmlAttribute(retrieveCell, 'data-order_no') ||
      extractHtmlAttribute(rowCell, 'data-order_no'),
    created_at: stripHtml(row?.[3]),
    invoice_no: stripHtml(row?.[4]),
    invoice_date: stripHtml(row?.[5]),
    delivery_type: stripHtml(row?.[6]),
    customer_phone: stripHtml(row?.[7]),
    customer_name: stripHtml(row?.[8]),
    notes: stripHtml(row?.[10]),
    total: parseMoney(row?.[11]),
    paid: parseMoney(row?.[12]),
    balance: parseMoney(row?.[13]),
    branch: stripHtml(row?.[14]),
    cust_head_id: extractHtmlAttribute(printCell, 'data-cust_head_id'),
    invoice_id: extractHtmlAttribute(printCell, 'data-invoice_id') || extractHtmlAttribute(retrieveCell, 'data-invoice_id'),
    status_flags: statusFlags,
  };
};

const normalizePosNumberish = (value: unknown, fallback = 0) => {
  const parsed = parseMoney(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const firstNonEmptyString = (row: Record<string, any> | undefined, keys: string[]) => {
  if (!row) return '';
  for (const key of keys) {
    const value = String(row[key] ?? '').trim();
    if (value) return value;
  }
  return '';
};

const POS_DETAIL_ROW_HINT_KEYS = [
  'each_sale_entry_id',
  'sale_prdt_id',
  'sale_qty',
  'qty',
  'quantity',
  'primary_sale_prdt_name',
  'product_name',
  'item_name',
  'sale_sub_total',
];

const toRecordLike = (value: unknown): Record<string, any> => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, any>;
  }
  if (Array.isArray(value)) {
    const mapped: Record<string, any> = {};
    for (let i = 0; i < value.length; i += 1) mapped[String(i)] = value[i];
    return mapped;
  }
  return {};
};

const scorePosDetailRowsArray = (arr: unknown[]): number => {
  if (!Array.isArray(arr) || arr.length === 0) return 0;
  let score = 0;
  const sample = arr.slice(0, 25);
  for (const row of sample) {
    const rec = toRecordLike(row);
    const keys = Object.keys(rec);
    if (keys.length === 0) continue;
    score += 1;
    for (const hint of POS_DETAIL_ROW_HINT_KEYS) {
      if (Object.prototype.hasOwnProperty.call(rec, hint)) score += 3;
    }
  }
  return score;
};

const pickLikelyPosDetailsRows = (payload: any): unknown[] => {
  if (Array.isArray(payload)) {
    // Legacy shape: [rows, dynamicFields, personCountDetails, ...]
    if (Array.isArray(payload[0])) return payload[0];
    // Sometimes payload is already rows array.
    const directScore = scorePosDetailRowsArray(payload);
    if (directScore > 0) return payload;
    return [];
  }

  if (!payload || typeof payload !== 'object') return [];

  const root = payload as Record<string, any>;
  const candidates: unknown[][] = [];
  const directKeys = [
    'rows',
    'data',
    'order_details',
    'details',
    'line_items',
    'items',
    'sale_items',
    'products',
    'result',
  ];

  for (const key of directKeys) {
    const value = root[key];
    if (Array.isArray(value)) candidates.push(value);
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      for (const nested of directKeys) {
        const nestedValue = (value as Record<string, any>)[nested];
        if (Array.isArray(nestedValue)) candidates.push(nestedValue);
      }
    }
  }

  for (const value of Object.values(root)) {
    if (Array.isArray(value)) candidates.push(value);
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      for (const nestedValue of Object.values(value as Record<string, any>)) {
        if (Array.isArray(nestedValue)) candidates.push(nestedValue);
      }
    }
  }

  let best: unknown[] = [];
  let bestScore = 0;
  for (const candidate of candidates) {
    let normalized = candidate;
    if (candidate.length === 1 && Array.isArray(candidate[0])) {
      normalized = candidate[0] as unknown[];
    }
    const score = scorePosDetailRowsArray(normalized);
    if (score > bestScore) {
      bestScore = score;
      best = normalized;
    }
  }

  return bestScore > 0 ? best : [];
};

const buildPosOrderSearchPayload = (
  query: string,
  overrides?: {
    paid_status?: string;
    job_status?: string;
    cust_type?: string;
    del_type?: string;
    pay_type?: string;
    branch_id?: string;
    prevent_depot_selection?: string;
  }
) => {
  const params = new URLSearchParams();

  // Keep this lightweight by default; this endpoint accepts custom filters directly.
  params.set('draw', '1');
  params.set('start', '0');
  params.set('length', '25');
  params.set('order[0][column]', '1');
  params.set('order[0][dir]', 'desc');
  if (POS_INCLUDE_DATATABLE_COLUMNS) {
    for (let i = 0; i < POS_TABLE_COLUMN_COUNT; i += 1) {
      params.set(`columns[${i}][data]`, '');
      params.set(`columns[${i}][name]`, '');
      params.set(`columns[${i}][searchable]`, 'true');
      params.set(`columns[${i}][orderable]`, 'true');
      params.set(`columns[${i}][search][value]`, '');
      params.set(`columns[${i}][search][regex]`, 'false');
    }
  }
  params.set('search[value]', query);
  params.set('search[regex]', 'false');
  params.set('filterTxt', query);

  // POS custom filters used by Magnus sales/findLaundryOrders.
  // Mirrors the request shape generated by assets/pos/js/pos_laundry.js.
  params.set('job_search_txt', query);
  params.set('date', '');
  params.set('waiter', '');
  params.set('from_date', '');
  params.set('from_time', '');
  params.set('to_data', '');
  params.set('to_time', '');
  params.set('paid_status', overrides?.paid_status ?? POS_PAID_STATUS);
  params.set('job_status', overrides?.job_status ?? POS_JOB_STATUS);
  params.set('cust_type', overrides?.cust_type ?? POS_CUSTOMER_TYPE);
  params.set('del_type', overrides?.del_type ?? POS_DELIVERY_TYPE);
  params.set('pay_type', overrides?.pay_type ?? POS_PAY_TYPE);
  params.set('branch_id', overrides?.branch_id ?? POS_BRANCH_ID);
  params.set('prevent_depot_selection', overrides?.prevent_depot_selection ?? POS_PREVENT_DEPOT_SELECTION);

  params.set('_', String(Date.now()));
  return params;
};

const fetchPosOrderSearch = async (query: string) => {
  const endpoint = resolvePosEndpoint();
  if (!endpoint) {
    throw new Error('POS endpoint is not configured.');
  }
  let cookieHeader = String(posCookieJar || POS_COOKIE).trim();
  if ((!cookieHeader || !hasMinimalPosCookie(cookieHeader)) && canAutoRefreshPosSession()) {
    await refreshPosSession('search_prepare');
    cookieHeader = String(posCookieJar || POS_COOKIE).trim();
  }
  if (!cookieHeader) {
    throw new Error(
      canAutoRefreshPosSession()
        ? `POS session is not available and auto-refresh failed. ${posLastRefreshReason || 'Check POS login credentials in .env.'}`.trim()
        : 'POS cookie is not configured. Set POS_COOKIE (or POS_SESSION_COOKIE) in server .env.'
    );
  }
  if (cookieHeader.includes('...')) {
    throw new Error('POS_COOKIE contains placeholder dots (...). Paste the full real Cookie header from browser Network.');
  }
  if (!hasMinimalPosCookie(cookieHeader)) {
    throw new Error(
      canAutoRefreshPosSession()
        ? `POS cookie is incomplete and auto-refresh could not fix it. ${posLastRefreshReason || ''}`.trim()
        : 'POS_COOKIE is incomplete. It must include at least ci_session_* and inout cookies from POS request.'
    );
  }

  const buildHeaders = (cookie: string): Record<string, string> => ({
    Accept: 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,ar;q=0.7',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    Cookie: cookie,
    Origin: resolvePosOrigin(),
    Referer: POS_REFERER || POS_BASE_URL,
    'X-Requested-With': 'XMLHttpRequest',
  });

  const withTimeout = async (request: (signal: AbortSignal) => Promise<Response>) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), POS_REQUEST_TIMEOUT_MS);
    try {
      return await request(controller.signal);
    } finally {
      clearTimeout(timer);
    }
  };

  const parseResponseBody = async (response: Response) => {
    updatePosCookieJarFromResponse(cookieHeader, response);
    cookieHeader = String(posCookieJar || cookieHeader).trim();

    const text = await response.text().catch(() => '');
    let parsed: any = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = null;
    }
    return { text, parsed };
  };

  const requestWithPayload = async (payload: URLSearchParams) => {
    const postResponse = await withTimeout((signal) =>
      fetch(endpoint, {
        method: 'POST',
        headers: {
          ...buildHeaders(cookieHeader),
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: payload.toString(),
        signal,
      })
    );

    let parsedBody = await parseResponseBody(postResponse);
    if (!parsedBody.parsed || !Array.isArray(parsedBody.parsed?.data)) {
      const getUrl = `${endpoint}${endpoint.includes('?') ? '&' : '?'}${payload.toString()}`;
      const getResponse = await withTimeout((signal) =>
        fetch(getUrl, {
          method: 'GET',
          headers: buildHeaders(cookieHeader),
          signal,
        })
      );
      parsedBody = await parseResponseBody(getResponse);
    }
    return parsedBody;
  };

  let { text, parsed } = await requestWithPayload(buildPosOrderSearchPayload(query));

  const needsRetry =
    parsed &&
    Array.isArray(parsed?.data) &&
    parsed.data.length === 0 &&
    Number(parsed?.recordsFiltered ?? 0) > 0;

  if (needsRetry) {
    const retryVariants = [
      { job_status: '0', branch_id: '0', prevent_depot_selection: '0' },
      { job_status: '0', branch_id: '0', prevent_depot_selection: '1' },
      { job_status: '0', branch_id: POS_BRANCH_ID || '0', prevent_depot_selection: '0' },
    ];
    for (const variant of retryVariants) {
      const retry = await requestWithPayload(buildPosOrderSearchPayload(query, variant));
      if (retry.parsed && Array.isArray(retry.parsed?.data) && retry.parsed.data.length > 0) {
        text = retry.text;
        parsed = retry.parsed;
        break;
      }
    }
  }

  if (!parsed || !Array.isArray(parsed?.data)) {
    if (/<!doctype|<html/i.test(text)) {
      if (canAutoRefreshPosSession() && (await refreshPosSession('search_html_response'))) {
        cookieHeader = String(posCookieJar || POS_COOKIE).trim();
        const retry = await requestWithPayload(buildPosOrderSearchPayload(query));
        text = retry.text;
        parsed = retry.parsed;
      } else {
        throw new Error(
          canAutoRefreshPosSession()
            ? `POS returned HTML and auto-refresh failed. ${posLastRefreshReason || 'Check POS credentials/session.'}`.trim()
            : 'POS returned HTML (likely login/session page). Refresh POS_COOKIE from browser Network and try again.'
        );
      }
    } else {
      throw new Error(`POS response is not valid JSON data. ${text.slice(0, 240)}`);
    }
  }

  if (!parsed || !Array.isArray(parsed?.data)) {
    throw new Error(`POS response is not valid JSON data after retry. ${String(text).slice(0, 240)}`);
  }

  const rawRows = parsed.data as any[];
  const rows = rawRows.map((row) => toPosRowArray(row)).filter((row) => row.length > 0);
  const orders = rows
    .map((row) => parsePosOrderPreview(row))
    .filter((order) => order.order_no || order.orders_id);

  if (rawRows.length > 0 && orders.length === 0) {
    const sample = rawRows[0];
    const sampleShape =
      Array.isArray(sample) ? `array(${sample.length})` : sample && typeof sample === 'object' ? `object keys: ${Object.keys(sample).join(',').slice(0, 120)}` : typeof sample;
    console.warn('POS parsing warning: rows received but no orders parsed.', { rows: rawRows.length, sampleShape });
  }

  return {
    recordsTotal: Number(parsed?.recordsTotal ?? orders.length) || orders.length,
    recordsFiltered: Number(parsed?.recordsFiltered ?? orders.length) || orders.length,
    orders,
  };
};

const postPosForm = async (
  endpointPath: string,
  payload: URLSearchParams,
  options?: { fallbackToGet?: boolean }
) => {
  const endpoint = resolvePosEndpointFromPath(endpointPath);
  if (!endpoint) throw new Error('POS endpoint is not configured.');

  let cookieHeader = String(posCookieJar || POS_COOKIE).trim();
  if ((!cookieHeader || !hasMinimalPosCookie(cookieHeader)) && canAutoRefreshPosSession()) {
    await refreshPosSession('post_prepare');
    cookieHeader = String(posCookieJar || POS_COOKIE).trim();
  }
  if (!cookieHeader) {
    throw new Error(
      canAutoRefreshPosSession()
        ? `POS session is not available and auto-refresh failed. ${posLastRefreshReason || 'Check POS login credentials in .env.'}`.trim()
        : 'POS cookie is not configured. Set POS_COOKIE (or POS_SESSION_COOKIE) in server .env.'
    );
  }
  if (cookieHeader.includes('...')) {
    throw new Error('POS_COOKIE contains placeholder dots (...). Paste the full real Cookie header from browser Network.');
  }
  if (!hasMinimalPosCookie(cookieHeader)) {
    throw new Error(
      canAutoRefreshPosSession()
        ? `POS cookie is incomplete and auto-refresh could not fix it. ${posLastRefreshReason || ''}`.trim()
        : 'POS_COOKIE is incomplete. It must include at least ci_session_* and inout cookies from POS request.'
    );
  }

  const buildHeaders = (cookie: string): Record<string, string> => ({
    Accept: 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,ar;q=0.7',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    Cookie: cookie,
    Origin: resolvePosOrigin(),
    Referer: POS_REFERER || POS_BASE_URL,
    'X-Requested-With': 'XMLHttpRequest',
  });

  const withTimeout = async (request: (signal: AbortSignal) => Promise<Response>) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), POS_REQUEST_TIMEOUT_MS);
    try {
      return await request(controller.signal);
    } finally {
      clearTimeout(timer);
    }
  };

  const parseResponse = async (response: Response) => {
    updatePosCookieJarFromResponse(cookieHeader, response);
    cookieHeader = String(posCookieJar || cookieHeader).trim();

    const text = await response.text().catch(() => '');
    let parsed: any = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = null;
    }
    return { text, parsed };
  };

  const postResponse = await withTimeout((signal) =>
    fetch(endpoint, {
      method: 'POST',
      headers: {
        ...buildHeaders(cookieHeader),
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: payload.toString(),
      signal,
    })
  );

  let responseBody = await parseResponse(postResponse);
  if ((!responseBody.parsed || typeof responseBody.parsed !== 'object') && options?.fallbackToGet) {
    const getUrl = `${endpoint}${endpoint.includes('?') ? '&' : '?'}${payload.toString()}`;
    const getResponse = await withTimeout((signal) =>
      fetch(getUrl, {
        method: 'GET',
        headers: buildHeaders(cookieHeader),
        signal,
      })
    );
    responseBody = await parseResponse(getResponse);
  }

  if (isLikelyPosLoginHtml(String(responseBody.text ?? '')) && canAutoRefreshPosSession()) {
    const refreshed = await refreshPosSession('post_html_response');
    if (refreshed) {
      cookieHeader = String(posCookieJar || POS_COOKIE).trim();
      const retryResponse = await withTimeout((signal) =>
        fetch(endpoint, {
          method: 'POST',
          headers: {
            ...buildHeaders(cookieHeader),
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
          body: payload.toString(),
          signal,
        })
      );
      responseBody = await parseResponse(retryResponse);
      if ((!responseBody.parsed || typeof responseBody.parsed !== 'object') && options?.fallbackToGet) {
        const getUrl = `${endpoint}${endpoint.includes('?') ? '&' : '?'}${payload.toString()}`;
        const retryGetResponse = await withTimeout((signal) =>
          fetch(getUrl, {
            method: 'GET',
            headers: buildHeaders(cookieHeader),
            signal,
          })
        );
        responseBody = await parseResponse(retryGetResponse);
      }
    }
  }

  return responseBody;
};

const parsePosOrderDetails = (payload: any): PosOrderDetailsResult => {
  if ((!Array.isArray(payload) && (!payload || typeof payload !== 'object')) || (Array.isArray(payload) && payload.length === 0)) {
    throw new Error('POS order details response is empty.');
  }

  const rows = pickLikelyPosDetailsRows(payload).map((row) => toRecordLike(row));
  const dynamicFields = Array.isArray(payload?.[1])
    ? payload[1]
    : Array.isArray(payload?.dynamic_fields)
      ? payload.dynamic_fields
      : Array.isArray(payload?.dynamicFields)
        ? payload.dynamicFields
        : [];
  const personCountDetails = Array.isArray(payload?.[2])
    ? payload[2]
    : Array.isArray(payload?.person_count_details)
      ? payload.person_count_details
      : Array.isArray(payload?.personCountDetails)
        ? payload.personCountDetails
        : [];
  const productAssignedTax =
    payload?.[3] ??
    payload?.product_assigned_tax ??
    payload?.productAssignedTax ??
    {};
  const invoiceHistory = Array.isArray(payload?.[4])
    ? payload[4]
    : Array.isArray(payload?.invoice_history)
      ? payload.invoice_history
      : Array.isArray(payload?.invoiceHistory)
        ? payload.invoiceHistory
        : [];
  if (!rows.length) {
    const keys =
      payload && typeof payload === 'object' && !Array.isArray(payload)
        ? Object.keys(payload as Record<string, unknown>).slice(0, 20).join(', ')
        : '';
    throw new Error(`POS order details parsed with no rows.${keys ? ` Payload keys: ${keys}` : ''}`);
  }
  const firstRow = (rows[0] ?? {}) as Record<string, any>;

  const lineByKey = new Map<string, PosOrderDetailLineItem>();
  for (let index = 0; index < rows.length; index += 1) {
    const row = (rows[index] ?? {}) as Record<string, any>;
    const saleEntryId = String(row.each_sale_entry_id ?? '').trim();
    const refId = String(row.ref_id ?? '').trim();
    const fallbackKey = `${saleEntryId || 'entry'}:${refId || index}`;

    const productName = firstNonEmptyString(row, [
      'primary_sale_prdt_name',
      'sale_prdt_product_name',
      'product_name',
      'item_name',
      'sale_prdt_name',
      'srv_prdt_product_name',
    ]);
    const secondaryName = firstNonEmptyString(row, ['secondary_sale_prdt_name']);
    const service = firstNonEmptyString(row, ['unitname_short', 'service_name']);
    const title = [productName, secondaryName].filter(Boolean).join(' - ') || service || `Item ${index + 1}`;

    const qty = normalizePosNumberish(row.sale_qty ?? row.qty ?? row.quantity ?? row.each_person_qty, 1);
    const unitPrice = normalizePosNumberish(
      row.sale_unit_price ?? row.sale_unit_actual_price ?? row.sale_price ?? row.customer_specific_price ?? row.retail_price_with_vat,
      0
    );
    const subTotal = normalizePosNumberish(row.sale_sub_total, qty * unitPrice);
    const taxAmount = normalizePosNumberish(row.sale_tax_amount, 0);
    const totalWithTax = subTotal + taxAmount;

    if (!lineByKey.has(fallbackKey)) {
      lineByKey.set(fallbackKey, {
        line_key: fallbackKey,
        sale_entry_id: saleEntryId,
        product_id: String(row.sale_prdt_id ?? row.product_id ?? '').trim(),
        name: title,
        service,
        qty,
        unit_price: unitPrice,
        sub_total: subTotal,
        tax_amount: taxAmount,
        total_with_tax: totalWithTax,
        barcode: String(row.barcode ?? '').trim(),
        unit: String(row.unitname_short ?? '').trim(),
      });
    }
  }

  return {
    general: {
      order_id: String(firstRow.id ?? '').trim(),
      order_no: String(firstRow.order_no ?? '').trim(),
      searched_order_id: String(firstRow.searched_ord_no ?? '').trim(),
      searched_invoice_id: String(firstRow.searched_inv_no ?? '').trim(),
      customer_name: firstNonEmptyString(firstRow, ['cust_ord_name', 'customer_name']),
      customer_mobile: firstNonEmptyString(firstRow, ['cust_ord_mobile', 'mobile', 'customer_mobile']),
      customer_address: firstNonEmptyString(firstRow, ['cust_ord_address', 'address1', 'customer_address']),
      delivery_type: String(firstRow.delivery_type ?? '').trim(),
      delivery_date: String(firstRow.delivery_date ?? '').trim(),
      delivery_time: String(firstRow.delivery_time ?? '').trim(),
      billing_date: String(firstRow.billing_date ?? '').trim(),
      total_amount: normalizePosNumberish(firstRow.total_amount, 0),
      tax_amount: normalizePosNumberish(firstRow.tax_amount, 0),
      grand_total: normalizePosNumberish(firstRow.grand_total, 0),
      received_amount: normalizePosNumberish(firstRow.received_amount, 0),
      balance: normalizePosNumberish(firstRow.balance, 0),
      status: firstNonEmptyString(firstRow, ['order_status', 'paid_status']),
      branch_id: String(firstRow.branch_id ?? '').trim(),
      salesman_id: String(firstRow.assign_to_salesman ?? '').trim(),
      driver_id: String(firstRow.driver_id ?? '').trim(),
      invoice_remark1: String(firstRow.invoice_remark1 ?? '').trim(),
      invoice_remark2: String(firstRow.invoice_remark2 ?? '').trim(),
    },
    line_items: Array.from(lineByKey.values()),
    dynamic_fields: dynamicFields,
    person_count_details: personCountDetails,
    product_assigned_tax: productAssignedTax,
    invoice_history: invoiceHistory,
    raw_counts: {
      rows: rows.length,
      line_items: lineByKey.size,
    },
  };
};

const fetchPosOrderDetails = async (params: {
  order_id: string;
  s_order_id: string;
  mode?: string;
  open_type?: string;
  job_process_commision_option?: string;
}) => {
  const payload = new URLSearchParams();
  payload.set('order_id', params.order_id || '0');
  payload.set('s_order_id', params.s_order_id || '0');
  payload.set('mode', params.mode || '0');
  payload.set('open_type', params.open_type || 'preview');
  payload.set('job_process_commision_option', params.job_process_commision_option ?? POS_JOB_PROCESS_COMMISION_OPTION);

  const { text, parsed } = await postPosForm(POS_FIND_ORDER_DETAILS_PATH, payload, { fallbackToGet: false });
  if (parsed === 0 || parsed === '0') {
    throw new Error('Order details not found in POS.');
  }
  if (!Array.isArray(parsed)) {
    if (/<!doctype|<html/i.test(text)) {
      throw new Error('POS returned HTML while loading order details (session/login page). Refresh POS_COOKIE and retry.');
    }
    throw new Error(`POS order details response is not valid JSON array. ${text.slice(0, 240)}`);
  }

  return parsePosOrderDetails(parsed);
};

const fetchPosProducts = async (params: {
  unit_id?: string;
  laundry_cat?: string;
  cust_type?: string;
  cur_page?: string;
  customer_id?: string;
}) => {
  const payload = new URLSearchParams();
  payload.set('unit_id', params.unit_id ?? '1');
  payload.set('laundry_cat', params.laundry_cat ?? '0');
  payload.set('cust_type', params.cust_type ?? '76');
  payload.set('cur_page', params.cur_page ?? '1');
  payload.set('customer_id', params.customer_id ?? '0');

  const { text, parsed } = await postPosForm(POS_GET_PRODUCTS_PATH, payload, { fallbackToGet: false });
  if (!parsed || typeof parsed !== 'object') {
    if (/<!doctype|<html/i.test(text)) {
      throw new Error('POS returned HTML while loading products (session/login page). Refresh POS_COOKIE and retry.');
    }
    throw new Error(`POS products response is not valid JSON. ${text.slice(0, 240)}`);
  }

  const products = Array.isArray((parsed as any).products) ? (parsed as any).products : [];
  const currencyShort = String((parsed as any).currency_short ?? '').trim();

  const normalizedProducts = products.map((item: any) => ({
    id: String(item?.id ?? '').trim(),
    name:
      String(item?.primary_sale_prdt_name ?? '').trim() ||
      String(item?.product_name ?? '').trim() ||
      String(item?.name ?? '').trim() ||
      String(item?.secondary_sale_prdt_name ?? '').trim(),
    barcode: String(item?.barcode ?? '').trim(),
    unit_price: normalizePosNumberish(item?.customer_specific_price ?? item?.retail_price_with_vat ?? item?.sale_unit_price ?? item?.sale_price, 0),
    raw: item,
  }));

  return {
    currency_short: currencyShort,
    total_products: normalizedProducts.length,
    products: normalizedProducts,
  };
};

const normalizeAlertOrderNo = (value: unknown) => String(value ?? '').trim().toUpperCase();

const evaluateAlertMatch = (qtyInOrder: number, qtyInStore: number) => {
  const safeOrderQty = Math.max(0, Number(qtyInOrder) || 0);
  const safeStoreQty = Math.max(0, Number(qtyInStore) || 0);
  let matchState: AlertMatchState = 'unknown';
  if (safeOrderQty > 0) {
    if (safeStoreQty === safeOrderQty) matchState = 'complete';
    else if (safeStoreQty < safeOrderQty) matchState = 'missing';
    else matchState = 'extra';
  }
  return {
    matched: matchState === 'complete' ? 'yes' : 'no',
    match_state: matchState,
  } as const;
};

const toAlertWarnings = (params: {
  match_state: AlertMatchState;
  pos_error?: string;
  qty_in_order: number;
  qty_in_store: number;
}) => {
  const warnings: string[] = [];
  if (params.pos_error) warnings.push(`POS: ${params.pos_error}`);
  if (params.match_state === 'missing') {
    warnings.push(`في قطعة ناقصة (${params.qty_in_store}/${params.qty_in_order})`);
  } else if (params.match_state === 'extra') {
    warnings.push(`في قطعة زائدة أو مكررة (${params.qty_in_store}/${params.qty_in_order})`);
  } else if (params.match_state === 'unknown') {
    warnings.push('تعذر تحديد حالة المطابقة من POS');
  }
  return warnings;
};

const renderAlertTemplate = (template: string, context: Record<string, string | number>) =>
  String(template ?? '').replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key) => {
    const value = context[key];
    if (value === undefined || value === null) return '';
    return String(value);
  });

const loadStoredOrderSnapshots = async (limit: number) => {
  const cappedLimit = Math.max(1, Math.min(500, Number(limit) || 120));
  const snapshots = new Map<
    string,
    {
      order_no: string;
      qty_in_store: number;
      first_stored_at: string | null;
      store_slots: CustomerAlertCandidate['store_slots'];
    }
  >();

  if (USE_POSTGRES_LOCAL && pgPool) {
    const grouped = await pgPool.query(
      `SELECT blanket_number AS order_no, MIN(created_at) AS first_stored_at, COUNT(*)::int AS qty_in_store
       FROM blankets
       WHERE status = 'stored' AND trim(COALESCE(blanket_number, '')) <> ''
       GROUP BY blanket_number
       ORDER BY MIN(created_at) ASC
       LIMIT $1`,
      [cappedLimit]
    );

    const orderNos = grouped.rows
      .map((row: any) => normalizeAlertOrderNo(row?.order_no))
      .filter((value: string) => value.length > 0);

    if (orderNos.length > 0) {
      const placeholders = orderNos.map((_, index) => `$${index + 1}`).join(', ');
      const slotRows = await pgPool.query(
        `SELECT id, blanket_number, store, row, "column", status, created_at
         FROM blankets
         WHERE status = 'stored' AND blanket_number IN (${placeholders})
         ORDER BY created_at ASC, id ASC`,
        orderNos
      );

      for (const row of grouped.rows as any[]) {
        const orderNo = normalizeAlertOrderNo(row?.order_no);
        if (!orderNo) continue;
        snapshots.set(orderNo, {
          order_no: orderNo,
          qty_in_store: Math.max(0, Number(row?.qty_in_store ?? 0) || 0),
          first_stored_at: row?.first_stored_at ? String(row.first_stored_at) : null,
          store_slots: [],
        });
      }

      for (const row of slotRows.rows as any[]) {
        const orderNo = normalizeAlertOrderNo(row?.blanket_number);
        const target = snapshots.get(orderNo);
        if (!target) continue;
        target.store_slots.push({
          blanket_id: Number(row?.id ?? 0) || 0,
          store: String(row?.store ?? ''),
          row: Number(row?.row ?? 0) || 0,
          column: Number(row?.column ?? 0) || 0,
          status: String(row?.status ?? 'stored'),
          created_at: row?.created_at ? String(row.created_at) : null,
        });
      }
    }

    return Array.from(snapshots.values());
  }

  const groupedRows = db
    .prepare(
      `SELECT blanket_number AS order_no, MIN(created_at) AS first_stored_at, COUNT(*) AS qty_in_store
       FROM blankets
       WHERE status = 'stored' AND TRIM(COALESCE(blanket_number, '')) <> ''
       GROUP BY blanket_number
       ORDER BY datetime(MIN(created_at)) ASC, MIN(id) ASC
       LIMIT ?`
    )
    .all(cappedLimit) as Array<{
    order_no: string;
    first_stored_at: string | null;
    qty_in_store: number;
  }>;

  const orderNos = groupedRows
    .map((row) => normalizeAlertOrderNo(row?.order_no))
    .filter((value) => value.length > 0);

  for (const row of groupedRows) {
    const orderNo = normalizeAlertOrderNo(row.order_no);
    if (!orderNo) continue;
    snapshots.set(orderNo, {
      order_no: orderNo,
      qty_in_store: Math.max(0, Number(row.qty_in_store ?? 0) || 0),
      first_stored_at: row.first_stored_at ? String(row.first_stored_at) : null,
      store_slots: [],
    });
  }

  if (orderNos.length > 0) {
    const placeholders = orderNos.map(() => '?').join(', ');
    const slotRows = db
      .prepare(
        `SELECT id, blanket_number, store, row, "column", status, created_at
         FROM blankets
         WHERE status = 'stored' AND blanket_number IN (${placeholders})
         ORDER BY datetime(created_at) ASC, id ASC`
      )
      .all(...orderNos) as Array<{
      id: number;
      blanket_number: string;
      store: string;
      row: number;
      column: number;
      status: string;
      created_at: string | null;
    }>;

    for (const row of slotRows) {
      const orderNo = normalizeAlertOrderNo(row.blanket_number);
      const target = snapshots.get(orderNo);
      if (!target) continue;
      target.store_slots.push({
        blanket_id: Number(row.id ?? 0) || 0,
        store: String(row.store ?? ''),
        row: Number(row.row ?? 0) || 0,
        column: Number(row.column ?? 0) || 0,
        status: String(row.status ?? 'stored'),
        created_at: row.created_at ? String(row.created_at) : null,
      });
    }
  }

  return Array.from(snapshots.values());
};

const loadStoredOrderSnapshotByOrderNo = async (orderNoInput: string) => {
  const orderNo = normalizeAlertOrderNo(orderNoInput);
  if (!orderNo) return null;

  if (USE_POSTGRES_LOCAL && pgPool) {
    const grouped = await pgPool.query(
      `SELECT blanket_number AS order_no, MIN(created_at) AS first_stored_at, COUNT(*)::int AS qty_in_store
       FROM blankets
       WHERE status = 'stored' AND blanket_number = $1
       GROUP BY blanket_number
       LIMIT 1`,
      [orderNo]
    );
    const row = grouped.rows[0] as any;
    if (!row) return null;
    const slots = await pgPool.query(
      `SELECT id, blanket_number, store, row, "column", status, created_at
       FROM blankets
       WHERE status = 'stored' AND blanket_number = $1
       ORDER BY created_at ASC, id ASC`,
      [orderNo]
    );
    return {
      order_no: orderNo,
      qty_in_store: Math.max(0, Number(row?.qty_in_store ?? 0) || 0),
      first_stored_at: row?.first_stored_at ? String(row.first_stored_at) : null,
      store_slots: (slots.rows as any[]).map((slot) => ({
        blanket_id: Number(slot?.id ?? 0) || 0,
        store: String(slot?.store ?? ''),
        row: Number(slot?.row ?? 0) || 0,
        column: Number(slot?.column ?? 0) || 0,
        status: String(slot?.status ?? 'stored'),
        created_at: slot?.created_at ? String(slot.created_at) : null,
      })),
    };
  }

  const grouped = db
    .prepare(
      `SELECT blanket_number AS order_no, MIN(created_at) AS first_stored_at, COUNT(*) AS qty_in_store
       FROM blankets
       WHERE status = 'stored' AND blanket_number = ?
       GROUP BY blanket_number
       LIMIT 1`
    )
    .get(orderNo) as
    | {
        order_no: string;
        first_stored_at: string | null;
        qty_in_store: number;
      }
    | undefined;
  if (!grouped) return null;

  const slots = db
    .prepare(
      `SELECT id, blanket_number, store, row, "column", status, created_at
       FROM blankets
       WHERE status = 'stored' AND blanket_number = ?
       ORDER BY datetime(created_at) ASC, id ASC`
    )
    .all(orderNo) as Array<{
    id: number;
    blanket_number: string;
    store: string;
    row: number;
    column: number;
    status: string;
    created_at: string | null;
  }>;

  return {
    order_no: orderNo,
    qty_in_store: Math.max(0, Number(grouped.qty_in_store ?? 0) || 0),
    first_stored_at: grouped.first_stored_at ? String(grouped.first_stored_at) : null,
    store_slots: slots.map((slot) => ({
      blanket_id: Number(slot.id ?? 0) || 0,
      store: String(slot.store ?? ''),
      row: Number(slot.row ?? 0) || 0,
      column: Number(slot.column ?? 0) || 0,
      status: String(slot.status ?? 'stored'),
      created_at: slot.created_at ? String(slot.created_at) : null,
    })),
  };
};

const resolvePosOrderDetailsByOrderNo = async (orderNo: string) => {
  const normalizedOrderNo = normalizeAlertOrderNo(orderNo);
  if (!normalizedOrderNo) throw new Error('Order number is required.');

  let sourceOrdersId = '';
  let sourceInvoiceId = '';
  let searchError = '';

  try {
    const search = await fetchPosOrderSearch(normalizedOrderNo);
    const exact = search.orders.find((order) => normalizeAlertOrderNo(order.order_no) === normalizedOrderNo) ?? search.orders[0];
    if (exact) {
      sourceOrdersId = String(exact.orders_id ?? '').trim();
      sourceInvoiceId = String(exact.invoice_id ?? '').trim();
    }
  } catch (error: any) {
    searchError = String(error?.message || 'POS order search failed');
  }

  if (!sourceOrdersId && !sourceInvoiceId) {
    const compact = normalizedOrderNo.replace(/[^0-9A-Z]/gi, '');
    const numericOnly = compact.replace(/\D+/g, '');
    const candidates = Array.from(
      new Set([normalizedOrderNo, compact, numericOnly].map((value) => String(value ?? '').trim()).filter((value) => value.length > 0))
    );

    for (const candidate of candidates) {
      const directAttempts = [
        { order_id: '0', s_order_id: candidate },
        { order_id: candidate, s_order_id: '0' },
      ];
      for (const attempt of directAttempts) {
        try {
          const details = await fetchPosOrderDetails({
            order_id: attempt.order_id,
            s_order_id: attempt.s_order_id,
            mode: '0',
            open_type: 'preview',
          });
          if ((details.line_items ?? []).length > 0) return details;
        } catch {
          // keep trying alternate order shapes
        }
      }
    }
  }

  if (!sourceOrdersId && !sourceInvoiceId) {
    throw new Error(searchError || 'Unable to resolve order ID from POS.');
  }

  return fetchPosOrderDetails({
    order_id: sourceInvoiceId || '0',
    s_order_id: sourceOrdersId || '0',
    mode: '0',
    open_type: 'preview',
  });
};

const readLatestAlertLogByOrderNo = () => {
  const rows = db
    .prepare(
      `SELECT log.order_no, log.status, log.sent_at
       FROM customer_alert_logs log
       INNER JOIN (
         SELECT order_no, MAX(id) AS max_id
         FROM customer_alert_logs
         GROUP BY order_no
       ) latest
       ON latest.max_id = log.id`
    )
    .all() as Array<{ order_no: string; status: string; sent_at: string | null }>;
  const map = new Map<string, { status: string; sent_at: string | null }>();
  for (const row of rows) {
    map.set(normalizeAlertOrderNo(row.order_no), {
      status: String(row.status ?? ''),
      sent_at: row.sent_at ? String(row.sent_at) : null,
    });
  }
  return map;
};

const buildAlertCandidateFromSnapshot = async (
  snapshot: Awaited<ReturnType<typeof loadStoredOrderSnapshots>>[number],
  latestStatusMap: Map<string, { status: string; sent_at: string | null }>
): Promise<CustomerAlertCandidate> => {
  const latest = latestStatusMap.get(normalizeAlertOrderNo(snapshot.order_no));
  const fallbackOrderNo = normalizeAlertOrderNo(snapshot.order_no);
  const fallbackQtyInStore = Math.max(0, Number(snapshot.qty_in_store ?? 0) || 0);
  const fallback: CustomerAlertCandidate = {
    order_number: fallbackOrderNo,
    order_no: fallbackOrderNo,
    customer_name: '',
    phone: '',
    quantity_in_order: 0,
    quantity_in_store: fallbackQtyInStore,
    qty_in_order: 0,
    qty_in_store: fallbackQtyInStore,
    matched: 'no',
    match_state: 'unknown',
    warnings: toAlertWarnings({
      match_state: 'unknown',
      qty_in_order: 0,
      qty_in_store: fallbackQtyInStore,
    }),
    total_amount: 0,
    first_stored_at: snapshot.first_stored_at,
    store_slots: snapshot.store_slots,
    last_alert_status: latest?.status ?? null,
    last_alert_at: latest?.sent_at ?? null,
  };

  try {
    const details = await resolvePosOrderDetailsByOrderNo(snapshot.order_no);
    const qtyInOrder = (details.line_items ?? []).reduce((sum, line) => sum + Math.max(0, Number(line.qty ?? 0) || 0), 0);
    const qtyInStore = Math.max(0, Number(snapshot.qty_in_store ?? 0) || 0);
    const match = evaluateAlertMatch(qtyInOrder, qtyInStore);
    return {
      ...fallback,
      customer_name: String(details.general.customer_name ?? '').trim(),
      phone: String(details.general.customer_mobile ?? '').trim(),
      quantity_in_order: qtyInOrder,
      quantity_in_store: qtyInStore,
      qty_in_order: qtyInOrder,
      qty_in_store: qtyInStore,
      matched: match.matched,
      match_state: match.match_state,
      warnings: toAlertWarnings({
        match_state: match.match_state,
        qty_in_order: qtyInOrder,
        qty_in_store: qtyInStore,
      }),
      total_amount: Math.max(0, Number(details.general.grand_total ?? details.general.total_amount ?? 0) || 0),
    };
  } catch (error: any) {
    const posError = String(error?.message || 'POS details unavailable');
    return {
      ...fallback,
      pos_error: posError,
      warnings: toAlertWarnings({
        match_state: fallback.match_state,
        pos_error: posError,
        qty_in_order: fallback.qty_in_order,
        qty_in_store: fallback.qty_in_store,
      }),
    };
  }
};

const buildCustomerAlertCandidates = async (limit = 120) => {
  const snapshots = await loadStoredOrderSnapshots(limit);
  const latestStatusMap = readLatestAlertLogByOrderNo();
  const out: CustomerAlertCandidate[] = [];
  for (const batch of chunk(snapshots, 4)) {
    const resolved = await Promise.all(batch.map((snapshot) => buildAlertCandidateFromSnapshot(snapshot, latestStatusMap)));
    out.push(...resolved);
  }
  return out.sort((a, b) => {
    const aAt = a.first_stored_at ? new Date(a.first_stored_at).getTime() : Number.MAX_SAFE_INTEGER;
    const bAt = b.first_stored_at ? new Date(b.first_stored_at).getTime() : Number.MAX_SAFE_INTEGER;
    if (aAt !== bAt) return aAt - bAt;
    return a.order_no.localeCompare(b.order_no);
  });
};

const normalizeSortingOrderNo = (value: unknown) => String(value ?? '').trim().toUpperCase();

const toSortingCellStatus = (totalSorted: number, totalRequired: number): SortingCellStatus => {
  if (totalRequired <= 0) return 'pending';
  if (totalSorted <= 0) return 'pending';
  if (totalSorted >= totalRequired) return 'complete';
  return 'partial';
};

const toSortingOrderStatus = (totalSorted: number, totalRequired: number): SortingOrderStatus => {
  if (totalRequired <= 0) return 'sorting_pending';
  if (totalSorted <= 0) return 'sorting_pending';
  if (totalSorted >= totalRequired) return 'sorted_complete';
  return 'sorting_partial';
};

const toSortingItemStatus = (sorted: number, required: number): SortingItemRecord['status'] => {
  if (required <= 0) return 'complete';
  if (sorted <= 0) return 'missing';
  if (sorted >= required) return 'complete';
  return 'partial';
};

const coercePositiveInt = (value: unknown, fallback = 1) => {
  const parsed = Math.floor(Number(value ?? fallback));
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
};

const getSortingOrderBundle = (orderNo: string) => {
  const order = db
    .prepare('SELECT * FROM sorting_orders WHERE order_no = ?')
    .get(orderNo) as SortingOrderRecord | undefined;
  if (!order) return null;
  const items = db
    .prepare('SELECT * FROM sorting_items WHERE order_no = ? ORDER BY id ASC')
    .all(orderNo) as SortingItemRecord[];
  const table = order.table_id
    ? (db.prepare('SELECT id, name FROM sorting_tables WHERE id = ?').get(order.table_id) as { id: number; name: string } | undefined)
    : undefined;
  return {
    order,
    items,
    placement: order.table_id && order.row_no && order.col_no
      ? {
          table_id: order.table_id,
          table_name: table?.name ?? '',
          row_no: order.row_no,
          col_no: order.col_no,
          label: `${table?.name ?? `Table ${order.table_id}`} • R${order.row_no}:C${order.col_no}`,
        }
      : null,
  };
};

const syncSortingOrderProgress = (orderNo: string) => {
  const bundle = getSortingOrderBundle(orderNo);
  if (!bundle) return null;

  // Workflow status is driven by Clothes only:
  // - when clothes are complete => order moves to ironing/packing stage
  // - home items and blanket items are handled in later dedicated stages
  const clothesItems = bundle.items.filter((item) => detectSortingItemCategory(item.item_name) === 'clothes');
  const totalRequiredFromClothes = clothesItems.reduce((sum, item) => sum + Math.max(0, Number(item.qty_required) || 0), 0);
  const totalSortedFromClothes = clothesItems.reduce((sum, item) => sum + Math.max(0, Number(item.qty_sorted) || 0), 0);
  const totalIronedFromClothes = clothesItems.reduce((sum, item) => sum + Math.max(0, Number(item.qty_ironed) || 0), 0);
  const totalRequired = totalRequiredFromClothes;
  const totalSorted = Math.min(totalSortedFromClothes, totalRequiredFromClothes);
  const totalIroned = Math.min(totalIronedFromClothes, totalRequiredFromClothes);
  const orderStatus: SortingOrderStatus =
    bundle.order.status === 'packed_complete'
      ? 'packed_complete'
      : totalIroned > 0
        ? 'packing_in_progress'
        : toSortingOrderStatus(totalSorted, totalRequired);

  for (const item of bundle.items) {
    const itemStatus = toSortingItemStatus(item.qty_sorted, item.qty_required);
    if (item.status !== itemStatus) {
      db.prepare('UPDATE sorting_items SET status = ? WHERE id = ?').run(itemStatus, item.id);
    }
  }

  db.prepare(
    `UPDATE sorting_orders
     SET total_required = ?,
         total_sorted = ?,
         total_ironed = ?,
         status = ?,
         completed_at = CASE WHEN ? = 'sorted_complete' AND completed_at IS NULL THEN CURRENT_TIMESTAMP ELSE completed_at END,
         updated_at = CURRENT_TIMESTAMP
     WHERE order_no = ?`
  ).run(totalRequired, totalSorted, totalIroned, orderStatus, orderStatus, orderNo);

  const refreshed = db
    .prepare('SELECT * FROM sorting_orders WHERE order_no = ?')
    .get(orderNo) as SortingOrderRecord | undefined;

  if (refreshed?.table_id && refreshed.row_no && refreshed.col_no) {
    const cellStatus = toSortingCellStatus(totalSorted, totalRequired);
    db.prepare(
      `UPDATE sorting_cells
       SET active_order_no = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE table_id = ? AND row_no = ? AND col_no = ?`
    ).run(orderNo, cellStatus, refreshed.table_id, refreshed.row_no, refreshed.col_no);
  }

  return getSortingOrderBundle(orderNo);
};

const assignSortingCellForOrder = (orderNo: string) => {
  const order = db
    .prepare('SELECT * FROM sorting_orders WHERE order_no = ?')
    .get(orderNo) as SortingOrderRecord | undefined;
  if (!order) {
    throw new Error('Sorting order not found.');
  }

  const claimCellTx = db.transaction(() => {
    if (order.table_id && order.row_no && order.col_no) {
      const existingCell = db
        .prepare('SELECT * FROM sorting_cells WHERE table_id = ? AND row_no = ? AND col_no = ?')
        .get(order.table_id, order.row_no, order.col_no) as SortingCellRecord | undefined;

      if (existingCell && (!existingCell.active_order_no || existingCell.active_order_no === orderNo)) {
        db.prepare(
          `UPDATE sorting_cells
           SET active_order_no = ?, updated_at = CURRENT_TIMESTAMP
           WHERE table_id = ? AND row_no = ? AND col_no = ?`
        ).run(orderNo, order.table_id, order.row_no, order.col_no);
        return {
          table_id: order.table_id,
          row_no: order.row_no,
          col_no: order.col_no,
        };
      }
    }

    const freeCell = db
      .prepare(
        `SELECT c.table_id, c.row_no, c.col_no
         FROM sorting_cells c
         INNER JOIN sorting_tables t ON t.id = c.table_id
         WHERE t.is_active = 1 AND c.active_order_no IS NULL
         ORDER BY t.sort_order ASC, t.id ASC, c.row_no ASC, c.col_no ASC
         LIMIT 1`
      )
      .get() as { table_id: number; row_no: number; col_no: number } | undefined;

    if (!freeCell) {
      throw new Error('No available sorting cell. Add table/cells or free completed cells.');
    }

    db.prepare(
      `UPDATE sorting_cells
       SET active_order_no = ?, status = 'pending', updated_at = CURRENT_TIMESTAMP
       WHERE table_id = ? AND row_no = ? AND col_no = ?`
    ).run(orderNo, freeCell.table_id, freeCell.row_no, freeCell.col_no);

    db.prepare(
      `UPDATE sorting_orders
       SET table_id = ?, row_no = ?, col_no = ?, updated_at = CURRENT_TIMESTAMP
       WHERE order_no = ?`
    ).run(freeCell.table_id, freeCell.row_no, freeCell.col_no, orderNo);

    return freeCell;
  });

  const placement = claimCellTx();
  const table = db
    .prepare('SELECT id, name FROM sorting_tables WHERE id = ?')
    .get(placement.table_id) as { id: number; name: string } | undefined;
  return {
    table_id: placement.table_id,
    table_name: table?.name ?? '',
    row_no: placement.row_no,
    col_no: placement.col_no,
    label: `${table?.name ?? `Table ${placement.table_id}`} • R${placement.row_no}:C${placement.col_no}`,
  };
};

const ensureSortingOrderInitialized = async (params: {
  order_no: string;
  source_orders_id?: string;
  source_invoice_id?: string;
  customer_name?: string;
  total_required?: number;
  items?: Array<{ item_name: string; qty_required: number }>;
  allow_unsorted_fallback?: boolean;
}) => {
  const normalizedOrderNo = normalizeSortingOrderNo(params.order_no);
  if (!normalizedOrderNo) throw new Error('Order number is required.');

  const existing = db
    .prepare('SELECT * FROM sorting_orders WHERE order_no = ?')
    .get(normalizedOrderNo) as SortingOrderRecord | undefined;
  const existingItems = existing
    ? (db.prepare('SELECT * FROM sorting_items WHERE order_no = ? ORDER BY id ASC').all(normalizedOrderNo) as SortingItemRecord[])
    : [];
  const canRefreshExistingUnsorted =
    Boolean(existing) &&
    existingItems.length === 1 &&
    /^unsorted item$/i.test(String(existingItems[0]?.item_name ?? '').trim()) &&
    Number(existingItems[0]?.qty_sorted ?? 0) <= 0 &&
    Number(existingItems[0]?.qty_ironed ?? 0) <= 0 &&
    Number((existingItems[0] as any)?.qty_packed ?? 0) <= 0;
  if (existing && !canRefreshExistingUnsorted) return existing;

  let sourceOrdersId = String(params.source_orders_id ?? existing?.source_orders_id ?? '').trim();
  let sourceInvoiceId = String(params.source_invoice_id ?? existing?.source_invoice_id ?? '').trim();
  let customerName = String(params.customer_name ?? existing?.customer_name ?? '').trim();
  let totalRequired = coercePositiveInt(params.total_required ?? existing?.total_required ?? 0, 0);
  const allowUnsortedFallback = Boolean(params.allow_unsorted_fallback);
  let posSearchError: string | null = null;
  let posDetailsError: string | null = null;
  let items: Array<{ item_name: string; qty_required: number }> = Array.isArray(params.items)
    ? params.items
        .map((item) => ({
          item_name: String(item?.item_name ?? '').trim(),
          qty_required: coercePositiveInt(item?.qty_required ?? 0, 0),
        }))
        .filter((item) => item.item_name.length > 0 && item.qty_required > 0)
    : [];
  const hasManualInput = items.length > 0 || totalRequired > 0;

  if (!sourceOrdersId && !sourceInvoiceId) {
    try {
      const search = await fetchPosOrderSearch(normalizedOrderNo);
      const exact =
        search.orders.find((order) => normalizeSortingOrderNo(order.order_no) === normalizedOrderNo) ??
        search.orders[0];
      if (exact) {
        sourceOrdersId = String(exact.orders_id ?? '').trim();
        sourceInvoiceId = String(exact.invoice_id ?? '').trim();
        if (!customerName) customerName = String(exact.customer_name ?? '').trim();
      }
    } catch (error: any) {
      posSearchError = String(error?.message || 'POS order search failed');
    }
  }

  if (!sourceOrdersId && !sourceInvoiceId) {
    const directCandidates: Array<{ order_id: string; s_order_id: string; tag: 'orders' | 'invoice' }> = [];
    const compact = normalizedOrderNo.replace(/[^0-9A-Z]/gi, '');
    const numericOnly = compact.replace(/\D+/g, '');
    const alnumCandidates = Array.from(
      new Set(
        [normalizedOrderNo, compact, numericOnly]
          .map((value) => String(value ?? '').trim())
          .filter((value) => value.length > 0)
      )
    );

    for (const candidate of alnumCandidates) {
      directCandidates.push({ order_id: '0', s_order_id: candidate, tag: 'orders' });
      directCandidates.push({ order_id: candidate, s_order_id: '0', tag: 'invoice' });
    }

    for (const candidate of directCandidates) {
      try {
        const directDetails = await fetchPosOrderDetails({
          order_id: candidate.order_id,
          s_order_id: candidate.s_order_id,
          mode: '0',
          open_type: 'preview',
        });
        if ((directDetails.line_items ?? []).length > 0) {
          if (candidate.tag === 'orders') {
            sourceOrdersId = candidate.s_order_id;
          } else {
            sourceInvoiceId = candidate.order_id;
          }
          if (!customerName) {
            customerName = String(directDetails.general.customer_name ?? '').trim();
          }
          break;
        }
      } catch {
        // Keep trying other numeric/alphanumeric shapes.
      }
    }
  }

  if (sourceOrdersId || sourceInvoiceId) {
    try {
      const details = await fetchPosOrderDetails({
        order_id: sourceInvoiceId || '0',
        s_order_id: sourceOrdersId || '0',
        mode: '0',
        open_type: 'preview',
      });

      if (!customerName) {
        customerName = String(details.general.customer_name ?? '').trim();
      }

      const aggregate = new Map<string, number>();
      for (const line of details.line_items) {
        const name = String(line.name ?? '').trim() || 'Unsorted item';
        const qty = coercePositiveInt(line.qty, 1);
        aggregate.set(name, (aggregate.get(name) ?? 0) + qty);
      }

      if (aggregate.size > 0) {
        items = Array.from(aggregate.entries()).map(([item_name, qty_required]) => ({ item_name, qty_required }));
      }

      const qtySum = items.reduce((sum, item) => sum + item.qty_required, 0);
      totalRequired = Math.max(totalRequired, qtySum, 1);
    } catch (error: any) {
      // Keep the message for better diagnosis if we end up with no parsed items.
      posDetailsError = String(error?.message || 'unknown POS details error');
    }
  }

  if (items.length === 0) {
    if (!allowUnsortedFallback && !hasManualInput) {
      const reasons = [posSearchError, posDetailsError].filter((value) => Boolean(value)).join(' | ');
      throw new Error(
        `Could not load order items from POS for ${normalizedOrderNo}.${reasons ? ` ${reasons}` : ''}`
      );
    }
    if ((sourceOrdersId || sourceInvoiceId) && posDetailsError) {
      throw new Error(`Could not parse POS line items for order ${normalizedOrderNo}: ${posDetailsError}`);
    }
    const fallbackRequired = Math.max(totalRequired, 1);
    totalRequired = fallbackRequired;
    items = [{ item_name: 'Unsorted item', qty_required: fallbackRequired }];
  } else {
    totalRequired = Math.max(totalRequired, items.reduce((sum, item) => sum + item.qty_required, 0), 1);
  }

  const createOrderTx = db.transaction(() => {
    const exists = db
      .prepare('SELECT order_no FROM sorting_orders WHERE order_no = ?')
      .get(normalizedOrderNo) as { order_no: string } | undefined;

    if (!exists) {
      db.prepare(
        `INSERT INTO sorting_orders (
          order_no, customer_name, total_required, total_sorted, total_ironed, status, source_orders_id, source_invoice_id, created_at, updated_at
        )
        VALUES (?, ?, ?, 0, 0, 'sorting_pending', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      ).run(
        normalizedOrderNo,
        customerName,
        totalRequired,
        sourceOrdersId || null,
        sourceInvoiceId || null
      );
    } else {
      db.prepare(
        `UPDATE sorting_orders
         SET customer_name = ?,
             total_required = ?,
             source_orders_id = ?,
             source_invoice_id = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE order_no = ?`
      ).run(customerName, totalRequired, sourceOrdersId || null, sourceInvoiceId || null, normalizedOrderNo);

      db.prepare('DELETE FROM sorting_items WHERE order_no = ?').run(normalizedOrderNo);
    }

    const insertItem = db.prepare(
      `INSERT OR IGNORE INTO sorting_items (order_no, item_name, qty_required, qty_sorted, qty_ironed, qty_packed, status)
       VALUES (?, ?, ?, 0, 0, 0, 'missing')`
    );
    for (const item of items) {
      insertItem.run(normalizedOrderNo, item.item_name, item.qty_required);
    }
  });

  createOrderTx();
  const created = db
    .prepare('SELECT * FROM sorting_orders WHERE order_no = ?')
    .get(normalizedOrderNo) as SortingOrderRecord | undefined;
  if (!created) {
    throw new Error('Failed to initialize sorting order.');
  }
  return created;
};

const applySortingScan = (params: {
  order_no: string;
  item_name?: string;
  qty?: number;
  user?: string;
  request_id?: string;
}) => {
  const normalizedOrderNo = normalizeSortingOrderNo(params.order_no);
  const scanQty = coercePositiveInt(params.qty, 1);
  const preferredItemName = String(params.item_name ?? '').trim().toLowerCase();
  const scanUser = String(params.user ?? 'system').trim() || 'system';
  const requestId = String(params.request_id ?? '').trim() || null;

  const order = db
    .prepare('SELECT * FROM sorting_orders WHERE order_no = ?')
    .get(normalizedOrderNo) as SortingOrderRecord | undefined;
  if (!order) {
    throw new Error('Sorting order was not initialized.');
  }

  const items = db
    .prepare('SELECT * FROM sorting_items WHERE order_no = ? ORDER BY id ASC')
    .all(normalizedOrderNo) as SortingItemRecord[];
  if (items.length === 0) {
    throw new Error('No order items found for this sorting order.');
  }

  let remaining = scanQty;
  const increments = new Map<number, number>();

  const applyToItem = (item: SortingItemRecord) => {
    if (remaining <= 0) return;
    const available = Math.max(0, item.qty_required - item.qty_sorted - (increments.get(item.id) ?? 0));
    if (available <= 0) return;
    const used = Math.min(remaining, available);
    if (used <= 0) return;
    increments.set(item.id, (increments.get(item.id) ?? 0) + used);
    remaining -= used;
  };

  if (preferredItemName) {
    const targetItem =
      items.find((item) => item.item_name.trim().toLowerCase() === preferredItemName) ??
      items.find((item) => item.item_name.trim().toLowerCase().includes(preferredItemName));
    if (targetItem) applyToItem(targetItem);
  }

  const categoryRank = (item: SortingItemRecord) => {
    const category = detectSortingItemCategory(item.item_name);
    if (category === 'clothes') return 0;
    if (category === 'home_phase2') return 1;
    return 2;
  };
  const prioritizedItems = [...items].sort((a, b) => categoryRank(a) - categoryRank(b) || a.id - b.id);

  for (const item of prioritizedItems) {
    applyToItem(item);
    if (remaining <= 0) break;
  }

  const consumed = scanQty - remaining;
  const commitTx = db.transaction(() => {
    for (const item of items) {
      const delta = increments.get(item.id) ?? 0;
      if (delta <= 0) continue;
      const nextSorted = Math.min(item.qty_required, item.qty_sorted + delta);
      const nextStatus = toSortingItemStatus(nextSorted, item.qty_required);
      db.prepare(
        `UPDATE sorting_items
         SET qty_sorted = ?, status = ?
         WHERE id = ?`
      ).run(nextSorted, nextStatus, item.id);
    }

    const orderAfterCell = db
      .prepare('SELECT table_id, row_no, col_no FROM sorting_orders WHERE order_no = ?')
      .get(normalizedOrderNo) as { table_id: number | null; row_no: number | null; col_no: number | null } | undefined;

    db.prepare(
      `INSERT INTO sorting_scans (order_no, scanned_code, table_id, row_no, col_no, item_name, qty, user, request_id, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    ).run(
      normalizedOrderNo,
      normalizedOrderNo,
      orderAfterCell?.table_id ?? null,
      orderAfterCell?.row_no ?? null,
      orderAfterCell?.col_no ?? null,
      params.item_name ? String(params.item_name).trim() : null,
      Math.max(consumed, 0),
      scanUser,
      requestId
    );
  });

  commitTx();
  const synced = syncSortingOrderProgress(normalizedOrderNo);
  return {
    consumed,
    overflow: remaining,
    ...(synced ?? {}),
  };
};

const applySortingIroningStart = (params: {
  order_no: string;
  qty?: number;
  user?: string;
  request_id?: string;
}) => {
  const normalizedOrderNo = normalizeSortingOrderNo(params.order_no);
  const inputQty = coercePositiveInt(params.qty, 1);
  const ironingUser = String(params.user ?? 'system').trim() || 'system';
  const requestId = String(params.request_id ?? '').trim() || null;

  const order = db
    .prepare('SELECT * FROM sorting_orders WHERE order_no = ?')
    .get(normalizedOrderNo) as SortingOrderRecord | undefined;
  if (!order) {
    throw new Error('Sorting order was not initialized.');
  }
  if (order.status === 'packed_complete') {
    throw new Error('Order is already packed complete.');
  }

  const items = db
    .prepare('SELECT * FROM sorting_items WHERE order_no = ? ORDER BY id ASC')
    .all(normalizedOrderNo) as SortingItemRecord[];
  const clothesItems = items.filter((item) => detectSortingItemCategory(item.item_name) === 'clothes');
  if (clothesItems.length === 0) {
    throw new Error('No clothes items found in this order.');
  }

  const totalSortedAvailable = clothesItems.reduce((sum, item) => {
    const sortedAvailable = Math.min(item.qty_sorted, item.qty_required);
    return sum + Math.max(0, sortedAvailable - item.qty_ironed);
  }, 0);

  let remaining = inputQty;
  const increments = new Map<number, number>();
  for (const item of clothesItems) {
    if (remaining <= 0) break;
    const sortedAvailable = Math.min(item.qty_sorted, item.qty_required);
    const available = Math.max(0, sortedAvailable - item.qty_ironed - (increments.get(item.id) ?? 0));
    if (available <= 0) continue;
    const used = Math.min(remaining, available);
    increments.set(item.id, (increments.get(item.id) ?? 0) + used);
    remaining -= used;
  }

  const consumed = inputQty - remaining;
  if (consumed <= 0) {
    if (totalSortedAvailable <= 0) {
      throw new Error('No sorted clothes are available for ironing yet.');
    }
    throw new Error('All sorted clothes pieces for this order are already ironed.');
  }

  const firstItemWithDelta = clothesItems.find((item) => (increments.get(item.id) ?? 0) > 0);

  const commitTx = db.transaction(() => {
    for (const item of clothesItems) {
      const delta = increments.get(item.id) ?? 0;
      if (delta <= 0) continue;
      const nextIroned = Math.min(item.qty_required, item.qty_ironed + delta);
      db.prepare(
        `UPDATE sorting_items
         SET qty_ironed = ?
         WHERE id = ?`
      ).run(nextIroned, item.id);
    }

    if (order.status !== 'packing_in_progress' && order.status !== 'packed_complete') {
      db.prepare(
        `UPDATE sorting_orders
         SET status = 'packing_in_progress', updated_at = CURRENT_TIMESTAMP
         WHERE order_no = ?`
      ).run(normalizedOrderNo);
    }

    db.prepare(
      `INSERT INTO sorting_ironing_events (order_no, item_name, qty, user, request_id, timestamp)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    ).run(
      normalizedOrderNo,
      firstItemWithDelta?.item_name ?? null,
      consumed,
      ironingUser,
      requestId
    );
  });

  commitTx();

  const synced = syncSortingOrderProgress(normalizedOrderNo);
  const clothesAfter = (synced?.items ?? items).filter((item) => detectSortingItemCategory(item.item_name) === 'clothes');
  const required = clothesAfter.reduce((sum, item) => sum + Math.max(0, Number(item.qty_required) || 0), 0);
  const ironed = clothesAfter.reduce((sum, item) => sum + Math.max(0, Number(item.qty_ironed) || 0), 0);
  return {
    consumed,
    overflow: remaining,
    ironing_progress: {
      ironed,
      required,
      complete: required > 0 && ironed >= required,
    },
    ...(synced ?? {}),
  };
};

const getBlanketPackingBundle = (orderNo: string) => {
  const normalizedOrderNo = normalizeSortingOrderNo(orderNo);
  const order = db
    .prepare('SELECT * FROM sorting_orders WHERE order_no = ?')
    .get(normalizedOrderNo) as SortingOrderRecord | undefined;
  if (!order) return null;
  const items = db
    .prepare('SELECT * FROM sorting_items WHERE order_no = ? ORDER BY id ASC')
    .all(normalizedOrderNo) as SortingItemRecord[];
  const blanketItems = items.filter((item) => detectSortingItemCategory(item.item_name) === 'blanket_phase3');
  const totals = blanketItems.reduce(
    (acc, item) => {
      acc.required += Math.max(0, Number(item.qty_required) || 0);
      acc.packed += Math.max(0, Math.min(Number(item.qty_required) || 0, Number(item.qty_packed) || 0));
      return acc;
    },
    { required: 0, packed: 0 }
  );
  return {
    order,
    items: blanketItems,
    totals: {
      required: totals.required,
      packed: totals.packed,
      remaining: Math.max(0, totals.required - totals.packed),
      complete: totals.required > 0 && totals.packed >= totals.required,
    },
  };
};

const applyBlanketPackingScan = (params: {
  order_no: string;
  item_name?: string;
  qty?: number;
  user?: string;
  request_id?: string;
}) => {
  const normalizedOrderNo = normalizeSortingOrderNo(params.order_no);
  const scanQty = coercePositiveInt(params.qty, 1);
  const requestedItemName = String(params.item_name ?? '').trim().toLowerCase();
  const packedByUser = String(params.user ?? 'system').trim() || 'system';
  const requestId = String(params.request_id ?? '').trim() || null;

  const order = db
    .prepare('SELECT * FROM sorting_orders WHERE order_no = ?')
    .get(normalizedOrderNo) as SortingOrderRecord | undefined;
  if (!order) {
    throw new Error('Sorting order was not initialized.');
  }

  const allItems = db
    .prepare('SELECT * FROM sorting_items WHERE order_no = ? ORDER BY id ASC')
    .all(normalizedOrderNo) as SortingItemRecord[];
  const blanketItems = allItems.filter((item) => detectSortingItemCategory(item.item_name) === 'blanket_phase3');
  if (blanketItems.length === 0) {
    throw new Error('No blanket or pillow items found in this order.');
  }

  let remaining = scanQty;
  const increments = new Map<number, number>();
  const applyToItem = (item: SortingItemRecord) => {
    if (remaining <= 0) return;
    const required = Math.max(0, Number(item.qty_required) || 0);
    const packed = Math.max(0, Number(item.qty_packed) || 0);
    const staged = increments.get(item.id) ?? 0;
    const available = Math.max(0, required - packed - staged);
    if (available <= 0) return;
    const used = Math.min(remaining, available);
    if (used <= 0) return;
    increments.set(item.id, staged + used);
    remaining -= used;
  };

  if (requestedItemName) {
    const targetItem =
      blanketItems.find((item) => item.item_name.trim().toLowerCase() === requestedItemName) ??
      blanketItems.find((item) => item.item_name.trim().toLowerCase().includes(requestedItemName));
    if (targetItem) {
      applyToItem(targetItem);
    }
  }

  // Fill remaining qty over all blanket items in stable order.
  for (const item of blanketItems) {
    applyToItem(item);
    if (remaining <= 0) break;
  }

  const consumed = scanQty - remaining;
  if (consumed <= 0) {
    throw new Error('Blanket/pillow quantities are already fully packed for this order.');
  }

  const firstTouched = blanketItems.find((item) => (increments.get(item.id) ?? 0) > 0);
  const commitTx = db.transaction(() => {
    for (const item of blanketItems) {
      const delta = increments.get(item.id) ?? 0;
      if (delta <= 0) continue;
      const required = Math.max(0, Number(item.qty_required) || 0);
      const nextPacked = Math.min(required, Math.max(0, Number(item.qty_packed) || 0) + delta);
      db.prepare(
        `UPDATE sorting_items
         SET qty_packed = ?
         WHERE id = ?`
      ).run(nextPacked, item.id);
    }

    db.prepare(
      `INSERT INTO sorting_blanket_packing_events (order_no, item_name, qty, user, request_id, timestamp)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    ).run(normalizedOrderNo, firstTouched?.item_name ?? null, consumed, packedByUser, requestId);

    // Record in global logs as requested.
    db.prepare(
      `INSERT INTO logs (blanket_number, action, user, store, row, column, status, request_id, device, ip, notes, timestamp)
       VALUES (?, ?, ?, ?, NULL, NULL, ?, ?, NULL, NULL, ?, CURRENT_TIMESTAMP)`
    ).run(
      normalizedOrderNo,
      'packed',
      packedByUser,
      'blanket_packing',
      'packed',
      requestId,
      `Blanket packing scan${firstTouched?.item_name ? ` • ${firstTouched.item_name}` : ''} • qty ${consumed}`
    );
  });

  commitTx();
  const bundle = getBlanketPackingBundle(normalizedOrderNo);
  if (!bundle) {
    throw new Error('Failed to refresh blanket packing order.');
  }

  return {
    consumed,
    overflow: remaining,
    ...bundle,
  };
};

const buildSortingState = () => {
  const tables = db
    .prepare('SELECT * FROM sorting_tables ORDER BY sort_order ASC, id ASC')
    .all() as SortingTableRecord[];

  const tablePayload = tables.map((table) => {
    const cells = db
      .prepare(
        `SELECT c.id, c.table_id, c.row_no, c.col_no, c.active_order_no, c.status, c.updated_at,
                o.customer_name, o.total_required, o.total_sorted, o.status AS order_status
         FROM sorting_cells c
         LEFT JOIN sorting_orders o ON o.order_no = c.active_order_no
         WHERE c.table_id = ?
           AND c.row_no BETWEEN 1 AND ?
           AND c.col_no BETWEEN 1 AND ?
         ORDER BY c.row_no ASC, c.col_no ASC`
      )
      .all(table.id, table.rows, table.cols) as Array<
      SortingCellRecord & {
        customer_name: string | null;
        total_required: number | null;
        total_sorted: number | null;
        order_status: SortingOrderStatus | null;
      }
    >;

    const summary = {
      empty: cells.filter((cell) => !cell.active_order_no).length,
      pending: cells.filter((cell) => cell.status === 'pending').length,
      partial: cells.filter((cell) => cell.status === 'partial').length,
      complete: cells.filter((cell) => cell.status === 'complete').length,
    };

    return {
      ...table,
      cells: cells.map((cell) => ({
        ...cell,
        progress: {
          sorted: Number(cell.total_sorted ?? 0),
          required: Number(cell.total_required ?? 0),
        },
      })),
      summary,
    };
  });

  const orders = db
    .prepare('SELECT * FROM sorting_orders ORDER BY updated_at DESC, created_at DESC')
    .all() as SortingOrderRecord[];
  const itemsByOrder = new Map<string, SortingItemRecord[]>();
  const items = db
    .prepare('SELECT * FROM sorting_items ORDER BY order_no ASC, id ASC')
    .all() as SortingItemRecord[];
  for (const item of items) {
    if (!itemsByOrder.has(item.order_no)) itemsByOrder.set(item.order_no, []);
    itemsByOrder.get(item.order_no)!.push(item);
  }

  const ordersPayload = orders.map((order) => ({
    ...order,
    items: itemsByOrder.get(order.order_no) ?? [],
    progress_percent:
      order.total_required > 0 ? Math.min(100, Math.round((order.total_sorted / order.total_required) * 100)) : 0,
  }));

  return {
    tables: tablePayload,
    orders: {
      all: ordersPayload,
      sorting: ordersPayload.filter((order) => order.status === 'sorting_pending' || order.status === 'sorting_partial'),
      ready_for_packing: ordersPayload.filter((order) => order.status === 'sorted_complete' || order.status === 'packing_in_progress'),
      packed: ordersPayload.filter((order) => order.status === 'packed_complete'),
    },
  };
};

const getOtpPhonePurposeKey = (phoneNormalized: string, purpose: CustomerOtpPurpose) =>
  `${phoneNormalized}:${purpose}`;

const pruneCustomerOtpStores = () => {
  const now = Date.now();
  for (const [challengeId, challenge] of customerOtpChallengeStore.entries()) {
    if (challenge.expires_at <= now) {
      customerOtpChallengeStore.delete(challengeId);
      const key = getOtpPhonePurposeKey(challenge.phone_normalized, challenge.purpose);
      if (customerOtpChallengeByPhonePurpose.get(key) === challengeId) {
        customerOtpChallengeByPhonePurpose.delete(key);
      }
    }
  }

  for (const [token, verification] of customerOtpVerificationStore.entries()) {
    if (verification.expires_at <= now || verification.consumed) {
      customerOtpVerificationStore.delete(token);
    }
  }
};

const isTwilioVerifyEnabled = () =>
  CUSTOMER_SMS_PROVIDER === 'twilio' &&
  TWILIO_ACCOUNT_SID.length > 0 &&
  TWILIO_AUTH_TOKEN.length > 0 &&
  TWILIO_VERIFY_SERVICE_SID.length > 0;

const isAipsoftSmsEnabled = () =>
  CUSTOMER_SMS_PROVIDER === 'aipsoft' &&
  AIPSOFT_SMS_SECRET.length > 0 &&
  AIPSOFT_SMS_URL.length > 0 &&
  AIPSOFT_VERIFY_URL.length > 0;

const sendOtpViaTwilioVerify = async (phoneE164: string) => {
  const endpoint = `https://verify.twilio.com/v2/Services/${encodeURIComponent(TWILIO_VERIFY_SERVICE_SID)}/Verifications`;
  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
  const payload = new URLSearchParams({
    To: phoneE164,
    Channel: 'sms',
  });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: payload.toString(),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Twilio send failed (${response.status})`);
  }
};

const verifyOtpViaTwilioVerify = async (phoneE164: string, code: string) => {
  const endpoint = `https://verify.twilio.com/v2/Services/${encodeURIComponent(TWILIO_VERIFY_SERVICE_SID)}/VerificationCheck`;
  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
  const payload = new URLSearchParams({
    To: phoneE164,
    Code: code,
  });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: payload.toString(),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Twilio verify failed (${response.status})`);
  }

  const body = (await response.json().catch(() => ({}))) as { status?: string; valid?: boolean };
  return body.valid === true || String(body.status ?? '').toLowerCase() === 'approved';
};

class OtpProviderError extends Error {
  status: number;
  code: string;
  details?: string;

  constructor(status: number, code: string, message: string, details?: string) {
    super(message);
    this.name = 'OtpProviderError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const tryParseJson = (text: string) => {
  try {
    return text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
};

const formatAipsoftPhone = (phoneNormalized: string, phoneE164: string) => {
  if (AIPSOFT_SMS_PHONE_MODE === 'e164') return phoneE164;
  if (AIPSOFT_SMS_PHONE_MODE === 'e164_no_plus') return phoneE164.replace(/^\+/, '');
  return phoneNormalized;
};

const getAipsoftPhoneCandidates = (phoneNormalized: string, phoneE164: string) => {
  const e164NoPlus = phoneE164.replace(/^\+/, '');
  if (AIPSOFT_SMS_PHONE_MODE === 'auto') {
    return Array.from(new Set([phoneNormalized, e164NoPlus, phoneE164]));
  }
  return [formatAipsoftPhone(phoneNormalized, phoneE164)];
};

const sendCustomerAlertWhatsapp = async (phoneRaw: string, message: string) => {
  const phoneNormalized = normalizeCustomerPhone(phoneRaw);
  const phoneE164 = phoneNormalized ? toCustomerPhoneE164(phoneNormalized) : null;
  const fallbackPhone = String(phoneRaw ?? '').replace(/\s+/g, '');
  const phoneCandidates =
    phoneNormalized && phoneE164
      ? getAipsoftPhoneCandidates(phoneNormalized, phoneE164)
      : fallbackPhone
        ? [fallbackPhone]
        : [];

  if (phoneCandidates.length === 0) {
    throw new Error('Customer phone is empty or invalid.');
  }

  const normalizedMessage = String(message ?? '').trim();
  if (!normalizedMessage) {
    throw new Error('Message body is required.');
  }

  if (CUSTOMER_ALERT_WHATSAPP_PROVIDER === 'mock') {
    return {
      provider: 'mock',
      status: 'sent',
      response: 'Mock provider accepted message.',
    };
  }

  if (CUSTOMER_ALERT_WHATSAPP_PROVIDER !== 'aipsoft') {
    throw new Error('Unsupported WhatsApp provider. Set CUSTOMER_ALERT_WHATSAPP_PROVIDER to mock or aipsoft.');
  }

  if (!AIPSOFT_WHATSAPP_SEND_URL || !AIPSOFT_SMS_SECRET) {
    throw new Error('AIPSoft WhatsApp is not configured. Set AIPSOFT_WHATSAPP_SEND_URL and AIPSOFT_SMS_SECRET.');
  }

  const encodings: Array<'multipart' | 'urlencoded'> = ['multipart', 'urlencoded'];
  let lastBody = '';
  let lastAttempt = '';
  let lastError: Error | null = null;

  const sendAttempt = async (
    payload: Array<[string, string]>,
    encoding: 'multipart' | 'urlencoded',
    signal: AbortSignal
  ) => {
    if (encoding === 'urlencoded') {
      const form = new URLSearchParams();
      for (const [key, value] of payload) form.append(key, value);
      return fetch(AIPSOFT_WHATSAPP_SEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: form.toString(),
        signal,
      });
    }
    const form = new FormData();
    for (const [key, value] of payload) form.append(key, value);
    return fetch(AIPSOFT_WHATSAPP_SEND_URL, {
      method: 'POST',
      body: form,
      signal,
    });
  };

  for (const phone of phoneCandidates) {
    const payload: Array<[string, string]> = [
      ['secret', AIPSOFT_SMS_SECRET],
      ['type', AIPSOFT_WHATSAPP_TYPE || 'whatsapp'],
      ['phone', phone],
      ['message', normalizedMessage],
    ];
    if (AIPSOFT_WHATSAPP_ACCOUNT) payload.push(['account', AIPSOFT_WHATSAPP_ACCOUNT]);

    for (const encoding of encodings) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), CUSTOMER_ALERT_SEND_TIMEOUT_MS);
      try {
        lastAttempt = `phone=${phone}, encoding=${encoding}`;
        const response = await sendAttempt(payload, encoding, controller.signal);
        const body = await response.text().catch(() => '');
        lastBody = body;
        const parsed = tryParseJson(body) as { status?: number | string; message?: string };
        const providerStatus = Number(parsed.status ?? (response.ok ? 200 : response.status));
        if (response.ok && providerStatus === 200) {
          return {
            provider: 'aipsoft',
            status: 'sent',
            response: body || 'AIPSoft accepted message.',
          };
        }
        lastError = new Error(body || `AIPSoft message failed (${response.status})`);
      } catch (error: any) {
        lastError = error instanceof Error ? error : new Error(String(error));
      } finally {
        clearTimeout(timer);
      }
    }
  }

  throw new Error(
    `Failed to send WhatsApp alert via AIPSoft. ${lastAttempt}${lastBody ? ` | ${String(lastBody).slice(0, 260)}` : ''}${
      lastError?.message ? ` | ${lastError.message}` : ''
    }`
  );
};

const sendOtpViaAipsoft = async (
  phoneNormalized: string,
  phoneE164: string,
  channel: CustomerOtpChannel
) => {
  // AIPSoft OTP endpoint expects a template that contains {{otp}}.
  const sourceTemplate = channel === 'whatsapp' ? AIPSOFT_WHATSAPP_TEMPLATE : AIPSOFT_SMS_TEMPLATE;
  const templateHasOtp = /\{\{\s*otp\s*\}\}/i.test(sourceTemplate);
  const message = templateHasOtp ? sourceTemplate : `${sourceTemplate} {{otp}}`;
  const aipsoftType = channel === 'whatsapp' ? AIPSOFT_WHATSAPP_TYPE : AIPSOFT_SMS_TYPE;
  const phoneCandidates = getAipsoftPhoneCandidates(phoneNormalized, phoneE164);
  const encodings: Array<'multipart' | 'urlencoded'> = ['multipart', 'urlencoded'];
  let lastError: Error | null = null;
  let lastResponseBody = '';
  let lastAttempt = '';

  const getBasePayload = (phone: string) => {
    const payload: Array<[string, string]> = [
      ['secret', AIPSOFT_SMS_SECRET],
      ['type', aipsoftType],
      ['message', message],
      ['phone', phone],
      ['expire', String(AIPSOFT_SMS_EXPIRE_SECONDS)],
    ];

    if (channel === 'whatsapp') {
      // Optional WhatsApp account routing field documented by AIPSoft.
      if (AIPSOFT_WHATSAPP_ACCOUNT) {
        payload.push(['account', AIPSOFT_WHATSAPP_ACCOUNT]);
      }
      return payload;
    }

    // Optional SMS routing fields documented by AIPSoft.
    if (AIPSOFT_SMS_MODE === 'devices' || AIPSOFT_SMS_MODE === 'credits') {
      payload.push(['mode', AIPSOFT_SMS_MODE]);
    }
    if (AIPSOFT_SMS_DEVICE) payload.push(['device', AIPSOFT_SMS_DEVICE]);
    if (AIPSOFT_SMS_GATEWAY) payload.push(['gateway', AIPSOFT_SMS_GATEWAY]);
    if (AIPSOFT_SMS_SIM) payload.push(['sim', AIPSOFT_SMS_SIM]);
    return payload;
  };

  const sendRequest = async (payload: Array<[string, string]>, encoding: 'multipart' | 'urlencoded') => {
    if (encoding === 'urlencoded') {
      const form = new URLSearchParams();
      for (const [key, value] of payload) form.append(key, value);
      return fetch(AIPSOFT_SMS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: form.toString(),
      });
    }

    const form = new FormData();
    for (const [key, value] of payload) form.append(key, value);
    return fetch(AIPSOFT_SMS_URL, {
      method: 'POST',
      body: form,
    });
  };

  for (const phone of phoneCandidates) {
    const payload = getBasePayload(phone);
    for (const encoding of encodings) {
      lastAttempt = `phone=${phone}, encoding=${encoding}, mode=${AIPSOFT_SMS_MODE || 'default'}`;
      const response = await sendRequest(payload, encoding);

      const responseBody = await response.text().catch(() => '');
      lastResponseBody = responseBody;
      const parsed = tryParseJson(responseBody) as { status?: number | string; message?: string; data?: unknown };

      const providerStatus = Number(parsed.status ?? (response.ok ? 200 : response.status));
      const providerMessage = String(parsed.message ?? responseBody ?? '').toLowerCase();
      const looksInvalidParam = providerMessage.includes('invalid parameter');

      if (response.ok && providerStatus === 200) {
        return;
      }

      lastError = new Error(responseBody || `AIPSoft send failed (${response.status})`);
      // When parameters are rejected, try the next attempt strategy.
      if (looksInvalidParam) {
        continue;
      }
      throw lastError;
    }
  }

  if (lastError) {
    const parsed = tryParseJson(lastResponseBody) as { status?: number | string; message?: string; data?: unknown };
    const providerMessage = String(parsed.message ?? lastResponseBody ?? '').toLowerCase();
    if (providerMessage.includes('invalid parameter')) {
      throw new OtpProviderError(
        502,
        'AIPSOFT_INVALID_PARAMETERS',
        `${channel === 'whatsapp' ? 'WhatsApp' : 'SMS'} provider rejected OTP request parameters. Verify AIPSoft OTP permission and channel configuration.`,
        `${lastAttempt} | ${lastResponseBody} | channel=${channel}`
      );
    }
    throw new OtpProviderError(
      502,
      'AIPSOFT_SEND_FAILED',
      `Failed to send OTP via ${channel === 'whatsapp' ? 'WhatsApp' : 'SMS'} provider.`,
      `${lastAttempt} | ${lastResponseBody || lastError.message} | channel=${channel}`
    );
  }
};

const verifyOtpViaAipsoft = async (code: string) => {
  const query = new URLSearchParams({
    secret: AIPSOFT_SMS_SECRET,
    otp: code,
  });
  const endpoint = `${AIPSOFT_VERIFY_URL}${AIPSOFT_VERIFY_URL.includes('?') ? '&' : '?'}${query.toString()}`;
  const response = await fetch(endpoint, { method: 'GET' });

  const rawBody = await response.text().catch(() => '');
  const body = tryParseJson(rawBody) as {
    status?: number | string;
    message?: string;
    data?: boolean | string | number | null;
  };

  if (!response.ok) {
    throw new OtpProviderError(
      502,
      'AIPSOFT_VERIFY_FAILED',
      'Failed to verify OTP with SMS provider.',
      rawBody || `status=${response.status}`
    );
  }

  // Accept multiple possible response shapes from provider.
  const message = String(body.message ?? '').toLowerCase();
  const statusCode = Number(body.status ?? 0);

  if (message.includes('verified')) return true;
  if (typeof body.data === 'boolean') return body.data;
  if (typeof body.data === 'number') return body.data === 1;
  if (typeof body.data === 'string') {
    const dataValue = body.data.trim().toLowerCase();
    if (dataValue === 'true' || dataValue === '1' || dataValue === 'verified' || dataValue === 'ok') return true;
    if (dataValue === 'false' || dataValue === '0') return false;
  }
  return statusCode === 200 && !message.includes('invalid') && !message.includes('expired') && !message.includes('wrong');
};

const consumeCustomerOtpVerificationToken = (
  token: string,
  phoneNormalized: string,
  purpose: CustomerOtpPurpose
) => {
  pruneCustomerOtpStores();
  const record = customerOtpVerificationStore.get(token);
  if (!record) return false;
  if (record.consumed || record.expires_at <= Date.now()) {
    customerOtpVerificationStore.delete(token);
    return false;
  }
  if (record.phone_normalized !== phoneNormalized || record.purpose !== purpose) {
    return false;
  }
  record.consumed = true;
  customerOtpVerificationStore.set(token, record);
  return true;
};

const DEFAULT_DRIVER_ACCOUNTS = [
  { id: 'DRV-001', name: 'Driver 1', phone: '0565865506' },
];

const getConfiguredDrivers = () => {
  const row = db.prepare('SELECT payload FROM customer_site_config WHERE id = 1').get() as { payload: string } | undefined;
  if (!row?.payload) return DEFAULT_DRIVER_ACCOUNTS;
  try {
    const parsed = JSON.parse(row.payload) as { drivers?: Array<{ id?: unknown; name?: unknown; phone?: unknown }> };
    const list = Array.isArray(parsed.drivers) ? parsed.drivers : [];
    const normalized = list
      .map((driver) => ({
        id: String(driver?.id ?? '').trim(),
        name: String(driver?.name ?? '').trim(),
        phone: normalizeDriverPhone(driver?.phone ?? ''),
      }))
      .filter((driver) => Boolean(driver.id));
    return normalized.length > 0 ? normalized : DEFAULT_DRIVER_ACCOUNTS;
  } catch {
    return DEFAULT_DRIVER_ACCOUNTS;
  }
};

const hashCustomerPassword = (password: string, saltHex?: string) => {
  const salt = saltHex ? Buffer.from(saltHex, 'hex') : randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
};

const verifyCustomerPassword = (password: string, encodedHash: string) => {
  const [saltHex, hashHex] = String(encodedHash ?? '').split(':');
  if (!saltHex || !hashHex) return false;
  const expectedHash = Buffer.from(hashHex, 'hex');
  const actualHash = scryptSync(password, Buffer.from(saltHex, 'hex'), 64);
  if (expectedHash.length !== actualHash.length) return false;
  return timingSafeEqual(expectedHash, actualHash);
};

const normalizeCustomerUser = (user: CustomerUserRecord) => ({
  id: user.id,
  name: user.name || '',
  phone: user.phone || '',
  email: user.email || '',
  type: user.customer_type || 'individual',
  area: user.area || '',
  prefService: Number(user.pref_service ?? 1) || 1,
  notifType: user.notif_type || 'whatsapp',
  created_at: user.created_at,
  last_login_at: user.last_login_at,
});

const findCustomerByPhoneNormalized = (phoneNormalized: string) => {
  const direct = db
    .prepare('SELECT * FROM customer_users WHERE phone_normalized = ?')
    .get(phoneNormalized) as CustomerUserRecord | undefined;
  if (direct) return direct;

  const e164NoPlus = phoneNormalized.startsWith('0') && phoneNormalized.length === 10
    ? `971${phoneNormalized.slice(1)}`
    : null;
  if (e164NoPlus) {
    return db
      .prepare('SELECT * FROM customer_users WHERE phone_normalized = ?')
      .get(e164NoPlus) as CustomerUserRecord | undefined;
  }

  return undefined;
};

const deleteCustomerSession = (token: string) => {
  customerSessionStore.delete(token);
  db.prepare('DELETE FROM customer_sessions WHERE token = ?').run(token);
};

const issueCustomerSession = (userId: string) => {
  const token = randomUUID();
  const session: CustomerSessionRecord = {
    token,
    user_id: userId,
    expires_at: Date.now() + CUSTOMER_SESSION_TTL_MS,
  };
  customerSessionStore.set(token, session);
  db.prepare(
    `INSERT INTO customer_sessions (token, user_id, expires_at, created_at)
     VALUES (?, ?, ?, ?)`
  ).run(token, userId, session.expires_at, new Date().toISOString());
  return session;
};

const getCustomerSessionFromRequest = (req: any): CustomerSessionRecord | null => {
  const token = extractBearerToken(req);
  if (!token) return null;

  const fromMemory = customerSessionStore.get(token);
  if (fromMemory) {
    if (fromMemory.expires_at <= Date.now()) {
      deleteCustomerSession(token);
      return null;
    }
    return fromMemory;
  }

  const row = db
    .prepare('SELECT token, user_id, expires_at FROM customer_sessions WHERE token = ?')
    .get(token) as CustomerSessionRecord | undefined;

  if (!row) return null;
  if (Number(row.expires_at) <= Date.now()) {
    deleteCustomerSession(token);
    return null;
  }

  const session: CustomerSessionRecord = {
    token: row.token,
    user_id: row.user_id,
    expires_at: Number(row.expires_at),
  };
  customerSessionStore.set(token, session);
  return session;
};

const requireCustomerAuth = (req: any, res: any, next: any) => {
  const session = getCustomerSessionFromRequest(req);
  if (!session) return res.status(401).json({ error: 'Authentication required.' });
  req.customerAuth = session;
  next();
};

const deleteDriverSession = (token: string) => {
  driverSessionStore.delete(token);
  db.prepare('DELETE FROM customer_driver_sessions WHERE token = ?').run(token);
};

const issueDriverSession = (driver: { id: string; name: string; phone: string }) => {
  const token = randomUUID();
  const session: DriverSessionRecord = {
    token,
    driver_id: driver.id,
    driver_name: driver.name,
    driver_phone: driver.phone,
    expires_at: Date.now() + DRIVER_SESSION_TTL_MS,
  };
  driverSessionStore.set(token, session);
  db.prepare(
    `INSERT INTO customer_driver_sessions (token, payload, expires_at, created_at)
     VALUES (?, ?, ?, ?)`
  ).run(token, JSON.stringify(session), session.expires_at, new Date().toISOString());
  return session;
};

const getDriverSessionFromRequest = (req: any): DriverSessionRecord | null => {
  const token = extractBearerToken(req);
  if (!token) return null;

  const fromMemory = driverSessionStore.get(token);
  if (fromMemory) {
    if (fromMemory.expires_at <= Date.now()) {
      deleteDriverSession(token);
      return null;
    }
    return fromMemory;
  }

  const row = db
    .prepare('SELECT payload, expires_at FROM customer_driver_sessions WHERE token = ?')
    .get(token) as { payload: string; expires_at: number } | undefined;

  if (!row) return null;
  if (Number(row.expires_at) <= Date.now()) {
    deleteDriverSession(token);
    return null;
  }

  try {
    const parsed = JSON.parse(row.payload) as DriverSessionRecord;
    if (!parsed?.driver_id) {
      deleteDriverSession(token);
      return null;
    }
    const session: DriverSessionRecord = {
      ...parsed,
      token,
      expires_at: Number(row.expires_at),
    };
    driverSessionStore.set(token, session);
    return session;
  } catch {
    deleteDriverSession(token);
    return null;
  }
};

const requireDriverAuth = (req: any, res: any, next: any) => {
  const session = getDriverSessionFromRequest(req);
  if (!session) return res.status(401).json({ error: 'Driver authentication required.' });
  req.driverAuth = session;
  next();
};

const requireCustomerOrAdminAuth = (req: any, res: any, next: any) => {
  const adminSession = getSessionFromRequest(req);
  if (adminSession) {
    req.auth = adminSession;
    return next();
  }

  const customerSession = getCustomerSessionFromRequest(req);
  if (customerSession) {
    req.customerAuth = customerSession;
    return next();
  }

  return res.status(401).json({ error: 'Authentication required.' });
};

const isAdminUsername = async (username: unknown) => {
  if (typeof username !== 'string' || username.trim().length === 0) return false;
  const row = db.prepare('SELECT role FROM users WHERE username = ?').get(username.trim()) as { role?: string } | undefined;
  const role = String(row?.role ?? '').toLowerCase();
  return role === 'admin' || role === 'super-admin' || role === 'manager';
};

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const sessionStore = new Map<string, SessionRecord>();

const SYSTEM_ADMIN_ROLES = new Set(['super-admin', 'admin', 'manager']);
const OPERATIONS_MANAGER_ROLES = new Set(['super-admin', 'admin', 'manager', 'branch-manager']);
const PICKER_ROLES = new Set(['super-admin', 'admin', 'manager', 'branch-manager', 'cashier']);
const SORTING_ROLES = new Set(['super-admin', 'admin', 'manager', 'branch-manager', 'sorter', 'packer']);

const hasRole = (role: unknown, allowedRoles: Set<string>) => {
  const normalized = String(role ?? '').toLowerCase().trim();
  return allowedRoles.has(normalized);
};

const isAdminRole = (role: unknown) => hasRole(role, SYSTEM_ADMIN_ROLES);
const isOperationsManagerRole = (role: unknown) => hasRole(role, OPERATIONS_MANAGER_ROLES);
const isPickerRole = (role: unknown) => hasRole(role, PICKER_ROLES);
const isSortingRole = (role: unknown) => hasRole(role, SORTING_ROLES);

const getSessionFromRequest = (req: any): SessionRecord | null => {
  const token = extractBearerToken(req);
  if (!token) return null;
  const fromMemory = sessionStore.get(token);
  if (fromMemory) {
    if (fromMemory.expires_at <= Date.now()) {
      sessionStore.delete(token);
      db.prepare('DELETE FROM app_sessions WHERE token = ?').run(token);
      return null;
    }
    return fromMemory;
  }

  const row = db
    .prepare('SELECT token, user_id, username, role, expires_at FROM app_sessions WHERE token = ?')
    .get(token) as SessionRecord | undefined;
  if (!row) return null;
  if (Number(row.expires_at) <= Date.now()) {
    db.prepare('DELETE FROM app_sessions WHERE token = ?').run(token);
    return null;
  }
  const session: SessionRecord = {
    token: row.token,
    user_id: Number(row.user_id),
    username: row.username,
    role: row.role,
    expires_at: Number(row.expires_at),
  };
  sessionStore.set(token, session);
  return session;
};

const issueSession = (user: Pick<SQLiteUserRecord, 'id' | 'username' | 'role'>) => {
  const token = randomUUID();
  const session: SessionRecord = {
    token,
    user_id: user.id,
    username: user.username,
    role: user.role,
    expires_at: Date.now() + SESSION_TTL_MS,
  };
  sessionStore.set(token, session);
  db.prepare('DELETE FROM app_sessions WHERE token = ?').run(token);
  db.prepare(
    `INSERT INTO app_sessions (token, user_id, username, role, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(token, session.user_id, session.username, session.role, session.expires_at, new Date().toISOString());
  return session;
};

const requireAuth = (req: any, res: any, next: any) => {
  const session = getSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  req.auth = session;
  next();
};

const requireAdmin = (req: any, res: any, next: any) => {
  const session = getSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if (!isAdminRole(session.role)) {
    return res.status(403).json({ error: 'Admin or manager only.' });
  }
  req.auth = session;
  next();
};

const requireOperationsManager = (req: any, res: any, next: any) => {
  const session = getSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if (!isOperationsManagerRole(session.role)) {
    return res.status(403).json({ error: 'Manager access required.' });
  }
  req.auth = session;
  next();
};

const requirePicker = (req: any, res: any, next: any) => {
  const session = getSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if (!isPickerRole(session.role)) {
    return res.status(403).json({ error: 'Picker access required.' });
  }
  req.auth = session;
  next();
};

const requireSorting = (req: any, res: any, next: any) => {
  const session = getSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if (!isSortingRole(session.role)) {
    return res.status(403).json({ error: 'Sorting access required.' });
  }
  req.auth = session;
  next();
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
        rows, columns, rotation_y, auto_settle, store_type, hanger_slots, slot_capacity, require_pick_scan, store_color, store_color_visible, store_opacity, cell_width, cell_depth, cell_height
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        normalizeStoreRequirePickScan((s as any).require_pick_scan, s.store_type ?? 'grid') ? 1 : 0,
        normalizeStoreColor(s.store_color),
        normalizeStoreColorVisible((s as any).store_color_visible) ? 1 : 0,
        normalizeStoreOpacity(s.store_opacity),
        normalizeStoreCellDimension(s.cell_width, deriveDefaultCellWidth(s.columns ?? 10)),
        normalizeStoreCellDimension(s.cell_depth, deriveDefaultCellDepth(s.rows ?? 10)),
        normalizeStoreCellDimension(s.cell_height, deriveDefaultCellHeight())
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

const coreRequiredUsers = [
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

const bulkStaffFullNames = [
  'MANAR HAKIM',
  'MOHAMED OSMAN SAEED AHMED',
  'SURENDERA BARSATI RAM',
  'AMBAREESH SATHEESAN AMBILI SATHEESAN GOPALAN',
  'RAJARAM VIKRAMA PAL',
  'SHYAM CHAND JAUTAM',
  'SAHARUL ISLAM BORLASKAR HARI MIA BORLASKAR',
  'VINOD KUMAR KANAUJIA BANKELAL KANAUJIA',
  'ANIL KUMAR LALLAN DHOBI',
  'MUHAMMAD RIAZ MUHAMMAD ISHAQ',
  'MUJAHID RAMAZAN RAMAZAN',
  'SAID AMIN MOEEN GUL',
  'NOOR UL ISLAM SHAMS UL ISLAM',
  'EMAAN FAYYAZ ABBASI',
  'ANGELICA GANNABAN CABRERA',
  'CHRIS MARIE RUFULE CALAMBA',
  'MAAZ ABDALLA HUSSIEN MOHAMED',
  'MOHANAD MOHAMMED ALI',
  'ANKIT RAKESH',
  'HARIOM CHAUDHARI MEWALAL',
  'PRADEEP KUMAR VIJAI KUMAR',
  'MUHAMMAD SOHAIL MUHAMMAD ISHAQ',
  'MUHAMMAD ADNAN KHAN MUHAMMAD UBAID ULLAH JAN',
  'ALI RAZA TARIQ MAHMOOD',
  'MUHAMMAD SOHAIL MUHAMMAD ASHFAQ',
  'FIDA HUSSAIN ABBASI FAYYAZ AHMED ABBASI',
  'GUL NAWAZ KHAN ABEED ULLAH KHAN',
  'MUHAMMAD MUHAMMAD AFZAL BUTT',
  'MUHAMMAD SULEMAN SANA ULLAH',
];

const normalizeUsernameToken = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '');

const buildUsernameFromFullName = (fullName: string) => {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .map(normalizeUsernameToken)
    .filter(Boolean);
  const base = parts.slice(0, 2).join('_');
  return base || 'user';
};

const usedUsernames = new Set(coreRequiredUsers.map((entry) => entry.username));
const buildUniqueUsername = (baseName: string) => {
  let candidate = baseName;
  let suffix = 2;
  while (usedUsernames.has(candidate)) {
    candidate = `${baseName}${suffix}`;
    suffix += 1;
  }
  usedUsernames.add(candidate);
  return candidate;
};

const bulkStaffUsers = bulkStaffFullNames.map((fullName) => {
  const normalizedFullName = fullName.replace(/\s+/g, ' ').trim();
  const baseUsername = buildUsernameFromFullName(normalizedFullName);
  return {
    username: buildUniqueUsername(baseUsername),
    full_name: normalizedFullName,
    role: 'cashier' as AppUserRole,
    password: '0123@1',
  };
});

const requiredUsers = [...coreRequiredUsers, ...bulkStaffUsers];

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
      rows, columns, rotation_y, auto_settle, store_type, hanger_slots, slot_capacity, require_pick_scan, store_color, store_color_visible, store_opacity, cell_width, cell_depth, cell_height
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      normalizeStoreRequirePickScan((store as any).require_pick_scan, store.store_type) ? 1 : 0,
      normalizeStoreColor((store as any).store_color),
      normalizeStoreColorVisible((store as any).store_color_visible) ? 1 : 0,
      normalizeStoreOpacity((store as any).store_opacity),
      normalizeStoreCellDimension((store as any).cell_width, deriveDefaultCellWidth(store.columns)),
      normalizeStoreCellDimension((store as any).cell_depth, deriveDefaultCellDepth(store.rows)),
      normalizeStoreCellDimension((store as any).cell_height, deriveDefaultCellHeight())
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

const normalizeStoreColorVisible = (value: unknown) => {
  if (value === false || value === 0 || value === '0') return false;
  return true;
};

const normalizeStoreRequirePickScan = (value: unknown, storeType: unknown) => {
  if (value === true || value === 1 || value === '1') return true;
  if (value === false || value === 0 || value === '0') return false;
  return String(storeType ?? '').toLowerCase() === 'hanger';
};

const deriveDefaultCellWidth = (columns: unknown) =>
  STORE_LOCAL_FOOTPRINT / Math.max(1, Number(columns ?? 1) || 1);

const deriveDefaultCellDepth = (rows: unknown) =>
  STORE_LOCAL_FOOTPRINT / Math.max(1, Number(rows ?? 1) || 1);

const deriveDefaultCellHeight = () => 0.11;

const normalizeStoreCellDimension = (value: unknown, fallback: number) => {
  const fallbackNumber = Number.isFinite(Number(fallback)) ? Number(fallback) : 0.5;
  const candidate = Number(value ?? fallbackNumber);
  const parsed = Number.isFinite(candidate) ? candidate : fallbackNumber;
  const clamped = Math.min(20, Math.max(-20, parsed));
  if (Math.abs(clamped) >= 0.001) return clamped;
  return clamped < 0 || Object.is(clamped, -0) ? -0.001 : 0.001;
};

const isMissingStoreColorVisibleColumnError = (error: any) => {
  const code = String(error?.code ?? '').trim();
  const message = String(error?.message ?? '').toLowerCase();
  return code === '42703' && message.includes('store_color_visible');
};

const ensurePostgresLocalStoreColumns = async () => {
  if (!USE_POSTGRES_LOCAL || !pgPool) return;
  await pgPool.query(
    "ALTER TABLE stores ADD COLUMN IF NOT EXISTS store_color_visible integer DEFAULT 1"
  );
  await pgPool.query(
    'UPDATE stores SET store_color_visible = 1 WHERE store_color_visible IS NULL'
  );
};

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

const insertSupabaseLogsBulk = async (entries: Record<string, unknown>[]) => {
  if (!supabaseAdmin) {
    return { error: { message: 'Supabase admin is not configured.' } as any };
  }
  if (!entries.length) return { error: null };

  const { error } = await supabaseAdmin.from('logs').insert(entries);
  if (!error) return { error: null };

  const code = (error as any).code;
  if (code === '42703' || code === 'PGRST204') {
    const fallbackEntries = entries.map((entry) => {
      const { request_id: _requestId, device: _device, ip: _ip, notes: _notes, ...fallback } = entry;
      return fallback;
    });
    const retry = await supabaseAdmin.from('logs').insert(fallbackEntries);
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

  if (status !== 'stored') return;

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

const assertPostgresBlanketSlot = async (
  storeName: string,
  row: number,
  column: number,
  status: string,
  excludeBlanketId?: number
) => {
  if (!pgPool) return;

  const storeRes = await pgPool.query(
    'SELECT store_name, rows, columns, store_type, slot_capacity FROM stores WHERE store_name = $1 LIMIT 1',
    [storeName]
  );
  const store = storeRes.rows[0] as
    | { store_name: string; rows: number; columns: number; store_type: string; slot_capacity: number }
    | undefined;

  if (!store) {
    const error = new Error(`Store not found: ${storeName}`);
    (error as any).status = 400;
    throw error;
  }

  const maxRows = Number(store.rows ?? 0);
  const maxCols = Number(store.columns ?? 0);

  if (status !== 'stored') return;

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

  const capacity = store.store_type === 'hanger' ? 1 : Math.max(1, Number(store.slot_capacity ?? 1));
  let countSql = 'SELECT COUNT(*)::int AS c FROM blankets WHERE store = $1 AND row = $2 AND "column" = $3 AND status = $4';
  const params: Array<string | number> = [storeName, row, column, 'stored'];
  if (typeof excludeBlanketId === 'number') {
    countSql += ' AND id <> $5';
    params.push(excludeBlanketId);
  }
  const countRes = await pgPool.query(countSql, params);
  const count = Number(countRes.rows?.[0]?.c ?? 0);
  if (count >= capacity) {
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

  if (status !== 'stored') return;

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
  try {
    await ensurePostgresLocalStoreColumns();
  } catch (error: any) {
    console.warn(
      'Postgres stores schema check failed:',
      error?.message || error
    );
  }

  const app = express();
  const envPort = Number(process.env.PORT);
  const PORT = Number.isFinite(envPort) && envPort > 0 ? envPort : 3001;

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
    const dbProvider = DB_PROVIDER || 'sqlite';
    const dbActive = USE_POSTGRES_LOCAL ? 'postgres' : 'sqlite';
    res.send(
      [
        'window.__RUNTIME_CONFIG__ = window.__RUNTIME_CONFIG__ || {};',
        `window.__RUNTIME_CONFIG__.VITE_SUPABASE_ENABLED = ${JSON.stringify(enabled)};`,
        `window.__RUNTIME_CONFIG__.VITE_SUPABASE_URL = ${JSON.stringify(url)};`,
        `window.__RUNTIME_CONFIG__.VITE_SUPABASE_ANON_KEY = ${JSON.stringify(anonKey)};`,
        `window.__RUNTIME_CONFIG__.VITE_DB_PROVIDER = ${JSON.stringify(dbProvider)};`,
        `window.__RUNTIME_CONFIG__.VITE_DB_ACTIVE = ${JSON.stringify(dbActive)};`,
      ].join('\n')
    );
  });

  app.get('/api/db/status', requireAdmin, async (req, res) => {
    try {
      const sqlitePath = path.resolve('blanket_storage.db');
      const sqliteFile = existsSync(sqlitePath) ? statSync(sqlitePath) : null;
      const sqliteCounts = {
        stores: Number((db.prepare('SELECT COUNT(*) AS c FROM stores').get() as any)?.c ?? 0) || 0,
        blankets: Number((db.prepare('SELECT COUNT(*) AS c FROM blankets').get() as any)?.c ?? 0) || 0,
        logs: Number((db.prepare('SELECT COUNT(*) AS c FROM logs').get() as any)?.c ?? 0) || 0,
      };

      let postgres: any = {
        configured: Boolean(USE_POSTGRES_LOCAL && pgPool),
        reachable: false,
        counts: null,
        error: null,
      };

      if (USE_POSTGRES_LOCAL && pgPool) {
        try {
          const [storesRes, blanketsRes, logsRes] = await Promise.all([
            pgPool.query('SELECT COUNT(*)::int AS c FROM stores'),
            pgPool.query('SELECT COUNT(*)::int AS c FROM blankets'),
            pgPool.query('SELECT COUNT(*)::int AS c FROM logs'),
          ]);
          postgres = {
            configured: true,
            reachable: true,
            counts: {
              stores: Number(storesRes.rows?.[0]?.c ?? 0) || 0,
              blankets: Number(blanketsRes.rows?.[0]?.c ?? 0) || 0,
              logs: Number(logsRes.rows?.[0]?.c ?? 0) || 0,
            },
            error: null,
          };
        } catch (error: any) {
          postgres = {
            configured: true,
            reachable: false,
            counts: null,
            error: String(error?.message || 'Postgres unreachable'),
          };
        }
      }

      const activeProvider = USE_POSTGRES_LOCAL ? 'postgres' : 'sqlite';
      const activeCounts = activeProvider === 'postgres' && postgres.reachable ? postgres.counts : sqliteCounts;

      return res.json({
        active_provider: activeProvider,
        counts: activeCounts,
        sqlite: {
          path: sqlitePath,
          file_exists: Boolean(sqliteFile),
          file_size_bytes: sqliteFile?.size ?? 0,
          last_modified: sqliteFile?.mtime?.toISOString?.() ?? null,
          counts: sqliteCounts,
        },
        postgres,
        now: new Date().toISOString(),
      });
    } catch (error: any) {
      return res.status(500).json({ error: error?.message || 'Failed to load database status.' });
    }
  });

  app.get('/api/db/table-preview', requireAdmin, async (req, res) => {
    try {
      const table = String(req.query.table ?? 'stores').trim().toLowerCase();
      if (!['stores', 'blankets', 'logs'].includes(table)) {
        return res.status(400).json({ error: 'Unsupported table. Use stores, blankets, or logs.' });
      }
      const q = String(req.query.q ?? '').trim();
      const limit = Math.max(1, Math.min(200, Number(req.query.limit ?? 50) || 50));
      const offset = Math.max(0, Number(req.query.offset ?? 0) || 0);

      if (USE_POSTGRES_LOCAL && pgPool) {
        let whereSql = '';
        let params: any[] = [];
        if (q) {
          if (table === 'stores') {
            whereSql = 'WHERE store_name ILIKE $1';
            params = [`%${q}%`];
          } else if (table === 'blankets') {
            whereSql = 'WHERE blanket_number ILIKE $1 OR store ILIKE $1 OR status ILIKE $1';
            params = [`%${q}%`];
          } else {
            whereSql = 'WHERE blanket_number ILIKE $1 OR action ILIKE $1 OR "user" ILIKE $1 OR store ILIKE $1 OR COALESCE(notes, \'\') ILIKE $1';
            params = [`%${q}%`];
          }
        }
        const orderSql =
          table === 'stores'
            ? 'ORDER BY store_name ASC'
            : table === 'blankets'
              ? 'ORDER BY created_at DESC, id DESC'
              : 'ORDER BY "timestamp" DESC, id DESC';

        const countSql = `SELECT COUNT(*)::int AS c FROM ${table} ${whereSql}`;
        const dataSql = `SELECT * FROM ${table} ${whereSql} ${orderSql} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        const [countRes, dataRes] = await Promise.all([
          pgPool.query(countSql, params),
          pgPool.query(dataSql, [...params, limit, offset]),
        ]);
        return res.json({
          provider: 'postgres',
          table,
          total: Number(countRes.rows?.[0]?.c ?? 0) || 0,
          offset,
          limit,
          rows: Array.isArray(dataRes.rows) ? dataRes.rows : [],
        });
      }

      let whereSql = '';
      const sqliteParams: any[] = [];
      if (q) {
        if (table === 'stores') {
          whereSql = 'WHERE store_name LIKE ?';
          sqliteParams.push(`%${q}%`);
        } else if (table === 'blankets') {
          whereSql = 'WHERE blanket_number LIKE ? OR store LIKE ? OR status LIKE ?';
          sqliteParams.push(`%${q}%`, `%${q}%`, `%${q}%`);
        } else {
          whereSql = 'WHERE blanket_number LIKE ? OR action LIKE ? OR user LIKE ? OR store LIKE ? OR COALESCE(notes, \'\') LIKE ?';
          sqliteParams.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
        }
      }

      const orderSql =
        table === 'stores'
          ? 'ORDER BY store_name ASC'
          : table === 'blankets'
            ? 'ORDER BY datetime(created_at) DESC, id DESC'
            : 'ORDER BY datetime(timestamp) DESC, id DESC';

      const total = Number(
        (db.prepare(`SELECT COUNT(*) AS c FROM ${table} ${whereSql}`).get(...sqliteParams) as any)?.c ?? 0
      ) || 0;
      const rows = db
        .prepare(`SELECT * FROM ${table} ${whereSql} ${orderSql} LIMIT ? OFFSET ?`)
        .all(...sqliteParams, limit, offset);

      return res.json({
        provider: 'sqlite',
        table,
        total,
        offset,
        limit,
        rows: Array.isArray(rows) ? rows : [],
      });
    } catch (error: any) {
      return res.status(500).json({ error: error?.message || 'Failed to load table preview.' });
    }
  });

  app.get(
    '/api/backup/snapshot',
    requireAdmin,
    asyncHandler(async (req, res) => {

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
  app.get('/api/supabase/stores', requireAuth, async (_req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase admin is not configured.' });
    try {
      const { data, error } = await supabaseAdmin.from('stores').select('*').order('store_name', { ascending: true });
      if (error) return res.status(500).json({ error: error.message, code: (error as any).code });
      const stores = Array.isArray(data) ? data : [];
      return res.json(stores);
    } catch (error: any) {
      console.error('Error fetching stores from Supabase:', error);
      return res.status(500).json({ error: error.message || 'Failed to fetch stores' });
    }
  });

  app.post('/api/supabase/stores', requireOperationsManager, async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase admin is not configured.' });
    const payload = req.body ?? {};
    const visualPayload = {
      ...payload,
      require_pick_scan: normalizeStoreRequirePickScan((payload as any).require_pick_scan, (payload as any).store_type),
      store_color: normalizeStoreColor((payload as any).store_color),
      store_color_visible: normalizeStoreColorVisible((payload as any).store_color_visible),
      store_opacity: normalizeStoreOpacity((payload as any).store_opacity),
      cell_width: normalizeStoreCellDimension((payload as any).cell_width, deriveDefaultCellWidth((payload as any).columns ?? 10)),
      cell_depth: normalizeStoreCellDimension((payload as any).cell_depth, deriveDefaultCellDepth((payload as any).rows ?? 10)),
      cell_height: normalizeStoreCellDimension((payload as any).cell_height, deriveDefaultCellHeight()),
    };
    let { error } = await supabaseAdmin.from('stores').insert(visualPayload);
    // Backwards compatibility with older Supabase schema (without visual columns).
    if (error && ((error as any).code === '42703' || (error as any).code === 'PGRST204')) {
      const {
        require_pick_scan: _requirePickScan,
        store_color: _storeColor,
        store_color_visible: _storeColorVisible,
        store_opacity: _storeOpacity,
        cell_width: _cellWidth,
        cell_depth: _cellDepth,
        cell_height: _cellHeight,
        ...legacyPayload
      } = visualPayload as any;
      const retry = await supabaseAdmin.from('stores').insert(legacyPayload);
      error = retry.error ?? null;
    }
    if (error) return res.status(500).json({ error: error.message, code: (error as any).code });
    return res.json({ success: true });
  });

  app.put('/api/supabase/stores/:name', requireOperationsManager, async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase admin is not configured.' });
    const name = req.params.name;
    const payload = req.body ?? {};
    const visualPayload = {
      ...payload,
      require_pick_scan: normalizeStoreRequirePickScan((payload as any).require_pick_scan, (payload as any).store_type),
      store_color: normalizeStoreColor((payload as any).store_color),
      store_color_visible: normalizeStoreColorVisible((payload as any).store_color_visible),
      store_opacity: normalizeStoreOpacity((payload as any).store_opacity),
      cell_width: normalizeStoreCellDimension((payload as any).cell_width, deriveDefaultCellWidth((payload as any).columns ?? 10)),
      cell_depth: normalizeStoreCellDimension((payload as any).cell_depth, deriveDefaultCellDepth((payload as any).rows ?? 10)),
      cell_height: normalizeStoreCellDimension((payload as any).cell_height, deriveDefaultCellHeight()),
    };
    let { error } = await supabaseAdmin.from('stores').update(visualPayload).eq('store_name', name);
    // Backwards compatibility with older Supabase schema (without visual columns).
    if (error && ((error as any).code === '42703' || (error as any).code === 'PGRST204')) {
      const {
        require_pick_scan: _requirePickScan,
        store_color: _storeColor,
        store_color_visible: _storeColorVisible,
        store_opacity: _storeOpacity,
        cell_width: _cellWidth,
        cell_depth: _cellDepth,
        cell_height: _cellHeight,
        ...legacyPayload
      } = visualPayload as any;
      const retry = await supabaseAdmin.from('stores').update(legacyPayload).eq('store_name', name);
      error = retry.error ?? null;
    }
    if (error) return res.status(500).json({ error: error.message, code: (error as any).code });
    return res.json({ success: true });
  });

  app.delete('/api/supabase/stores/:name', requireOperationsManager, async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase admin is not configured.' });
    const name = req.params.name;
    const force = String(req.query.force ?? '').trim() === '1';
    const { count, error: countError } = await supabaseAdmin
      .from('blankets')
      .select('id', { count: 'exact', head: true })
      .eq('store', name);
    if (countError) return res.status(500).json({ error: countError.message, code: (countError as any).code });
    if ((count ?? 0) > 0 && !force) return res.status(400).json({ error: 'Cannot delete store with blankets in it.' });
    if ((count ?? 0) > 0 && force) {
      const { error: deleteBlanketsError } = await supabaseAdmin.from('blankets').delete().eq('store', name);
      if (deleteBlanketsError) {
        return res.status(500).json({ error: deleteBlanketsError.message, code: (deleteBlanketsError as any).code });
      }
    }

    const { error } = await supabaseAdmin.from('stores').delete().eq('store_name', name);
    if (error) return res.status(500).json({ error: error.message, code: (error as any).code });
    return res.json({ success: true });
  });

  app.get('/api/supabase/blankets', requireAuth, async (_req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase admin is not configured.' });
    try {
      const { data, error } = await supabaseAdmin.from('blankets').select('*').order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message, code: (error as any).code });
      const blankets = Array.isArray(data) ? data : [];
      return res.json(blankets);
    } catch (error: any) {
      console.error('Error fetching blankets from Supabase:', error);
      return res.status(500).json({ error: error.message || 'Failed to fetch blankets' });
    }
  });

  app.post('/api/supabase/blankets', requireOperationsManager, async (req, res) => {
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

  app.post('/api/supabase/blankets/bulk-apply', requireOperationsManager, async (req: any, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase admin is not configured.' });
    const payload = req.body ?? {};
    const user = String(payload.user || req.auth?.username || 'system');
    const fileName = String(payload.fileName || '').trim();
    const storeChanges = Array.isArray(payload.storeChanges) ? payload.storeChanges : [];
    const operations = Array.isArray(payload.operations) ? payload.operations : [];
    const baseMeta = getLogMeta(req);
    const touchedStores = new Set<string>();

    try {
      if (storeChanges.length > 0) {
        const targetNames = Array.from(
          new Set(
            storeChanges
              .map((item: any) => String(item?.store_name || '').trim())
              .filter((name: string) => name.length > 0)
          )
        );

        if (targetNames.length > 0) {
          const { data: existingStores, error: storesError } = await supabaseAdmin
            .from('stores')
            .select('*')
            .in('store_name', targetNames);
          if (storesError) return res.status(500).json({ error: storesError.message, code: (storesError as any).code });

          const existingMap = new Map<string, any>((Array.isArray(existingStores) ? existingStores : []).map((s: any) => [s.store_name, s]));

          const createPayload: any[] = [];
          const updatePayload: any[] = [];

          for (const rawChange of storeChanges) {
            const name = String(rawChange?.store_name || '').trim();
            if (!name) continue;
            const nextRows = Math.max(1, Number(rawChange?.rows ?? 1) || 1);
            const nextCols = Math.max(1, Number(rawChange?.columns ?? 1) || 1);
            const existing = existingMap.get(name);

            if (!existing) {
              createPayload.push({
                store_name: name,
                rows: nextRows,
                columns: nextCols,
                auto_settle: true,
                store_type: 'grid',
                hanger_slots: 0,
                slot_capacity: 1,
                require_pick_scan: false,
                store_color: '#3b82f6',
                store_opacity: 1,
                cell_width: normalizeStoreCellDimension(0.5, deriveDefaultCellWidth(nextCols)),
                cell_depth: normalizeStoreCellDimension(0.5, deriveDefaultCellDepth(nextRows)),
                cell_height: normalizeStoreCellDimension(0.11, deriveDefaultCellHeight()),
              });
              touchedStores.add(name);
              continue;
            }

            const oldRows = Math.max(1, Number(existing.rows ?? 1) || 1);
            const oldCols = Math.max(1, Number(existing.columns ?? 1) || 1);
            const mergedRows = Math.max(oldRows, nextRows);
            const mergedCols = Math.max(oldCols, nextCols);
            if (mergedRows !== oldRows || mergedCols !== oldCols) {
              updatePayload.push({
                store_name: name,
                rows: mergedRows,
                columns: mergedCols,
              });
              touchedStores.add(name);
            }
          }

          if (createPayload.length) {
            const { error } = await supabaseAdmin.from('stores').insert(createPayload);
            if (error) {
              for (const entry of createPayload) {
                const single = await supabaseAdmin.from('stores').insert([entry]);
                if (!single.error) continue;
                const upsertFallback = await supabaseAdmin.from('stores').upsert([entry], { onConflict: 'store_name' });
                if (upsertFallback.error) {
                  return res.status(500).json({ error: upsertFallback.error.message, code: (upsertFallback.error as any).code });
                }
              }
            }
          }

          for (const updateItem of updatePayload) {
            const { error } = await supabaseAdmin
              .from('stores')
              .update({ rows: updateItem.rows, columns: updateItem.columns })
              .eq('store_name', updateItem.store_name);
            if (error) {
              return res.status(500).json({ error: error.message, code: (error as any).code });
            }
          }
        }
      }

      const updateOps = operations.filter((op: any) => String(op?.op) === 'update');
      const insertOps = operations.filter((op: any) => String(op?.op) === 'insert');

      const updateIds = Array.from(
        new Set(
          updateOps
            .map((op: any) => Number(op?.id))
            .filter((id: number) => Number.isFinite(id) && id > 0)
        )
      );

      const previousMap = new Map<number, any>();
      if (updateIds.length > 0) {
        const { data: previousRows, error: previousError } = await supabaseAdmin
          .from('blankets')
          .select('id, blanket_number, store, row, column, status')
          .in('id', updateIds);
        if (previousError) return res.status(500).json({ error: previousError.message, code: (previousError as any).code });
        for (const row of Array.isArray(previousRows) ? previousRows : []) {
          previousMap.set(Number((row as any).id), row);
        }
      }

      const updatePayload: any[] = [];
      const logEntries: Record<string, unknown>[] = [];
      const skipped: Array<{ op: 'update' | 'insert'; reason: string; id?: number; store?: string; row?: number; column?: number; number?: string }> = [];

      for (const op of updateOps) {
        const id = Number(op?.id);
        if (!Number.isFinite(id) || id <= 0) continue;
        const previous = previousMap.get(id);
        if (!previous) continue;

        const data = (op?.data ?? {}) as Record<string, unknown>;
        const nextStore = String(data.store ?? previous.store);
        const nextRow = Number(data.row ?? previous.row);
        const nextColumn = Number(data.column ?? previous.column);
        const nextStatus = String(data.status ?? previous.status ?? 'stored');
        const nextBlanketNumber = String(data.blanket_number ?? previous.blanket_number);
        const action = String(op?.forceAction || deriveBlanketAction(previous, {
          store: nextStore,
          row: nextRow,
          column: nextColumn,
          status: nextStatus,
        }));

        updatePayload.push({
          id,
          blanket_number: nextBlanketNumber,
          store: nextStore,
          row: nextRow,
          column: nextColumn,
          status: nextStatus,
        });
        touchedStores.add(String(previous.store));
        touchedStores.add(nextStore);

        logEntries.push({
          blanket_number: nextBlanketNumber,
          action,
          user,
          store: nextStore,
          row: nextRow,
          column: nextColumn,
          status: nextStatus,
          request_id: baseMeta.request_id,
          device: baseMeta.device,
          ip: baseMeta.ip,
          notes: typeof op?.notes === 'string' && op.notes.trim() ? op.notes.trim() : baseMeta.notes,
        });
      }

      if (updatePayload.length > 0) {
        for (const batch of chunk(updatePayload, 500)) {
          const { error } = await supabaseAdmin.from('blankets').upsert(batch, { onConflict: 'id' });
          if (!error) continue;
          for (const row of batch) {
            const single = await supabaseAdmin.from('blankets').upsert([row], { onConflict: 'id' });
            if (!single.error) continue;
            skipped.push({
              op: 'update',
              id: Number(row.id),
              store: String(row.store || ''),
              row: Number(row.row),
              column: Number(row.column),
              number: String(row.blanket_number || ''),
              reason: single.error.message,
            });
          }
        }
      }

      const insertPayload: any[] = [];
      for (const op of insertOps) {
        const data = (op?.data ?? {}) as Record<string, unknown>;
        const blanketNumber = String(data.blanket_number ?? '').trim();
        const store = String(data.store ?? '').trim();
        const row = Number(data.row);
        const column = Number(data.column);
        const status = String(data.status ?? 'stored');
        if (!blanketNumber || !store || !Number.isFinite(row) || !Number.isFinite(column)) continue;
        insertPayload.push({
          blanket_number: blanketNumber,
          store,
          row,
          column,
          status,
        });
        touchedStores.add(store);

        logEntries.push({
          blanket_number: blanketNumber,
          action: status || 'stored',
          user,
          store,
          row,
          column,
          status,
          request_id: baseMeta.request_id,
          device: baseMeta.device,
          ip: baseMeta.ip,
          notes: typeof op?.notes === 'string' && op.notes.trim() ? op.notes.trim() : baseMeta.notes,
        });
      }

      if (insertPayload.length > 0) {
        for (const batch of chunk(insertPayload, 500)) {
          const { error } = await supabaseAdmin.from('blankets').insert(batch);
          if (!error) continue;
          for (const row of batch) {
            const single = await supabaseAdmin.from('blankets').insert([row]);
            if (!single.error) continue;
            skipped.push({
              op: 'insert',
              store: String(row.store || ''),
              row: Number(row.row),
              column: Number(row.column),
              number: String(row.blanket_number || ''),
              reason: single.error.message,
            });
          }
        }
      }

      if (storeChanges.length > 0) {
        for (const change of storeChanges) {
          const name = String(change?.store_name || '').trim();
          if (!name) continue;
          logEntries.push({
            blanket_number: '[STORE]',
            action: 'store_update',
            user,
            store: name,
            row: 0,
            column: 0,
            status: 'active',
            request_id: baseMeta.request_id,
            device: baseMeta.device,
            ip: baseMeta.ip,
            notes: `${String(change?.note || '').trim() || 'Bulk import store update'}${fileName ? ` | file=${fileName}` : ''}`,
          });
        }
      }

      if (logEntries.length > 0) {
        for (const batch of chunk(logEntries, 400)) {
          const { error } = await insertSupabaseLogsBulk(batch);
          if (error) return res.status(500).json({ error: error.message, code: (error as any).code });
        }
      }

      const touchedStoreList = Array.from(touchedStores);
      const [storesRows, blanketsRows] = await Promise.all([
        touchedStoreList.length
          ? supabaseAdmin.from('stores').select('*').in('store_name', touchedStoreList)
          : Promise.resolve({ data: [], error: null } as any),
        touchedStoreList.length
          ? supabaseAdmin.from('blankets').select('*').in('store', touchedStoreList)
          : Promise.resolve({ data: [], error: null } as any),
      ]);

      if (storesRows.error) return res.status(500).json({ error: storesRows.error.message, code: (storesRows.error as any).code });
      if (blanketsRows.error) return res.status(500).json({ error: blanketsRows.error.message, code: (blanketsRows.error as any).code });

      return res.json({
        success: true,
        touchedStores: touchedStoreList,
        stores: Array.isArray(storesRows.data) ? storesRows.data : [],
        blankets: Array.isArray(blanketsRows.data) ? blanketsRows.data : [],
        skipped,
      });
    } catch (error: any) {
      console.error('supabase bulk apply failed', error);
      return res.status(500).json({ error: error?.message || 'Bulk import apply failed.' });
    }
  });

  app.post('/api/supabase/blankets/empty-store', requireOperationsManager, async (req: any, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase admin is not configured.' });
    const storeName = String(req.body?.storeName || '').trim();
    if (!storeName) return res.status(400).json({ error: 'storeName is required.' });
    const reason = String(req.body?.reason || '').trim();
    const user = String(req.body?.user || req.auth?.username || 'system');
    const meta = getLogMeta(req);

    const { data: affectedRows, error: fetchError } = await supabaseAdmin
      .from('blankets')
      .select('id, blanket_number, store, row, column, status')
      .eq('store', storeName)
      .eq('status', 'stored');
    if (fetchError) return res.status(500).json({ error: fetchError.message, code: (fetchError as any).code });

    const affected = Array.isArray(affectedRows) ? affectedRows : [];
    const count = affected.length;
    const archiveId = `store-archive-${storeName}-${Date.now()}`;
    const archiveNote = `ARCHIVE ${archiveId} | reason=${reason || '-'} | count=${count}`;

    const logEntries: Record<string, unknown>[] = [
      {
        blanket_number: '[STORE]',
        action: 'store_archive',
        user,
        store: storeName,
        row: 0,
        column: 0,
        status: 'active',
        request_id: meta.request_id,
        device: meta.device,
        ip: meta.ip,
        notes: archiveNote,
      },
      {
        blanket_number: '[STORE]',
        action: 'store_emptied',
        user,
        store: storeName,
        row: 0,
        column: 0,
        status: 'active',
        request_id: meta.request_id,
        device: meta.device,
        ip: meta.ip,
        notes: `Cleared ${count} stored items`,
      },
    ];

    if (count > 0) {
      const ids = affected.map((item: any) => Number(item.id)).filter((id: number) => Number.isFinite(id) && id > 0);
      for (const batchIds of chunk(ids, 500)) {
        const { error } = await supabaseAdmin.from('blankets').update({ status: 'retrieved' }).in('id', batchIds);
        if (error) return res.status(500).json({ error: error.message, code: (error as any).code });
      }
    }

    const logResult = await insertSupabaseLogsBulk(logEntries);
    if (logResult.error) return res.status(500).json({ error: logResult.error.message, code: (logResult.error as any).code });

    const { data: storeBlankets, error: blanketsError } = await supabaseAdmin.from('blankets').select('*').eq('store', storeName);
    if (blanketsError) return res.status(500).json({ error: blanketsError.message, code: (blanketsError as any).code });

    return res.json({
      success: true,
      touchedStores: [storeName],
      affectedCount: count,
      blankets: Array.isArray(storeBlankets) ? storeBlankets : [],
      archiveId,
    });
  });

  app.put('/api/supabase/blankets/:id', requireOperationsManager, async (req, res) => {
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

  app.post('/api/supabase/blankets/:id/pick', requirePicker, async (req: any, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase admin is not configured.' });
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ error: 'Invalid blanket id.' });
    const user = req.body?.user || req.auth?.username || 'system';
    const meta = getLogMeta(req);

    const { data: blanket, error: fetchBlanketError } = await supabaseAdmin
      .from('blankets')
      .select('id, blanket_number, store, row, column, status')
      .eq('id', id)
      .single();
    if (fetchBlanketError) return res.status(500).json({ error: fetchBlanketError.message, code: (fetchBlanketError as any).code });
    if (!blanket) return res.status(404).json({ error: 'Blanket not found' });

    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('store_name, rows, columns, auto_settle, store_type, slot_capacity')
      .eq('store_name', blanket.store)
      .single();
    if (storeError) return res.status(500).json({ error: storeError.message, code: (storeError as any).code });
    if (!store) return res.status(400).json({ error: `Store not found: ${blanket.store}` });

    const maxRows = Math.max(1, Number((store as any).rows ?? 1));
    const maxCols = Math.max(1, Number((store as any).columns ?? 1));
    const rowOutOfBounds = Number(blanket.row) < 1 || Number(blanket.row) > maxRows;
    const columnOutOfBounds = Number(blanket.column) < 1 || Number(blanket.column) > maxCols;
    const hasLegacyOutOfBoundsSlot = rowOutOfBounds || columnOutOfBounds;
    const normalizedRow = Math.min(maxRows, Math.max(1, Number(blanket.row) || 1));
    const normalizedColumn = Math.min(maxCols, Math.max(1, Number(blanket.column) || 1));
    const wasStored = String(blanket.status) === 'stored';
    const canAutoSettle =
      Boolean((store as any).auto_settle) &&
      String((store as any).store_type ?? 'grid') !== 'hanger' &&
      Math.max(1, Number((store as any).slot_capacity ?? 1)) <= 1 &&
      !hasLegacyOutOfBoundsSlot;

    // IMPORTANT:
    // Pick first, then settle. If we move first while this blanket is still "stored",
    // slot-capacity triggers may reject moves into this row/column as "slot is full".
    const pickUpdate: Record<string, unknown> = { status: 'picked' };
    if (hasLegacyOutOfBoundsSlot) {
      // Keep "pick" working even if store dimensions were shrunk after this item was stored.
      // We normalize row/column only for this state transition.
      pickUpdate.row = normalizedRow;
      pickUpdate.column = normalizedColumn;
    }
    const { error: pickError } = await supabaseAdmin.from('blankets').update(pickUpdate).eq('id', id);
    if (pickError) return res.status(500).json({ error: pickError.message, code: (pickError as any).code });

    if (wasStored && canAutoSettle) {
      const { data: columnItems, error: columnItemsError } = await supabaseAdmin
        .from('blankets')
        .select('id, row')
        .eq('store', blanket.store)
        .eq('column', blanket.column)
        .eq('status', 'stored')
        .order('row', { ascending: true });
      if (columnItemsError) return res.status(500).json({ error: columnItemsError.message, code: (columnItemsError as any).code });

      const items = Array.isArray(columnItems) ? columnItems : [];
      const maxRows = Math.max(1, Number((store as any).rows ?? 1));
      const startRow = maxRows - items.length + 1;
      for (let index = 0; index < items.length; index += 1) {
        const entry = items[index] as { id: number; row: number };
        const targetRow = startRow + index;
        if (Number(entry.row) === targetRow) continue;
        const { error: moveError } = await supabaseAdmin.from('blankets').update({ row: targetRow }).eq('id', entry.id);
        if (moveError) return res.status(500).json({ error: moveError.message, code: (moveError as any).code });
      }
    }

    const { error: logError } = await insertSupabaseLog({
      blanket_number: blanket.blanket_number,
      action: 'picked',
      user,
      store: blanket.store,
      row: blanket.row,
      column: blanket.column,
      status: 'picked',
      request_id: meta.request_id,
      device: meta.device,
      ip: meta.ip,
      notes: meta.notes,
    });
    if (logError) return res.status(500).json({ error: logError.message, code: (logError as any).code });

    return res.json({ success: true });
  });

  app.delete('/api/supabase/blankets/:id', requireOperationsManager, async (req, res) => {
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

  app.get('/api/supabase/logs', requireAuth, async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase admin is not configured.' });
    try {
      const limit = Math.min(1000, Math.max(1, Number(req.query.limit ?? 500)));
      const { data, error } = await supabaseAdmin
        .from('logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .order('id', { ascending: false })
        .limit(limit);
      if (error) return res.status(500).json({ error: error.message, code: (error as any).code });
      const logs = Array.isArray(data) ? data : [];
      return res.json(logs);
    } catch (error: any) {
      console.error('Error fetching logs from Supabase:', error);
      return res.status(500).json({ error: error.message || 'Failed to fetch logs' });
    }
  });

  app.post('/api/supabase/logs', requireOperationsManager, async (req, res) => {
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
    requireAdmin,
    asyncHandler(async (req, res) => {
      const { snapshot, source, confirm } = req.body ?? {};
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
    requireAdmin,
    asyncHandler(async (req, res) => {
      if (!supabaseAdmin) return res.status(503).json({ error: 'Supabase admin is not configured.' });
      const { snapshot, source, confirm } = req.body ?? {};
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
        require_pick_scan: normalizeStoreRequirePickScan((s as any).require_pick_scan, s.store_type ?? 'grid'),
        store_color: normalizeStoreColor(s.store_color),
        store_color_visible: normalizeStoreColorVisible((s as any).store_color_visible),
        store_opacity: normalizeStoreOpacity(s.store_opacity),
        cell_width: normalizeStoreCellDimension(s.cell_width, deriveDefaultCellWidth(s.columns ?? 10)),
        cell_depth: normalizeStoreCellDimension(s.cell_depth, deriveDefaultCellDepth(s.rows ?? 10)),
        cell_height: normalizeStoreCellDimension(s.cell_height, deriveDefaultCellHeight()),
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

  app.get('/api/users', requireAdmin, async (req, res) => {
    try {
      const username = typeof req.query.username === 'string' ? req.query.username : undefined;
      // Use SQLite as the source of truth for app users so seeded/local users
      // are always visible in User Management, even when Supabase is enabled.
      const users = getSQLiteUsers(username);

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

  app.post('/api/users', requireAdmin, async (req, res) => {
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
        try {
          const authUserId = await ensureAuthUser(payload);
          await upsertPublicUser(payload, authUserId);
        } catch (syncError) {
          console.warn('Supabase user sync skipped during create:', syncError);
        }
      }

      res.status(201).json(normalizeSQLiteUser(sqliteUser));
    } catch (error: any) {
      console.error('Failed to create user:', error);
      res.status(500).json({ error: error.message || 'Failed to create user' });
    }
  });

  app.put('/api/users/:id', requireAdmin, async (req, res) => {
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
        try {
          const { data: publicUser, error } = await supabaseAdmin
            .from('users')
            .select('auth_user_id')
            .eq('username', sqliteExisting.username)
            .maybeSingle();

          if (error) throw error;

          const authUserId = await ensureAuthUser(payload, publicUser?.auth_user_id ?? undefined);
          await upsertPublicUser(payload, authUserId);
        } catch (syncError) {
          console.warn('Supabase user sync skipped during update:', syncError);
        }
      }

      const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as SQLiteUserRecord;
      res.json(normalizeSQLiteUser(updatedUser));
    } catch (error: any) {
      console.error('Failed to update user:', error);
      res.status(500).json({ error: error.message || 'Failed to update user' });
    }
  });

  app.delete('/api/users/:id', requireAdmin, async (req, res) => {
    try {
      const userId = Number(req.params.id);
      const sqliteExisting = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as SQLiteUserRecord | undefined;
      if (!sqliteExisting) {
        return res.status(404).json({ error: 'User not found' });
      }

      db.prepare('DELETE FROM users WHERE id = ?').run(userId);

      if (isSupabaseAdminEnabled && supabaseAdmin) {
        try {
          const { data: publicUser, error } = await supabaseAdmin
            .from('users')
            .select('auth_user_id')
            .eq('username', sqliteExisting.username)
            .maybeSingle();

          if (error) throw error;

          const { error: deletePublicError } = await supabaseAdmin.from('users').delete().eq('username', sqliteExisting.username);
          if (deletePublicError) throw deletePublicError;

          if (publicUser?.auth_user_id) {
            const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(publicUser.auth_user_id);
            if (deleteAuthError) throw deleteAuthError;
          }
        } catch (syncError) {
          console.warn('Supabase user sync skipped during delete:', syncError);
        }
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      res.status(500).json({ error: error.message || 'Failed to delete user' });
    }
  });

  app.post('/api/users/:id/touch-login', requireAuth, async (req: any, res) => {
    try {
      const userId = Number(req.params.id);
      const auth = req.auth as SessionRecord | undefined;
      if (!auth) return res.status(401).json({ error: 'Authentication required.' });
      if (auth.user_id !== userId && !isAdminRole(auth.role)) {
        return res.status(403).json({ error: 'Forbidden.' });
      }
      const timestamp = new Date().toISOString();
      touchSQLiteLastLogin(userId, timestamp);

      if (isSupabaseAdminEnabled && supabaseAdmin) {
        try {
          const sqliteUser = db.prepare('SELECT username FROM users WHERE id = ?').get(userId) as { username?: string } | undefined;
          if (sqliteUser?.username) {
            const { data: publicUser, error } = await supabaseAdmin
              .from('users')
              .select('auth_user_id')
              .eq('username', sqliteUser.username)
              .maybeSingle();

            if (error) throw error;
            if (publicUser?.auth_user_id) {
              await updateAuthLoginStamp(publicUser.auth_user_id, timestamp);
            }
          }
        } catch (syncError) {
          console.warn('Supabase user sync skipped during touch-login:', syncError);
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

    const normalizedUser = normalizeSQLiteUser({ ...user, last_login_at: timestamp });
    const session = issueSession({ id: user.id, username: user.username, role: user.role });
    res.json({ user: normalizedUser, token: session.token, expires_at: session.expires_at });
  });

  app.get('/api/session', requireAuth, (req: any, res) => {
    const auth = req.auth as SessionRecord | undefined;
    if (!auth) return res.status(401).json({ error: 'Authentication required.' });
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(auth.user_id) as SQLiteUserRecord | undefined;
    if (!user || user.is_active === 0) {
      sessionStore.delete(auth.token);
      db.prepare('DELETE FROM app_sessions WHERE token = ?').run(auth.token);
      return res.status(401).json({ error: 'Session expired.' });
    }
    res.json(normalizeSQLiteUser(user));
  });

  app.post('/api/logout', requireAuth, (req: any, res) => {
    const auth = req.auth as SessionRecord | undefined;
    if (auth) {
      sessionStore.delete(auth.token);
      db.prepare('DELETE FROM app_sessions WHERE token = ?').run(auth.token);
    }
    res.json({ success: true });
  });

  app.get('/api/stores', requireAuth, async (_req, res) => {
    try {
      if (USE_POSTGRES_LOCAL && pgPool) {
        const result = await pgPool.query('SELECT * FROM stores ORDER BY store_name ASC');
        return res.json(Array.isArray(result.rows) ? result.rows : []);
      }
      const stores = db.prepare('SELECT * FROM stores').all();
      const storesArray = Array.isArray(stores) ? stores : [];
      res.json(storesArray);
    } catch (error: any) {
      console.error('Error fetching stores from SQLite:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch stores' });
    }
  });

  app.post('/api/stores', requireOperationsManager, async (req, res) => {
    const { store_name, rows, columns, auto_settle, store_type, hanger_slots, slot_capacity, require_pick_scan, width, depth, height, store_color, store_color_visible, store_opacity, cell_width, cell_depth, cell_height } = req.body;

    const normalizedRows = store_type === 'hanger' ? 1 : Math.max(1, Number(rows ?? 10) || 1);
    const normalizedHangerSlots = store_type === 'hanger'
      ? Math.max(1, Number(hanger_slots ?? columns ?? 10) || 1)
      : Math.max(0, Number(hanger_slots ?? 0) || 0);
    const normalizedColumns = store_type === 'hanger' ? normalizedHangerSlots : Math.max(1, Number(columns ?? 10) || 1);
    const normalizedWidth = Math.max(0.1, Number(width ?? normalizedColumns) || normalizedColumns);
    const normalizedDepth = Math.max(0.1, Number(depth ?? (store_type === 'hanger' ? 1 : normalizedRows)) || (store_type === 'hanger' ? 1 : normalizedRows));
    const normalizedHeight = Math.max(0.1, Number(height ?? 3) || 3);
    const normalizedStoreColor = normalizeStoreColor(store_color);
    const normalizedStoreColorVisible = normalizeStoreColorVisible(store_color_visible);
    const normalizedStoreOpacity = normalizeStoreOpacity(store_opacity);
    const normalizedRequirePickScan = normalizeStoreRequirePickScan(require_pick_scan, store_type || 'grid');
    const normalizedCellWidth = normalizeStoreCellDimension(cell_width, deriveDefaultCellWidth(normalizedColumns));
    const normalizedCellDepth = normalizeStoreCellDimension(cell_depth, deriveDefaultCellDepth(normalizedRows));
    const normalizedCellHeight = normalizeStoreCellDimension(cell_height, deriveDefaultCellHeight());
    const normalizedSlotCapacity =
      store_type === 'hanger'
        ? 1
        : Math.max(1, Number(slot_capacity ?? (/^folding\\b/i.test(String(store_name)) ? 20 : 1)));

    if (USE_POSTGRES_LOCAL && pgPool) {
      try {
        const existingPositionsResult = await pgPool.query('SELECT position_x, position_z FROM stores');
        const existingPositions = existingPositionsResult.rows as { position_x: number; position_z: number }[];
        const availableSlot = defaultStoreSlots.find(
          (slot) => !existingPositions.some((pos) => Number(pos.position_x) === slot.x && Number(pos.position_z) === slot.z)
        );

        const position_x = availableSlot ? availableSlot.x : (existingPositions.length ? Number(existingPositions[existingPositions.length - 1].position_x) + 15 : 0);
        const position_z = availableSlot ? availableSlot.z : 0;

        try {
          await pgPool.query(
            `
            INSERT INTO stores (
              store_name, position_x, position_z, width, depth, height, rows, columns,
              auto_settle, store_type, hanger_slots, slot_capacity, require_pick_scan, store_color, store_color_visible, store_opacity, cell_width, cell_depth, cell_height
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            `,
            [
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
              normalizedRequirePickScan ? 1 : 0,
              normalizedStoreColor,
              normalizedStoreColorVisible ? 1 : 0,
              normalizedStoreOpacity,
              normalizedCellWidth,
              normalizedCellDepth,
              normalizedCellHeight,
            ]
          );
        } catch (error: any) {
          if (!isMissingStoreColorVisibleColumnError(error)) throw error;
          await pgPool.query(
            `
            INSERT INTO stores (
              store_name, position_x, position_z, width, depth, height, rows, columns,
              auto_settle, store_type, hanger_slots, slot_capacity, require_pick_scan, store_color, store_opacity, cell_width, cell_depth, cell_height
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            `,
            [
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
              normalizedRequirePickScan ? 1 : 0,
              normalizedStoreColor,
              normalizedStoreOpacity,
              normalizedCellWidth,
              normalizedCellDepth,
              normalizedCellHeight,
            ]
          );
        }
        return res.json({ success: true });
      } catch (error: any) {
        return res.status(500).json({ error: error?.message || 'Failed to create store' });
      }
    }

    const existingPositions = db.prepare('SELECT position_x, position_z FROM stores').all() as { position_x: number; position_z: number }[];
    const availableSlot = defaultStoreSlots.find(
      (slot) => !existingPositions.some((pos) => pos.position_x === slot.x && pos.position_z === slot.z)
    );

    const position_x = availableSlot ? availableSlot.x : (existingPositions.length ? existingPositions[existingPositions.length - 1].position_x + 15 : 0);
    const position_z = availableSlot ? availableSlot.z : 0;

    db.prepare(`
      INSERT INTO stores (
        store_name, position_x, position_z, width, depth, height, rows, columns,
        auto_settle, store_type, hanger_slots, slot_capacity, require_pick_scan, store_color, store_color_visible, store_opacity, cell_width, cell_depth, cell_height
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      normalizedRequirePickScan ? 1 : 0,
      normalizedStoreColor,
      normalizedStoreColorVisible ? 1 : 0,
      normalizedStoreOpacity,
      normalizedCellWidth,
      normalizedCellDepth,
      normalizedCellHeight
    );

    res.json({ success: true });
  });

  app.put('/api/stores/:name', requireOperationsManager, async (req, res) => {
    const { name } = req.params;
    const { position_x, position_y, position_z, width, depth, height, rows, columns, rotation_y, auto_settle, store_type, hanger_slots, slot_capacity, require_pick_scan, store_color, store_color_visible, store_opacity, cell_width, cell_depth, cell_height } = req.body;

    const normalizedRows = store_type === 'hanger' ? 1 : Math.max(1, Number(rows ?? 10) || 1);
    const normalizedHangerSlots = store_type === 'hanger'
      ? Math.max(1, Number(hanger_slots ?? columns ?? 10) || 1)
      : Math.max(0, Number(hanger_slots ?? 0) || 0);
    const normalizedColumns = store_type === 'hanger' ? normalizedHangerSlots : Math.max(1, Number(columns ?? 10) || 1);
    const normalizedWidth = Math.max(0.1, Number(width ?? normalizedColumns) || normalizedColumns);
    const normalizedDepth = Math.max(0.1, Number(depth ?? (store_type === 'hanger' ? 1 : normalizedRows)) || (store_type === 'hanger' ? 1 : normalizedRows));
    const normalizedHeight = Math.max(0.1, Number(height ?? 3) || 3);
    const normalizedStoreColor = normalizeStoreColor(store_color);
    const normalizedStoreColorVisible = normalizeStoreColorVisible(store_color_visible);
    const normalizedStoreOpacity = normalizeStoreOpacity(store_opacity);
    const normalizedRequirePickScan = normalizeStoreRequirePickScan(require_pick_scan, store_type || 'grid');
    const normalizedCellWidth = normalizeStoreCellDimension(cell_width, deriveDefaultCellWidth(normalizedColumns));
    const normalizedCellDepth = normalizeStoreCellDimension(cell_depth, deriveDefaultCellDepth(normalizedRows));
    const normalizedCellHeight = normalizeStoreCellDimension(cell_height, deriveDefaultCellHeight());
    const normalizedSlotCapacity = store_type === 'hanger' ? 1 : Math.max(1, Number(slot_capacity ?? 1));

    if (USE_POSTGRES_LOCAL && pgPool) {
      try {
        try {
          await pgPool.query(
            `
            UPDATE stores
            SET position_x = $1, position_y = $2, position_z = $3, width = $4, depth = $5, height = $6, rows = $7, columns = $8, rotation_y = $9, auto_settle = $10, store_type = $11, hanger_slots = $12, slot_capacity = $13, require_pick_scan = $14, store_color = $15, store_color_visible = $16, store_opacity = $17, cell_width = $18, cell_depth = $19, cell_height = $20
            WHERE store_name = $21
            `,
            [
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
              normalizedRequirePickScan ? 1 : 0,
              normalizedStoreColor,
              normalizedStoreColorVisible ? 1 : 0,
              normalizedStoreOpacity,
              normalizedCellWidth,
              normalizedCellDepth,
              normalizedCellHeight,
              name,
            ]
          );
        } catch (error: any) {
          if (!isMissingStoreColorVisibleColumnError(error)) throw error;
          await pgPool.query(
            `
            UPDATE stores
            SET position_x = $1, position_y = $2, position_z = $3, width = $4, depth = $5, height = $6, rows = $7, columns = $8, rotation_y = $9, auto_settle = $10, store_type = $11, hanger_slots = $12, slot_capacity = $13, require_pick_scan = $14, store_color = $15, store_opacity = $16, cell_width = $17, cell_depth = $18, cell_height = $19
            WHERE store_name = $20
            `,
            [
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
              normalizedRequirePickScan ? 1 : 0,
              normalizedStoreColor,
              normalizedStoreOpacity,
              normalizedCellWidth,
              normalizedCellDepth,
              normalizedCellHeight,
              name,
            ]
          );
        }
        return res.json({ success: true });
      } catch (error: any) {
        return res.status(500).json({ error: error?.message || 'Failed to update store' });
      }
    }

    try {
      db.prepare(`
        UPDATE stores
        SET position_x = ?, position_y = ?, position_z = ?, width = ?, depth = ?, height = ?, rows = ?, columns = ?, rotation_y = ?, auto_settle = ?, store_type = ?, hanger_slots = ?, slot_capacity = ?, require_pick_scan = ?, store_color = ?, store_color_visible = ?, store_opacity = ?, cell_width = ?, cell_depth = ?, cell_height = ?
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
        normalizedRequirePickScan ? 1 : 0,
        normalizedStoreColor,
        normalizedStoreColorVisible ? 1 : 0,
        normalizedStoreOpacity,
        normalizedCellWidth,
        normalizedCellDepth,
        normalizedCellHeight,
        name
      );
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error?.message || 'Failed to update store' });
    }
  });

  app.delete('/api/stores/:name', requireOperationsManager, async (req, res) => {
    const { name } = req.params;
    const force = String(req.query.force ?? '').trim() === '1';

    if (USE_POSTGRES_LOCAL && pgPool) {
      try {
        const countRes = await pgPool.query('SELECT COUNT(*)::int as count FROM blankets WHERE store = $1', [name]);
        const blanketCount = Number(countRes.rows?.[0]?.count ?? 0);
        if (blanketCount > 0 && !force) {
          return res.status(400).json({ error: 'Cannot delete store with blankets in it.' });
        }
        if (blanketCount > 0 && force) {
          await pgPool.query('DELETE FROM blankets WHERE store = $1', [name]);
        }
        await pgPool.query('DELETE FROM stores WHERE store_name = $1', [name]);
        return res.json({ success: true });
      } catch (error: any) {
        return res.status(500).json({ error: error?.message || 'Failed to delete store' });
      }
    }

    const blanketCount = db.prepare('SELECT COUNT(*) as count FROM blankets WHERE store = ?').get(name) as { count: number };
    if (blanketCount.count > 0 && !force) {
      return res.status(400).json({ error: 'Cannot delete store with blankets in it.' });
    }
    if (blanketCount.count > 0 && force) {
      db.prepare('DELETE FROM blankets WHERE store = ?').run(name);
    }

    db.prepare('DELETE FROM stores WHERE store_name = ?').run(name);
    res.json({ success: true });
  });

  app.get('/api/blankets', requireAuth, async (_req, res) => {
    try {
      if (USE_POSTGRES_LOCAL && pgPool) {
        const result = await pgPool.query('SELECT * FROM blankets ORDER BY created_at DESC');
        return res.json(Array.isArray(result.rows) ? result.rows : []);
      }
      const blankets = db.prepare('SELECT * FROM blankets ORDER BY created_at DESC').all();
      const blanketsArray = Array.isArray(blankets) ? blankets : [];
      res.json(blanketsArray);
    } catch (error: any) {
      console.error('Error fetching blankets from SQLite:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch blankets' });
    }
  });

  app.post('/api/blankets', requireOperationsManager, async (req, res) => {
    const { blanket_number, store, row, column, status, user, notes } = req.body;
    const action = status || 'stored';
    const meta = getLogMeta(req);

    if (USE_POSTGRES_LOCAL && pgPool) {
      try {
        await assertPostgresBlanketSlot(String(store), Number(row), Number(column), String(status || 'stored'));
      } catch (error: any) {
        return res.status(error.status || 400).json({ error: error.message || 'Invalid slot' });
      }

      try {
        const insertRes = await pgPool.query(
          `
          INSERT INTO blankets (blanket_number, store, row, "column", status)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
          `,
          [blanket_number, store, row, column, status || 'stored']
        );

        await pgPool.query(
          `
          INSERT INTO logs (blanket_number, action, "user", store, row, "column", status, request_id, device, ip, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          `,
          [
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
            typeof notes === 'string' && notes.trim().length > 0 ? notes.trim() : meta.notes,
          ]
        );
        return res.json({ id: insertRes.rows?.[0]?.id });
      } catch (error: any) {
        return res.status(500).json({ error: error?.message || 'Failed to create blanket' });
      }
    }

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

  app.post('/api/blankets/bulk-apply', requireOperationsManager, (req: any, res) => {
    const payload = req.body ?? {};
    const user = String(payload.user || req.auth?.username || 'system');
    const fileName = String(payload.fileName || '').trim();
    const storeChanges = Array.isArray(payload.storeChanges) ? payload.storeChanges : [];
    const operations = Array.isArray(payload.operations) ? payload.operations : [];
    const meta = getLogMeta(req);
    const touchedStores = new Set<string>();

    if (USE_POSTGRES_LOCAL && pgPool) {
      (async () => {
        const client = await pgPool.connect();
        try {
          await client.query('BEGIN');
          for (const change of storeChanges) {
            const name = String(change?.store_name || '').trim();
            if (!name) continue;
            const nextRows = Math.max(1, Number(change?.rows ?? 1) || 1);
            const nextCols = Math.max(1, Number(change?.columns ?? 1) || 1);
            const currentRes = await client.query('SELECT rows, columns FROM stores WHERE store_name = $1 LIMIT 1', [name]);
            const current = currentRes.rows?.[0] as { rows: number; columns: number } | undefined;
            if (!current) {
              await client.query(
                `INSERT INTO stores (
                  store_name, rows, columns, auto_settle, store_type, hanger_slots, slot_capacity,
                  require_pick_scan, store_color, store_opacity, cell_width, cell_depth, cell_height
                ) VALUES ($1, $2, $3, 1, 'grid', 0, 1, 0, '#3b82f6', 1, 0.5, 0.5, 0.11)`,
                [name, nextRows, nextCols]
              );
              touchedStores.add(name);
            } else {
              const mergedRows = Math.max(1, Math.max(Number(current.rows ?? 1) || 1, nextRows));
              const mergedCols = Math.max(1, Math.max(Number(current.columns ?? 1) || 1, nextCols));
              if (mergedRows !== Number(current.rows ?? 1) || mergedCols !== Number(current.columns ?? 1)) {
                await client.query('UPDATE stores SET rows = $1, columns = $2 WHERE store_name = $3', [
                  mergedRows,
                  mergedCols,
                  name,
                ]);
                touchedStores.add(name);
              }
            }
            await client.query(
              `INSERT INTO logs (blanket_number, action, "user", store, row, "column", status, request_id, device, ip, notes)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
              [
                '[STORE]',
                'store_update',
                user,
                name,
                0,
                0,
                'active',
                meta.request_id,
                meta.device,
                meta.ip,
                `${String(change?.note || '').trim() || 'Bulk import store update'}${fileName ? ` | file=${fileName}` : ''}`,
              ]
            );
          }

          for (const op of operations) {
            const opType = String(op?.op || '').trim();
            if (opType === 'update') {
              const id = Number(op?.id);
              if (!Number.isFinite(id) || id <= 0) continue;
              const previousRes = await client.query(
                'SELECT id, blanket_number, store, row, "column", status FROM blankets WHERE id = $1 LIMIT 1',
                [id]
              );
              const previousRow = previousRes.rows?.[0];
              if (!previousRow) continue;
              const previous = {
                id: Number(previousRow.id),
                blanket_number: String(previousRow.blanket_number),
                store: String(previousRow.store),
                row: Number(previousRow.row),
                column: Number(previousRow.column),
                status: String(previousRow.status),
              };
              const data = (op?.data ?? {}) as Record<string, unknown>;
              const nextBlanketNumber = String(data.blanket_number ?? previous.blanket_number);
              const nextStore = String(data.store ?? previous.store);
              const nextRow = Number(data.row ?? previous.row);
              const nextColumn = Number(data.column ?? previous.column);
              const nextStatus = String(data.status ?? previous.status ?? 'stored');
              await assertPostgresBlanketSlot(nextStore, nextRow, nextColumn, nextStatus, id);
              await client.query(
                'UPDATE blankets SET blanket_number = $1, store = $2, row = $3, "column" = $4, status = $5 WHERE id = $6',
                [nextBlanketNumber, nextStore, nextRow, nextColumn, nextStatus, id]
              );
              touchedStores.add(previous.store);
              touchedStores.add(nextStore);
              const action = String(op?.forceAction || deriveBlanketAction(previous, {
                store: nextStore,
                row: nextRow,
                column: nextColumn,
                status: nextStatus,
              }));
              await client.query(
                `INSERT INTO logs (blanket_number, action, "user", store, row, "column", status, request_id, device, ip, notes)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [
                  nextBlanketNumber,
                  action,
                  user,
                  nextStore,
                  nextRow,
                  nextColumn,
                  nextStatus,
                  meta.request_id,
                  meta.device,
                  meta.ip,
                  typeof op?.notes === 'string' && op.notes.trim() ? op.notes.trim() : meta.notes,
                ]
              );
              continue;
            }

            if (opType === 'insert') {
              const data = (op?.data ?? {}) as Record<string, unknown>;
              const blanketNumber = String(data.blanket_number ?? '').trim();
              const store = String(data.store ?? '').trim();
              const row = Number(data.row);
              const column = Number(data.column);
              const status = String(data.status ?? 'stored');
              if (!blanketNumber || !store || !Number.isFinite(row) || !Number.isFinite(column)) continue;
              await assertPostgresBlanketSlot(store, row, column, status);
              await client.query(
                'INSERT INTO blankets (blanket_number, store, row, "column", status) VALUES ($1, $2, $3, $4, $5)',
                [blanketNumber, store, row, column, status]
              );
              touchedStores.add(store);
              await client.query(
                `INSERT INTO logs (blanket_number, action, "user", store, row, "column", status, request_id, device, ip, notes)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [
                  blanketNumber,
                  status || 'stored',
                  user,
                  store,
                  row,
                  column,
                  status,
                  meta.request_id,
                  meta.device,
                  meta.ip,
                  typeof op?.notes === 'string' && op.notes.trim() ? op.notes.trim() : meta.notes,
                ]
              );
            }
          }

          await client.query('COMMIT');
          const touchedStoreList = Array.from(touchedStores);
          let storesRows: any[] = [];
          let blanketsRows: any[] = [];
          if (touchedStoreList.length > 0) {
            const storesRes = await pgPool.query(
              'SELECT * FROM stores WHERE store_name = ANY($1::text[])',
              [touchedStoreList]
            );
            const blanketsRes = await pgPool.query(
              'SELECT * FROM blankets WHERE store = ANY($1::text[])',
              [touchedStoreList]
            );
            storesRows = storesRes.rows ?? [];
            blanketsRows = blanketsRes.rows ?? [];
          }
          return res.json({
            success: true,
            touchedStores: touchedStoreList,
            stores: storesRows,
            blankets: blanketsRows,
          });
        } catch (error: any) {
          await client.query('ROLLBACK');
          return res.status(500).json({ error: error?.message || 'Bulk apply failed.' });
        } finally {
          client.release();
        }
      })();
      return;
    }

    const selectStoreStmt = db.prepare('SELECT * FROM stores WHERE store_name = ?');
    const insertStoreStmt = db.prepare(`
      INSERT INTO stores (
        store_name, rows, columns, auto_settle, store_type, hanger_slots, slot_capacity,
        require_pick_scan, store_color, store_opacity, cell_width, cell_depth, cell_height
      ) VALUES (?, ?, ?, 1, 'grid', 0, 1, 0, '#3b82f6', 1, 0.5, 0.5, 0.11)
    `);
    const updateStoreStmt = db.prepare('UPDATE stores SET rows = ?, columns = ? WHERE store_name = ?');
    const fetchBlanketStmt = db.prepare('SELECT id, blanket_number, store, row, column, status FROM blankets WHERE id = ?');
    const updateBlanketStmt = db.prepare(`
      UPDATE blankets
      SET blanket_number = ?, store = ?, row = ?, column = ?, status = ?
      WHERE id = ?
    `);
    const insertBlanketStmt = db.prepare(`
      INSERT INTO blankets (blanket_number, store, row, column, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    const insertLogStmt = db.prepare(
      'INSERT INTO logs (blanket_number, action, user, store, row, column, status, request_id, device, ip, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    try {
      const tx = db.transaction(() => {
        for (const change of storeChanges) {
          const name = String(change?.store_name || '').trim();
          if (!name) continue;
          const nextRows = Math.max(1, Number(change?.rows ?? 1) || 1);
          const nextCols = Math.max(1, Number(change?.columns ?? 1) || 1);
          const current = selectStoreStmt.get(name) as any;
          if (!current) {
            insertStoreStmt.run(name, nextRows, nextCols);
            touchedStores.add(name);
          } else {
            const mergedRows = Math.max(1, Math.max(Number(current.rows ?? 1) || 1, nextRows));
            const mergedCols = Math.max(1, Math.max(Number(current.columns ?? 1) || 1, nextCols));
            if (mergedRows !== Number(current.rows ?? 1) || mergedCols !== Number(current.columns ?? 1)) {
              updateStoreStmt.run(mergedRows, mergedCols, name);
              touchedStores.add(name);
            }
          }
          insertLogStmt.run(
            '[STORE]',
            'store_update',
            user,
            name,
            0,
            0,
            'active',
            meta.request_id,
            meta.device,
            meta.ip,
            `${String(change?.note || '').trim() || 'Bulk import store update'}${fileName ? ` | file=${fileName}` : ''}`
          );
        }

        for (const op of operations) {
          const opType = String(op?.op || '').trim();
          if (opType === 'update') {
            const id = Number(op?.id);
            if (!Number.isFinite(id) || id <= 0) continue;
            const previous = fetchBlanketStmt.get(id) as
              | { id: number; blanket_number: string; store: string; row: number; column: number; status: string }
              | undefined;
            if (!previous) continue;
            const data = (op?.data ?? {}) as Record<string, unknown>;
            const nextBlanketNumber = String(data.blanket_number ?? previous.blanket_number);
            const nextStore = String(data.store ?? previous.store);
            const nextRow = Number(data.row ?? previous.row);
            const nextColumn = Number(data.column ?? previous.column);
            const nextStatus = String(data.status ?? previous.status ?? 'stored');
            assertSqliteBlanketSlot(nextStore, nextRow, nextColumn, nextStatus, id);
            updateBlanketStmt.run(nextBlanketNumber, nextStore, nextRow, nextColumn, nextStatus, id);
            touchedStores.add(previous.store);
            touchedStores.add(nextStore);
            const action = String(op?.forceAction || deriveBlanketAction(previous, {
              store: nextStore,
              row: nextRow,
              column: nextColumn,
              status: nextStatus,
            }));
            insertLogStmt.run(
              nextBlanketNumber,
              action,
              user,
              nextStore,
              nextRow,
              nextColumn,
              nextStatus,
              meta.request_id,
              meta.device,
              meta.ip,
              typeof op?.notes === 'string' && op.notes.trim() ? op.notes.trim() : meta.notes
            );
            continue;
          }

          if (opType === 'insert') {
            const data = (op?.data ?? {}) as Record<string, unknown>;
            const blanketNumber = String(data.blanket_number ?? '').trim();
            const store = String(data.store ?? '').trim();
            const row = Number(data.row);
            const column = Number(data.column);
            const status = String(data.status ?? 'stored');
            if (!blanketNumber || !store || !Number.isFinite(row) || !Number.isFinite(column)) continue;
            assertSqliteBlanketSlot(store, row, column, status);
            insertBlanketStmt.run(blanketNumber, store, row, column, status);
            touchedStores.add(store);
            insertLogStmt.run(
              blanketNumber,
              status || 'stored',
              user,
              store,
              row,
              column,
              status,
              meta.request_id,
              meta.device,
              meta.ip,
              typeof op?.notes === 'string' && op.notes.trim() ? op.notes.trim() : meta.notes
            );
          }
        }
      });

      tx();
      const touchedStoreList = Array.from(touchedStores);
      let storesRows: any[] = [];
      let blanketsRows: any[] = [];
      if (touchedStoreList.length > 0) {
        const placeholders = touchedStoreList.map(() => '?').join(', ');
        storesRows = db.prepare(`SELECT * FROM stores WHERE store_name IN (${placeholders})`).all(...touchedStoreList) as any[];
        blanketsRows = db.prepare(`SELECT * FROM blankets WHERE store IN (${placeholders})`).all(...touchedStoreList) as any[];
      }
      return res.json({
        success: true,
        touchedStores: touchedStoreList,
        stores: storesRows,
        blankets: blanketsRows,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error?.message || 'Bulk apply failed.' });
    }
  });

  app.post('/api/blankets/empty-store', requireOperationsManager, (req: any, res) => {
    const storeName = String(req.body?.storeName || '').trim();
    if (!storeName) return res.status(400).json({ error: 'storeName is required.' });
    const reason = String(req.body?.reason || '').trim();
    const user = String(req.body?.user || req.auth?.username || 'system');
    const meta = getLogMeta(req);

    if (USE_POSTGRES_LOCAL && pgPool) {
      (async () => {
        const client = await pgPool.connect();
        try {
          await client.query('BEGIN');
          const affectedRes = await client.query(
            'SELECT id, blanket_number, store, row, "column", status FROM blankets WHERE store = $1 AND status = $2',
            [storeName, 'stored']
          );
          const affected = (affectedRes.rows ?? []).map((row: any) => ({
            id: Number(row.id),
            blanket_number: String(row.blanket_number),
            store: String(row.store),
            row: Number(row.row),
            column: Number(row.column),
            status: String(row.status),
          }));
          const archiveId = `store-archive-${storeName}-${Date.now()}`;
          const count = affected.length;
          const archiveNote = `ARCHIVE ${archiveId} | reason=${reason || '-'} | count=${count}`;

          await client.query(
            `INSERT INTO logs (blanket_number, action, "user", store, row, "column", status, request_id, device, ip, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            ['[STORE]', 'store_archive', user, storeName, 0, 0, 'active', meta.request_id, meta.device, meta.ip, archiveNote]
          );

          await client.query('UPDATE blankets SET status = $1 WHERE store = $2 AND status = $3', ['retrieved', storeName, 'stored']);
          await client.query(
            `INSERT INTO logs (blanket_number, action, "user", store, row, "column", status, request_id, device, ip, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
              '[STORE]',
              'store_emptied',
              user,
              storeName,
              0,
              0,
              'active',
              meta.request_id,
              meta.device,
              meta.ip,
              `Cleared ${count} stored items`,
            ]
          );
          await client.query('COMMIT');

          const blanketsRes = await pgPool.query('SELECT * FROM blankets WHERE store = $1', [storeName]);
          return res.json({
            success: true,
            touchedStores: [storeName],
            affectedCount: count,
            archiveId,
            blankets: Array.isArray(blanketsRes.rows) ? blanketsRes.rows : [],
          });
        } catch (error: any) {
          await client.query('ROLLBACK');
          return res.status(500).json({ error: error?.message || 'Empty store failed.' });
        } finally {
          client.release();
        }
      })();
      return;
    }

    const fetchAffectedStmt = db.prepare(
      'SELECT id, blanket_number, store, row, column, status FROM blankets WHERE store = ? AND status = ?'
    );
    const updateStoreBlanketsStmt = db.prepare('UPDATE blankets SET status = ? WHERE store = ? AND status = ?');
    const insertLogStmt = db.prepare(
      'INSERT INTO logs (blanket_number, action, user, store, row, column, status, request_id, device, ip, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    try {
      const affected = fetchAffectedStmt.all(storeName, 'stored') as Array<{
        id: number;
        blanket_number: string;
        store: string;
        row: number;
        column: number;
        status: string;
      }>;

      const archiveId = `store-archive-${storeName}-${Date.now()}`;
      const count = affected.length;
      const archiveNote = `ARCHIVE ${archiveId} | reason=${reason || '-'} | count=${count}`;

      const tx = db.transaction(() => {
        insertLogStmt.run('[STORE]', 'store_archive', user, storeName, 0, 0, 'active', meta.request_id, meta.device, meta.ip, archiveNote);
        updateStoreBlanketsStmt.run('retrieved', storeName, 'stored');
        insertLogStmt.run(
          '[STORE]',
          'store_emptied',
          user,
          storeName,
          0,
          0,
          'active',
          meta.request_id,
          meta.device,
          meta.ip,
          `Cleared ${count} stored items`
        );
      });

      tx();
      const blanketsRows = db.prepare('SELECT * FROM blankets WHERE store = ?').all(storeName);
      return res.json({
        success: true,
        touchedStores: [storeName],
        affectedCount: count,
        archiveId,
        blankets: Array.isArray(blanketsRows) ? blanketsRows : [],
      });
    } catch (error: any) {
      return res.status(500).json({ error: error?.message || 'Empty store failed.' });
    }
  });

  app.put('/api/blankets/:id', requireOperationsManager, async (req, res) => {
    const { id } = req.params;
    const { blanket_number, store, row, column, status, user, notes } = req.body;
    const meta = getLogMeta(req);
    if (USE_POSTGRES_LOCAL && pgPool) {
      try {
        const previousRes = await pgPool.query(
          'SELECT blanket_number, store, row, "column", status FROM blankets WHERE id = $1 LIMIT 1',
          [Number(id)]
        );
        const previousRow = previousRes.rows?.[0];
        const previous = previousRow
          ? {
              blanket_number: String(previousRow.blanket_number),
              store: String(previousRow.store),
              row: Number(previousRow.row),
              column: Number(previousRow.column),
              status: String(previousRow.status),
            }
          : undefined;

        const action = deriveBlanketAction(previous as any, { store, row, column, status });

        try {
          await assertPostgresBlanketSlot(String(store), Number(row), Number(column), String(status), Number(id));
        } catch (error: any) {
          return res.status(error.status || 400).json({ error: error.message || 'Invalid slot' });
        }

        await pgPool.query(
          `UPDATE blankets SET blanket_number = $1, store = $2, row = $3, "column" = $4, status = $5 WHERE id = $6`,
          [blanket_number, store, row, column, status, Number(id)]
        );
        await pgPool.query(
          `INSERT INTO logs (blanket_number, action, "user", store, row, "column", status, request_id, device, ip, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
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
            typeof notes === 'string' && notes.trim().length > 0 ? notes.trim() : meta.notes,
          ]
        );
        return res.json({ success: true });
      } catch (error: any) {
        return res.status(500).json({ error: error?.message || 'Failed to update blanket' });
      }
    }

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

  app.post('/api/blankets/:id/pick', requirePicker, async (req: any, res) => {
    const { id } = req.params;
    const blanketId = Number(id);
    if (!Number.isFinite(blanketId) || blanketId <= 0) {
      return res.status(400).json({ error: 'Invalid blanket id.' });
    }

    const meta = getLogMeta(req);

    if (USE_POSTGRES_LOCAL && pgPool) {
      const client = await pgPool.connect();
      try {
        await client.query('BEGIN');
        const blanketRes = await client.query(
          'SELECT id, blanket_number, store, row, "column", status FROM blankets WHERE id = $1 LIMIT 1',
          [blanketId]
        );
        const b = blanketRes.rows?.[0];
        if (!b) {
          await client.query('ROLLBACK');
          return res.status(404).json({ error: 'Blanket not found.' });
        }
        const blanket = {
          id: Number(b.id),
          blanket_number: String(b.blanket_number),
          store: String(b.store),
          row: Number(b.row),
          column: Number(b.column),
          status: String(b.status),
        };

        const storeRes = await client.query(
          'SELECT rows, auto_settle, store_type, slot_capacity FROM stores WHERE store_name = $1 LIMIT 1',
          [blanket.store]
        );
        const s = storeRes.rows?.[0];
        if (!s) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: `Store not found: ${blanket.store}` });
        }
        const store = {
          rows: Number(s.rows),
          auto_settle: Number(s.auto_settle),
          store_type: String(s.store_type),
          slot_capacity: Number(s.slot_capacity),
        };

        const canAutoSettle =
          Number(store.auto_settle ?? 1) !== 0 &&
          String(store.store_type ?? 'grid') !== 'hanger' &&
          Math.max(1, Number(store.slot_capacity ?? 1)) <= 1;

        await client.query('UPDATE blankets SET status = $1 WHERE id = $2', ['picked', blanket.id]);

        if (String(blanket.status) === 'stored' && canAutoSettle) {
          const storedRes = await client.query(
            'SELECT id, row FROM blankets WHERE store = $1 AND "column" = $2 AND status = $3 AND id <> $4 ORDER BY row ASC',
            [blanket.store, blanket.column, 'stored', blanket.id]
          );
          const storedInColumn = (storedRes.rows ?? []).map((r: any) => ({
            id: Number(r.id),
            row: Number(r.row),
          }));
          const maxRows = Math.max(1, Number(store.rows ?? 1));
          const startRow = maxRows - storedInColumn.length + 1;
          for (let index = 0; index < storedInColumn.length; index += 1) {
            const currentBlanket = storedInColumn[index];
            const targetRow = startRow + index;
            if (currentBlanket.row === targetRow) continue;
            await client.query('UPDATE blankets SET row = $1 WHERE id = $2', [targetRow, currentBlanket.id]);
          }
        }

        await client.query(
          `INSERT INTO logs (blanket_number, action, "user", store, row, "column", status, request_id, device, ip, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            blanket.blanket_number,
            'picked',
            req.body?.user || req.auth?.username || 'system',
            blanket.store,
            blanket.row,
            blanket.column,
            'picked',
            meta.request_id,
            meta.device,
            meta.ip,
            meta.notes,
          ]
        );
        await client.query('COMMIT');
        return res.json({ success: true });
      } catch (error: any) {
        await client.query('ROLLBACK');
        return res.status(500).json({ error: error?.message || 'Failed to pick blanket.' });
      } finally {
        client.release();
      }
    }

    const blanket = db.prepare('SELECT id, blanket_number, store, row, column, status FROM blankets WHERE id = ?').get(blanketId) as
      | { id: number; blanket_number: string; store: string; row: number; column: number; status: string }
      | undefined;
    if (!blanket) return res.status(404).json({ error: 'Blanket not found.' });

    const store = db.prepare('SELECT rows, auto_settle, store_type, slot_capacity FROM stores WHERE store_name = ?').get(blanket.store) as
      | { rows: number; auto_settle: number; store_type: string; slot_capacity: number }
      | undefined;
    if (!store) return res.status(400).json({ error: `Store not found: ${blanket.store}` });

    const canAutoSettle =
      Number(store.auto_settle ?? 1) !== 0 &&
      String(store.store_type ?? 'grid') !== 'hanger' &&
      Math.max(1, Number(store.slot_capacity ?? 1)) <= 1;

    // Pick first, then settle. This avoids temporary capacity conflicts while still "stored".
    db.prepare('UPDATE blankets SET status = ? WHERE id = ?').run('picked', blanket.id);

    if (String(blanket.status) === 'stored' && canAutoSettle) {
      const storedInColumn = db
        .prepare(
          'SELECT id, row FROM blankets WHERE store = ? AND column = ? AND status = ? AND id <> ? ORDER BY row ASC'
        )
        .all(blanket.store, blanket.column, 'stored', blanket.id) as Array<{ id: number; row: number }>;
      const maxRows = Math.max(1, Number(store.rows ?? 1));
      const startRow = maxRows - storedInColumn.length + 1;
      for (let index = 0; index < storedInColumn.length; index += 1) {
        const currentBlanket = storedInColumn[index];
        const targetRow = startRow + index;
        if (currentBlanket.row === targetRow) continue;
        db.prepare('UPDATE blankets SET row = ? WHERE id = ?').run(targetRow, currentBlanket.id);
      }
    }

    db.prepare(
      'INSERT INTO logs (blanket_number, action, user, store, row, column, status, request_id, device, ip, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      blanket.blanket_number,
      'picked',
      req.body?.user || req.auth?.username || 'system',
      blanket.store,
      blanket.row,
      blanket.column,
      'picked',
      meta.request_id,
      meta.device,
      meta.ip,
      meta.notes
    );

    res.json({ success: true });
  });

  app.delete('/api/blankets/:id', requireOperationsManager, async (req, res) => {
    const { id } = req.params;
    const meta = getLogMeta(req);
    if (USE_POSTGRES_LOCAL && pgPool) {
      try {
        const blanketRes = await pgPool.query(
          'SELECT blanket_number, store, row, "column", status FROM blankets WHERE id = $1 LIMIT 1',
          [Number(id)]
        );
        const blanketRow = blanketRes.rows?.[0];
        if (blanketRow) {
          await pgPool.query('DELETE FROM blankets WHERE id = $1', [Number(id)]);
          await pgPool.query(
            `INSERT INTO logs (blanket_number, action, "user", store, row, "column", status, request_id, device, ip, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
              blanketRow.blanket_number,
              'deleted',
              req.body?.user || 'system',
              blanketRow.store,
              blanketRow.row,
              blanketRow.column,
              blanketRow.status,
              meta.request_id,
              meta.device,
              meta.ip,
              meta.notes,
            ]
          );
        }
        return res.json({ success: true });
      } catch (error: any) {
        return res.status(500).json({ error: error?.message || 'Failed to delete blanket' });
      }
    }

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

  app.get('/api/logs', requireAuth, async (req, res) => {
    try {
      // Order by id as a tie-breaker so multiple events in the same second don't appear to "overwrite" each other.
      const rawLimit = Number(req.query.limit ?? 500);
      const limit = Number.isFinite(rawLimit) ? Math.min(1000, Math.max(1, rawLimit)) : 500;
      if (USE_POSTGRES_LOCAL && pgPool) {
        const result = await pgPool.query('SELECT * FROM logs ORDER BY "timestamp" DESC, id DESC LIMIT $1', [limit]);
        return res.json(Array.isArray(result.rows) ? result.rows : []);
      }
      const logs = db.prepare('SELECT * FROM logs ORDER BY timestamp DESC, id DESC LIMIT ?').all(limit);
      const logsArray = Array.isArray(logs) ? logs : [];
      res.json(logsArray);
    } catch (error: any) {
      console.error('Error fetching logs from SQLite:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch logs' });
    }
  });

  app.post('/api/logs', requireOperationsManager, async (req, res) => {
    const { blanket_number, action, user, store, row, column, status, notes } = req.body;
    const meta = getLogMeta(req);
    if (USE_POSTGRES_LOCAL && pgPool) {
      try {
        await pgPool.query(
          `INSERT INTO logs (blanket_number, action, "user", store, row, "column", status, request_id, device, ip, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
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
            typeof notes === 'string' && notes.trim().length > 0 ? notes.trim() : meta.notes,
          ]
        );
        return res.json({ success: true });
      } catch (error: any) {
        return res.status(500).json({ error: error?.message || 'Failed to create log' });
      }
    }

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

  app.get('/api/pos/find-laundry-orders', requireAuth, async (req, res) => {
    try {
      const query = String(req.query.q ?? '').trim();
      if (query.length < 2) {
        return res.status(400).json({ error: 'Search query must be at least 2 characters.' });
      }

      const result = await fetchPosOrderSearch(query);
      res.json(result);
    } catch (error: any) {
      console.error('POS order search failed:', error);
      res.status(502).json({ error: error?.message || 'Failed to fetch orders from POS system.' });
    }
  });

  app.get('/api/pos/order-details', requireAuth, async (req, res) => {
    try {
      const orderId = String(req.query.order_id ?? req.query.invoice_id ?? '').trim();
      const sOrderId = String(req.query.s_order_id ?? req.query.orders_id ?? '').trim();
      if (!orderId && !sOrderId) {
        return res.status(400).json({
          error: 'order_id (or invoice_id) or s_order_id (or orders_id) is required.',
        });
      }

      const mode = String(req.query.mode ?? '').trim();
      const openType = String(req.query.open_type ?? '').trim();
      const jobProcessCommisionOption = String(req.query.job_process_commision_option ?? '').trim();

      const details = await fetchPosOrderDetails({
        order_id: orderId || '0',
        s_order_id: sOrderId || '0',
        ...(mode ? { mode } : {}),
        ...(openType ? { open_type: openType } : {}),
        ...(jobProcessCommisionOption ? { job_process_commision_option: jobProcessCommisionOption } : {}),
      });

      res.json(details);
    } catch (error: any) {
      console.error('POS order details failed:', error);
      res.status(502).json({ error: error?.message || 'Failed to fetch order details from POS system.' });
    }
  });

  app.get('/api/pos/get-products', requireAuth, async (req, res) => {
    try {
      const unitId = String(req.query.unit_id ?? '').trim();
      const laundryCat = String(req.query.laundry_cat ?? '').trim();
      const custType = String(req.query.cust_type ?? '').trim();
      const curPage = String(req.query.cur_page ?? '').trim();
      const customerId = String(req.query.customer_id ?? '').trim();

      const products = await fetchPosProducts({
        ...(unitId ? { unit_id: unitId } : {}),
        ...(laundryCat ? { laundry_cat: laundryCat } : {}),
        ...(custType ? { cust_type: custType } : {}),
        ...(curPage ? { cur_page: curPage } : {}),
        ...(customerId ? { customer_id: customerId } : {}),
      });

      res.json(products);
    } catch (error: any) {
      console.error('POS products failed:', error);
      res.status(502).json({ error: error?.message || 'Failed to fetch products from POS system.' });
    }
  });

  const resolveAlertMessageBody = (templateId: number | null, message: string | null) => {
    if (templateId && Number.isFinite(templateId) && templateId > 0) {
      const template = db
        .prepare('SELECT * FROM customer_alert_templates WHERE id = ?')
        .get(templateId) as CustomerAlertTemplateRecord | undefined;
      if (!template) {
        throw new Error('Template not found.');
      }
      if (Number(template.is_active ?? 1) === 0) {
        throw new Error('Template is inactive.');
      }
      return { body: String(template.body ?? ''), template_id: template.id };
    }
    const raw = String(message ?? '').trim();
    if (!raw) {
      throw new Error('Message body is required when template is not selected.');
    }
    return { body: raw, template_id: null };
  };

  const insertCustomerAlertLog = (payload: {
    order_no: string;
    customer_name: string;
    phone: string;
    message_body: string;
    template_id: number | null;
    status: string;
    provider_response?: string | null;
    error_message?: string | null;
    sent_by: string;
  }) => {
    db.prepare(
      `INSERT INTO customer_alert_logs
       (order_no, customer_name, phone, message_body, template_id, status, provider_response, error_message, sent_by, sent_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    ).run(
      payload.order_no,
      payload.customer_name,
      payload.phone,
      payload.message_body,
      payload.template_id,
      payload.status,
      payload.provider_response ?? null,
      payload.error_message ?? null,
      payload.sent_by
    );
  };

  const resolveAlertCandidateByOrderNo = async (orderNoInput: string) => {
    const snapshot = await loadStoredOrderSnapshotByOrderNo(orderNoInput);
    if (!snapshot) return null;
    const latestStatusMap = readLatestAlertLogByOrderNo();
    return buildAlertCandidateFromSnapshot(snapshot, latestStatusMap);
  };

  app.get('/api/customer-alerts/templates', requirePicker, (_req, res) => {
    try {
      const rows = db
        .prepare('SELECT * FROM customer_alert_templates ORDER BY is_active DESC, updated_at DESC, id DESC')
        .all() as CustomerAlertTemplateRecord[];
      res.json({ templates: rows });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to load alert templates.' });
    }
  });

  app.get('/api/customer-alerts/scan-storage', requirePicker, async (req, res) => {
    try {
      const limit = Math.max(1, Math.min(500, Number(req.query.limit ?? 200) || 200));
      const snapshots = await loadStoredOrderSnapshots(limit);
      const orders = snapshots.map((snapshot) => ({
        order_number: normalizeAlertOrderNo(snapshot.order_no),
        order_no: normalizeAlertOrderNo(snapshot.order_no),
        quantity_in_store: Math.max(0, Number(snapshot.qty_in_store ?? 0) || 0),
        qty_in_store: Math.max(0, Number(snapshot.qty_in_store ?? 0) || 0),
        first_stored_at: snapshot.first_stored_at,
        locations_count: snapshot.store_slots.length,
        store_slots: snapshot.store_slots,
      }));
      res.json({
        orders,
        scanned_count: orders.length,
        generated_at: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to scan storage.' });
    }
  });

  app.post('/api/customer-alerts/templates', requireOperationsManager, (req, res) => {
    try {
      const name = String(req.body?.name ?? '').trim();
      const body = String(req.body?.body ?? '').trim();
      const channel = String(req.body?.channel ?? 'whatsapp').trim() || 'whatsapp';
      const isActive = req.body?.is_active === undefined ? 1 : Number(req.body?.is_active ? 1 : 0);
      if (!name) return res.status(400).json({ error: 'Template name is required.' });
      if (!body) return res.status(400).json({ error: 'Template body is required.' });
      const result = db
        .prepare(
          `INSERT INTO customer_alert_templates (name, channel, body, is_active, created_by, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
        )
        .run(name, channel, body, isActive, req.auth?.username || 'system');
      const row = db
        .prepare('SELECT * FROM customer_alert_templates WHERE id = ?')
        .get(Number(result.lastInsertRowid)) as CustomerAlertTemplateRecord | undefined;
      res.json({ success: true, template: row ?? null });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to create alert template.' });
    }
  });

  app.put('/api/customer-alerts/templates/:id', requireOperationsManager, (req, res) => {
    try {
      const id = Number(req.params.id ?? 0);
      if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ error: 'Valid template id is required.' });
      const existing = db
        .prepare('SELECT * FROM customer_alert_templates WHERE id = ?')
        .get(id) as CustomerAlertTemplateRecord | undefined;
      if (!existing) return res.status(404).json({ error: 'Template not found.' });

      const name = req.body?.name === undefined ? existing.name : String(req.body?.name ?? '').trim();
      const body = req.body?.body === undefined ? existing.body : String(req.body?.body ?? '').trim();
      const channel = req.body?.channel === undefined ? existing.channel : String(req.body?.channel ?? '').trim();
      const isActive = req.body?.is_active === undefined ? Number(existing.is_active ?? 1) : Number(req.body?.is_active ? 1 : 0);

      if (!name) return res.status(400).json({ error: 'Template name is required.' });
      if (!body) return res.status(400).json({ error: 'Template body is required.' });
      if (!channel) return res.status(400).json({ error: 'Template channel is required.' });

      db.prepare(
        `UPDATE customer_alert_templates
         SET name = ?, channel = ?, body = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      ).run(name, channel, body, isActive, id);

      const row = db
        .prepare('SELECT * FROM customer_alert_templates WHERE id = ?')
        .get(id) as CustomerAlertTemplateRecord | undefined;
      res.json({ success: true, template: row ?? null });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to update alert template.' });
    }
  });

  app.delete('/api/customer-alerts/templates/:id', requireOperationsManager, (req, res) => {
    try {
      const id = Number(req.params.id ?? 0);
      if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ error: 'Valid template id is required.' });
      const row = db
        .prepare('SELECT * FROM customer_alert_templates WHERE id = ?')
        .get(id) as CustomerAlertTemplateRecord | undefined;
      if (!row) return res.status(404).json({ error: 'Template not found.' });
      db.prepare('DELETE FROM customer_alert_templates WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to delete alert template.' });
    }
  });

  app.get('/api/customer-alerts/candidates', requirePicker, async (req, res) => {
    try {
      const limit = Math.max(1, Math.min(500, Number(req.query.limit ?? 120) || 120));
      const candidates = await buildCustomerAlertCandidates(limit);
      res.json({ candidates, generated_at: new Date().toISOString() });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to load customer alert candidates.' });
    }
  });

  app.post('/api/customer-alerts/check-order', requirePicker, async (req, res) => {
    try {
      const orderNo = normalizeAlertOrderNo(req.body?.orderNo);
      if (!orderNo) return res.status(400).json({ error: 'orderNo is required.' });
      const candidate = await resolveAlertCandidateByOrderNo(orderNo);
      if (!candidate) return res.status(404).json({ error: 'No stored pieces found for this order.' });
      res.json({ candidate, warnings: candidate.warnings ?? [] });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to check order matching.' });
    }
  });

  app.post('/api/customer-alerts/send-one', requirePicker, async (req, res) => {
    try {
      const orderNo = normalizeAlertOrderNo(req.body?.orderNo);
      if (!orderNo) return res.status(400).json({ error: 'orderNo is required.' });

      const sendOnlyMatched = req.body?.sendOnlyMatched === undefined ? true : Boolean(req.body?.sendOnlyMatched);
      const dryRun = Boolean(req.body?.dryRun);
      const templateIdRaw = Number(req.body?.templateId ?? 0);
      const templateId = Number.isFinite(templateIdRaw) && templateIdRaw > 0 ? templateIdRaw : null;
      const providedMessage = req.body?.message === undefined ? null : String(req.body?.message ?? '').trim();

      const candidate = await resolveAlertCandidateByOrderNo(orderNo);
      if (!candidate) return res.status(404).json({ error: 'No stored pieces found for this order.' });
      if (sendOnlyMatched && candidate.match_state !== 'complete') {
        return res.status(409).json({
          error: 'لا يمكن الإرسال لأن الكمية غير مكتملة.',
          candidate,
        });
      }

      const messageSource = resolveAlertMessageBody(templateId, providedMessage);
      const stores = Array.from(new Set(candidate.store_slots.map((slot) => slot.store).filter(Boolean))).join(', ');
      const renderedMessage = renderAlertTemplate(messageSource.body, {
        name: candidate.customer_name || 'عميلنا العزيز',
        order_no: candidate.order_no,
        pieces: candidate.qty_in_order || candidate.qty_in_store,
        total: candidate.total_amount.toFixed(2),
        store: stores,
      }).trim();
      if (!renderedMessage) return res.status(400).json({ error: 'Rendered message is empty.' });

      const phone = String(req.body?.phone ?? candidate.phone ?? '').trim();
      if (!phone) {
        return res.status(400).json({
          error: 'Customer phone is missing in POS details.',
          candidate,
        });
      }

      if (dryRun) {
        return res.json({
          success: true,
          dryRun: true,
          candidate,
          preview: {
            phone,
            message: renderedMessage,
          },
        });
      }

      const sentBy = String(req.auth?.username ?? 'system');
      try {
        const providerResult = await sendCustomerAlertWhatsapp(phone, renderedMessage);
        insertCustomerAlertLog({
          order_no: candidate.order_no,
          customer_name: candidate.customer_name,
          phone,
          message_body: renderedMessage,
          template_id: messageSource.template_id,
          status: 'sent',
          provider_response: JSON.stringify(providerResult),
          sent_by: sentBy,
        });
        return res.json({
          success: true,
          candidate,
          result: providerResult,
        });
      } catch (sendError: any) {
        insertCustomerAlertLog({
          order_no: candidate.order_no,
          customer_name: candidate.customer_name,
          phone,
          message_body: renderedMessage,
          template_id: messageSource.template_id,
          status: 'failed',
          error_message: String(sendError?.message || 'send failed'),
          sent_by: sentBy,
        });
        return res.status(502).json({
          error: sendError?.message || 'Failed to send WhatsApp alert.',
          candidate,
        });
      }
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to send alert.' });
    }
  });

  app.post('/api/customer-alerts/send-bulk', requirePicker, async (req, res) => {
    try {
      const orderNosInput = Array.isArray(req.body?.orderNos) ? req.body.orderNos : [];
      const normalizedOrderNos = Array.from(
        new Set(orderNosInput.map((value: unknown) => normalizeAlertOrderNo(value)).filter((value: string) => value.length > 0))
      );
      const dryRun = Boolean(req.body?.dryRun);
      const sendOnlyMatched = req.body?.sendOnlyMatched === undefined ? true : Boolean(req.body?.sendOnlyMatched);
      const retryFailedOnly = Boolean(req.body?.retryFailedOnly);
      const limit = Math.max(1, Math.min(500, Number(req.body?.limit ?? 120) || 120));
      const templateIdRaw = Number(req.body?.templateId ?? 0);
      const templateId = Number.isFinite(templateIdRaw) && templateIdRaw > 0 ? templateIdRaw : null;
      const providedMessage = req.body?.message === undefined ? null : String(req.body?.message ?? '').trim();
      const messageSource = resolveAlertMessageBody(templateId, providedMessage);
      const sentBy = String(req.auth?.username ?? 'system');

      const baseCandidates =
        normalizedOrderNos.length > 0
          ? (
              await Promise.all(
                normalizedOrderNos.map(async (orderNo: string) => resolveAlertCandidateByOrderNo(orderNo))
              )
            ).filter((candidate): candidate is CustomerAlertCandidate => Boolean(candidate))
          : await buildCustomerAlertCandidates(limit);

      const failedOrderSet = retryFailedOnly
        ? new Set(
            (db
              .prepare("SELECT DISTINCT order_no FROM customer_alert_logs WHERE status = 'failed'")
              .all() as Array<{ order_no: string }>)
              .map((row) => normalizeAlertOrderNo(row.order_no))
              .filter((value) => value.length > 0)
          )
        : null;

      const candidates = baseCandidates.filter((candidate) => {
        if (failedOrderSet && !failedOrderSet.has(normalizeAlertOrderNo(candidate.order_no))) return false;
        if (sendOnlyMatched && candidate.match_state !== 'complete') return false;
        return true;
      });

      const summary = {
        total: candidates.length,
        sent: 0,
        failed: 0,
        skipped: 0,
      };
      const results: Array<{
        order_no: string;
        status: 'sent' | 'failed' | 'skipped';
        reason?: string;
        phone?: string;
      }> = [];

      for (const candidate of candidates) {
        const stores = Array.from(new Set(candidate.store_slots.map((slot) => slot.store).filter(Boolean))).join(', ');
        const renderedMessage = renderAlertTemplate(messageSource.body, {
          name: candidate.customer_name || 'عميلنا العزيز',
          order_no: candidate.order_no,
          pieces: candidate.qty_in_order || candidate.qty_in_store,
          total: candidate.total_amount.toFixed(2),
          store: stores,
        }).trim();
        const phone = String(candidate.phone ?? '').trim();

        if (!phone || !renderedMessage) {
          summary.skipped += 1;
          results.push({
            order_no: candidate.order_no,
            status: 'skipped',
            reason: !phone ? 'missing phone' : 'empty message',
          });
          continue;
        }

        if (dryRun) {
          summary.sent += 1;
          results.push({
            order_no: candidate.order_no,
            status: 'sent',
            phone,
          });
          continue;
        }

        try {
          const providerResult = await sendCustomerAlertWhatsapp(phone, renderedMessage);
          insertCustomerAlertLog({
            order_no: candidate.order_no,
            customer_name: candidate.customer_name,
            phone,
            message_body: renderedMessage,
            template_id: messageSource.template_id,
            status: 'sent',
            provider_response: JSON.stringify(providerResult),
            sent_by: sentBy,
          });
          summary.sent += 1;
          results.push({
            order_no: candidate.order_no,
            status: 'sent',
            phone,
          });
        } catch (sendError: any) {
          insertCustomerAlertLog({
            order_no: candidate.order_no,
            customer_name: candidate.customer_name,
            phone,
            message_body: renderedMessage,
            template_id: messageSource.template_id,
            status: 'failed',
            error_message: String(sendError?.message || 'send failed'),
            sent_by: sentBy,
          });
          summary.failed += 1;
          results.push({
            order_no: candidate.order_no,
            status: 'failed',
            reason: String(sendError?.message || 'send failed'),
            phone,
          });
        }
      }

      res.json({
        success: true,
        dryRun,
        summary,
        results,
      });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to send bulk alerts.' });
    }
  });

  app.get('/api/sorting/state', requireSorting, (_req, res) => {
    try {
      res.json(buildSortingState());
    } catch (error: any) {
      console.error('Failed to build sorting state:', error);
      res.status(500).json({ error: error?.message || 'Failed to load sorting state.' });
    }
  });

  app.get('/api/sorting/order/:orderNo', requireSorting, (req, res) => {
    try {
      const orderNo = normalizeSortingOrderNo(req.params.orderNo);
      if (!orderNo) return res.status(400).json({ error: 'Order number is required.' });
      const bundle = getSortingOrderBundle(orderNo);
      if (!bundle) return res.status(404).json({ error: 'Sorting order not found.' });
      return res.json(bundle);
    } catch (error: any) {
      console.error('Failed to load sorting order:', error);
      return res.status(500).json({ error: error?.message || 'Failed to load sorting order.' });
    }
  });

  app.get('/api/sorting/blanket/order/:orderNo', requireSorting, async (req, res) => {
    try {
      const orderNo = normalizeSortingOrderNo(req.params.orderNo);
      if (!orderNo) return res.status(400).json({ error: 'Order number is required.' });

      // Ensure order is initialized from POS (same behavior as sorting prepare, but without table assignment).
      await ensureSortingOrderInitialized({
        order_no: orderNo,
        allow_unsorted_fallback: false,
      });

      const bundle = getBlanketPackingBundle(orderNo);
      if (!bundle) return res.status(404).json({ error: 'Order not found.' });
      if ((bundle.items ?? []).length === 0) {
        return res.status(409).json({ error: 'No blanket or pillow items found in this order.' });
      }
      return res.json(bundle);
    } catch (error: any) {
      console.error('Failed to load blanket packing order:', error);
      return res.status(500).json({ error: error?.message || 'Failed to load blanket packing order.' });
    }
  });

  app.post('/api/sorting/orders/prepare', requireSorting, async (req, res) => {
    try {
      const orderNo = normalizeSortingOrderNo(req.body?.order_no ?? req.body?.orderNo);
      if (!orderNo) return res.status(400).json({ error: 'Order number is required.' });

      await ensureSortingOrderInitialized({
        order_no: orderNo,
        source_orders_id: req.body?.source_orders_id,
        source_invoice_id: req.body?.source_invoice_id,
        customer_name: req.body?.customer_name,
        total_required: req.body?.total_required,
        items: Array.isArray(req.body?.items) ? req.body.items : undefined,
        allow_unsorted_fallback: req.body?.allow_unsorted_fallback === true,
      });

      const placement = assignSortingCellForOrder(orderNo);
      const bundle = syncSortingOrderProgress(orderNo) ?? getSortingOrderBundle(orderNo);
      if (!bundle) return res.status(404).json({ error: 'Sorting order not found after prepare.' });

      res.json({
        order: bundle.order,
        items: bundle.items,
        placement,
      });
    } catch (error: any) {
      console.error('Failed to prepare sorting order:', error);
      res.status(500).json({ error: error?.message || 'Failed to prepare sorting order.' });
    }
  });

  app.get('/api/sorting/tables', requireSorting, (_req, res) => {
    try {
      const tables = db
        .prepare('SELECT * FROM sorting_tables ORDER BY sort_order ASC, id ASC')
        .all() as SortingTableRecord[];
      res.json(tables);
    } catch (error: any) {
      console.error('Failed to load sorting tables:', error);
      res.status(500).json({ error: error?.message || 'Failed to load sorting tables.' });
    }
  });

  app.post('/api/sorting/tables', requireOperationsManager, (req, res) => {
    try {
      const name = String(req.body?.name ?? '').trim();
      const rows = coercePositiveInt(req.body?.rows, 2);
      const cols = coercePositiveInt(req.body?.cols, 6);
      const isActive = req.body?.is_active === false || req.body?.is_active === 0 ? 0 : 1;

      if (!name) return res.status(400).json({ error: 'Table name is required.' });

      const maxSort = db.prepare('SELECT COALESCE(MAX(sort_order), 0) AS max_sort FROM sorting_tables').get() as { max_sort: number };
      const result = db
        .prepare(
          `INSERT INTO sorting_tables (name, rows, cols, sort_order, is_active, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
        )
        .run(name, rows, cols, Number(maxSort.max_sort || 0) + 1, isActive);

      const tableId = Number(result.lastInsertRowid);
      ensureSortingCellsForTable(tableId, rows, cols);

      const created = db.prepare('SELECT * FROM sorting_tables WHERE id = ?').get(tableId) as SortingTableRecord | undefined;
      res.status(201).json(created ?? { success: true, id: tableId });
    } catch (error: any) {
      console.error('Failed to create sorting table:', error);
      res.status(500).json({ error: error?.message || 'Failed to create sorting table.' });
    }
  });

  app.put('/api/sorting/tables/:id', requireOperationsManager, (req, res) => {
    try {
      const tableId = Number(req.params.id);
      if (!Number.isFinite(tableId) || tableId <= 0) {
        return res.status(400).json({ error: 'Invalid table id.' });
      }
      const current = db.prepare('SELECT * FROM sorting_tables WHERE id = ?').get(tableId) as SortingTableRecord | undefined;
      if (!current) return res.status(404).json({ error: 'Sorting table not found.' });

      const name = String(req.body?.name ?? current.name).trim();
      const rows = coercePositiveInt(req.body?.rows ?? current.rows, current.rows);
      const cols = coercePositiveInt(req.body?.cols ?? current.cols, current.cols);
      const sortOrder = Number.isFinite(Number(req.body?.sort_order)) ? Number(req.body.sort_order) : current.sort_order;
      const isActive =
        req.body?.is_active === undefined
          ? current.is_active
          : req.body?.is_active === false || req.body?.is_active === 0
            ? 0
            : 1;

      if (!name) return res.status(400).json({ error: 'Table name is required.' });

      db.prepare(
        `UPDATE sorting_tables
         SET name = ?, rows = ?, cols = ?, sort_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      ).run(name, rows, cols, sortOrder, isActive, tableId);

      ensureSortingCellsForTable(tableId, rows, cols);
      const updated = db.prepare('SELECT * FROM sorting_tables WHERE id = ?').get(tableId) as SortingTableRecord | undefined;
      res.json(updated ?? { success: true });
    } catch (error: any) {
      console.error('Failed to update sorting table:', error);
      res.status(500).json({ error: error?.message || 'Failed to update sorting table.' });
    }
  });

  app.post('/api/sorting/scan', requireSorting, async (req: any, res) => {
    try {
      const orderNo = normalizeSortingOrderNo(req.body?.order_no ?? req.body?.orderNo ?? req.body?.scanned_code);
      if (!orderNo) return res.status(400).json({ error: 'Order number is required.' });

      await ensureSortingOrderInitialized({
        order_no: orderNo,
        source_orders_id: req.body?.source_orders_id,
        source_invoice_id: req.body?.source_invoice_id,
        customer_name: req.body?.customer_name,
        total_required: req.body?.total_required,
        items: Array.isArray(req.body?.items) ? req.body.items : undefined,
      });

      const orderBefore = db
        .prepare('SELECT status FROM sorting_orders WHERE order_no = ?')
        .get(orderNo) as { status: SortingOrderStatus } | undefined;
      if (orderBefore?.status === 'packed_complete') {
        return res.status(409).json({ error: 'Order already packed and closed.' });
      }

      const placement = assignSortingCellForOrder(orderNo);
      const meta = getLogMeta(req);
      const scan = applySortingScan({
        order_no: orderNo,
        item_name: req.body?.item_name,
        qty: req.body?.qty,
        user: req.body?.user || req.auth?.username || 'system',
        request_id: meta.request_id,
      });

      const bundle = getSortingOrderBundle(orderNo);
      res.json({
        success: true,
        placement,
        scan: {
          consumed: scan.consumed,
          overflow: scan.overflow,
        },
        order: bundle?.order ?? null,
        items: bundle?.items ?? [],
        state: buildSortingState(),
      });
    } catch (error: any) {
      console.error('Failed to process sorting scan:', error);
      res.status(500).json({ error: error?.message || 'Failed to process sorting scan.' });
    }
  });

  app.post('/api/sorting/ironing/start', requireSorting, (req: any, res) => {
    try {
      const orderNo = normalizeSortingOrderNo(req.body?.order_no ?? req.body?.orderNo ?? req.body?.scanned_code);
      if (!orderNo) return res.status(400).json({ error: 'Order number is required.' });

      const meta = getLogMeta(req);
      const event = applySortingIroningStart({
        order_no: orderNo,
        qty: req.body?.qty,
        user: req.body?.user || req.auth?.username || 'system',
        request_id: meta.request_id,
      });

      const bundle = getSortingOrderBundle(orderNo);
      res.json({
        success: true,
        event: {
          consumed: event.consumed,
          overflow: event.overflow,
          ironing_progress: event.ironing_progress,
        },
        order: bundle?.order ?? null,
        items: bundle?.items ?? [],
        state: buildSortingState(),
      });
    } catch (error: any) {
      console.error('Failed to record ironing start:', error);
      const message = String(error?.message || 'Failed to record ironing start.');
      if (
        /must be sorted completely|already ironed|not initialized|no clothes items|no sorted clothes|already packed complete/i.test(message)
      ) {
        return res.status(409).json({ error: message });
      }
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/sorting/blanket/scan', requireSorting, async (req: any, res) => {
    try {
      const orderNo = normalizeSortingOrderNo(req.body?.order_no ?? req.body?.orderNo ?? req.body?.scanned_code);
      if (!orderNo) return res.status(400).json({ error: 'Order number is required.' });

      await ensureSortingOrderInitialized({
        order_no: orderNo,
        allow_unsorted_fallback: false,
      });

      const meta = getLogMeta(req);
      const result = applyBlanketPackingScan({
        order_no: orderNo,
        item_name: req.body?.item_name,
        qty: req.body?.qty,
        user: req.body?.user || req.auth?.username || 'system',
        request_id: meta.request_id,
      });

      return res.json({
        success: true,
        event: {
          consumed: result.consumed,
          overflow: result.overflow,
        },
        order: result.order,
        items: result.items,
        totals: result.totals,
      });
    } catch (error: any) {
      console.error('Failed to process blanket packing scan:', error);
      return res.status(500).json({ error: error?.message || 'Failed to process blanket packing scan.' });
    }
  });

  app.post('/api/sorting/orders/:orderNo/packing', requireSorting, (req: any, res) => {
    try {
      const orderNo = normalizeSortingOrderNo(req.params.orderNo);
      const action = String(req.body?.action ?? '').trim().toLowerCase();
      if (!orderNo) return res.status(400).json({ error: 'Order number is required.' });
      if (action !== 'start' && action !== 'complete') {
        return res.status(400).json({ error: 'Action must be start or complete.' });
      }

      const order = db
        .prepare('SELECT * FROM sorting_orders WHERE order_no = ?')
        .get(orderNo) as SortingOrderRecord | undefined;
      if (!order) return res.status(404).json({ error: 'Sorting order not found.' });

      if (action === 'start') {
        if (order.status === 'packed_complete') {
          return res.status(409).json({ error: 'Order is already packed complete.' });
        }
        const sortedCount = Math.max(0, Number(order.total_sorted) || 0);
        const ironedCount = Math.max(0, Number(order.total_ironed) || 0);
        if (sortedCount <= ironedCount) {
          return res.status(409).json({ error: 'No sorted clothes are available for packing yet.' });
        }
        db.prepare(
          `UPDATE sorting_orders
           SET status = 'packing_in_progress', updated_at = CURRENT_TIMESTAMP
           WHERE order_no = ?`
        ).run(orderNo);
      } else {
        if (order.status !== 'packing_in_progress' && order.status !== 'sorted_complete') {
          return res.status(409).json({ error: 'Order is not in packing stage.' });
        }
        const completeTx = db.transaction(() => {
          db.prepare(
            `UPDATE sorting_orders
             SET status = 'packed_complete',
                 table_id = NULL,
                 row_no = NULL,
                 col_no = NULL,
                 updated_at = CURRENT_TIMESTAMP
             WHERE order_no = ?`
          ).run(orderNo);

          if (order.table_id && order.row_no && order.col_no) {
            db.prepare(
              `UPDATE sorting_cells
               SET active_order_no = NULL, status = 'empty', updated_at = CURRENT_TIMESTAMP
               WHERE table_id = ? AND row_no = ? AND col_no = ?`
            ).run(order.table_id, order.row_no, order.col_no);
          }
        });
        completeTx();
      }

      const bundle = getSortingOrderBundle(orderNo);
      res.json({
        success: true,
        order: bundle?.order ?? null,
        items: bundle?.items ?? [],
        state: buildSortingState(),
      });
    } catch (error: any) {
      console.error('Failed to update packing status:', error);
      res.status(500).json({ error: error?.message || 'Failed to update packing status.' });
    }
  });

  app.get('/api/achievements/ironing', requireSorting, (req: any, res) => {
    try {
      const auth = req.auth as SessionRecord | undefined;
      const scope = String(req.query.scope ?? 'me').trim().toLowerCase();
      const period = String(req.query.period ?? 'today').trim().toLowerCase();
      const requestedUser = String(req.query.user ?? '').trim();
      const canViewAll = Boolean(auth?.role && (isOperationsManagerRole(auth.role) || isAdminRole(auth.role)));
      const effectiveScope = scope === 'all' && canViewAll ? 'all' : 'me';

      let sinceExpr = "datetime('now', 'localtime', 'start of day')";
      if (period === 'week') sinceExpr = "datetime('now', 'localtime', '-6 days', 'start of day')";
      if (period === 'month') sinceExpr = "datetime('now', 'localtime', '-29 days', 'start of day')";

      const targetUser = effectiveScope === 'all' ? (requestedUser || '') : String(auth?.username ?? '').trim();
      const whereUser = targetUser ? 'AND user = ?' : '';
      const params = targetUser ? [targetUser] : [];

      const summary = db
        .prepare(
          `SELECT
             COALESCE(SUM(qty), 0) AS total_pieces,
             COUNT(*) AS total_starts,
             COUNT(DISTINCT order_no) AS unique_orders
           FROM sorting_ironing_events
           WHERE datetime(timestamp) >= ${sinceExpr}
           ${whereUser}`
        )
        .get(...params) as { total_pieces: number; total_starts: number; unique_orders: number };

      const byUser = db
        .prepare(
          `SELECT user, COALESCE(SUM(qty), 0) AS total_pieces, COUNT(*) AS total_starts, COUNT(DISTINCT order_no) AS unique_orders
           FROM sorting_ironing_events
           WHERE datetime(timestamp) >= ${sinceExpr}
           ${whereUser}
           GROUP BY user
           ORDER BY total_pieces DESC, total_starts DESC, user ASC`
        )
        .all(...params) as Array<{ user: string; total_pieces: number; total_starts: number; unique_orders: number }>;

      const recent = db
        .prepare(
          `SELECT id, order_no, item_name, qty, user, request_id, timestamp
           FROM sorting_ironing_events
           WHERE datetime(timestamp) >= ${sinceExpr}
           ${whereUser}
           ORDER BY datetime(timestamp) DESC, id DESC
           LIMIT 80`
        )
        .all(...params) as SortingIroningEventRecord[];

      res.json({
        scope: effectiveScope,
        period,
        viewer: auth?.username ?? null,
        summary: {
          total_pieces: Number(summary?.total_pieces ?? 0),
          total_starts: Number(summary?.total_starts ?? 0),
          unique_orders: Number(summary?.unique_orders ?? 0),
        },
        by_user: byUser,
        recent,
      });
    } catch (error: any) {
      console.error('Failed to load ironing achievements:', error);
      res.status(500).json({ error: error?.message || 'Failed to load ironing achievements.' });
    }
  });

  // ------------------------------
  // Customer-site public API
  // ------------------------------
  app.post('/api/customer/auth/otp/send', async (req, res) => {
    try {
      pruneCustomerOtpStores();

      const purpose = parseCustomerOtpPurpose(req.body?.purpose);
      const channel = parseCustomerOtpChannel(req.body?.channel);
      const phoneNormalized = normalizeCustomerPhone(req.body?.phone);
      if (!purpose) {
        return res.status(400).json({ error: 'OTP purpose is required (register or login).' });
      }
      if (!phoneNormalized) {
        return res.status(400).json({ error: 'Valid phone number is required.' });
      }

      const existingAccount = findCustomerByPhoneNormalized(phoneNormalized);
      if (purpose === 'register' && existingAccount) {
        return res.status(409).json({ error: 'Account already exists for this phone.' });
      }
      if (purpose === 'login') {
        if (!existingAccount) return res.status(404).json({ error: 'No account found for this phone.' });
        if (Number(existingAccount.is_active ?? 1) === 0) {
          return res.status(403).json({ error: 'This account is inactive.' });
        }
      }

      const phoneE164 = toCustomerPhoneE164(phoneNormalized);
      if (!phoneE164) {
        return res.status(400).json({ error: 'Unable to normalize phone number.' });
      }

      const now = Date.now();
      const key = getOtpPhonePurposeKey(phoneNormalized, purpose);
      const existingChallengeId = customerOtpChallengeByPhonePurpose.get(key);
      if (existingChallengeId) {
        const existingChallenge = customerOtpChallengeStore.get(existingChallengeId);
        if (existingChallenge && existingChallenge.cooldown_until > now) {
          return res.status(429).json({
            error: 'Please wait before requesting another code.',
            retry_after_ms: existingChallenge.cooldown_until - now,
          });
        }
      }

      const challengeId = randomUUID();
      let provider: CustomerOtpChallengeRecord['provider'] = 'mock';
      let devCode: string | undefined;
      let codeHash: string | null = null;

      if (CUSTOMER_SMS_PROVIDER === 'twilio') {
        if (channel !== 'sms') {
          return res.status(400).json({ error: 'Selected OTP channel is not supported by current provider.' });
        }
        if (!isTwilioVerifyEnabled()) {
          return res.status(500).json({ error: 'Twilio SMS is not configured. Set TWILIO_* env vars.' });
        }
        await sendOtpViaTwilioVerify(phoneE164);
        provider = 'twilio';
      } else if (CUSTOMER_SMS_PROVIDER === 'aipsoft') {
        if (!isAipsoftSmsEnabled()) {
          return res.status(500).json({ error: 'AIPSoft SMS is not configured. Set AIPSOFT_SMS_SECRET and AIPSOFT_SMS_URL.' });
        }
        await sendOtpViaAipsoft(phoneNormalized, phoneE164, channel);
        provider = 'aipsoft';
      } else {
        devCode = String(randomInt(0, 1_000_000)).padStart(6, '0');
        codeHash = hashCustomerPassword(devCode);
        console.log(`[OTP:DEV] ${purpose} channel=${channel} phone=${phoneNormalized} code=${devCode}`);
        provider = 'mock';
      }

      const challenge: CustomerOtpChallengeRecord = {
        id: challengeId,
        phone_normalized: phoneNormalized,
        phone_e164: phoneE164,
        purpose,
        channel,
        provider,
        code_hash: codeHash,
        expires_at: now + CUSTOMER_OTP_CODE_TTL_MS,
        attempts: 0,
        cooldown_until: now + CUSTOMER_OTP_SEND_COOLDOWN_MS,
      };

      customerOtpChallengeStore.set(challengeId, challenge);
      customerOtpChallengeByPhonePurpose.set(key, challengeId);

      res.json({
        challengeId,
        expires_at: challenge.expires_at,
        cooldown_until: challenge.cooldown_until,
        provider: challenge.provider,
        channel: challenge.channel,
        ...(process.env.NODE_ENV !== 'production' && challenge.provider === 'mock' && devCode ? { dev_code: devCode } : {}),
      });
    } catch (error: any) {
      console.error('Failed to send customer OTP:', error);
      if (error instanceof OtpProviderError) {
        return res.status(error.status).json({
          error: error.message,
          code: error.code,
        });
      }
      res.status(500).json({ error: error?.message || 'Failed to send verification code' });
    }
  });

  app.post('/api/customer/auth/otp/verify', async (req, res) => {
    try {
      pruneCustomerOtpStores();

      const challengeId = String(req.body?.challengeId ?? '').trim();
      const code = String(req.body?.code ?? '').replace(/\D/g, '');
      if (!challengeId || code.length < 4) {
        return res.status(400).json({ error: 'challengeId and code are required.' });
      }

      const challenge = customerOtpChallengeStore.get(challengeId);
      if (!challenge) {
        return res.status(400).json({ error: 'Verification challenge expired or invalid.' });
      }

      if (challenge.expires_at <= Date.now()) {
        customerOtpChallengeStore.delete(challengeId);
        const key = getOtpPhonePurposeKey(challenge.phone_normalized, challenge.purpose);
        if (customerOtpChallengeByPhonePurpose.get(key) === challengeId) {
          customerOtpChallengeByPhonePurpose.delete(key);
        }
        return res.status(400).json({ error: 'Verification code has expired.' });
      }

      if (challenge.attempts >= CUSTOMER_OTP_MAX_VERIFY_ATTEMPTS) {
        return res.status(429).json({ error: 'Too many invalid attempts. Request a new code.' });
      }

      let verified = false;
      if (challenge.provider === 'twilio') {
        verified = await verifyOtpViaTwilioVerify(challenge.phone_e164, code);
      } else if (challenge.provider === 'aipsoft') {
        verified = await verifyOtpViaAipsoft(code);
      } else if (challenge.code_hash) {
        verified = verifyCustomerPassword(code, challenge.code_hash);
      }

      if (!verified) {
        challenge.attempts += 1;
        customerOtpChallengeStore.set(challengeId, challenge);
        return res.status(400).json({ error: 'Invalid verification code.' });
      }

      customerOtpChallengeStore.delete(challengeId);
      const key = getOtpPhonePurposeKey(challenge.phone_normalized, challenge.purpose);
      if (customerOtpChallengeByPhonePurpose.get(key) === challengeId) {
        customerOtpChallengeByPhonePurpose.delete(key);
      }

      const verificationToken = randomUUID();
      const verification: CustomerOtpVerificationRecord = {
        token: verificationToken,
        phone_normalized: challenge.phone_normalized,
        purpose: challenge.purpose,
        expires_at: Date.now() + CUSTOMER_OTP_VERIFICATION_TTL_MS,
        consumed: false,
      };
      customerOtpVerificationStore.set(verificationToken, verification);

      res.json({
        verified: true,
        verificationToken,
        expires_at: verification.expires_at,
      });
    } catch (error: any) {
      console.error('Failed to verify customer OTP:', error);
      if (error instanceof OtpProviderError) {
        return res.status(error.status).json({
          error: error.message,
          code: error.code,
        });
      }
      res.status(500).json({ error: error?.message || 'Failed to verify code' });
    }
  });

  app.post('/api/customer/auth/register', (req, res) => {
    try {
      const name = String(req.body?.name ?? '').trim();
      const rawPhone = String(req.body?.phone ?? '').trim();
      const rawEmail = String(req.body?.email ?? '').trim();
      const password = String(req.body?.password ?? '');
      const verificationToken = String(req.body?.verificationToken ?? '').trim();
      const customerType = String(req.body?.type ?? 'individual').trim() || 'individual';
      const area = String(req.body?.area ?? '').trim();
      const notifType = String(req.body?.notifType ?? 'whatsapp').trim() || 'whatsapp';
      const prefService = Math.max(1, Number(req.body?.prefService ?? 1) || 1);
      const registerWithOtp = verificationToken.length > 0;

      if (!name) return res.status(400).json({ error: 'Name is required.' });
      if (registerWithOtp && password.length > 0 && password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters when provided.' });
      }
      if (!registerWithOtp && password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
      }

      const phoneNormalized = normalizeCustomerPhone(rawPhone);
      const emailNormalized = normalizeCustomerEmail(rawEmail);
      if (registerWithOtp) {
        if (!phoneNormalized) {
          return res.status(400).json({ error: 'Phone is required for OTP registration.' });
        }
        const otpOk = consumeCustomerOtpVerificationToken(verificationToken, phoneNormalized, 'register');
        if (!otpOk) {
          return res.status(401).json({ error: 'Verification token is invalid or expired.' });
        }
      } else if (!phoneNormalized && !emailNormalized) {
        return res.status(400).json({ error: 'Phone or email is required.' });
      }

      if (phoneNormalized) {
        const exists = db
          .prepare('SELECT id FROM customer_users WHERE phone_normalized = ?')
          .get(phoneNormalized) as { id: string } | undefined;
        if (exists) return res.status(409).json({ error: 'Account already exists for this phone.' });
      }

      if (emailNormalized) {
        const exists = db
          .prepare('SELECT id FROM customer_users WHERE email_normalized = ?')
          .get(emailNormalized) as { id: string } | undefined;
        if (exists) return res.status(409).json({ error: 'Account already exists for this email.' });
      }

      const userId = randomUUID();
      const now = new Date().toISOString();
      const passwordHash = hashCustomerPassword(password.length >= 6 ? password : randomUUID());

      db.prepare(
        `INSERT INTO customer_users (
          id, name, phone, phone_normalized, email, email_normalized, password_hash,
          customer_type, area, pref_service, notif_type, is_active, created_at, updated_at, last_login_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`
      ).run(
        userId,
        name,
        rawPhone || null,
        phoneNormalized,
        rawEmail || null,
        emailNormalized,
        passwordHash,
        customerType,
        area || null,
        prefService,
        notifType,
        now,
        now,
        now
      );

      const user = db.prepare('SELECT * FROM customer_users WHERE id = ?').get(userId) as CustomerUserRecord | undefined;
      if (!user) return res.status(500).json({ error: 'Failed to create account.' });

      const session = issueCustomerSession(user.id);
      res.status(201).json({
        user: normalizeCustomerUser(user),
        token: session.token,
        expires_at: session.expires_at,
      });
    } catch (error: any) {
      console.error('Failed to register customer:', error);
      res.status(500).json({ error: error?.message || 'Failed to create customer account' });
    }
  });

  app.post('/api/customer/auth/login', (req, res) => {
    try {
      const identifier = String(req.body?.identifier ?? '').trim();
      const password = String(req.body?.password ?? '');
      if (!identifier || !password) {
        return res.status(400).json({ error: 'Identifier and password are required.' });
      }

      const emailNormalized = normalizeCustomerEmail(identifier);
      const phoneNormalized = normalizeCustomerPhone(identifier);

      let user: CustomerUserRecord | undefined;
      if (emailNormalized) {
        user = db
          .prepare('SELECT * FROM customer_users WHERE email_normalized = ?')
          .get(emailNormalized) as CustomerUserRecord | undefined;
      } else if (phoneNormalized) {
        user = db
          .prepare('SELECT * FROM customer_users WHERE phone_normalized = ?')
          .get(phoneNormalized) as CustomerUserRecord | undefined;
      }

      if (!user) {
        user = db
          .prepare('SELECT * FROM customer_users WHERE lower(trim(coalesce(email, \'\'))) = lower(trim(?)) OR trim(coalesce(phone, \'\')) = trim(?)')
          .get(identifier, identifier) as CustomerUserRecord | undefined;
      }

      if (!user || !verifyCustomerPassword(password, user.password_hash)) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      if (Number(user.is_active ?? 1) === 0) {
        return res.status(403).json({ error: 'This account is inactive.' });
      }

      const now = new Date().toISOString();
      db.prepare('UPDATE customer_users SET last_login_at = ?, updated_at = ? WHERE id = ?').run(now, now, user.id);

      const refreshedUser = db.prepare('SELECT * FROM customer_users WHERE id = ?').get(user.id) as CustomerUserRecord | undefined;
      if (!refreshedUser) return res.status(500).json({ error: 'Failed to load account.' });

      const session = issueCustomerSession(refreshedUser.id);
      res.json({
        user: normalizeCustomerUser(refreshedUser),
        token: session.token,
        expires_at: session.expires_at,
      });
    } catch (error: any) {
      console.error('Failed to login customer:', error);
      res.status(500).json({ error: error?.message || 'Failed to login customer' });
    }
  });

  app.post('/api/customer/auth/login-otp', (req, res) => {
    try {
      pruneCustomerOtpStores();

      const phoneNormalized = normalizeCustomerPhone(req.body?.phone);
      const verificationToken = String(req.body?.verificationToken ?? '').trim();
      if (!phoneNormalized || !verificationToken) {
        return res.status(400).json({ error: 'Phone and verification token are required.' });
      }

      const otpOk = consumeCustomerOtpVerificationToken(verificationToken, phoneNormalized, 'login');
      if (!otpOk) {
        return res.status(401).json({ error: 'Verification token is invalid or expired.' });
      }

      const user = findCustomerByPhoneNormalized(phoneNormalized);
      if (!user) return res.status(404).json({ error: 'No account found for this phone.' });
      if (Number(user.is_active ?? 1) === 0) {
        return res.status(403).json({ error: 'This account is inactive.' });
      }

      const now = new Date().toISOString();
      db.prepare('UPDATE customer_users SET last_login_at = ?, updated_at = ? WHERE id = ?').run(now, now, user.id);
      const refreshedUser = db.prepare('SELECT * FROM customer_users WHERE id = ?').get(user.id) as CustomerUserRecord | undefined;
      if (!refreshedUser) return res.status(500).json({ error: 'Failed to load account.' });

      const session = issueCustomerSession(refreshedUser.id);
      res.json({
        user: normalizeCustomerUser(refreshedUser),
        token: session.token,
        expires_at: session.expires_at,
      });
    } catch (error: any) {
      console.error('Failed to login customer with OTP:', error);
      res.status(500).json({ error: error?.message || 'Failed to login with OTP' });
    }
  });

  app.get('/api/customer/auth/session', requireCustomerAuth, (req: any, res) => {
    try {
      const customerAuth = req.customerAuth as CustomerSessionRecord | undefined;
      if (!customerAuth) return res.status(401).json({ error: 'Authentication required.' });

      const user = db
        .prepare('SELECT * FROM customer_users WHERE id = ?')
        .get(customerAuth.user_id) as CustomerUserRecord | undefined;

      if (!user || Number(user.is_active ?? 1) === 0) {
        deleteCustomerSession(customerAuth.token);
        return res.status(401).json({ error: 'Session expired.' });
      }

      res.json(normalizeCustomerUser(user));
    } catch (error: any) {
      console.error('Failed to fetch customer session:', error);
      res.status(500).json({ error: error?.message || 'Failed to fetch customer session' });
    }
  });

  app.post('/api/customer/auth/logout', requireCustomerAuth, (req: any, res) => {
    const customerAuth = req.customerAuth as CustomerSessionRecord | undefined;
    if (customerAuth?.token) deleteCustomerSession(customerAuth.token);
    res.json({ success: true });
  });

  app.post('/api/customer/driver/auth/login', (req, res) => {
    try {
      const driverId = String(req.body?.driverId ?? '').trim();
      const phoneInput = normalizeDriverPhone(req.body?.phone ?? '');

      if (!driverId || !phoneInput) {
        return res.status(400).json({ error: 'Driver ID and phone are required.' });
      }

      const drivers = getConfiguredDrivers();
      const driver = drivers.find((entry) => entry.id === driverId);
      if (!driver) return res.status(401).json({ error: 'Invalid driver credentials.' });

      if (!driver.phone || driver.phone !== phoneInput) {
        return res.status(401).json({ error: 'Invalid driver credentials.' });
      }

      const session = issueDriverSession(driver);
      res.json({
        driver: {
          id: driver.id,
          name: driver.name,
          phone: driver.phone,
        },
        token: session.token,
        expires_at: session.expires_at,
      });
    } catch (error: any) {
      console.error('Failed to login driver:', error);
      res.status(500).json({ error: error?.message || 'Failed to login driver' });
    }
  });

  app.get('/api/customer/driver/auth/session', requireDriverAuth, (req: any, res) => {
    const driverAuth = req.driverAuth as DriverSessionRecord | undefined;
    if (!driverAuth) return res.status(401).json({ error: 'Driver authentication required.' });

    const drivers = getConfiguredDrivers();
    const current = drivers.find((driver) => driver.id === driverAuth.driver_id);
    if (!current) {
      deleteDriverSession(driverAuth.token);
      return res.status(401).json({ error: 'Driver session expired.' });
    }

    res.json({
      id: current.id,
      name: current.name,
      phone: current.phone,
    });
  });

  app.post('/api/customer/driver/auth/logout', requireDriverAuth, (req: any, res) => {
    const driverAuth = req.driverAuth as DriverSessionRecord | undefined;
    if (driverAuth?.token) deleteDriverSession(driverAuth.token);
    res.json({ success: true });
  });

  app.get('/api/customer/driver/orders', requireDriverAuth, (req: any, res) => {
    try {
      const driverAuth = req.driverAuth as DriverSessionRecord | undefined;
      if (!driverAuth) return res.status(401).json({ error: 'Driver authentication required.' });

      const rows = db
        .prepare('SELECT payload FROM customer_orders ORDER BY datetime(updated_at) DESC, datetime(created_at) DESC, id DESC')
        .all() as { payload: string }[];

      const orders = rows
        .map((row) => {
          try {
            return JSON.parse(row.payload) as Record<string, unknown>;
          } catch {
            return null;
          }
        })
        .filter(Boolean)
        .filter((order) => {
          const assigned = String(order?.assignedDriverId ?? '').trim();
          const status = normalizeCustomerOrderStatus(order?.status);
          const isMine = assigned === driverAuth.driver_id;
          const isPickupPool = !assigned && status === 'new';
          const isReadyPool = (!assigned || assigned === driverAuth.driver_id) && status === 'ready';
          return isMine || isPickupPool || isReadyPool;
        });

      res.json(orders);
    } catch (error: any) {
      console.error('Failed to fetch driver orders:', error);
      res.status(500).json({ error: error?.message || 'Failed to fetch driver orders' });
    }
  });

  app.put('/api/customer/driver/orders/:id/status', requireDriverAuth, (req: any, res) => {
    try {
      const driverAuth = req.driverAuth as DriverSessionRecord | undefined;
      if (!driverAuth) return res.status(401).json({ error: 'Driver authentication required.' });

      const id = String(req.params.id ?? '').trim();
      if (!id) return res.status(400).json({ error: 'Order id is required.' });

      const requestedStatus = normalizeCustomerOrderStatus(req.body?.status);
      const row = db.prepare('SELECT payload FROM customer_orders WHERE id = ?').get(id) as { payload: string } | undefined;
      if (!row) return res.status(404).json({ error: 'Order not found.' });

      const payload = JSON.parse(row.payload) as Record<string, unknown>;
      const assignedDriverId = String(payload.assignedDriverId ?? '').trim();
      const currentStatus = normalizeCustomerOrderStatus(payload.status);

      if (assignedDriverId && assignedDriverId !== driverAuth.driver_id) {
        return res.status(403).json({ error: 'This order is assigned to another driver.' });
      }

      const allowedStatuses = new Set(['accepted', 'on_the_way', 'pickup', 'delivery', 'delivered', 'completed']);
      if (!allowedStatuses.has(requestedStatus)) {
        return res.status(400).json({ error: `Status "${requestedStatus}" is not allowed for drivers.` });
      }

      const shouldAutoAssign = !assignedDriverId && (currentStatus === 'new' || currentStatus === 'ready');
      const nextPayload = {
        ...payload,
        status: requestedStatus,
        assignedDriverId: shouldAutoAssign ? driverAuth.driver_id : (assignedDriverId || driverAuth.driver_id),
      };

      db.prepare(
        `UPDATE customer_orders
         SET status = ?, payload = ?, updated_at = ?
         WHERE id = ?`
      ).run(requestedStatus, JSON.stringify(nextPayload), new Date().toISOString(), id);

      res.json(nextPayload);
    } catch (error: any) {
      console.error('Failed to update driver order status:', error);
      res.status(500).json({ error: error?.message || 'Failed to update driver order status' });
    }
  });

  app.get('/api/customer/orders', requireCustomerOrAdminAuth, (_req, res) => {
    try {
      const rows = db
        .prepare('SELECT payload FROM customer_orders ORDER BY datetime(updated_at) DESC, datetime(created_at) DESC, id DESC')
        .all() as { payload: string }[];

      const orders = rows
        .map((row) => {
          try {
            return JSON.parse(row.payload);
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      res.json(orders);
    } catch (error: any) {
      console.error('Failed to fetch customer orders:', error);
      res.status(500).json({ error: error?.message || 'Failed to fetch customer orders' });
    }
  });

  app.get('/api/customer/orders/:id', requireCustomerOrAdminAuth, (req, res) => {
    try {
      const id = String(req.params.id ?? '').trim();
      if (!id) return res.status(400).json({ error: 'Order id is required.' });

      const row = db.prepare('SELECT payload FROM customer_orders WHERE id = ?').get(id) as { payload: string } | undefined;
      if (!row) return res.status(404).json({ error: 'Order not found.' });

      res.json(JSON.parse(row.payload));
    } catch (error: any) {
      console.error('Failed to fetch customer order:', error);
      res.status(500).json({ error: error?.message || 'Failed to fetch customer order' });
    }
  });

  app.post('/api/customer/orders', requireCustomerOrAdminAuth, (req, res) => {
    try {
      const order = parseCustomerOrderPayload(req.body);
      if (!order) return res.status(400).json({ error: 'Valid order payload is required.' });

      const now = new Date().toISOString();
      db.prepare(
        `INSERT INTO customer_orders (id, status, payload, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           status = excluded.status,
           payload = excluded.payload,
           updated_at = excluded.updated_at`
      ).run(order.id, order.status, JSON.stringify(order), now, now);

      res.status(201).json(order);
    } catch (error: any) {
      console.error('Failed to create customer order:', error);
      res.status(500).json({ error: error?.message || 'Failed to create customer order' });
    }
  });

  app.put('/api/customer/orders/:id', requireOperationsManager, (req, res) => {
    try {
      const id = String(req.params.id ?? '').trim();
      if (!id) return res.status(400).json({ error: 'Order id is required.' });

      const incoming = parseCustomerOrderPayload({ ...req.body, id });
      if (!incoming) return res.status(400).json({ error: 'Valid order payload is required.' });

      const existing = db.prepare('SELECT id FROM customer_orders WHERE id = ?').get(id) as { id: string } | undefined;
      if (!existing) return res.status(404).json({ error: 'Order not found.' });

      db.prepare(
        `UPDATE customer_orders
         SET status = ?, payload = ?, updated_at = ?
         WHERE id = ?`
      ).run(incoming.status, JSON.stringify(incoming), new Date().toISOString(), id);

      res.json(incoming);
    } catch (error: any) {
      console.error('Failed to update customer order:', error);
      res.status(500).json({ error: error?.message || 'Failed to update customer order' });
    }
  });

  app.put('/api/customer/orders/:id/status', requireOperationsManager, (req, res) => {
    try {
      const id = String(req.params.id ?? '').trim();
      const requestedStatus = normalizeCustomerOrderStatus(req.body?.status);
      if (!id) return res.status(400).json({ error: 'Order id is required.' });

      const row = db.prepare('SELECT payload FROM customer_orders WHERE id = ?').get(id) as { payload: string } | undefined;
      if (!row) return res.status(404).json({ error: 'Order not found.' });

      const payload = JSON.parse(row.payload);
      const nextPayload = {
        ...payload,
        status: requestedStatus,
      };

      db.prepare(
        `UPDATE customer_orders
         SET status = ?, payload = ?, updated_at = ?
         WHERE id = ?`
      ).run(requestedStatus, JSON.stringify(nextPayload), new Date().toISOString(), id);

      res.json(nextPayload);
    } catch (error: any) {
      console.error('Failed to update customer order status:', error);
      res.status(500).json({ error: error?.message || 'Failed to update customer order status' });
    }
  });

  app.get('/api/customer/site-config', (_req, res) => {
    try {
      const row = db.prepare('SELECT payload FROM customer_site_config WHERE id = 1').get() as { payload: string } | undefined;
      if (!row) return res.json(null);
      res.json(JSON.parse(row.payload));
    } catch (error: any) {
      console.error('Failed to fetch customer site config:', error);
      res.status(500).json({ error: error?.message || 'Failed to fetch site config' });
    }
  });

  app.put('/api/customer/site-config', requireOperationsManager, (req, res) => {
    try {
      const payload = req.body;
      if (!payload || typeof payload !== 'object') {
        return res.status(400).json({ error: 'Valid site config payload is required.' });
      }

      db.prepare(
        `INSERT INTO customer_site_config (id, payload, updated_at)
         VALUES (1, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           payload = excluded.payload,
           updated_at = excluded.updated_at`
      ).run(JSON.stringify(payload), new Date().toISOString());

      res.json(payload);
    } catch (error: any) {
      console.error('Failed to update customer site config:', error);
      res.status(500).json({ error: error?.message || 'Failed to update site config' });
    }
  });

  // Legacy/local shortcuts: open hub routes without /smart-storage-hub prefix.
  // Register for both development and production modes.
  const hubLegacyRouteRedirects = new Map<string, string>([
    ['/search', '/smart-storage-hub/search'],
    ['/management', '/smart-storage-hub/management'],
    ['/sorting', '/smart-storage-hub/sorting'],
    ['/achievements', '/smart-storage-hub/achievements'],
  ]);
  for (const [fromPath, toPath] of hubLegacyRouteRedirects.entries()) {
    app.get(fromPath, (_req, res) => {
      res.redirect(302, toPath);
    });
    app.get(`${fromPath}/`, (_req, res) => {
      res.redirect(302, toPath);
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const hubDistPath = path.join(process.cwd(), 'dist-smart-storage-hub');
    const customerDistPath = path.join(process.cwd(), 'apps', 'customer-site', 'dist');

    app.use('/smart-storage-hub', express.static(hubDistPath, { maxAge: '1d' }));
    app.use(express.static(customerDistPath, { maxAge: '1d' }));

    // Smart Storage Hub SPA fallback under /smart-storage-hub/*
    app.get('/smart-storage-hub', (_req, res) => {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.sendFile(path.join(hubDistPath, 'index.html'), (err) => {
        if (err) {
          console.error('Error serving Smart Storage Hub index.html:', err);
          res.status(500).json({ error: 'Failed to load Smart Storage Hub' });
        }
      });
    });

    app.get('/smart-storage-hub/*', (_req, res) => {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.sendFile(path.join(hubDistPath, 'index.html'), (err) => {
        if (err) {
          console.error('Error serving Smart Storage Hub index.html:', err);
          res.status(500).json({ error: 'Failed to load Smart Storage Hub' });
        }
      });
    });

    // Customer site SPA fallback at root.
    app.get('*', (_req, res) => {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.sendFile(path.join(customerDistPath, 'index.html'), (err) => {
        if (err) {
          console.error('Error serving customer site index.html:', err);
          res.status(500).json({ error: 'Failed to load customer site' });
        }
      });
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
    const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
    console.log(`Server running on http://localhost:${PORT} (${mode})`);
    if (mode !== 'production') {
      console.log('DEV mode uses Vite middleware (many module requests are expected in Network tab).');
    }
  });
}

startServer();
