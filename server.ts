import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { existsSync, statSync } from 'fs';
import cors from 'cors';
import Database from 'better-sqlite3';
import { Pool } from 'pg';
import { randomBytes, randomInt, randomUUID, scryptSync, timingSafeEqual } from 'crypto';
import { AsyncLocalStorage } from 'async_hooks';
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
import { createAiOperationsService } from './src/server/ai/aiOperationsService';
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
  branch_id?: number | null;
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
  branch_id: number | null;
  branch_name?: string | null;
};

type BranchRecord = {
  id: number;
  name: string;
  city: string;
  trade_license: string | null;
  phone: string | null;
  address: string | null;
  status: 'active' | 'inactive';
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type SessionRecord = {
  token: string;
  user_id: number;
  username: string;
  role: AppUserRole;
  expires_at: number;
  auth_provider?: 'local' | 'pos';
  pos_user_id?: string | null;
  pos_branch_id?: string | null;
  pos_currency_id?: string | null;
};

type PosStaffSessionRecord = {
  token: string;
  username: string;
  display_name: string;
  user_type_name: string;
  pos_user_id: string;
  branch_id: string;
  branch_code: string;
  currency_id: string;
  client_identifier: string;
  cookie_header: string;
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
  provider: 'twilio' | 'aipsoft' | 'meta_whatsapp' | 'mock';
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
  raw_search_text: string;
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
  remark: string;
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
    customer_outstanding_balance: number;
    customer_ledger_balance: number;
    customer_credit_limit: number;
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
  phone_normalized: string;
  pos_status: PosSortingMeta['pos_order_status'] | '';
  order_date: string;
  delivery_date: string;
  customer_address: string;
  remark: string;
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
    store_rows?: number;
    store_columns?: number;
    store_type?: string;
    status: string;
    created_at: string | null;
  }>;
  pos_error?: string;
  last_alert_status: string | null;
  last_alert_at: string | null;
};

type CustomerAlertPhoneSeverity = 'critical' | 'high' | 'medium' | 'low';

type CustomerAlertPhoneGroup = {
  id: string;
  phone: string;
  display_phone: string;
  customer_names: string[];
  order_count: number;
  stored_piece_count: number;
  delivered_stored_count: number;
  mismatch_count: number;
  oldest_stored_at: string | null;
  severity: CustomerAlertPhoneSeverity;
  alerts: string[];
  orders: CustomerAlertCandidate[];
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
  customer_phone: string | null;
  total_required: number;
  total_sorted: number;
  total_ironed: number;
  status: SortingOrderStatus;
  table_id: number | null;
  row_no: number | null;
  col_no: number | null;
  source_orders_id: string | null;
  source_invoice_id: string | null;
  pos_order_status: string | null;
  pos_payment_status: string | null;
  pos_status_flags: string | null;
  pos_remark: string | null;
  pos_total: number | null;
  pos_paid: number | null;
  pos_balance: number | null;
  pos_order_date: string | null;
  pos_delivery_date: string | null;
  pos_delivery_time: string | null;
  pos_last_synced_at: string | null;
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

type SortingIroningSessionRecord = {
  id: number;
  order_no: string;
  status: 'in_progress' | 'completed' | 'paused';
  worker: string;
  team_members: string | null;
  started_at: string;
  ended_at: string | null;
  pieces_target: number;
  pieces_ironed: number;
  quality_score: number | null;
  notes: string | null;
  request_id: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type BlanketPackingLogRecord = {
  id: number;
  order_number: string;
  customer_name: string | null;
  customer_phone: string | null;
  blanket_index: number;
  total_blankets: number;
  action: 'printed' | 'reprinted' | 'packed';
  status: 'not_packed' | 'partially_packed' | 'fully_packed' | 'error';
  printed_at: string | null;
  packed_by: string | null;
  created_at: string | null;
  request_id?: string | null;
};

db.exec(`
  CREATE TABLE IF NOT EXISTS branches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT '',
    trade_license TEXT,
    phone TEXT,
    address TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

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
    cell_height REAL DEFAULT 0.11,
    branch_id INTEGER DEFAULT 1
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

  CREATE TABLE IF NOT EXISTS chat_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel TEXT NOT NULL,
    chat_user_id TEXT NOT NULL,
    chat_phone TEXT,
    display_name TEXT,
    smart_hub_user_id INTEGER,
    pos_user_id TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(channel, chat_user_id)
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel TEXT NOT NULL,
    chat_user_id TEXT NOT NULL,
    message_id TEXT,
    direction TEXT NOT NULL,
    body TEXT NOT NULL,
    parsed_intent TEXT,
    order_no TEXT,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS chat_pending_confirmations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel TEXT NOT NULL,
    chat_user_id TEXT NOT NULL,
    action_type TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    consumed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_review_batches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel TEXT NOT NULL DEFAULT 'telegram',
    chat_user_id TEXT,
    submitted_by TEXT,
    submitted_text TEXT NOT NULL DEFAULT '',
    duplicate_groups_count INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    processed_orders INTEGER DEFAULT 0,
    failed_orders INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'created',
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
  );

  CREATE TABLE IF NOT EXISTS order_review_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id INTEGER NOT NULL,
    store_name TEXT NOT NULL,
    order_no TEXT NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    order_status TEXT,
    balance REAL DEFAULT 0,
    remark TEXT,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_review_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel TEXT NOT NULL,
    chat_user_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'collecting',
    current_store_index INTEGER DEFAULT 0,
    store_sequence_json TEXT NOT NULL,
    batch_payload_json TEXT NOT NULL DEFAULT '{}',
    batch_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
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
    customer_phone TEXT,
    total_required INTEGER NOT NULL DEFAULT 0,
    total_sorted INTEGER NOT NULL DEFAULT 0,
    total_ironed INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'sorting_pending',
    table_id INTEGER,
    row_no INTEGER,
    col_no INTEGER,
    source_orders_id TEXT,
    source_invoice_id TEXT,
    pos_order_status TEXT,
    pos_payment_status TEXT,
    pos_status_flags TEXT,
    pos_remark TEXT,
    pos_total REAL DEFAULT 0,
    pos_paid REAL DEFAULT 0,
    pos_balance REAL DEFAULT 0,
    pos_order_date TEXT,
    pos_delivery_date TEXT,
    pos_delivery_time TEXT,
    pos_last_synced_at DATETIME,
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

  CREATE TABLE IF NOT EXISTS sorting_ironing_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_no TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress',
    worker TEXT DEFAULT 'system',
    team_members TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    pieces_target INTEGER NOT NULL DEFAULT 0,
    pieces_ironed INTEGER NOT NULL DEFAULT 0,
    quality_score REAL,
    notes TEXT,
    request_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

  CREATE TABLE IF NOT EXISTS blanket_packing_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    blanket_index INTEGER NOT NULL DEFAULT 0,
    total_blankets INTEGER NOT NULL DEFAULT 0,
    action TEXT NOT NULL DEFAULT 'printed',
    status TEXT NOT NULL DEFAULT 'not_packed',
    printed_at DATETIME,
    packed_by TEXT,
    request_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS report_snapshots (
    report_id TEXT PRIMARY KEY,
    share_token TEXT NOT NULL,
    report_type TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME
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
  CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(channel, chat_user_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_chat_pending_user ON chat_pending_confirmations(channel, chat_user_id, expires_at, consumed_at);
  CREATE INDEX IF NOT EXISTS idx_order_review_sessions_user ON order_review_sessions(channel, chat_user_id, status, updated_at);
  CREATE INDEX IF NOT EXISTS idx_order_review_items_batch ON order_review_items(batch_id, customer_phone);
  CREATE INDEX IF NOT EXISTS idx_sorting_cells_table ON sorting_cells(table_id, row_no, col_no);
  CREATE INDEX IF NOT EXISTS idx_sorting_cells_table_active ON sorting_cells(table_id, active_order_no);
  CREATE INDEX IF NOT EXISTS idx_sorting_orders_status ON sorting_orders(status, updated_at);
  CREATE INDEX IF NOT EXISTS idx_sorting_orders_updated_created ON sorting_orders(updated_at DESC, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_sorting_items_order_id ON sorting_items(order_no, id);
  CREATE INDEX IF NOT EXISTS idx_sorting_scans_order_no ON sorting_scans(order_no, timestamp);
  CREATE INDEX IF NOT EXISTS idx_sorting_ironing_events_order_no ON sorting_ironing_events(order_no, timestamp);
  CREATE INDEX IF NOT EXISTS idx_sorting_ironing_events_user ON sorting_ironing_events(user, timestamp);
  CREATE INDEX IF NOT EXISTS idx_sorting_ironing_sessions_order_no ON sorting_ironing_sessions(order_no, started_at);
  CREATE INDEX IF NOT EXISTS idx_sorting_ironing_sessions_worker ON sorting_ironing_sessions(worker, started_at);
  CREATE INDEX IF NOT EXISTS idx_sorting_ironing_sessions_status ON sorting_ironing_sessions(status, updated_at);
  CREATE INDEX IF NOT EXISTS idx_sorting_blanket_events_order_no ON sorting_blanket_packing_events(order_no, timestamp);
  CREATE INDEX IF NOT EXISTS idx_sorting_blanket_events_user ON sorting_blanket_packing_events(user, timestamp);
  CREATE INDEX IF NOT EXISTS idx_blanket_packing_logs_order_no ON blanket_packing_logs(order_number, created_at);
  CREATE INDEX IF NOT EXISTS idx_blanket_packing_logs_action ON blanket_packing_logs(action, created_at);
  CREATE INDEX IF NOT EXISTS idx_report_snapshots_type_created ON report_snapshots(report_type, created_at);
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
ensureColumn('stores', 'branch_id', 'INTEGER DEFAULT 1');

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
ensureColumn('users', 'branch_id', 'INTEGER DEFAULT 1');

const ensureDefaultSqliteBranch = () => {
  const existing = db.prepare('SELECT id FROM branches ORDER BY id ASC LIMIT 1').get() as { id: number } | undefined;
  if (!existing) {
    db.prepare(
      `INSERT INTO branches (id, name, city, trade_license, phone, address, status, notes, created_at, updated_at)
       VALUES (1, ?, ?, ?, ?, ?, 'active', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    ).run('فرع الفلاح', 'أبوظبي', '', '', 'Al Falah, Abu Dhabi', 'Default branch for existing storage and orders.');
  }
  db.prepare('UPDATE stores SET branch_id = 1 WHERE branch_id IS NULL OR branch_id <= 0').run();
  db.prepare('UPDATE users SET branch_id = 1 WHERE branch_id IS NULL OR branch_id <= 0').run();
};

ensureDefaultSqliteBranch();

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
ensureColumn('app_sessions', 'auth_provider', "TEXT DEFAULT 'local'");
ensureColumn('app_sessions', 'pos_user_id', 'TEXT');
ensureColumn('app_sessions', 'pos_branch_id', 'TEXT');
ensureColumn('app_sessions', 'pos_currency_id', 'TEXT');
ensureColumn('chat_users', 'chat_phone', 'TEXT');
ensureColumn('chat_users', 'display_name', 'TEXT');
ensureColumn('chat_users', 'smart_hub_user_id', 'INTEGER');
ensureColumn('chat_users', 'pos_user_id', 'TEXT');
ensureColumn('chat_users', 'pos_username', 'TEXT');
ensureColumn('chat_users', 'pos_display_name', 'TEXT');
ensureColumn('chat_users', 'pos_branch_id', 'TEXT');
ensureColumn('chat_users', 'pos_branch_code', 'TEXT');
ensureColumn('chat_users', 'is_active', 'INTEGER DEFAULT 1');
ensureColumn('chat_users', 'created_at', 'DATETIME');
ensureColumn('chat_users', 'updated_at', 'DATETIME');
ensureColumn('chat_users', 'linked_at', 'DATETIME');
ensureColumn('order_review_batches', 'channel', "TEXT DEFAULT 'telegram'");
ensureColumn('order_review_batches', 'chat_user_id', 'TEXT');
ensureColumn('order_review_batches', 'submitted_by', 'TEXT');
ensureColumn('order_review_batches', 'submitted_text', "TEXT DEFAULT ''");
ensureColumn('order_review_batches', 'duplicate_groups_count', 'INTEGER DEFAULT 0');
ensureColumn('order_review_batches', 'total_orders', 'INTEGER DEFAULT 0');
ensureColumn('order_review_batches', 'processed_orders', 'INTEGER DEFAULT 0');
ensureColumn('order_review_batches', 'failed_orders', 'INTEGER DEFAULT 0');
ensureColumn('order_review_batches', 'status', "TEXT DEFAULT 'created'");
ensureColumn('order_review_batches', 'error_message', 'TEXT');
ensureColumn('order_review_batches', 'created_at', 'DATETIME');
ensureColumn('order_review_batches', 'completed_at', 'DATETIME');
ensureColumn('order_review_items', 'batch_id', 'INTEGER DEFAULT 0');
ensureColumn('order_review_items', 'store_name', "TEXT DEFAULT ''");
ensureColumn('order_review_items', 'order_no', "TEXT DEFAULT ''");
ensureColumn('order_review_items', 'customer_name', 'TEXT');
ensureColumn('order_review_items', 'customer_phone', 'TEXT');
ensureColumn('order_review_items', 'order_status', 'TEXT');
ensureColumn('order_review_items', 'balance', 'REAL DEFAULT 0');
ensureColumn('order_review_items', 'remark', 'TEXT');
ensureColumn('order_review_items', 'error_message', 'TEXT');
ensureColumn('order_review_items', 'created_at', 'DATETIME');
ensureColumn('order_review_sessions', 'channel', "TEXT DEFAULT 'telegram'");
ensureColumn('order_review_sessions', 'chat_user_id', "TEXT DEFAULT ''");
ensureColumn('order_review_sessions', 'status', "TEXT DEFAULT 'collecting'");
ensureColumn('order_review_sessions', 'current_store_index', 'INTEGER DEFAULT 0');
ensureColumn('order_review_sessions', 'store_sequence_json', "TEXT DEFAULT '[]'");
ensureColumn('order_review_sessions', 'batch_payload_json', "TEXT DEFAULT '{}'");
ensureColumn('order_review_sessions', 'batch_id', 'INTEGER');
ensureColumn('order_review_sessions', 'created_at', 'DATETIME');
ensureColumn('order_review_sessions', 'updated_at', 'DATETIME');
ensureColumn('order_review_sessions', 'completed_at', 'DATETIME');

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
ensureColumn('sorting_orders', 'customer_phone', 'TEXT');
ensureColumn('sorting_orders', 'total_required', 'INTEGER DEFAULT 0');
ensureColumn('sorting_orders', 'total_sorted', 'INTEGER DEFAULT 0');
ensureColumn('sorting_orders', 'total_ironed', 'INTEGER DEFAULT 0');
ensureColumn('sorting_orders', 'status', "TEXT DEFAULT 'sorting_pending'");
ensureColumn('sorting_orders', 'table_id', 'INTEGER');
ensureColumn('sorting_orders', 'row_no', 'INTEGER');
ensureColumn('sorting_orders', 'col_no', 'INTEGER');
ensureColumn('sorting_orders', 'source_orders_id', 'TEXT');
ensureColumn('sorting_orders', 'source_invoice_id', 'TEXT');
ensureColumn('sorting_orders', 'pos_order_status', 'TEXT');
ensureColumn('sorting_orders', 'pos_payment_status', 'TEXT');
ensureColumn('sorting_orders', 'pos_status_flags', 'TEXT');
ensureColumn('sorting_orders', 'pos_remark', 'TEXT');
ensureColumn('sorting_orders', 'pos_total', 'REAL DEFAULT 0');
ensureColumn('sorting_orders', 'pos_paid', 'REAL DEFAULT 0');
ensureColumn('sorting_orders', 'pos_balance', 'REAL DEFAULT 0');
ensureColumn('sorting_orders', 'pos_order_date', 'TEXT');
ensureColumn('sorting_orders', 'pos_delivery_date', 'TEXT');
ensureColumn('sorting_orders', 'pos_delivery_time', 'TEXT');
ensureColumn('sorting_orders', 'pos_last_synced_at', 'DATETIME');
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

ensureColumn('sorting_ironing_sessions', 'order_no', "TEXT DEFAULT ''");
ensureColumn('sorting_ironing_sessions', 'status', "TEXT DEFAULT 'in_progress'");
ensureColumn('sorting_ironing_sessions', 'worker', "TEXT DEFAULT 'system'");
ensureColumn('sorting_ironing_sessions', 'team_members', 'TEXT');
ensureColumn('sorting_ironing_sessions', 'started_at', 'DATETIME');
ensureColumn('sorting_ironing_sessions', 'ended_at', 'DATETIME');
ensureColumn('sorting_ironing_sessions', 'pieces_target', 'INTEGER DEFAULT 0');
ensureColumn('sorting_ironing_sessions', 'pieces_ironed', 'INTEGER DEFAULT 0');
ensureColumn('sorting_ironing_sessions', 'quality_score', 'REAL');
ensureColumn('sorting_ironing_sessions', 'notes', 'TEXT');
ensureColumn('sorting_ironing_sessions', 'request_id', 'TEXT');
ensureColumn('sorting_ironing_sessions', 'created_at', 'DATETIME');
ensureColumn('sorting_ironing_sessions', 'updated_at', 'DATETIME');

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

ensureColumn('blanket_packing_logs', 'order_number', "TEXT DEFAULT ''");
ensureColumn('blanket_packing_logs', 'customer_name', 'TEXT');
ensureColumn('blanket_packing_logs', 'customer_phone', 'TEXT');
ensureColumn('blanket_packing_logs', 'blanket_index', 'INTEGER DEFAULT 0');
ensureColumn('blanket_packing_logs', 'total_blankets', 'INTEGER DEFAULT 0');
ensureColumn('blanket_packing_logs', 'action', "TEXT DEFAULT 'printed'");
ensureColumn('blanket_packing_logs', 'status', "TEXT DEFAULT 'not_packed'");
ensureColumn('blanket_packing_logs', 'printed_at', 'DATETIME');
ensureColumn('blanket_packing_logs', 'packed_by', 'TEXT');
ensureColumn('blanket_packing_logs', 'request_id', 'TEXT');
ensureColumn('blanket_packing_logs', 'created_at', 'DATETIME');

db.prepare(
  'CREATE INDEX IF NOT EXISTS idx_blanket_packing_logs_order_no ON blanket_packing_logs(order_number, created_at)'
).run();
db.prepare(
  'CREATE INDEX IF NOT EXISTS idx_blanket_packing_logs_action ON blanket_packing_logs(action, created_at)'
).run();

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
const CUSTOMER_SMS_PROVIDER =
  RAW_CUSTOMER_SMS_PROVIDER === 'textconnect'
    ? 'aipsoft'
    : ['meta', 'meta_whatsapp', 'whatsapp_cloud', 'meta_cloud'].includes(RAW_CUSTOMER_SMS_PROVIDER)
      ? 'meta_whatsapp'
      : RAW_CUSTOMER_SMS_PROVIDER;
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
const META_WHATSAPP_API_VERSION = String(process.env.META_WHATSAPP_API_VERSION ?? 'v20.0').trim() || 'v20.0';
const META_WHATSAPP_ACCESS_TOKEN = String(process.env.META_WHATSAPP_ACCESS_TOKEN ?? '').trim();
const META_WHATSAPP_PHONE_NUMBER_ID = String(process.env.META_WHATSAPP_PHONE_NUMBER_ID ?? '').trim();
const META_WHATSAPP_OTP_TEMPLATE_NAME = String(process.env.META_WHATSAPP_OTP_TEMPLATE_NAME ?? '').trim();
const META_WHATSAPP_OTP_TEMPLATE_LANGUAGE = String(
  process.env.META_WHATSAPP_OTP_TEMPLATE_LANGUAGE ?? 'en_US'
).trim() || 'en_US';
const META_WHATSAPP_OTP_INCLUDE_BODY_CODE = /^(1|true|yes)$/i.test(
  String(process.env.META_WHATSAPP_OTP_INCLUDE_BODY_CODE ?? '').trim()
);
const META_WHATSAPP_OTP_INCLUDE_BUTTON_CODE = !/^(0|false|no)$/i.test(
  String(process.env.META_WHATSAPP_OTP_INCLUDE_BUTTON_CODE ?? 'true').trim()
);
const META_WHATSAPP_OTP_BUTTON_TYPE = String(process.env.META_WHATSAPP_OTP_BUTTON_TYPE ?? 'url').trim() || 'url';
const META_WHATSAPP_OTP_BUTTON_INDEX = String(process.env.META_WHATSAPP_OTP_BUTTON_INDEX ?? '0').trim() || '0';
const META_WHATSAPP_ALERT_TEMPLATE_NAME = String(process.env.META_WHATSAPP_ALERT_TEMPLATE_NAME ?? '').trim();
const META_WHATSAPP_ALERT_TEMPLATE_LANGUAGE = String(
  process.env.META_WHATSAPP_ALERT_TEMPLATE_LANGUAGE ?? META_WHATSAPP_OTP_TEMPLATE_LANGUAGE
).trim() || META_WHATSAPP_OTP_TEMPLATE_LANGUAGE;
const META_WHATSAPP_DRIVER_PICKUP_TEMPLATE_NAME = String(
  process.env.META_WHATSAPP_DRIVER_PICKUP_TEMPLATE_NAME ?? ''
).trim();
const META_WHATSAPP_DRIVER_PICKUP_TEMPLATE_LANGUAGE = String(
  process.env.META_WHATSAPP_DRIVER_PICKUP_TEMPLATE_LANGUAGE ?? META_WHATSAPP_ALERT_TEMPLATE_LANGUAGE
).trim() || META_WHATSAPP_ALERT_TEMPLATE_LANGUAGE;
const META_WHATSAPP_CUSTOMER_ORDER_CONFIRMATION_TEMPLATE_NAME = String(
  process.env.META_WHATSAPP_CUSTOMER_ORDER_CONFIRMATION_TEMPLATE_NAME ?? ''
).trim();
const META_WHATSAPP_CUSTOMER_ORDER_CONFIRMATION_TEMPLATE_LANGUAGE = String(
  process.env.META_WHATSAPP_CUSTOMER_ORDER_CONFIRMATION_TEMPLATE_LANGUAGE ?? META_WHATSAPP_ALERT_TEMPLATE_LANGUAGE
).trim() || META_WHATSAPP_ALERT_TEMPLATE_LANGUAGE;
const META_WHATSAPP_CUSTOMER_ORDER_STATUS_UPDATE_TEMPLATE_NAME = String(
  process.env.META_WHATSAPP_CUSTOMER_ORDER_STATUS_UPDATE_TEMPLATE_NAME ?? ''
).trim();
const META_WHATSAPP_CUSTOMER_ORDER_STATUS_UPDATE_TEMPLATE_LANGUAGE = String(
  process.env.META_WHATSAPP_CUSTOMER_ORDER_STATUS_UPDATE_TEMPLATE_LANGUAGE ?? META_WHATSAPP_ALERT_TEMPLATE_LANGUAGE
).trim() || META_WHATSAPP_ALERT_TEMPLATE_LANGUAGE;
const RAW_CUSTOMER_ALERT_WHATSAPP_PROVIDER = String(process.env.CUSTOMER_ALERT_WHATSAPP_PROVIDER ?? 'mock')
  .trim()
  .toLowerCase();
const CUSTOMER_ALERT_WHATSAPP_PROVIDER =
  ['meta', 'meta_whatsapp', 'whatsapp_cloud', 'meta_cloud'].includes(RAW_CUSTOMER_ALERT_WHATSAPP_PROVIDER)
    ? 'meta_whatsapp'
    : RAW_CUSTOMER_ALERT_WHATSAPP_PROVIDER;
const AIPSOFT_WHATSAPP_SEND_URL = String(process.env.AIPSOFT_WHATSAPP_SEND_URL ?? '').trim();
const CUSTOMER_ALERT_SEND_TIMEOUT_MS = Math.max(
  3000,
  Math.min(30000, Number(process.env.CUSTOMER_ALERT_SEND_TIMEOUT_MS ?? 15000) || 15000)
);
const TELEGRAM_BOT_TOKEN = String(process.env.TELEGRAM_BOT_TOKEN ?? '').trim();
const TELEGRAM_WEBHOOK_SECRET = String(process.env.TELEGRAM_WEBHOOK_SECRET ?? '').trim();
const POS_BASE_URL = String(process.env.POS_BASE_URL ?? 'https://magnus.aipsoft.com/inout/sales').trim();
const POS_FIND_ORDERS_PATH = String(process.env.POS_FIND_ORDERS_PATH ?? '/findLaundryOrders').trim();
const POS_FIND_ORDER_DETAILS_PATH = String(process.env.POS_FIND_ORDER_DETAILS_PATH ?? '/findOrderDetails').trim();
const POS_SALES_PRINT_ENDPOINT = String(
  process.env.POS_SALES_PRINT_ENDPOINT ?? 'https://beta.aipsoft.com/inout/sales/print'
).trim();
const POS_SAVE_ORDER_PATH = String(process.env.POS_SAVE_ORDER_PATH ?? '/saveOrder').trim();
const POS_GET_PRODUCTS_PATH = String(process.env.POS_GET_PRODUCTS_PATH ?? '/getProducts').trim();
const POS_COUNTER_CASH_REPORT_PATH = String(process.env.POS_COUNTER_CASH_REPORT_PATH ?? '/generate_report').trim();
const REPORT_API_TOKEN = String(process.env.REPORT_API_TOKEN ?? process.env.N8N_REPORT_API_TOKEN ?? '').trim();
const POS_PURCHASE_API_BASE_URL = String(process.env.POS_PURCHASE_API_BASE_URL ?? 'https://beta.aipsoft.com/inout').trim();
const POS_EXPENSES_REFERER = String(
  process.env.POS_EXPENSES_REFERER ?? `${POS_PURCHASE_API_BASE_URL.replace(/\/+$/, '')}/accounts/expenses`
).trim();
const AIPSOFT_API_USER_ID = String(process.env.AIPSOFT_API_USER_ID ?? '').trim();
const AIPSOFT_DEFAULT_PAY_ACCOUNT_ID = String(process.env.AIPSOFT_DEFAULT_PAY_ACCOUNT_ID ?? '').trim();
const POS_DELIVERY_USER_ID = String(
  process.env.POS_DELIVERY_USER_ID ?? AIPSOFT_API_USER_ID ?? '1'
).trim() || '1';
const POS_DELIVERY_CURRENCY_ID = String(process.env.POS_DELIVERY_CURRENCY_ID ?? '2').trim() || '2';
const POS_DELIVERY_VERIFY_AFTER_PROCESS = /^(1|true|yes)$/i.test(
  String(process.env.POS_DELIVERY_VERIFY_AFTER_PROCESS ?? '').trim()
);
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
const POS_CACHE_TTL = 60000; // 1 minute cache
const posSearchCache = new Map<string, { result: any; timestamp: number }>();

let posCookieJar = POS_COOKIE;
let posCookieJarAutoRefreshed = false;
let posRefreshInFlight: Promise<boolean> | null = null;
let posLastRefreshReason = '';
const posStaffSessionStore = new Map<string, PosStaffSessionRecord>();
const posStaffRequestContext = new AsyncLocalStorage<PosStaffSessionRecord>();

const getActivePosStaffSession = () => posStaffRequestContext.getStore() ?? null;

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

const mergeResponseCookies = (baseCookieHeader: string, response: Response) => {
  const getSetCookie = (response.headers as any)?.getSetCookie;
  if (typeof getSetCookie === 'function') {
    const setCookies = getSetCookie.call(response.headers) as string[];
    if (Array.isArray(setCookies) && setCookies.length > 0) {
      return mergeCookieHeaders(baseCookieHeader, setCookies);
    }
  }
  const singleSetCookie = response.headers.get('set-cookie');
  return singleSetCookie ? mergeCookieHeaders(baseCookieHeader, [singleSetCookie]) : baseCookieHeader;
};

const updatePosCookieJarFromResponse = (baseCookieHeader: string, response: Response) => {
  posCookieJar = mergeResponseCookies(baseCookieHeader, response);
};

const hasMinimalPosCookie = (cookieHeader: string) => /ci_session_/i.test(cookieHeader) && /\binout=/i.test(cookieHeader);

const isPosHtmlDocument = (text: string) => {
  const lower = String(text ?? '').toLowerCase();
  return lower.includes('<!doctype') || lower.includes('<html');
};

const isLikelyPosLoginHtml = (text: string) => {
  const lower = String(text ?? '').toLowerCase();
  return (
    lower.includes(':: login') ||
    lower.includes('login/check') ||
    lower.includes('assets/dashboard/css/login.css') ||
    lower.includes('name="password"') ||
    lower.includes("name='password'")
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
    let cookieHeader = '';
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

      const verifyPayload = new URLSearchParams();
      verifyPayload.set('draw', '1');
      verifyPayload.set('start', '0');
      verifyPayload.set('length', '1');
      verifyPayload.set('order[0][column]', '0');
      verifyPayload.set('order[0][dir]', 'desc');
      verifyPayload.set('search[value]', '');
      verifyPayload.set('search[regex]', 'false');
      verifyPayload.set('filterTxt', '');
      verifyPayload.set('job_search_txt', '');
      verifyPayload.set('date', '');
      verifyPayload.set('waiter', '');
      verifyPayload.set('from_date', '');
      verifyPayload.set('from_time', '');
      verifyPayload.set('to_data', '');
      verifyPayload.set('to_time', '');
      verifyPayload.set('paid_status', POS_PAID_STATUS);
      verifyPayload.set('job_status', POS_JOB_STATUS);
      verifyPayload.set('cust_type', POS_CUSTOMER_TYPE);
      verifyPayload.set('del_type', POS_DELIVERY_TYPE);
      verifyPayload.set('pay_type', POS_PAY_TYPE);
      verifyPayload.set('branch_id', POS_BRANCH_ID);
      verifyPayload.set('prevent_depot_selection', POS_PREVENT_DEPOT_SELECTION);
      verifyPayload.set('_', String(Date.now()));

      const verifyResponse = await withTimeout((signal) =>
        fetch(resolvePosEndpoint(), {
          method: 'POST',
          headers: {
            Accept: 'application/json, text/javascript, */*; q=0.01',
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            Origin: resolvePosOrigin(),
            Referer: POS_REFERER || POS_BASE_URL,
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            ...(cookieHeader ? { Cookie: cookieHeader } : {}),
          },
          body: verifyPayload.toString(),
          signal,
        })
      );
      updatePosCookieJarFromResponse(cookieHeader, verifyResponse);
      cookieHeader = String(posCookieJar || cookieHeader).trim();
      const verifyText = await verifyResponse.text().catch(() => '');
      let verifyParsed: any = null;
      try {
        verifyParsed = verifyText ? JSON.parse(verifyText) : null;
      } catch {
        verifyParsed = null;
      }
      if (
        !verifyResponse.ok ||
        !verifyParsed ||
        !Array.isArray(verifyParsed?.data) ||
        isLikelyPosLoginHtml(verifyText) ||
        !hasMinimalPosCookie(cookieHeader)
      ) {
        posLastRefreshReason = `POS auto-refresh login did not create an authorized order-search session (${reason}). Check POS_LOGIN credentials and sales search permission.`;
        return false;
      }

      posCookieJar = cookieHeader;
      posCookieJarAutoRefreshed = true;
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

const authenticatePosStaff = async (usernameInput: unknown, passwordInput: unknown) => {
  const usernameRaw = String(usernameInput ?? '').trim();
  const password = String(passwordInput ?? '');
  if (!usernameRaw || !password) throw new Error('POS username and password are required.');

  const usernameBeforeAt = usernameRaw.includes('@') ? usernameRaw.split('@')[0].trim() : usernameRaw;
  const suppliedClient = usernameRaw.includes('@') ? usernameRaw.split('@')[1]?.trim() : '';
  if (suppliedClient && suppliedClient.toLowerCase() !== POS_LOGIN_CLIENT_IDENTIFIER.toLowerCase()) {
    throw new Error('Invalid POS username or password.');
  }
  const clientIdentifier = POS_LOGIN_CLIENT_IDENTIFIER;
  const usernameVariants = Array.from(
    new Set(
      [
        usernameRaw,
        usernameRaw.toLowerCase(),
        usernameBeforeAt,
        usernameBeforeAt.toLowerCase(),
        `${usernameBeforeAt}@${clientIdentifier}`,
        `${usernameBeforeAt.toLowerCase()}@${clientIdentifier}`,
      ].filter(Boolean)
    )
  );

  const withTimeout = async (request: (signal: AbortSignal) => Promise<Response>) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), POS_REQUEST_TIMEOUT_MS);
    try {
      return await request(controller.signal);
    } finally {
      clearTimeout(timer);
    }
  };

  let cookieHeader = '';
  try {
    const preflight = await withTimeout((signal) =>
      fetch(POS_LOGIN_REFERER, {
        method: 'GET',
        headers: {
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
        signal,
      })
    );
    cookieHeader = mergeResponseCookies(cookieHeader, preflight);
    await preflight.text().catch(() => '');
  } catch {
    // The login POST can still work without preflight cookies.
  }

  let authenticatedUsername = '';
  for (const username of usernameVariants) {
    const payload = new URLSearchParams();
    payload.set('username', username);
    payload.set('password', password);
    payload.set('client_identifier', clientIdentifier);
    payload.set('auto_login', 'null');
    payload.set('connection_path', 'null');

    const response = await withTimeout((signal) =>
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
    cookieHeader = mergeResponseCookies(cookieHeader, response);
    const text = await response.text().catch(() => '');
    let parsed: any = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = null;
    }
    const success =
      response.ok &&
      hasMinimalPosCookie(cookieHeader) &&
      (String(parsed?.message ?? '').toLowerCase().includes('login_success') ||
        String(text).toLowerCase().includes('login_success'));
    if (success) {
      authenticatedUsername = usernameBeforeAt;
      break;
    }
  }

  if (!authenticatedUsername) throw new Error('Invalid POS username or password.');

  const purchaseLoginPayload = new URLSearchParams();
  purchaseLoginPayload.set('username', `${usernameBeforeAt}@${clientIdentifier}`);
  purchaseLoginPayload.set('password', password);
  purchaseLoginPayload.set('device_id', '0');
  const purchaseLoginResponse = await withTimeout((signal) =>
    fetch(resolvePosPurchaseApiEndpoint('/purchase_api/login_action'), {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/javascript, */*; q=0.01',
        Origin: resolvePosOrigin(),
        Referer: `${POS_PURCHASE_API_BASE_URL.replace(/\/+$/, '')}/`,
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: purchaseLoginPayload.toString(),
      signal,
    })
  );
  cookieHeader = mergeResponseCookies(cookieHeader, purchaseLoginResponse);
  const purchaseLoginText = await purchaseLoginResponse.text().catch(() => '');
  let purchaseLogin: any = null;
  try {
    purchaseLogin = purchaseLoginText ? JSON.parse(purchaseLoginText) : null;
  } catch {
    purchaseLogin = null;
  }
  if (!purchaseLoginResponse.ok || Number(purchaseLogin?.status) !== 1 || !purchaseLogin?.data?.user_id) {
    throw new Error(String(purchaseLogin?.message ?? 'POS user details could not be loaded.'));
  }

  const data = purchaseLogin.data;
  const userId = String(data.user_id ?? '').trim();
  const branchId = String(data.branch_id ?? '').trim();
  const currencyId = String(data.currency_id ?? '').trim();
  let canonicalUsername = usernameBeforeAt;
  let displayName = usernameBeforeAt;
  let userTypeName = '';

  try {
    const profilePayload = new URLSearchParams();
    profilePayload.set('client_identifier', clientIdentifier);
    profilePayload.set('branch_id', branchId);
    profilePayload.set('user_id', userId);
    const profileResponse = await withTimeout((signal) =>
      fetch(resolvePosPurchaseApiEndpoint('/pos_api/getDeliveryData'), {
        method: 'POST',
        headers: {
          Accept: 'application/json, text/javascript, */*; q=0.01',
          Origin: resolvePosOrigin(),
          Referer: `${POS_PURCHASE_API_BASE_URL.replace(/\/+$/, '')}/delivery`,
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Cookie: cookieHeader,
        },
        body: profilePayload.toString(),
        signal,
      })
    );
    cookieHeader = mergeResponseCookies(cookieHeader, profileResponse);
    const profileText = await profileResponse.text().catch(() => '');
    const profile = profileText ? JSON.parse(profileText) : null;
    canonicalUsername = String(profile?.data?.username ?? canonicalUsername).trim() || canonicalUsername;
    displayName = String(profile?.data?.acc_name1 ?? profile?.data?.username ?? displayName).trim() || displayName;
    userTypeName = String(profile?.data?.user_type_name ?? '').trim();
  } catch {
    // Login metadata is sufficient when the optional profile request is unavailable.
  }

  return {
    username: usernameBeforeAt,
    pos_username: canonicalUsername,
    display_name: displayName,
    user_type_name: userTypeName,
    pos_user_id: userId,
    branch_id: branchId,
    branch_code: String(data.branch_code ?? '').trim(),
    currency_id: currencyId,
    client_identifier: String(data.oem_identifier ?? clientIdentifier).trim() || clientIdentifier,
    cookie_header: cookieHeader,
  };
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

const resolvePosPurchaseApiEndpoint = (endpointPath: string) => {
  if (!POS_PURCHASE_API_BASE_URL) return '';
  if (/^https?:\/\//i.test(endpointPath)) return endpointPath;
  const base = POS_PURCHASE_API_BASE_URL.endsWith('/') ? POS_PURCHASE_API_BASE_URL : `${POS_PURCHASE_API_BASE_URL}/`;
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
    raw_search_text: row.map((cell) => stripHtml(cell)).filter(Boolean).join(' '),
  };
};

type PosSortingMeta = {
  pos_order_status: 'Delivered' | 'Fully Packed' | 'Partially Packed' | 'Pending' | 'Pending/Unpaid';
  pos_payment_status: 'Paid' | 'Partially Paid' | 'Not Paid';
  pos_status_flags: string;
  pos_remark: string;
  pos_total: number;
  pos_paid: number;
  pos_balance: number;
  pos_order_date: string;
  pos_delivery_date: string;
  pos_delivery_time: string;
};

type PosConnectOrder = {
  order_no: string;
  customer_phone: string;
  customer_name: string;
  order_date: string;
  delivery_date: string;
  delivery_time: string;
  customer_address: string;
  remark: string;
  price: number;
  balance: number;
  customer_outstanding_balance: number;
  customer_ledger_balance: number;
  customer_credit_limit: number;
  order_status: PosSortingMeta['pos_order_status'];
  source_orders_id: string;
  source_invoice_id: string;
};

type PickupSearchLineItem = PosOrderDetailLineItem & {
  category: 'clothes' | 'home_phase2' | 'blanket_phase3';
};

type PickupSearchOrder = PosConnectOrder & {
  line_items: PickupSearchLineItem[];
  blanket_storage: {
    order_no: string;
    qty_in_store: number;
    first_stored_at: string | null;
    store_slots: CustomerAlertCandidate['store_slots'];
  } | null;
  details_error?: string;
};

type PosConnectSearchAttempt = {
  query: string;
  records_total: number;
  records_filtered: number;
  parsed_orders: number;
};

const normalizePosStatusFlags = (preview?: PosOrderPreview | null, details?: PosOrderDetailsResult | null) => {
  const flags = new Set<string>();
  for (const flag of preview?.status_flags ?? []) {
    const normalized = String(flag ?? '').trim().toLowerCase();
    if (normalized) flags.add(normalized);
  }
  const statusText = String(details?.general?.status ?? '').toLowerCase();
  if (statusText.includes('delivered')) flags.add('delivered');
  if (statusText.includes('fully') && statusText.includes('pack')) flags.add('fully_packed');
  if (statusText.includes('partial') && statusText.includes('pack')) flags.add('partially_packed');
  if (statusText.includes('not') && statusText.includes('paid')) flags.add('not_paid_fully');
  if (statusText.includes('unpaid')) flags.add('not_paid_fully');
  if (statusText.includes('full') && statusText.includes('paid')) flags.add('full_paid');
  return Array.from(flags);
};

const normalizePosPaymentStatus = (paid: number, total: number, balance: number): PosSortingMeta['pos_payment_status'] => {
  if (balance <= 0 && (paid > 0 || total <= 0)) return 'Paid';
  if (paid > 0 && balance > 0) return 'Partially Paid';
  return 'Not Paid';
};

const normalizePosOrderStatus = (
  flags: string[],
  paymentStatus: PosSortingMeta['pos_payment_status'],
  balance: number
): PosSortingMeta['pos_order_status'] => {
  const flagSet = new Set(flags.map((flag) => String(flag).toLowerCase()));
  if (flagSet.has('delivered')) return 'Delivered';
  if (flagSet.has('fully_packed')) return 'Fully Packed';
  if (flagSet.has('partially_packed')) return 'Partially Packed';
  if (flagSet.has('not_paid_fully') || paymentStatus !== 'Paid' || balance > 0) return 'Pending/Unpaid';
  return 'Pending';
};

const joinPosRemarks = (...values: unknown[]) => {
  const seen = new Set<string>();
  const parts: string[] = [];
  for (const value of values) {
    const text = String(value ?? '').replace(/\s+/g, ' ').trim();
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    parts.push(text);
  }
  return parts.join(' | ');
};

const buildPosSortingMeta = (
  preview?: PosOrderPreview | null,
  details?: PosOrderDetailsResult | null
): PosSortingMeta => {
  const flags = normalizePosStatusFlags(preview, details);
  const total = normalizePosNumberish(details?.general?.grand_total ?? details?.general?.total_amount ?? preview?.total, 0);
  const paid = normalizePosNumberish(details?.general?.received_amount ?? preview?.paid, 0);
  const balance = normalizePosNumberish(details?.general?.balance ?? preview?.balance, Math.max(0, total - paid));
  const paymentStatus = normalizePosPaymentStatus(paid, total, balance);
  return {
    pos_order_status: normalizePosOrderStatus(flags, paymentStatus, balance),
    pos_payment_status: paymentStatus,
    pos_status_flags: JSON.stringify(flags),
    pos_remark: joinPosRemarks(preview?.notes, details?.general?.invoice_remark1, details?.general?.invoice_remark2),
    pos_total: total,
    pos_paid: paid,
    pos_balance: balance,
    pos_order_date: String(details?.general?.billing_date ?? preview?.invoice_date ?? preview?.created_at ?? '').trim(),
    pos_delivery_date: String(details?.general?.delivery_date ?? '').trim(),
    pos_delivery_time: String(details?.general?.delivery_time ?? '').trim(),
  };
};

const normalizePosConnectPhone = (value: unknown) => String(value ?? '').replace(/\D+/g, '');

const isPosConnectPhoneQuery = (query: string) => normalizePosConnectPhone(query).length >= 5;

const buildPosConnectSearchQueries = (query: string) => {
  const raw = String(query ?? '').trim();
  const queries: string[] = [];
  const add = (value: unknown) => {
    const text = String(value ?? '').trim();
    if (!text) return;
    if (queries.some((item) => item.toLowerCase() === text.toLowerCase())) return;
    queries.push(text);
  };

  add(raw);

  const digits = normalizePosConnectPhone(raw);
  if (digits.length >= 5) {
    add(digits);
    if (digits.startsWith('00') && digits.length > 7) add(digits.slice(2));
    if (digits.startsWith('971') && digits.length >= 12) add(`0${digits.slice(3)}`);
    if (digits.startsWith('0') && digits.length >= 10) {
      add(digits.slice(1));
      add(`971${digits.slice(1)}`);
    }
    if (digits.startsWith('5') && digits.length === 9) {
      add(`0${digits}`);
      add(`971${digits}`);
    }
    if (digits.length > 9) add(digits.slice(-9));
    if (digits.length > 7) add(digits.slice(-7));
  }

  return queries;
};

type PickupBranchReference = {
  key: 'A' | 'M' | 'Z' | 'R';
  branch_id: string;
  branch_aliases: string[];
  invoice_reference: string;
  numeric_reference: string;
};

const PICKUP_BRANCH_REFERENCES: Record<
  PickupBranchReference['key'],
  Omit<PickupBranchReference, 'key' | 'invoice_reference' | 'numeric_reference'>
> = {
  A: { branch_id: '1', branch_aliases: ['ALFALAH'] },
  M: { branch_id: '3', branch_aliases: ['MUSAFFAH', 'MUSSAFAH'] },
  Z: { branch_id: '2', branch_aliases: ['MBZ', 'MOHAMMEDBINZAYED'] },
  R: { branch_id: '4', branch_aliases: ['ALRIYADH', 'RIYADH'] },
};

const normalizePosReference = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

const parsePickupBranchReference = (query: string): PickupBranchReference | null => {
  const normalized = normalizePosReference(query);
  const match = normalized.match(/^([AMZR])(\d{3,10})$/);
  if (!match) return null;

  const key = match[1] as PickupBranchReference['key'];
  const branch = PICKUP_BRANCH_REFERENCES[key];
  return {
    key,
    ...branch,
    invoice_reference: `${key}${match[2]}`,
    numeric_reference: match[2],
  };
};

const getPickupBranchKeyById = (branchId: unknown): PickupBranchReference['key'] | '' => {
  const normalizedBranchId = String(branchId ?? '').trim();
  const match = Object.entries(PICKUP_BRANCH_REFERENCES).find(([, branch]) => branch.branch_id === normalizedBranchId);
  return (match?.[0] as PickupBranchReference['key'] | undefined) ?? '';
};

const posPreviewMatchesBranchReference = (order: PosOrderPreview, reference: PickupBranchReference) => {
  const values = [
    order.invoice_no,
    order.order_no,
    order.orders_id,
    order.invoice_id,
    order.raw_search_text,
  ].map(normalizePosReference);
  const invoiceMatches = values.some(
    (value) =>
      value === reference.invoice_reference ||
      value === reference.numeric_reference ||
      value.includes(reference.invoice_reference)
  );
  const parsedBranch = normalizePosReference(order.branch);
  const rawText = normalizePosReference(order.raw_search_text);
  const branchMatches =
    !parsedBranch ||
    reference.branch_aliases.some(
      (alias) => parsedBranch === alias || parsedBranch.includes(alias) || rawText.includes(alias)
    );
  return invoiceMatches && branchMatches;
};

const buildPosConnectOrder = (
  preview?: PosOrderPreview | null,
  details?: PosOrderDetailsResult | null
): PosConnectOrder => {
  const meta = buildPosSortingMeta(preview, details);
  return {
    order_no: String(details?.general?.order_no || preview?.order_no || '').trim(),
    customer_phone: String(details?.general?.customer_mobile || preview?.customer_phone || '').trim(),
    customer_name: String(details?.general?.customer_name || preview?.customer_name || '').trim(),
    order_date: meta.pos_order_date,
    delivery_date: meta.pos_delivery_date,
    delivery_time: meta.pos_delivery_time,
    customer_address: String(details?.general?.customer_address || '').trim(),
    remark: meta.pos_remark,
    price: meta.pos_total,
    balance: meta.pos_balance,
    customer_outstanding_balance: Math.max(0, Number(details?.general?.customer_outstanding_balance ?? 0)),
    customer_ledger_balance: Number(details?.general?.customer_ledger_balance ?? 0),
    customer_credit_limit: Math.max(0, Number(details?.general?.customer_credit_limit ?? 0)),
    order_status: meta.pos_order_status,
    source_orders_id: String(preview?.orders_id || details?.general?.searched_order_id || details?.general?.order_id || '').trim(),
    source_invoice_id: String(preview?.invoice_id || details?.general?.searched_invoice_id || '').trim(),
  };
};

const normalizePickupStatus = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

const PICKUP_VISIBLE_STATUSES = new Set([
  'packed partially',
  'partially packed',
  'fully packed',
  'pending',
  'pending/unpaid',
  'delivered',
]);

const isPickupVisibleStatus = (status: unknown) => PICKUP_VISIBLE_STATUSES.has(normalizePickupStatus(status));

const posPhoneMatchesAnyQuery = (phoneValue: unknown, queries: string[]) => {
  const phone = normalizePosConnectPhone(phoneValue);
  if (phone.length < 5) return false;
  return queries.some((query) => {
    const candidate = normalizePosConnectPhone(query);
    if (candidate.length < 5) return false;
    if (phone.includes(candidate) || candidate.includes(phone)) return true;
    if (candidate.length >= 7 && phone.endsWith(candidate.slice(-7))) return true;
    if (phone.length >= 7 && candidate.endsWith(phone.slice(-7))) return true;
    return false;
  });
};

const buildPickupSearchLineItems = (details: PosOrderDetailsResult | null): PickupSearchLineItem[] =>
  (details?.line_items ?? []).map((item) => ({
    ...item,
    category: detectSortingItemCategory(item.name),
  }));

const hydratePickupSearchOrder = async (
  preview: PosOrderPreview | null,
  details: PosOrderDetailsResult | null,
  detailsError = '',
  fallbackOrderNo = ''
): Promise<PickupSearchOrder | null> => {
  const parsedOrder = buildPosConnectOrder(preview, details);
  const order = parsedOrder.order_no || !fallbackOrderNo ? parsedOrder : { ...parsedOrder, order_no: fallbackOrderNo };
  if (!isPickupVisibleStatus(order.order_status)) return null;

  const blanketStorage = await loadStoredOrderSnapshotByOrderNo(order.order_no).catch(() => null);
  return {
    ...order,
    line_items: buildPickupSearchLineItems(details),
    blanket_storage: blanketStorage,
    ...(detailsError ? { details_error: detailsError } : {}),
  };
};

const findBestPosConnectPreview = (
  orders: PosOrderPreview[],
  query: string,
  selected?: { orders_id?: string; invoice_id?: string }
) => {
  const selectedOrdersId = String(selected?.orders_id ?? '').trim();
  const selectedInvoiceId = String(selected?.invoice_id ?? '').trim();
  if (selectedOrdersId || selectedInvoiceId) {
    const selectedPreview = orders.find((order) =>
      (selectedOrdersId && String(order.orders_id ?? '') === selectedOrdersId) ||
      (selectedInvoiceId && String(order.invoice_id ?? '') === selectedInvoiceId)
    );
    if (selectedPreview) return selectedPreview;
  }

  const normalizedQuery = query.trim().toUpperCase();
  const exactOrder = orders.find((order) => String(order.order_no ?? '').trim().toUpperCase() === normalizedQuery);
  if (exactOrder) return exactOrder;

  const queryPhone = normalizePosConnectPhone(query);
  if (queryPhone.length >= 5) {
    const phoneMatches = orders.filter((order) => {
      const phone = normalizePosConnectPhone(order.customer_phone);
      return phone.length >= 5 && (phone.includes(queryPhone) || queryPhone.includes(phone));
    });
    if (phoneMatches.length === 1) return phoneMatches[0];
  }

  return orders[0] ?? null;
};

const posConnectPreviewMatchesQuery = (order: PosOrderPreview, query: string) => {
  const normalizedQuery = String(query ?? '').trim().toUpperCase();
  if (!normalizedQuery) return false;

  const orderNo = String(order.order_no ?? '').trim().toUpperCase();
  if (orderNo && orderNo === normalizedQuery) return true;

  const queryPhone = normalizePosConnectPhone(query);
  if (queryPhone.length >= 5) {
    const phone = normalizePosConnectPhone(order.customer_phone);
    if (phone.length >= 5 && (phone.includes(queryPhone) || queryPhone.includes(phone))) return true;
  }

  return false;
};

const filterPosConnectPreviewMatches = (orders: PosOrderPreview[], queries: string[]) => {
  const seen = new Set<string>();
  const matches: PosOrderPreview[] = [];
  for (const order of orders) {
    if (!queries.some((query) => posConnectPreviewMatchesQuery(order, query))) continue;
    const key = `${order.orders_id || ''}:${order.invoice_id || ''}:${order.order_no || ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    matches.push(order);
  }
  return matches;
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

const POS_KNOWN_PRODUCT_NAMES_BY_ID = new Map<string, string>([
  ['123', 'BLANKET-SMALL'],
  ['124', 'BLANKET-BIG'],
  ['125', 'BEDSHEET-SMALL'],
  ['126', 'BEDSHEET-BIG'],
  ['127', 'PILLOW CASE'],
  ['91', 'CURTAIN-SMALL'],
  ['92', 'CURTAIN-MEDIUM'],
  ['93', 'CURTAIN-BIG'],
  ['128', 'pilow'],
  ['132', 'dovet'],
]);

const POS_KNOWN_PRODUCT_NAMES_BY_BARCODE = new Map<string, string>([
  ['29', 'BLANKET-SMALL'],
  ['30', 'BLANKET-BIG'],
  ['31', 'BEDSHEET-SMALL'],
  ['32', 'BEDSHEET-BIG'],
  ['33', 'PILLOW CASE'],
  ['34', 'CURTAIN-SMALL'],
  ['35', 'CURTAIN-MEDIUM'],
  ['36', 'CURTAIN-BIG'],
  ['37', 'pilow'],
  ['61', 'dovet'],
]);

const resolveKnownPosProductName = (row: Record<string, any>) => {
  const productId = String(row.sale_prdt_id ?? row.product_id ?? row.id ?? '').trim();
  const barcode = String(row.barcode ?? row.product_barcode ?? '').trim();
  return POS_KNOWN_PRODUCT_NAMES_BY_ID.get(productId) ?? POS_KNOWN_PRODUCT_NAMES_BY_BARCODE.get(barcode) ?? '';
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
    start?: string;
    length?: string;
  }
) => {
  const params = new URLSearchParams();

  // Keep this lightweight by default; this endpoint accepts custom filters directly.
  params.set('draw', '1');
  params.set('start', overrides?.start ?? '0');
  params.set('length', overrides?.length ?? '25');
  params.set('order[0][column]', '0');
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

const getCachedPosSearch = (query: string) => {
  const cached = posSearchCache.get(query);
  if (cached && Date.now() - cached.timestamp < POS_CACHE_TTL) {
    return cached.result;
  }
  return null;
};

const setCachedPosSearch = (query: string, result: any) => {
  posSearchCache.set(query, { result, timestamp: Date.now() });
};

const fetchPosOrderSearch = async (
  query: string,
  overrides?: Parameters<typeof buildPosOrderSearchPayload>[1]
) => {
  const endpoint = resolvePosEndpoint();
  if (!endpoint) {
    throw new Error('POS endpoint is not configured.');
  }
  const staffSession = getActivePosStaffSession();
  let cookieHeader = String(staffSession?.cookie_header || posCookieJar || POS_COOKIE).trim();
  if (!staffSession && canAutoRefreshPosSession() && !posCookieJarAutoRefreshed) {
    await refreshPosSession('search_initial_refresh');
    cookieHeader = String(posCookieJar || POS_COOKIE).trim();
  }
  if (!staffSession && (!cookieHeader || !hasMinimalPosCookie(cookieHeader)) && canAutoRefreshPosSession()) {
    await refreshPosSession('search_prepare');
    cookieHeader = String(posCookieJar || POS_COOKIE).trim();
  }
  if (!cookieHeader) {
    throw new Error(
      canAutoRefreshPosSession()
        ? `POS session is not available and auto-refresh failed. ${posLastRefreshReason || 'Check POS login credentials in .env.'}`.trim()
        : 'POS login is not configured. Set POS_AUTO_REFRESH_ENABLED=1 with POS_LOGIN_USERNAME and POS_LOGIN_PASSWORD in server .env, or set POS_COOKIE as a temporary fallback.'
    );
  }
  if (cookieHeader.includes('...')) {
    throw new Error('POS_COOKIE contains placeholder dots (...). Paste the full real Cookie header from browser Network.');
  }
  if (!hasMinimalPosCookie(cookieHeader)) {
    throw new Error(
      canAutoRefreshPosSession()
        ? `POS cookie is incomplete and auto-refresh could not fix it. ${posLastRefreshReason || ''}`.trim()
        : 'POS session is incomplete. Prefer enabling POS auto login with POS_AUTO_REFRESH_ENABLED=1 and POS_LOGIN_* settings.'
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
    cookieHeader = mergeResponseCookies(cookieHeader, response);
    if (staffSession) {
      staffSession.cookie_header = cookieHeader;
    } else {
      posCookieJar = cookieHeader;
    }

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

  let { text, parsed } = await requestWithPayload(buildPosOrderSearchPayload(query, overrides));

  const needsRetry =
    parsed &&
    Array.isArray(parsed?.data) &&
    parsed.data.length === 0 &&
    Number(parsed?.recordsFiltered ?? 0) > 0;

  if (needsRetry) {
    const requestedBranchId = String(overrides?.branch_id ?? '').trim();
    const retryVariants =
      requestedBranchId && requestedBranchId !== '0'
        ? [
            { job_status: '0', branch_id: requestedBranchId, prevent_depot_selection: '0' },
            { job_status: '0', branch_id: requestedBranchId, prevent_depot_selection: '1' },
          ]
        : [
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
      if (!staffSession && canAutoRefreshPosSession() && (await refreshPosSession('search_html_response'))) {
        cookieHeader = String(posCookieJar || POS_COOKIE).trim();
        const retry = await requestWithPayload(buildPosOrderSearchPayload(query, overrides));
        text = retry.text;
        parsed = retry.parsed;
      } else {
        throw new Error(
          staffSession
            ? 'POS employee session expired. Sign out and sign in again.'
            : canAutoRefreshPosSession()
            ? `POS returned HTML and auto-refresh failed. ${posLastRefreshReason || 'Check POS credentials/session.'}`.trim()
            : 'POS returned HTML (likely login/session page). Enable POS auto login with POS_AUTO_REFRESH_ENABLED=1 and POS_LOGIN_* settings.'
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

const POS_CONNECT_FALLBACK_QUERY = String(process.env.POS_CONNECT_FALLBACK_QUERY ?? '000').trim() || '000';
const POS_CONNECT_FALLBACK_PAGE_SIZE = Math.max(
  100,
  Math.min(1000, Number(process.env.POS_CONNECT_FALLBACK_PAGE_SIZE ?? 500) || 500)
);
const POS_CONNECT_FALLBACK_MAX_PAGES = Math.max(
  1,
  Math.min(20, Number(process.env.POS_CONNECT_FALLBACK_MAX_PAGES ?? 4) || 4)
);
const POS_CONNECT_DEEP_FALLBACK_MAX_PAGES = Math.max(
  POS_CONNECT_FALLBACK_MAX_PAGES,
  Math.min(60, Number(process.env.POS_CONNECT_DEEP_FALLBACK_MAX_PAGES ?? 12) || 12)
);
const POS_CONNECT_FALLBACK_BATCH_SIZE = Math.max(
  1,
  Math.min(6, Number(process.env.POS_CONNECT_FALLBACK_BATCH_SIZE ?? 4) || 4)
);
const POS_CONNECT_FALLBACK_ENABLED = /^(1|true|yes)$/i.test(
  String(process.env.POS_CONNECT_FALLBACK_ENABLED ?? '').trim()
);
const PICKUP_PHONE_FALLBACK_ENABLED = !/^(0|false|no)$/i.test(
  String(process.env.PICKUP_PHONE_FALLBACK_ENABLED ?? '1').trim()
);
const PICKUP_PHONE_FALLBACK_MAX_PAGES = Math.max(
  1,
  Math.min(
    POS_CONNECT_DEEP_FALLBACK_MAX_PAGES,
    Number(process.env.PICKUP_PHONE_FALLBACK_MAX_PAGES ?? POS_CONNECT_FALLBACK_MAX_PAGES) || POS_CONNECT_FALLBACK_MAX_PAGES
  )
);
const POS_CONNECT_FAST_RESPONSE_ENABLED = !/^(0|false|no)$/i.test(
  String(process.env.POS_CONNECT_FAST_RESPONSE_ENABLED ?? '1').trim()
);
const POS_CONNECT_DIRECT_QUERY_LIMIT = Math.max(
  1,
  Math.min(8, Number(process.env.POS_CONNECT_DIRECT_QUERY_LIMIT ?? 3) || 3)
);
const POS_CONNECT_SEARCH_CACHE_TTL_MS = Math.max(
  10_000,
  Math.min(300_000, Number(process.env.POS_CONNECT_SEARCH_CACHE_TTL_MS ?? 120_000) || 120_000)
);
const POS_CONNECT_DETAILS_CACHE_TTL_MS = Math.max(
  10_000,
  Math.min(300_000, Number(process.env.POS_CONNECT_DETAILS_CACHE_TTL_MS ?? 120_000) || 120_000)
);
const POS_CONVEYER_AUTO_SYNC_ENABLED = !/^(0|false|no)$/i.test(
  String(process.env.POS_CONVEYER_AUTO_SYNC_ENABLED ?? '1').trim()
);
const POS_CONVEYER_STORE_NAME = String(process.env.POS_CONVEYER_STORE_NAME ?? 'conveyer').trim() || 'conveyer';
const POS_CONVEYER_STORE_ALIASES = String(
  process.env.POS_CONVEYER_STORE_ALIASES ?? 'conveyer,conveyor,كونفير,كنفير'
)
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);
const POS_CONVEYER_MAX_SLOT = Math.max(
  1,
  Math.min(1000, Number(process.env.POS_CONVEYER_MAX_SLOT ?? 300) || 300)
);
const posConnectSearchCache = new Map<
  string,
  {
    expires_at: number;
    result: Awaited<ReturnType<typeof fetchPosOrderSearch>>;
  }
>();
const posConnectDetailsCache = new Map<
  string,
  {
    expires_at: number;
    result: PosOrderDetailsResult;
  }
>();
const posConnectDetailsInFlight = new Map<string, Promise<PosOrderDetailsResult>>();

const fetchCachedPosConnectSearch = async (
  query: string,
  overrides?: Parameters<typeof buildPosOrderSearchPayload>[1]
) => {
  const posStaff = getActivePosStaffSession();
  const cacheKey = JSON.stringify({
    pos_user_id: posStaff?.pos_user_id ?? 'system',
    query,
    start: overrides?.start ?? '0',
    length: overrides?.length ?? '25',
    paid_status: overrides?.paid_status ?? POS_PAID_STATUS,
    job_status: overrides?.job_status ?? POS_JOB_STATUS,
    cust_type: overrides?.cust_type ?? POS_CUSTOMER_TYPE,
    del_type: overrides?.del_type ?? POS_DELIVERY_TYPE,
    pay_type: overrides?.pay_type ?? POS_PAY_TYPE,
    branch_id: overrides?.branch_id ?? POS_BRANCH_ID,
    prevent_depot_selection: overrides?.prevent_depot_selection ?? POS_PREVENT_DEPOT_SELECTION,
  });
  const now = Date.now();
  const cached = posConnectSearchCache.get(cacheKey);
  if (cached && cached.expires_at > now) return cached.result;

  const result = await fetchPosOrderSearch(query, overrides);
  if ((result.orders ?? []).length > 0) {
    posConnectSearchCache.set(cacheKey, {
      expires_at: now + POS_CONNECT_SEARCH_CACHE_TTL_MS,
      result,
    });
  }

  if (posConnectSearchCache.size > 80) {
    for (const [key, entry] of posConnectSearchCache.entries()) {
      if (entry.expires_at <= now || posConnectSearchCache.size > 60) {
        posConnectSearchCache.delete(key);
      }
    }
  }

  return result;
};

const getPosConnectDetailsCacheKey = (params: {
  order_id: string;
  s_order_id: string;
  mode?: string;
  open_type?: string;
  job_process_commision_option?: string;
}) =>
  JSON.stringify({
    pos_user_id: getActivePosStaffSession()?.pos_user_id ?? 'system',
    order_id: params.order_id || '0',
    s_order_id: params.s_order_id || '0',
    mode: params.mode || '0',
    open_type: params.open_type || 'preview',
    job_process_commision_option: params.job_process_commision_option ?? POS_JOB_PROCESS_COMMISION_OPTION,
  });

const getCachedPosConnectDetails = (params: Parameters<typeof getPosConnectDetailsCacheKey>[0]) => {
  const cacheKey = getPosConnectDetailsCacheKey(params);
  const cached = posConnectDetailsCache.get(cacheKey);
  if (cached && cached.expires_at > Date.now()) return cached.result;
  return null;
};

const fetchCachedPosConnectDetails = async (params: Parameters<typeof getPosConnectDetailsCacheKey>[0]) => {
  const cacheKey = getPosConnectDetailsCacheKey(params);
  const now = Date.now();
  const cached = posConnectDetailsCache.get(cacheKey);
  if (cached && cached.expires_at > now) return cached.result;

  const inFlight = posConnectDetailsInFlight.get(cacheKey);
  if (inFlight) return inFlight;

  const promise = fetchPosOrderDetails(params)
    .then((result) => {
      posConnectDetailsCache.set(cacheKey, {
        expires_at: Date.now() + POS_CONNECT_DETAILS_CACHE_TTL_MS,
        result,
      });

      if (posConnectDetailsCache.size > 80) {
        const pruneAt = Date.now();
        for (const [key, entry] of posConnectDetailsCache.entries()) {
          if (entry.expires_at <= pruneAt || posConnectDetailsCache.size > 60) {
            posConnectDetailsCache.delete(key);
          }
        }
      }

      return result;
    })
    .finally(() => {
      posConnectDetailsInFlight.delete(cacheKey);
    });

  posConnectDetailsInFlight.set(cacheKey, promise);
  return promise;
};

const isLikelyPosConnectOrderNoQuery = (query: string) => {
  const raw = String(query ?? '').trim();
  const compact = raw.replace(/[^0-9A-Z]/gi, '');
  const digits = normalizePosConnectPhone(raw);
  if (!compact) return false;
  if (/^\d+$/.test(compact)) return digits.length >= 3 && digits.length <= 8;
  return compact.length >= 3 && compact.length <= 14;
};

const tryFetchPosConnectDetailsByDisplayedOrderNo = async (
  query: string,
  searchQueries: string[],
  attempts: PosConnectSearchAttempt[]
) => {
  if (!isLikelyPosConnectOrderNoQuery(query)) return null;

  const candidates = Array.from(
    new Set(
      [query, ...searchQueries, query.replace(/[^0-9A-Z]/gi, ''), query.replace(/\D+/g, '')]
        .map((value) => String(value ?? '').trim())
        .filter(Boolean)
    )
  ).slice(0, 8);

  for (const candidate of candidates) {
    const shapes = [
      { order_id: '0', s_order_id: candidate, label: `${candidate} direct order` },
      { order_id: candidate, s_order_id: '0', label: `${candidate} direct invoice` },
    ];

    for (const shape of shapes) {
      try {
        const details = await fetchCachedPosConnectDetails({
          order_id: shape.order_id,
          s_order_id: shape.s_order_id,
          mode: '0',
          open_type: 'preview',
        });
        const orderNo = String(details.general.order_no || details.general.searched_order_id || '').trim().toUpperCase();
        const candidateUpper = candidate.toUpperCase();
        const hasUsefulDetails =
          (details.line_items ?? []).length > 0 ||
          Boolean(details.general.customer_name || details.general.customer_mobile || details.general.grand_total);
        if (hasUsefulDetails && (!orderNo || orderNo === candidateUpper || orderNo.includes(candidateUpper))) {
          attempts.push({
            query: shape.label,
            records_total: 1,
            records_filtered: 1,
            parsed_orders: 1,
          });
          return details;
        }
      } catch {
        attempts.push({
          query: shape.label,
          records_total: 0,
          records_filtered: 0,
          parsed_orders: 0,
        });
      }
    }
  }

  return null;
};

const resolvePosConnectPreviewByDisplayedOrderNo = async (
  orderNo: string,
  options?: { branchReference?: PickupBranchReference }
) => {
  const branchReference = options?.branchReference;
  const normalizedOrderNo = normalizeSortingOrderNo(
    branchReference?.numeric_reference ?? orderNo
  );
  if (!normalizedOrderNo) return null;
  const searchQueries = buildPosConnectSearchQueries(
    branchReference?.invoice_reference ?? normalizedOrderNo
  );
  const matchesExactReference = (order: PosOrderPreview) => {
    if (branchReference) return posPreviewMatchesBranchReference(order, branchReference);
    const normalizedReference = normalizePosReference(normalizedOrderNo);
    return (
      normalizePosReference(order.order_no) === normalizedReference ||
      normalizePosReference(order.invoice_no) === normalizedReference
    );
  };

  for (const candidateQuery of searchQueries) {
    try {
      const search = await fetchCachedPosConnectSearch(
        candidateQuery,
        branchReference ? { branch_id: branchReference.branch_id } : undefined
      );
      const exact = (search.orders ?? []).find(matchesExactReference);
      if (exact) return exact;
    } catch {
      // Fall back to the broader POS list scan below.
    }
  }

  const pageSize = POS_CONNECT_FALLBACK_PAGE_SIZE;
  const maxPages = POS_CONNECT_DEEP_FALLBACK_MAX_PAGES;
  const batchSize = POS_CONNECT_FALLBACK_BATCH_SIZE;
  for (let pageStart = 0; pageStart < maxPages; pageStart += batchSize) {
    const pageNumbers = Array.from(
      { length: Math.min(batchSize, maxPages - pageStart) },
      (_unused, index) => pageStart + index
    );
    const batchResults = await Promise.all(
      pageNumbers.map(async (page) => {
        try {
          const search = await fetchCachedPosConnectSearch(POS_CONNECT_FALLBACK_QUERY, {
            start: String(page * pageSize),
            length: String(pageSize),
            job_status: '0',
            branch_id: branchReference?.branch_id ?? '0',
            prevent_depot_selection: '0',
          });
          return { search, error: null as any };
        } catch (error) {
          return { search: null, error };
        }
      })
    );

    for (const result of batchResults) {
      if (result.error || !result.search) continue;
      const exact = (result.search.orders ?? []).find(matchesExactReference);
      if (exact) return exact;
    }

    if (batchResults.some((result) => (result.search?.orders?.length ?? 0) < pageSize)) break;
  }

  return null;
};

const postPosForm = async (
  endpointPath: string,
  payload: URLSearchParams,
  options?: { fallbackToGet?: boolean; referer?: string; origin?: string; allowHtmlResponse?: boolean }
) => {
  const endpoint = resolvePosEndpointFromPath(endpointPath);
  if (!endpoint) throw new Error('POS endpoint is not configured.');

  const staffSession = getActivePosStaffSession();
  let cookieHeader = String(staffSession?.cookie_header || posCookieJar || POS_COOKIE).trim();
  if (!staffSession && canAutoRefreshPosSession() && !posCookieJarAutoRefreshed) {
    await refreshPosSession('post_initial_refresh');
    cookieHeader = String(posCookieJar || POS_COOKIE).trim();
  }
  if (!staffSession && (!cookieHeader || !hasMinimalPosCookie(cookieHeader)) && canAutoRefreshPosSession()) {
    await refreshPosSession('post_prepare');
    cookieHeader = String(posCookieJar || POS_COOKIE).trim();
  }
  if (!cookieHeader) {
    throw new Error(
      canAutoRefreshPosSession()
        ? `POS session is not available and auto-refresh failed. ${posLastRefreshReason || 'Check POS login credentials in .env.'}`.trim()
        : 'POS login is not configured. Set POS_AUTO_REFRESH_ENABLED=1 with POS_LOGIN_USERNAME and POS_LOGIN_PASSWORD in server .env, or set POS_COOKIE as a temporary fallback.'
    );
  }
  if (cookieHeader.includes('...')) {
    throw new Error('POS_COOKIE contains placeholder dots (...). Paste the full real Cookie header from browser Network.');
  }
  if (!hasMinimalPosCookie(cookieHeader)) {
    throw new Error(
      canAutoRefreshPosSession()
        ? `POS cookie is incomplete and auto-refresh could not fix it. ${posLastRefreshReason || ''}`.trim()
        : 'POS session is incomplete. Prefer enabling POS auto login with POS_AUTO_REFRESH_ENABLED=1 and POS_LOGIN_* settings.'
    );
  }

  const buildHeaders = (cookie: string): Record<string, string> => ({
    Accept: 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,ar;q=0.7',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    Cookie: cookie,
    Origin: options?.origin || resolvePosOrigin(),
    Referer: options?.referer || POS_REFERER || POS_BASE_URL,
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
    cookieHeader = mergeResponseCookies(cookieHeader, response);
    if (staffSession) {
      staffSession.cookie_header = cookieHeader;
    } else {
      posCookieJar = cookieHeader;
    }

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

  if (
    !options?.allowHtmlResponse &&
    !staffSession &&
    (isPosHtmlDocument(String(responseBody.text ?? '')) || isLikelyPosLoginHtml(String(responseBody.text ?? ''))) &&
    canAutoRefreshPosSession()
  ) {
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

  if (
    !options?.allowHtmlResponse &&
    staffSession &&
    (isPosHtmlDocument(String(responseBody.text ?? '')) || isLikelyPosLoginHtml(String(responseBody.text ?? '')))
  ) {
    throw new Error('POS employee session expired. Sign out and sign in again.');
  }

  return responseBody;
};

const tryFetchPosOrderDetailsViaPackingSearch = async (
  query: string,
  attempts: PosConnectSearchAttempt[] = []
) => {
  if (!isLikelyPosConnectOrderNoQuery(query)) return null;
  const normalizedQuery = normalizePosReference(query);
  const branchReference = parsePickupBranchReference(query);
  const prefixedMatch = normalizedQuery.match(/^([A-Z])(\d{3,10})$/);
  const preChar = branchReference?.key ?? prefixedMatch?.[1] ?? '';
  const mainText = branchReference?.numeric_reference ?? prefixedMatch?.[2] ?? normalizedQuery;
  if (!mainText) return null;

  const payload = new URLSearchParams();
  payload.set('pre_char', preChar);
  payload.set('main_txt', mainText);
  payload.set(
    'client_identifier',
    getActivePosStaffSession()?.client_identifier || POS_LOGIN_CLIENT_IDENTIFIER
  );

  const label = `${preChar}${mainText} packing search`;
  try {
    const result = await postPosForm(
      resolvePosPurchaseApiEndpoint('/packing_api/searchOrder'),
      payload,
      {
        fallbackToGet: false,
        referer: `${POS_PURCHASE_API_BASE_URL.replace(/\/+$/, '')}/packing`,
      }
    );
    let response = result.parsed;
    if (typeof response === 'string') {
      try {
        response = JSON.parse(response);
      } catch {
        response = null;
      }
    }
    const status = Number(response?.status ?? 0);
    const responseData = response?.data;
    const resolvedId = String(
      responseData && typeof responseData === 'object'
        ? responseData.order_id ?? responseData.invoice_id ?? responseData.id ?? ''
        : responseData ?? ''
    ).trim();
    if (![1, 2, 4].includes(status) || !resolvedId || resolvedId === '0') {
      attempts.push({ query: label, records_total: 0, records_filtered: 0, parsed_orders: 0 });
      return null;
    }

    const primaryShape =
      status === 4
        ? { order_id: resolvedId, s_order_id: '0' }
        : { order_id: '0', s_order_id: resolvedId };
    const alternateShape =
      status === 4
        ? { order_id: '0', s_order_id: resolvedId }
        : { order_id: resolvedId, s_order_id: '0' };

    for (const shape of [primaryShape, alternateShape]) {
      try {
        const details = await fetchCachedPosConnectDetails({
          ...shape,
          mode: '0',
          open_type: 'preview',
        });
        const resolvedOrderNo = normalizePosReference(
          details.general.order_no || details.general.searched_order_id
        );
        const normalizedMain = normalizePosReference(mainText);
        const matchesRequestedOrder =
          !resolvedOrderNo ||
          resolvedOrderNo === normalizedQuery ||
          resolvedOrderNo.endsWith(normalizedQuery) ||
          resolvedOrderNo.endsWith(normalizedMain);
        const hasUsefulDetails =
          details.line_items.length > 0 ||
          Boolean(details.general.customer_name || details.general.customer_mobile || details.general.grand_total);
        if (matchesRequestedOrder && hasUsefulDetails) {
          attempts.push({ query: label, records_total: 1, records_filtered: 1, parsed_orders: 1 });
          return details;
        }
      } catch {
        // Try the alternate POS identifier shape.
      }
    }

    attempts.push({ query: label, records_total: 0, records_filtered: 0, parsed_orders: 0 });
    return null;
  } catch {
    attempts.push({ query: label, records_total: 0, records_filtered: 0, parsed_orders: 0 });
    return null;
  }
};

const normalizeReportDateInput = (value: unknown, fallback: string) => {
  const text = String(value ?? '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : fallback;
};

const normalizeReportTimeInput = (value: unknown, fallback: string) => {
  const text = String(value ?? '').trim();
  return /^(0?[1-9]|1[0-2]):[0-5]\d\s?(AM|PM)$/i.test(text) ? text.toUpperCase().replace(/\s+/, ' ') : fallback;
};

const buildCounterCashReportPayload = (input: any) => {
  const today = new Date().toISOString().slice(0, 10);
  const fromDate = normalizeReportDateInput(input?.from_date ?? input?.fromDate, today);
  const toDate = normalizeReportDateInput(input?.to_date ?? input?.toDate, fromDate);
  const payload = new URLSearchParams();
  const fields: Record<string, string> = {
    report_type: 'counter_cash',
    from_date: fromDate,
    from_time: normalizeReportTimeInput(input?.from_time ?? input?.fromTime, '12:00 AM'),
    to_date: toDate,
    to_time: normalizeReportTimeInput(input?.to_time ?? input?.toTime, '11:59 PM'),
    no_of_decimal_places: String(input?.no_of_decimal_places ?? input?.decimalPlaces ?? '2'),
    save: '1',
    predefined_date: 'Custom Range',
    prod_details: '0',
    void_details: '0',
    ord_prod_details: '0',
    ord_void_details: '0',
    cust_details: '0',
    expns_details: String(input?.expns_details ?? '1'),
    print: '0',
    inv_cat_wise: '0',
    ord_cat_wise: '0',
    inv_cat_wise_tax: '0',
    ord_cat_wise_tax: '0',
    salesman_wise: '0',
    credit_invoice: '0',
    return_invoice: '0',
    return_invoice_prod_details: '0',
    expence_entry_details: String(input?.expence_entry_details ?? input?.expense_entry_details ?? input?.expenseDetails ?? '0'),
    purchase_etnry_details: String(input?.purchase_etnry_details ?? input?.purchase_entry_details ?? input?.purchaseDetails ?? '0'),
    order_billwise_details: String(input?.order_billwise_details ?? input?.orderBillwiseDetails ?? input?.billwiseDetails ?? '0'),
    vehicle_details: '0',
    salesman_wise_detail: '0',
    received_payment_details: String(input?.received_payment_details ?? input?.paymentDetails ?? '0'),
    order_product_unit_wise: '0',
  };

  for (const [key, value] of Object.entries(fields)) {
    payload.set(key, value);
  }
  const branchId = String(input?.branch_id ?? input?.branchId ?? '').trim();
  if (branchId) payload.set('branch_id', branchId);

  return payload;
};

const parseExpenseMoney = (value: unknown, fallback = 0) => {
  const parsed = Number(String(value ?? '').replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : fallback;
};

const normalizePosExpenseDate = (value: unknown, fallback: string) => {
  const text = String(value ?? '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : fallback;
};

const parsePosJsonObject = (text: string, label: string) => {
  try {
    const parsed = text ? JSON.parse(text) : null;
    if (parsed && typeof parsed === 'object') return parsed as Record<string, any>;
  } catch {
    // handled below
  }
  throw new Error(`${label} returned non-JSON response: ${String(text ?? '').slice(0, 240)}`);
};

const buildPosExpenseForm = (fields: Record<string, unknown>) => {
  const payload = new URLSearchParams();
  for (const [key, value] of Object.entries(fields)) {
    payload.set(key, String(value ?? ''));
  }
  return payload;
};

const postPosPurchaseApi = async (endpointPath: string, fields: Record<string, unknown>) => {
  const endpoint = resolvePosPurchaseApiEndpoint(endpointPath);
  if (!endpoint) throw new Error('POS purchase API endpoint is not configured.');
  const response = await postPosForm(endpoint, buildPosExpenseForm(fields), {
    fallbackToGet: false,
    referer: POS_EXPENSES_REFERER,
  });
  return parsePosJsonObject(String(response.text ?? ''), endpointPath);
};

const createPosExpenseInvoice = async (input: any) => {
  const today = new Date().toISOString().slice(0, 10);
  const userId = String(input?.user_id ?? input?.api_user_id ?? AIPSOFT_API_USER_ID ?? '').trim();
  if (!userId) {
    throw new Error('AIPSOFT_API_USER_ID is missing. Set it in .env or send user_id in request.');
  }

  const clientIdentifier = String(input?.client_identifier ?? POS_LOGIN_CLIENT_IDENTIFIER ?? 'inout').trim() || 'inout';
  const branchId = String(input?.branch_id ?? '1').trim() || '1';
  const payAccount = String(input?.pay_account ?? input?.payment_account_id ?? AIPSOFT_DEFAULT_PAY_ACCOUNT_ID ?? '').trim();
  if (!payAccount) {
    throw new Error('pay_account is required. It is the POS payment account id.');
  }

  const rawLines = Array.isArray(input?.lines) ? input.lines : Array.isArray(input?.items) ? input.items : [];
  if (rawLines.length === 0) throw new Error('At least one expense line is required.');

  const lines = rawLines.map((line: any, index: number) => {
    const accountHead = String(line?.account_head ?? line?.accountHead ?? line?.expense_account_id ?? '').trim();
    if (!accountHead) throw new Error(`Line ${index + 1}: account_head is required.`);

    const amount = parseExpenseMoney(line?.amount, NaN);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error(`Line ${index + 1}: amount must be greater than 0.`);

    const taxAmount =
      line?.tax_amount !== undefined
        ? parseExpenseMoney(line.tax_amount, 0)
        : line?.tax_rate !== undefined
          ? parseExpenseMoney((amount * parseExpenseMoney(line.tax_rate, 0)) / 100, 0)
          : 0;
    const total = line?.total !== undefined ? parseExpenseMoney(line.total, amount + taxAmount) : parseExpenseMoney(amount + taxAmount, 0);

    return {
      account_head: accountHead,
      notes: String(line?.notes ?? line?.description ?? line?.remark ?? '').trim(),
      amount,
      tax_amount: taxAmount,
      total,
    };
  });

  const header = {
    user_id: userId,
    paid_by: String(input?.paid_by ?? input?.paidBy ?? input?.paid_by_name ?? '').trim(),
    paid_by_id: String(input?.paid_by_id ?? input?.paidById ?? input?.paid_by ?? input?.paidBy ?? userId).trim(),
    paid_user_id: String(input?.paid_by_id ?? input?.paidById ?? userId).trim(),
    branch_id: branchId,
    pay_account: payAccount,
    date: normalizePosExpenseDate(input?.date, today),
    remark: String(input?.remark ?? input?.notes ?? input?.description ?? '').trim(),
    client_identifier: clientIdentifier,
    bill_date: normalizePosExpenseDate(input?.bill_date ?? input?.billDate ?? input?.date, today),
    bill_no: String(input?.bill_no ?? input?.billNo ?? input?.invoice_no ?? input?.invoiceNo ?? '').trim(),
    account_segment_id: String(input?.account_segment_id ?? input?.vehicle_plate_number ?? '').trim(),
    account_class_id: String(input?.account_class_id ?? input?.vehicle_owner ?? '').trim(),
    project_id: String(input?.project_id ?? input?.projectId ?? '').trim(),
    party_account: String(input?.party_account ?? input?.vendor_id ?? input?.vendorId ?? input?.supplier_id ?? '').trim(),
    driver_id: String(input?.driver_id ?? input?.driverId ?? '').trim(),
    expense_id: String(input?.expense_id ?? '').trim(),
    amount: input?.driver_id || input?.driverId ? parseExpenseMoney(input?.amount ?? lines.reduce((sum, line) => sum + line.total, 0), 0) : 0,
  };

  const hold = await postPosPurchaseApi('/purchase_api/hold_expense', header);
  if (Number(hold.status) !== 1 || !hold.expense_id) {
    throw new Error(`hold_expense failed: ${JSON.stringify(hold)}`);
  }

  const expenseId = String(hold.expense_id);
  const detailResponses: Record<string, any>[] = [];
  let totalTax = 0;
  let totalAmount = 0;

  for (const line of lines) {
    totalTax = parseExpenseMoney(totalTax + line.tax_amount, 0);
    totalAmount = parseExpenseMoney(totalAmount + line.total, 0);
    const detail = await postPosPurchaseApi('/purchase_api/save_expense_details', {
      expense_id: expenseId,
      branch_id: branchId,
      account_head: line.account_head,
      account_segment_id: header.account_segment_id,
      account_class_id: header.account_class_id,
      amount: line.amount,
      tax_amount: line.tax_amount,
      total: line.total,
      notes: line.notes,
      client_identifier: clientIdentifier,
      button_type: 'ADD',
      expense_details_id: '',
    });
    if (Number(detail.status) !== 1) {
      throw new Error(`save_expense_details failed: ${JSON.stringify(detail)}`);
    }
    detailResponses.push(detail);
  }

  const approve = await postPosPurchaseApi('/purchase_api/approve_expense_data', {
    expense_id: expenseId,
    client_identifier: clientIdentifier,
    total_tax: totalTax,
    total_amount: totalAmount,
    images: Array.isArray(input?.images) ? input.images : [],
    user_id: userId,
    paid_by: header.paid_by,
    paid_by_id: header.paid_by_id,
    paid_user_id: header.paid_user_id,
  });
  if (Number(approve.status) !== 1) {
    throw new Error(`approve_expense_data failed: ${JSON.stringify(approve)}`);
  }

  return {
    ok: true,
    expense_id: expenseId,
    header,
    lines,
    total_tax: totalTax,
    total_amount: totalAmount,
    hold_response: hold,
    detail_responses: detailResponses,
    approve_response: approve,
  };
};

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const extractCounterCashAmount = (html: string, label: string) => {
  const pattern = new RegExp(
    `<td[^>]*>\\s*${escapeRegex(label)}\\s*<\\/td>\\s*<td[^>]*>\\s*([\\d,.-]+)\\s*<\\/td>`,
    'i'
  );
  const match = html.match(pattern);
  return match ? parseMoney(match[1]) : 0;
};

const extractCounterCashText = (html: string, pattern: RegExp) => {
  const match = html.match(pattern);
  return match ? stripHtml(match[1]) : '';
};

const roundReportMoney = (value: number) => Math.round((Number(value) || 0) * 100) / 100;

const parseCounterCashReportHtml = (html: string) => {
  const parseExpenseRows = (sectionHtml: string) => {
    const rows: Array<{ no: number; description: string; amount: number }> = [];
    const expensePattern =
      /<tr>\s*<td[^>]*>\s*(\d+)\s*<\/td>\s*<td[^>]*colspan="3"[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td[^>]*align="right"[^>]*>\s*([\d,.-]+)\s*<\/td>\s*<\/tr>/gi;
    for (const match of sectionHtml.matchAll(expensePattern)) {
      rows.push({
        no: Number(match[1]) || rows.length + 1,
        description: stripHtml(match[2]),
        amount: parseMoney(match[3]),
      });
    }
    return rows;
  };

  const expenseSections: Array<{
    key: string;
    title: string;
    received_total: number;
    expense_total: number;
    balance: number;
    rows: Array<{ no: number; description: string; amount: number }>;
  }> = [];
  const expenseSectionPattern =
    /<h3[^>]*class="[^"]*sub_title[^"]*"[^>]*>([\s\S]*?)<\/h3>([\s\S]*?)(?=<tr>\s*<td[^>]*colspan="5"[^>]*>\s*<h3[^>]*class="[^"]*sub_title|<\/tbody>\s*<\/table>)/gi;
  for (const match of html.matchAll(expenseSectionPattern)) {
    const title = stripHtml(match[1]);
    const sectionHtml = String(match[2] ?? '');
    if (!title) continue;
    const lowerTitle = title.toLowerCase();
    expenseSections.push({
      key: lowerTitle.includes('credit') ? 'credit_card' : 'cash',
      title,
      received_total: extractCounterCashAmount(sectionHtml, 'Received Total'),
      expense_total: extractCounterCashAmount(sectionHtml, 'Expense Total'),
      balance: extractCounterCashAmount(sectionHtml, 'Balance'),
      rows: parseExpenseRows(sectionHtml),
    });
  }

  const expenseRows = expenseSections.flatMap((section) =>
    section.rows.map((row) => ({
      ...row,
      account: section.key,
      account_title: section.title,
    }))
  );
  if (expenseRows.length === 0) {
    expenseRows.push(
      ...parseExpenseRows(html).map((row) => ({
        ...row,
        account: 'unknown',
        account_title: 'Expense Details',
      }))
    );
  }

  const cashExpenseSection = expenseSections.find((section) => section.key === 'cash');
  const creditCardExpenseSection = expenseSections.find((section) => section.key === 'credit_card');

  const customerRows: Array<{ customer: string; invoice_count: number; amount: number }> = [];
  const customerPattern =
    /<tr>\s*<td[^>]*align="left"[^>]*>\s*([^<]+?)\s*<\/td>\s*<td[^>]*align="left"[^>]*>\s*(\d+)\s*<\/td>\s*<td[^>]*align="right"[^>]*>\s*([\d,.-]+)\s*<\/td>\s*<\/tr>/gi;
  for (const match of html.matchAll(customerPattern)) {
    const customer = stripHtml(match[1]);
    if (!customer || customer.toLowerCase() === 'customer') continue;
    customerRows.push({
      customer,
      invoice_count: Number(match[2]) || 0,
      amount: parseMoney(match[3]),
    });
  }

  return {
    company: extractCounterCashText(html, /<h4[^>]*>\s*([^<]*IN AND OUT LAUNDRY[^<]*)\s*<\/h4>/i),
    report_name: extractCounterCashText(html, /<h4[^>]*>\s*Reports\s*:\s*([\s\S]*?)<\/h4>/i),
    date_range: extractCounterCashText(html, /Reports Date Range\s*:\s*([\s\S]*?)<\/h4>/i),
    printed_at: extractCounterCashText(html, /Printing Date\s*\/\s*Time\s*:\s*([\s\S]*?)<\/h4>/i),
    branch: extractCounterCashText(html, /<h4[^>]*>\s*Branch\s*:\s*([\s\S]*?)<\/h4>/i),
    cash_receipt: extractCounterCashAmount(html, 'Cash Account(Reciept)'),
    card_receipt: extractCounterCashAmount(html, 'Credit Card(Reciept)'),
    grand_total_receipt: extractCounterCashAmount(html, 'Grand Total Receipt'),
    total_income: extractCounterCashAmount(html, 'Total Income'),
    cash_in_hand: extractCounterCashAmount(html, 'Cash in Hand'),
    received_total: roundReportMoney(expenseSections.reduce((sum, section) => sum + section.received_total, 0)),
    expense_total: roundReportMoney(expenseSections.reduce((sum, section) => sum + section.expense_total, 0)),
    balance: roundReportMoney(expenseSections.reduce((sum, section) => sum + section.balance, 0)),
    cash_received_total: cashExpenseSection?.received_total ?? 0,
    cash_expense_total: cashExpenseSection?.expense_total ?? 0,
    cash_balance: cashExpenseSection?.balance ?? 0,
    credit_card_received_total: creditCardExpenseSection?.received_total ?? 0,
    credit_card_expense_total: creditCardExpenseSection?.expense_total ?? 0,
    credit_card_balance: creditCardExpenseSection?.balance ?? 0,
    total_invoice: extractCounterCashAmount(html, 'Total Invoice'),
    expense_sections: expenseSections,
    expenses: expenseRows,
    customers: customerRows,
  };
};

type PerformanceBucket = {
  label: string;
  from_date: string;
  to_date: string;
};

const dateOnlyUtc = (date: Date) => date.toISOString().slice(0, 10);

const parseReportDateUtc = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const addUtcDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

const daysBetweenInclusive = (fromDate: string, toDate: string) => {
  const from = parseReportDateUtc(fromDate);
  const to = parseReportDateUtc(toDate);
  return Math.max(1, Math.floor((to.getTime() - from.getTime()) / 86_400_000) + 1);
};

const buildPerformanceBuckets = (fromDate: string, toDate: string): PerformanceBucket[] => {
  const totalDays = daysBetweenInclusive(fromDate, toDate);
  const from = parseReportDateUtc(fromDate);
  const to = parseReportDateUtc(toDate);
  const buckets: PerformanceBucket[] = [];

  if (totalDays <= 45) {
    for (let cursor = new Date(from); cursor <= to; cursor = addUtcDays(cursor, 1)) {
      const date = dateOnlyUtc(cursor);
      buckets.push({ label: date.slice(5), from_date: date, to_date: date });
    }
    return buckets;
  }

  const cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1));
  while (cursor <= to) {
    const monthStart = new Date(cursor);
    const monthEnd = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 0));
    const bucketFrom = monthStart < from ? from : monthStart;
    const bucketTo = monthEnd > to ? to : monthEnd;
    buckets.push({
      label: `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`,
      from_date: dateOnlyUtc(bucketFrom),
      to_date: dateOnlyUtc(bucketTo),
    });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return buckets;
};

const fetchCounterCashReportSummary = async (input: any) => {
  const payload = buildCounterCashReportPayload(input);
  const { text } = await postPosForm(POS_COUNTER_CASH_REPORT_PATH, payload, { fallbackToGet: false });
  const html = String(text ?? '').trim();
  if (!html) throw new Error('POS returned an empty report response.');
  if (isLikelyPosLoginHtml(html)) {
    throw new Error('POS returned the login page. Check POS auto-login settings and Counter Cash report permission.');
  }
  return {
    request: Object.fromEntries(payload.entries()),
    html,
    summary: parseCounterCashReportHtml(html),
  };
};

type ReportTableRow = {
  context: string;
  values: Record<string, string>;
  cells: string[];
};

type ReportDetailLine = {
  source: 'expense_details' | 'purchase_details' | 'counter_cash';
  category: string;
  description: string;
  amount: number;
  date?: string;
  method?: string;
};

const cleanReportText = (value: unknown) =>
  stripHtml(String(value ?? '').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&'))
    .replace(/\s+/g, ' ')
    .trim();

const titleCaseReportLabel = (value: string) =>
  value
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\bAnd\b/g, 'and')
    .trim();

const shortenReportPartyName = (value: unknown) => {
  const text = cleanReportText(value)
    .replace(/\b(LLC|L\.L\.C|LTD|CO\.?|COMPANY|EST\.?|ESTABLISHMENT)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return '';
  if (text.length <= 38) return titleCaseReportLabel(text);
  return titleCaseReportLabel(text.slice(0, 38).replace(/\s+\S*$/, ''));
};

const simplifyExpenseCategoryLabel = (category: unknown, description?: unknown) => {
  const raw = cleanReportText(`${category ?? ''} ${description ?? ''}`);
  if (!raw) return 'مصروفات';
  const lower = raw.toLowerCase();

  if (/rent|rental|shop rental|lease|ايجار|إيجار/.test(lower)) return 'Rental';
  if (/taqa|addc|electric|water|utility|كهرب|مياه/.test(lower)) return 'TAQA';
  if (/federal tax authority|tax payment|vat|ضريبة|القيمة المضافة/.test(lower)) return 'Federal Tax Authority';
  if (/salary|wage|staff|worker|employee|راتب|رواتب/.test(lower)) return 'Salaries';
  if (/petrol|fuel|adnoc|diesel|vehicle|transport|delivery|وقود|بترول|توصيل/.test(lower)) return 'Transport';
  if (/chemical|detergent|soap|material|مواد|كيما/.test(lower)) return 'Chemicals';
  if (/maint|repair|spare|service|صيانة|تصليح/.test(lower)) return 'Maintenance';
  if (/internet|etisalat|du telecom|telecom|phone|هاتف|انترنت/.test(lower)) return 'Telecom';
  if (/insurance|تأمين/.test(lower)) return 'Insurance';
  if (/software|subscription|system|نظام|اشتراك/.test(lower)) return 'Software';

  const billPartyMatch = raw.match(/Bill#?:?[^,]*,\s*([^,]+)/i);
  if (billPartyMatch?.[1]) return shortenReportPartyName(billPartyMatch[1]);

  const parts = raw
    .split(',')
    .map((part) =>
      part
        .replace(/\bPayment\s+on\s+Expence-\d+\b/gi, '')
        .replace(/\bPayment\s+on\s+Expense-\d+\b/gi, '')
        .replace(/\bBy\s+Remittance\b/gi, '')
        .replace(/\bBill\s*#?:?\s*[\w/-]+\b/gi, '')
        .replace(/\bExpence-\d+\b/gi, '')
        .replace(/\bExpense-\d+\b/gi, '')
        .replace(/\bPayment\b/gi, '')
        .trim()
    )
    .filter(Boolean);

  const meaningful = parts
    .filter((part) => !/^\d+(\.\d+)?$/.test(part))
    .sort((left, right) => right.length - left.length)[0];

  return shortenReportPartyName(meaningful || raw) || 'مصروفات';
};

const simplifyPaymentMethodLabel = (value: unknown) => {
  const raw = cleanReportText(value);
  const lower = raw.toLowerCase();
  if (!raw) return 'Other';
  if (/cash|كاش|نقد/.test(lower)) return 'Cash';
  if (/visa|master|card|credit|debit|بطاقة/.test(lower)) return 'Card';
  if (/bank|transfer|remittance|wire|تحويل/.test(lower)) return 'Bank Transfer';
  if (/online|link|payment gateway/.test(lower)) return 'Online';
  if (/cheque|check|شيك/.test(lower)) return 'Cheque';
  return shortenReportPartyName(raw) || 'Other';
};

const normalizeReportKey = (value: unknown) =>
  cleanReportText(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '');

const extractReportCells = (rowHtml: string) =>
  Array.from(rowHtml.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)).map((match) => cleanReportText(match[1]));

const extractNearestReportContext = (html: string, tableIndex: number) => {
  const before = html.slice(Math.max(0, tableIndex - 2500), tableIndex);
  const headings = Array.from(before.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)).map((match) => cleanReportText(match[1]));
  const titledDivs = Array.from(before.matchAll(/<[^>]*class="[^"]*(?:sub_title|title|heading)[^"]*"[^>]*>([\s\S]*?)<\/[^>]+>/gi)).map((match) =>
    cleanReportText(match[1])
  );
  return [...headings, ...titledDivs].filter(Boolean).slice(-3).join(' | ');
};

const parseReportTables = (html: string): ReportTableRow[] => {
  const rows: ReportTableRow[] = [];
  for (const tableMatch of html.matchAll(/<table[\s\S]*?<\/table>/gi)) {
    const tableHtml = String(tableMatch[0] ?? '');
    const context = extractNearestReportContext(html, tableMatch.index ?? 0);
    const trMatches = Array.from(tableHtml.matchAll(/<tr[\s\S]*?<\/tr>/gi));
    let headers: string[] = [];
    for (const [rowIndex, trMatch] of trMatches.entries()) {
      const rowHtml = String(trMatch[0] ?? '');
      const cells = extractReportCells(rowHtml);
      if (cells.length < 2) continue;
      const hasHeaderCells = /<th\b/i.test(rowHtml);
      const normalizedCells = cells.map(normalizeReportKey);
      const looksLikeHeader =
        hasHeaderCells ||
        normalizedCells.some((cell) =>
          /date|amount|total|account|description|particular|supplier|vendor|category|method|payment|invoice|bill|تاريخ|مبلغ|اجمالي|إجمالي|حساب|بيان|وصف|مورد|طريقة|دفع|فاتورة/.test(
            cell
          )
        );

      if ((!headers.length || hasHeaderCells) && looksLikeHeader && rowIndex < 5) {
        headers = cells.map((cell, index) => normalizeReportKey(cell) || `cell${index + 1}`);
        continue;
      }

      const values: Record<string, string> = {};
      cells.forEach((cell, index) => {
        values[headers[index] || `cell${index + 1}`] = cell;
      });
      rows.push({ context, values, cells });
    }
  }
  return rows;
};

const valueByReportKeys = (row: ReportTableRow, patterns: RegExp[]) => {
  for (const [key, value] of Object.entries(row.values)) {
    if (patterns.some((pattern) => pattern.test(key))) return value;
  }
  return '';
};

const amountFromReportRow = (row: ReportTableRow, patterns: RegExp[]) => {
  const direct = valueByReportKeys(row, patterns);
  if (direct) {
    const amount = parseMoney(direct);
    if (amount) return amount;
  }

  const numericCells = row.cells
    .map((cell) => parseMoney(cell))
    .filter((amount) => Number.isFinite(amount) && Math.abs(amount) > 0);
  return numericCells.length ? numericCells[numericCells.length - 1] : 0;
};

const dateFromReportRow = (row: ReportTableRow) => {
  const direct = valueByReportKeys(row, [/date|تاريخ|billdate|invoicedate/]);
  const candidate = direct || row.cells.find((cell) => /\b\d{4}-\d{2}-\d{2}\b|\b\d{2}[/-]\d{2}[/-]\d{4}\b/.test(cell)) || '';
  const isoMatch = candidate.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  const slashMatch = candidate.match(/\b(\d{2})[/-](\d{2})[/-](\d{4})\b/);
  if (slashMatch) return `${slashMatch[3]}-${slashMatch[2]}-${slashMatch[1]}`;
  return '';
};

const reportRowContextMatches = (row: ReportTableRow, patterns: RegExp[]) => {
  const text = `${row.context} ${Object.keys(row.values).join(' ')} ${row.cells.join(' ')}`.toLowerCase();
  return patterns.some((pattern) => pattern.test(text));
};

const parseExpenseAndPurchaseDetails = (html: string): ReportDetailLine[] => {
  const rows = parseReportTables(html);
  const lines: ReportDetailLine[] = [];

  for (const row of rows) {
    const isPurchase = reportRowContextMatches(row, [/purchase|supplier|vendor|مشتريات|شراء|مورد/]);
    const isExpense = reportRowContextMatches(row, [/expense|expence|accounthead|expenseaccount|مصروف|مصروفات/]);
    if (!isExpense && !isPurchase) continue;

    const amount = amountFromReportRow(row, [/total|amount|net|debit|مبلغ|اجمالي|إجمالي/]);
    if (!amount) continue;

    const account =
      valueByReportKeys(row, [/accounthead|expenseaccount|account|category|type|حساب|فئة|بند/]) ||
      valueByReportKeys(row, [/supplier|vendor|party|مورد|طرف/]);
    const description =
      valueByReportKeys(row, [/description|particular|notes|remark|item|product|بيان|وصف|ملاحظ|الصنف/]) ||
      valueByReportKeys(row, [/bill|invoice|voucher|فاتورة|سند/]) ||
      row.cells.find((cell) => cell && !/^\d+$/.test(cell) && parseMoney(cell) === 0) ||
      '';
    const category = cleanReportText(account || description || (isPurchase ? 'مشتريات' : 'مصروفات'));

    lines.push({
      source: isPurchase ? 'purchase_details' : 'expense_details',
      category: simplifyExpenseCategoryLabel(category, description),
      description: cleanReportText(description || category),
      amount: roundReportMoney(Math.abs(amount)),
      date: dateFromReportRow(row) || undefined,
    });
  }

  return lines;
};

const buildDetailExpenseCategories = (
  summary: ReturnType<typeof parseCounterCashReportHtml>,
  detailLines: ReportDetailLine[]
) => {
  const usableLines = detailLines.filter((line) => line.amount > 0);
  if (!usableLines.length) return null;

  const totals = new Map<string, number>();
  for (const line of usableLines) {
    const category = simplifyExpenseCategoryLabel(line.category, line.description);
    totals.set(category, roundReportMoney((totals.get(category) || 0) + line.amount));
  }
  const total = roundReportMoney(Array.from(totals.values()).reduce((sum, amount) => sum + amount, 0)) || summary.expense_total;

  const sorted = Array.from(totals.entries())
    .map(([category, amount]) => ({
      category,
      amount: roundReportMoney(amount),
      percent: total > 0 ? roundReportMoney((amount / total) * 100) : 0,
      source: 'expense_purchase_details',
    }))
    .sort((left, right) => right.amount - left.amount);

  const visible = sorted.slice(0, 6);
  const rest = sorted.slice(6);
  if (rest.length) {
    const otherAmount = roundReportMoney(rest.reduce((sum, item) => sum + item.amount, 0));
    visible.push({
      category: 'Other',
      amount: otherAmount,
      percent: total > 0 ? roundReportMoney((otherAmount / total) * 100) : 0,
      source: 'expense_purchase_details',
    });
  }
  return visible;
};

const parsePaymentMethodDetails = (html: string) => {
  const rows = parseReportTables(html).filter((row) =>
    reportRowContextMatches(row, [/payment|received|receipt|cash|card|visa|master|دفع|مدفوع|استلام|كاش|بطاقة/])
  );
  const totals = new Map<string, number>();
  for (const row of rows) {
    const amount = amountFromReportRow(row, [/amount|paid|received|receipt|total|مبلغ|مدفوع|استلام|اجمالي|إجمالي/]);
    if (!amount) continue;
    const method =
      valueByReportKeys(row, [/method|payment|account|payaccount|mode|طريقة|دفع|حساب/]) ||
      row.cells.find((cell) => /cash|card|visa|master|كاش|بطاقة/i.test(cell)) ||
      'Other';
    const label = simplifyPaymentMethodLabel(method);
    totals.set(label, roundReportMoney((totals.get(label) || 0) + Math.abs(amount)));
  }
  return Array.from(totals.entries())
    .map(([method, amount]) => ({ method, amount }))
    .sort((left, right) => right.amount - left.amount);
};

const buildRevenueSeriesFromDetails = (html: string, buckets: PerformanceBucket[]) => {
  const rows = parseReportTables(html).filter((row) =>
    reportRowContextMatches(row, [/order|invoice|billwise|bill|sale|revenue|فاتورة|طلب|مبيعات|إيراد|ايراد/])
  );
  if (!rows.length) return null;

  const series = buckets.map((bucket) => ({
    label: bucket.label,
    from_date: bucket.from_date,
    to_date: bucket.to_date,
    revenue: 0,
    expenses: 0,
    orders: 0,
  }));

  for (const row of rows) {
    const date = dateFromReportRow(row);
    const amount = amountFromReportRow(row, [/grandtotal|nettotal|total|amount|paid|balance|اجمالي|إجمالي|مبلغ/]);
    if (!date || !amount) continue;
    const bucketIndex = buckets.findIndex((bucket) => date >= bucket.from_date && date <= bucket.to_date);
    if (bucketIndex < 0) continue;
    series[bucketIndex].revenue = roundReportMoney(series[bucketIndex].revenue + Math.abs(amount));
    series[bucketIndex].orders += 1;
  }

  return series.some((item) => item.revenue > 0 || item.orders > 0) ? series : null;
};

const categorizeExpense = (description: string) => {
  const text = description.toLowerCase();
  if (/salary|wage|staff|worker|employee|راتب|رواتب/.test(text)) return 'رواتب وأجور';
  if (/rent|lease|ايجار|إيجار/.test(text)) return 'إيجار';
  if (/electric|addc|water|utility|كهرب|مياه/.test(text)) return 'مرافق';
  if (/chemical|detergent|soap|material|مواد|كيما/.test(text)) return 'مواد كيميائية';
  if (/maint|repair|spare|service|صيانة|تصليح/.test(text)) return 'صيانة ومعدات';
  if (/fuel|petrol|adnoc|delivery|transport|car|vehicle|وقود|بترول|توصيل/.test(text)) return 'نقل وتشغيل';
  return 'أخرى';
};

const buildExpenseCategories = (summary: ReturnType<typeof parseCounterCashReportHtml>) => {
  const totals = new Map<string, number>();
  for (const row of summary.expenses || []) {
    const category = categorizeExpense(row.description || row.account_title || '');
    totals.set(category, roundReportMoney((totals.get(category) || 0) + Number(row.amount || 0)));
  }
  if (!totals.size && summary.expense_total > 0) totals.set('مصروفات عامة', summary.expense_total);
  return Array.from(totals.entries())
    .map(([category, amount]) => ({
      category,
      amount: roundReportMoney(amount),
      percent: summary.expense_total > 0 ? roundReportMoney((amount / summary.expense_total) * 100) : 0,
    }))
    .sort((left, right) => right.amount - left.amount);
};

const buildReportAdvice = (summary: ReturnType<typeof parseCounterCashReportHtml>) => {
  const revenue = Number(summary.total_income || 0);
  const expenses = Number(summary.expense_total || 0);
  const cash = Number(summary.cash_receipt || 0);
  const card = Number(summary.card_receipt || 0);
  const netProfit = revenue - expenses;
  const netCash = cash - Number(summary.cash_expense_total || 0);
  const cardShare = revenue > 0 ? (card / revenue) * 100 : 0;
  const expenseShare = revenue > 0 ? (expenses / revenue) * 100 : 0;

  const performance: string[] = [];
  const notes: string[] = [];
  const goals: string[] = [];

  if (revenue > 0) performance.push(`حقق الفرع إيرادات قدرها AED ${revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`);
  if (cardShare >= 70) performance.push(`المدفوعات بالبطاقة تمثل ${cardShare.toFixed(1)}% من إجمالي الإيرادات.`);
  if (netProfit > 0) performance.push(`صافي الإيراد بعد المصروفات إيجابي بنسبة ${((netProfit / Math.max(revenue, 1)) * 100).toFixed(1)}%.`);
  if (summary.total_invoice > 0) performance.push(`عدد الطلبات المسجلة ${Number(summary.total_invoice).toLocaleString('en-US')} طلب.`);

  if (netCash < 0) notes.push('صافي الكاش بعد مصروفات الكاش سلبي، يرجى مراجعة تدفقات الكاش اليومية.');
  if (expenseShare > 25) notes.push(`نسبة المصروفات مرتفعة عند ${expenseShare.toFixed(1)}% من الإيرادات.`);
  if (cardShare > 85) notes.push('نسبة البطاقة عالية؛ راقب توفر الكاش التشغيلي في الفرع.');
  if (!notes.length) notes.push('لا توجد ملاحظات مالية حرجة حسب القواعد الحالية.');

  goals.push('زيادة الإيرادات بنسبة 10% في الفترة القادمة.');
  if (expenseShare > 20) goals.push('خفض نسبة المصروفات إلى أقل من 20% من الإيرادات.');
  if (netCash < 0) goals.push('رفع صافي الكاش عبر تقليل المصروفات النقدية أو زيادة المدفوعات النقدية.');
  if (cardShare > 85) goals.push('تحسين توازن طرق الدفع وتقليل الاعتماد الكامل على البطاقة.');

  return { performance, notes, goals };
};

const buildPerformanceReport = async (input: any, req: any) => {
  const detailedInput = {
    ...input,
    expence_entry_details: '1',
    purchase_etnry_details: '1',
    received_payment_details: '1',
    order_billwise_details: '1',
  };
  const aggregate = await fetchCounterCashReportSummary(detailedInput);
  const request = aggregate.request;
  const summary = aggregate.summary;
  const fromDate = request.from_date;
  const toDate = request.to_date;
  const buckets = buildPerformanceBuckets(fromDate, toDate);
  const detailLines = parseExpenseAndPurchaseDetails(aggregate.html);
  const detailExpenseCategories = buildDetailExpenseCategories(summary, detailLines);
  const paymentDetails = parsePaymentMethodDetails(aggregate.html);
  let series = buildRevenueSeriesFromDetails(aggregate.html, buckets);
  let revenueTrendSource = 'order_billwise_details';

  if (!series) {
    revenueTrendSource = 'counter_cash_bucket_reports';
    const fallbackSeries: Array<{ label: string; from_date: string; to_date: string; revenue: number; expenses: number; orders: number }> = [];
    for (const bucket of buckets) {
      const bucketReport = await fetchCounterCashReportSummary({
        ...input,
        from_date: bucket.from_date,
        to_date: bucket.to_date,
        from_time: '12:00 AM',
        to_time: '11:59 PM',
      });
      fallbackSeries.push({
        label: bucket.label,
        from_date: bucket.from_date,
        to_date: bucket.to_date,
        revenue: bucketReport.summary.total_income,
        expenses: bucketReport.summary.expense_total,
        orders: bucketReport.summary.total_invoice,
      });
    }
    series = fallbackSeries;
  }

  const revenue = Number(summary.total_income || 0);
  const expenses = Number(summary.expense_total || 0);
  const cash = Number(summary.cash_receipt || 0);
  const card = Number(summary.card_receipt || 0);
  const cashExpenses = Number(summary.cash_expense_total || 0);
  const netProfit = roundReportMoney(revenue - expenses);
  const netCash = roundReportMoney(cash - cashExpenses);
  const periodLabel = String(input?.period_label || input?.periodLabel || `${fromDate} إلى ${toDate}`).trim();
  const reportId = [
    'RPT',
    fromDate.replace(/\D/g, ''),
    toDate.replace(/\D/g, ''),
    String(request.branch_id || 'all').replace(/\W/g, '').toUpperCase(),
  ].join('-');
  const query = new URLSearchParams({
    from_date: fromDate,
    to_date: toDate,
    period_label: periodLabel,
  });
  if (request.branch_id) query.set('branch_id', request.branch_id);
  const shareUrl = `${req.protocol}://${req.get('host')}/performance-report?${query.toString()}`;

  return {
    ok: true,
    report_id: reportId,
    report_type: String(input?.report_type || input?.reportType || 'performance'),
    period_label: periodLabel,
    from_date: fromDate,
    to_date: toDate,
    branch_id: request.branch_id || '',
    branch_name: String(input?.branch_name || input?.branchName || summary.branch || '').trim(),
    prepared_by: 'Sanad Laundry Tech System',
    report_date: new Date().toISOString().slice(0, 10),
    endpoint: resolvePosEndpointFromPath(POS_COUNTER_CASH_REPORT_PATH),
    request,
    share_url: shareUrl,
    image_url: `${shareUrl}&mode=image`,
    summary,
    metrics: {
      total_revenue: revenue,
      cash,
      card,
      total_expenses: expenses,
      net_profit: netProfit,
      cash_expenses: cashExpenses,
      card_expenses: Number(summary.credit_card_expense_total || 0),
      net_cash: netCash,
      total_orders: Number(summary.total_invoice || 0),
      cash_percent: revenue > 0 ? roundReportMoney((cash / revenue) * 100) : 0,
      card_percent: revenue > 0 ? roundReportMoney((card / revenue) * 100) : 0,
      expense_percent: revenue > 0 ? roundReportMoney((expenses / revenue) * 100) : 0,
      net_profit_percent: revenue > 0 ? roundReportMoney((netProfit / revenue) * 100) : 0,
    },
    series,
    payment_methods:
      paymentDetails.length > 0
        ? paymentDetails.map((item) => ({
            ...item,
            percent: revenue > 0 ? roundReportMoney((item.amount / revenue) * 100) : 0,
            source: 'received_payment_details',
          }))
        : [
            {
              method: 'الكاش (Cash)',
              amount: cash,
              percent: revenue > 0 ? roundReportMoney((cash / revenue) * 100) : 0,
              source: 'counter_cash_summary',
            },
            {
              method: 'البطاقة (Card)',
              amount: card,
              percent: revenue > 0 ? roundReportMoney((card / revenue) * 100) : 0,
              source: 'counter_cash_summary',
            },
          ],
    expense_details: detailLines,
    expense_categories: detailExpenseCategories || buildExpenseCategories(summary),
    advice: buildReportAdvice(summary),
    data_sources: {
      expense_categories: detailExpenseCategories ? 'expense_purchase_details' : 'counter_cash_summary_rows',
      payment_methods: paymentDetails.length > 0 ? 'received_payment_details' : 'counter_cash_summary',
      revenue_trend: revenueTrendSource,
    },
    html_length: aggregate.html.length,
  };
};

type DailyOperationBranchInput = {
  id: string;
  name: string;
};

const normalizeDailyReportDate = (value: unknown) => {
  const fallback = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  return normalizeReportDateInput(value, fallback);
};

const addReportDateDays = (date: string, days: number) => {
  const parsed = parseReportDateUtc(date);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return dateOnlyUtc(parsed);
};

const formatReportDateLong = (date: string) => {
  const parsed = parseReportDateUtc(date);
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
};

const normalizeBranchReportName = (value: unknown, fallback: string) => {
  const text = cleanReportText(value || fallback);
  const normalized = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (normalized.includes('ALFALAH')) return 'Al Falah';
  if (normalized.includes('MBZ') || normalized.includes('MOHAMMEDBINZAYED')) return 'MBZ';
  if (normalized.includes('MUSAFFAH') || normalized.includes('MUSSAFAH')) return 'Musaffah';
  if (normalized.includes('RIYADH')) return 'Al Riyadh';
  return text || fallback;
};

const getDailyOperationBranches = (input: any): DailyOperationBranchInput[] => {
  const requested = String(input?.branch_ids ?? input?.branchIds ?? '').trim();
  if (requested) {
    return requested
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
      .map((id) => ({ id, name: `Branch ${id}` }));
  }

  const localBranches =
    typeof readSqliteBranches === 'function'
      ? readSqliteBranches()
          .filter((branch) => String(branch.status || 'active').toLowerCase() !== 'inactive')
          .map((branch) => ({
            id: String(branch.id),
            name: normalizeBranchReportName(branch.name, `Branch ${branch.id}`),
          }))
      : [];

  if (localBranches.length > 1) return localBranches;
  return [
    { id: '1', name: 'Al Falah' },
    { id: '2', name: 'MBZ' },
    { id: '3', name: 'Musaffah' },
  ];
};

const fetchDailyOperationBranchReport = async (branch: DailyOperationBranchInput, fromDate: string, toDate = fromDate, detailed = false) => {
  try {
    const result = await fetchCounterCashReportSummary({
      branch_id: branch.id,
      from_date: fromDate,
      from_time: '12:00 AM',
      to_date: toDate,
      to_time: '11:59 PM',
      ...(detailed
        ? {
            expence_entry_details: '1',
            purchase_etnry_details: '1',
            received_payment_details: '1',
            order_billwise_details: '1',
            prod_details: '1',
            ord_prod_details: '1',
            cust_details: '1',
          }
        : {}),
    });
    return {
      ok: true,
      branch,
      html: result.html,
      summary: result.summary,
      error: '',
    };
  } catch (error: any) {
    return {
      ok: false,
      branch,
      html: '',
      summary: {
        branch: branch.name,
        total_income: 0,
        cash_receipt: 0,
        card_receipt: 0,
        expense_total: 0,
        cash_expense_total: 0,
        credit_card_expense_total: 0,
        cash_in_hand: 0,
        total_invoice: 0,
        customers: [],
        expenses: [],
      } as ReturnType<typeof parseCounterCashReportHtml>,
      error: error?.message || 'Failed to fetch branch report.',
    };
  }
};

const simplifyServiceLabel = (value: unknown) => {
  const raw = cleanReportText(value);
  if (!raw) return 'Other Services';
  const lower = raw.toLowerCase();
  if (/wash.*dry|dry.*wash|غسيل/.test(lower)) return /urgent|express|عاجل/.test(lower) ? 'Wash & Dry (Urgent)' : 'Wash & Dry';
  if (/iron|press|كوي/.test(lower)) return 'Ironing';
  if (/spot|stain|بقع/.test(lower)) return 'Spotting';
  if (/kg|misc|other|متنوع|اخرى|أخرى/.test(lower)) return 'Others';
  return shortenReportPartyName(raw);
};

const parseServiceDetailsFromHtml = (html: string) => {
  const rows = parseReportTables(html).filter((row) =>
    reportRowContextMatches(row, [/product|service|item|qty|quantity|orderproduct|saleproduct|خدمة|صنف|كمية/])
  );
  const totals = new Map<string, { service: string; qty: number; revenue: number }>();

  for (const row of rows) {
    const service =
      valueByReportKeys(row, [/service|product|item|description|name|خدمة|صنف|وصف|اسم/]) ||
      row.cells.find((cell) => cell && parseMoney(cell) === 0 && !/date|total|amount|qty/i.test(cell)) ||
      '';
    const label = simplifyServiceLabel(service);
    const qty = Math.abs(amountFromReportRow(row, [/qty|quantity|pcs|pieces|count|كمية|عدد/]));
    const revenue = Math.abs(amountFromReportRow(row, [/revenue|total|amount|net|grand|اجمالي|إجمالي|مبلغ/]));
    if (!label || (!qty && !revenue)) continue;

    const current = totals.get(label) || { service: label, qty: 0, revenue: 0 };
    current.qty = roundReportMoney(current.qty + qty);
    current.revenue = roundReportMoney(current.revenue + revenue);
    totals.set(label, current);
  }

  return Array.from(totals.values()).sort((left, right) => right.revenue - left.revenue);
};

const combineOperationExpenseCategories = (
  reports: Array<Awaited<ReturnType<typeof fetchDailyOperationBranchReport>>>,
  totalExpenses: number
) => {
  const totals = new Map<string, number>();
  for (const report of reports) {
    const detailLines = parseExpenseAndPurchaseDetails(report.html);
    const detailCategories = buildDetailExpenseCategories(report.summary, detailLines) || buildExpenseCategories(report.summary);
    for (const item of detailCategories) {
      const label = simplifyExpenseCategoryLabel(item.category);
      totals.set(label, roundReportMoney((totals.get(label) || 0) + item.amount));
    }
  }
  const computedTotal = roundReportMoney(Array.from(totals.values()).reduce((sum, value) => sum + value, 0)) || totalExpenses;
  return Array.from(totals.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percent: computedTotal > 0 ? roundReportMoney((amount / computedTotal) * 100) : 0,
    }))
    .sort((left, right) => right.amount - left.amount)
    .slice(0, 6);
};

const saveReportSnapshot = (report: any) => {
  const shareToken = randomUUID().replace(/-/g, '');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString();
  const payload = {
    ...report,
    share_token: shareToken,
  };
  db.prepare(
    `INSERT INTO report_snapshots (report_id, share_token, report_type, payload_json, created_at, expires_at)
     VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
     ON CONFLICT(report_id) DO UPDATE SET
       share_token = excluded.share_token,
       report_type = excluded.report_type,
       payload_json = excluded.payload_json,
       created_at = CURRENT_TIMESTAMP,
       expires_at = excluded.expires_at`
  ).run(report.report_id, shareToken, report.report_type || 'report', JSON.stringify(payload), expiresAt);
  return payload;
};

const readReportSnapshot = (reportId: unknown, token?: unknown) => {
  const id = String(reportId ?? '').trim();
  if (!id) return null;
  const row = db.prepare('SELECT * FROM report_snapshots WHERE report_id = ?').get(id) as
    | { report_id: string; share_token: string; payload_json: string; expires_at?: string }
    | undefined;
  if (!row) return null;
  const providedToken = String(token ?? '').trim();
  if (providedToken && providedToken !== row.share_token) return null;
  if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) return null;
  try {
    return JSON.parse(row.payload_json);
  } catch {
    return null;
  }
};

const normalizeOperationsReportPeriod = (input: any) => {
  const type = String(input?.report_type ?? input?.period_type ?? input?.period ?? 'daily').trim().toLowerCase();
  const normalizedType = type.includes('week') ? 'weekly' : type.includes('month') ? 'monthly' : 'daily';
  const today = normalizeDailyReportDate(input?.date ?? input?.to_date);
  if (input?.from_date && input?.to_date) {
    return {
      reportType: normalizedType,
      fromDate: normalizeReportDateInput(input.from_date, today),
      toDate: normalizeReportDateInput(input.to_date, today),
    };
  }
  if (normalizedType === 'weekly') {
    return { reportType: 'weekly', fromDate: addReportDateDays(today, -6), toDate: today };
  }
  if (normalizedType === 'monthly') {
    const parsed = parseReportDateUtc(today);
    const fromDate = dateOnlyUtc(new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), 1)));
    return { reportType: 'monthly', fromDate, toDate: today };
  }
  return { reportType: 'daily', fromDate: today, toDate: today };
};

const reportTitleForOperationsType = (reportType: string) => {
  if (reportType === 'weekly') return 'WEEKLY OPERATIONS REPORT';
  if (reportType === 'monthly') return 'MONTHLY OPERATIONS REPORT';
  return 'DAILY OPERATIONS REPORT';
};

const buildDailyOperationsReport = async (input: any, req: any) => {
  const { reportType, fromDate, toDate } = normalizeOperationsReportPeriod(input);
  const reportDate = toDate;
  const dayCount = daysBetweenInclusive(fromDate, toDate);
  const previousToDate = addReportDateDays(fromDate, -1);
  const previousFromDate = addReportDateDays(previousToDate, -(dayCount - 1));
  const branches = getDailyOperationBranches(input);
  const currentReports = await Promise.all(branches.map((branch) => fetchDailyOperationBranchReport(branch, fromDate, toDate, true)));
  const previousReports = await Promise.all(branches.map((branch) => fetchDailyOperationBranchReport(branch, previousFromDate, previousToDate, false)));

  const sumReports = (reports: typeof currentReports, key: keyof ReturnType<typeof parseCounterCashReportHtml>) =>
    roundReportMoney(reports.reduce((sum, report) => sum + Number((report.summary as any)[key] || 0), 0));

  const totalRevenue = sumReports(currentReports, 'total_income');
  const previousRevenue = sumReports(previousReports, 'total_income');
  const totalOrders = sumReports(currentReports, 'total_invoice');
  const previousOrders = sumReports(previousReports, 'total_invoice');
  const totalExpenses = sumReports(currentReports, 'expense_total');
  const totalCash = sumReports(currentReports, 'cash_receipt');
  const totalCashExpenses = sumReports(currentReports, 'cash_expense_total');
  const totalNewCustomers = currentReports.reduce((sum, report) => sum + (report.summary.customers?.length || 0), 0);
  const previousNewCustomers = previousReports.reduce((sum, report) => sum + (report.summary.customers?.length || 0), 0);

  const services = new Map<string, { service: string; qty: number; revenue: number }>();
  for (const report of currentReports) {
    for (const service of parseServiceDetailsFromHtml(report.html)) {
      const current = services.get(service.service) || { service: service.service, qty: 0, revenue: 0 };
      current.qty = roundReportMoney(current.qty + service.qty);
      current.revenue = roundReportMoney(current.revenue + service.revenue);
      services.set(service.service, current);
    }
  }
  const topServicesRaw = Array.from(services.values()).sort((left, right) => right.revenue - left.revenue).slice(0, 5);
  const totalItems = roundReportMoney(topServicesRaw.reduce((sum, service) => sum + service.qty, 0));
  const previousItems = 0;

  const trendBuckets =
    reportType === 'daily'
      ? Array.from({ length: 7 }, (_, index) => {
          const date = addReportDateDays(reportDate, index - 6);
          return { label: new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(parseReportDateUtc(date)), from_date: date, to_date: date };
        })
      : buildPerformanceBuckets(fromDate, toDate);
  const trend = [];
  for (const bucket of trendBuckets) {
    const dayReports = await Promise.all(branches.map((branch) => fetchDailyOperationBranchReport(branch, bucket.from_date, bucket.to_date, false)));
    trend.push({
      label: bucket.label,
      date: bucket.to_date,
      revenue: sumReports(dayReports, 'total_income'),
      orders: sumReports(dayReports, 'total_invoice'),
    });
  }

  const pctChange = (current: number, previous: number) => {
    if (!previous && current > 0) return 100;
    if (!previous) return 0;
    return roundReportMoney(((current - previous) / previous) * 100);
  };

  const branchRows = currentReports.map((report) => {
    const summary = report.summary;
    const branchName = normalizeBranchReportName(summary.branch, report.branch.name);
    const branchServices = parseServiceDetailsFromHtml(report.html);
    return {
      branch_id: report.branch.id,
      branch: branchName,
      revenue: Number(summary.total_income || 0),
      orders: Number(summary.total_invoice || 0),
      items: roundReportMoney(branchServices.reduce((sum, item) => sum + item.qty, 0)),
      new_customers: summary.customers?.length || 0,
      error: report.error,
    };
  });

  const totalServiceRevenue = topServicesRaw.reduce((sum, service) => sum + service.revenue, 0) || totalRevenue;
  const topServices = topServicesRaw.map((service, index) => ({
    rank: index + 1,
    service: service.service,
    qty: service.qty,
    revenue: service.revenue,
    percent: totalServiceRevenue > 0 ? roundReportMoney((service.revenue / totalServiceRevenue) * 100) : 0,
  }));

  const bestBranch = branchRows.slice().sort((left, right) => right.revenue - left.revenue)[0];
  const expenses = combineOperationExpenseCategories(currentReports, totalExpenses);
  const avgOrderValue = totalOrders > 0 ? roundReportMoney(totalRevenue / totalOrders) : 0;
  const previousAvgOrderValue = previousOrders > 0 ? roundReportMoney(previousRevenue / previousOrders) : 0;
  const closingBalance = roundReportMoney(totalCash - totalCashExpenses);
  const reportId = `OPS-${reportType.toUpperCase()}-${fromDate.replace(/\D/g, '')}-${toDate.replace(/\D/g, '')}-ALL`;

  const report = {
    ok: true,
    report_id: reportId,
    report_type: `all_branches_${reportType}_operations`,
    operations_type: reportType,
    report_title: reportTitleForOperationsType(reportType),
    date: reportDate,
    from_date: fromDate,
    to_date: toDate,
    date_label: fromDate === toDate ? formatReportDateLong(reportDate) : `${fromDate} إلى ${toDate}`,
    report_date: reportDate,
    prepared_at: '11:00 PM',
    scope: 'All Branches',
    branch_names: branches.map((branch) => branch.name),
    share_url: '',
    image_url: '',
    metrics: {
      total_revenue: totalRevenue,
      total_orders: totalOrders,
      new_customers: totalNewCustomers,
      avg_order_value: avgOrderValue,
      items_processed: totalItems,
      total_expenses: totalExpenses,
      opening_balance: 0,
      todays_revenue: totalRevenue,
      total_cash_in: totalCash,
      total_cash_out: totalCashExpenses,
      closing_balance: closingBalance,
      deltas: {
        revenue: pctChange(totalRevenue, previousRevenue),
        orders: pctChange(totalOrders, previousOrders),
        new_customers: pctChange(totalNewCustomers, previousNewCustomers),
        avg_order_value: pctChange(avgOrderValue, previousAvgOrderValue),
        items_processed: pctChange(totalItems, previousItems),
      },
    },
    trend,
    branches: branchRows,
    expenses,
    top_services: topServices,
    highlights: [
      `Revenue ${pctChange(totalRevenue, previousRevenue) >= 0 ? 'increased' : 'changed'} by ${Math.abs(pctChange(totalRevenue, previousRevenue)).toFixed(2)}% compared to yesterday.`,
      bestBranch ? `Highest revenue from ${bestBranch.branch} branch.` : 'Branch revenue data is ready.',
      `Average order value is AED ${avgOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`,
      topServices[0] ? `High demand for ${topServices[0].service}.` : 'Top service details were not returned by POS.',
      currentReports.every((report) => report.ok) ? 'All branches returned POS data successfully.' : 'Some branches returned POS warnings.',
    ],
    alerts: [
      ...currentReports.filter((report) => !report.ok).map((report) => `${report.branch.name}: ${report.error}`),
      ...(totalCashExpenses > totalCash ? ['Cash expenses are higher than cash revenue today.'] : []),
      ...(topServices.length === 0 ? ['Product/service details were not available in POS response.'] : []),
    ].slice(0, 4),
    tasks: [
      'Follow up on pending payments.',
      'Reorder chemicals before stockout.',
      'Review branch cash closing balance.',
      'Prepare weekly report for management.',
    ],
    data_sources: {
      branch_performance: 'POS Counter Cash by branch',
      revenue_trend: 'POS Counter Cash last 7 days',
      expenses: 'POS expense and purchase details',
      top_services: topServices.length ? 'POS product/service details' : 'Not available from POS details',
    },
  };
  const snapshot = String(input?.save_snapshot ?? input?.saveSnapshot ?? '1') === '0' ? report : saveReportSnapshot(report);
  const query = new URLSearchParams({
    report_id: snapshot.report_id,
    token: snapshot.share_token || '',
  });
  const configuredReportAppPath = String(process.env.REPORT_APP_BASE_PATH ?? '/smart-storage-hub').trim();
  const reportAppPath =
    configuredReportAppPath && configuredReportAppPath !== '/'
      ? `/${configuredReportAppPath.replace(/^\/+|\/+$/g, '')}`
      : '';
  const shareUrl = `${req.protocol}://${req.get('host')}${reportAppPath}/operations-report?${query.toString()}`;
  return {
    ...snapshot,
    share_url: shareUrl,
    image_url: `${shareUrl}&mode=image`,
  };
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
    ]) || resolveKnownPosProductName(row);
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
        remark: String(row.remark ?? '').trim(),
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
      customer_outstanding_balance: Math.max(
        0,
        normalizePosNumberish(
          firstRow.cust_total_credit,
          Math.max(0, -normalizePosNumberish(firstRow.cust_ledger_balance, 0))
        )
      ),
      customer_ledger_balance: normalizePosNumberish(firstRow.cust_ledger_balance, 0),
      customer_credit_limit: Math.max(0, normalizePosNumberish(firstRow.credit_limit, 0)),
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
      throw new Error('POS returned HTML while loading order details. Check POS auto-login settings and order details permission.');
    }
    throw new Error(`POS order details response is not valid JSON array. ${text.slice(0, 240)}`);
  }

  return parsePosOrderDetails(parsed);
};

const fetchRawPosOrderDetails = async (params: {
  order_id: string;
  s_order_id: string;
  mode?: string;
  open_type?: string;
}) => {
  const payload = new URLSearchParams();
  payload.set('order_id', params.order_id || '0');
  payload.set('s_order_id', params.s_order_id || '0');
  payload.set('mode', params.mode || '0');
  payload.set('open_type', params.open_type || 'open');

  const { text, parsed } = await postPosForm(POS_FIND_ORDER_DETAILS_PATH, payload, { fallbackToGet: false });
  if (!Array.isArray(parsed) || !Array.isArray(parsed[0]) || parsed[0].length === 0) {
    if (/<!doctype|<html/i.test(text)) {
      throw new Error('POS returned HTML while opening the order for update.');
    }
    throw new Error(`POS order update payload is not a valid details array. ${text.slice(0, 240)}`);
  }

  return {
    rows: parsed[0] as Array<Record<string, any>>,
    dynamic_fields: parsed[1],
    person_count_details: parsed[2],
    product_assigned_tax: (parsed[3] ?? {}) as Record<string, Array<Record<string, any>>>,
    invoice_history: Array.isArray(parsed[4]) ? parsed[4] : [],
  };
};

const normalizePosLineMatch = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const formatPosDayFirstDate = (value: unknown) => {
  const raw = String(value ?? '').trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : raw;
};

const normalizePosDocumentId = (value: unknown) => {
  const normalized = String(value ?? '').trim();
  return normalized === '0' ? '' : normalized;
};

type PickupNoPayReasonType = 'monthly_account' | 'other';

const appendUniquePosText = (existingValue: unknown, additionValue: unknown) => {
  const existing = String(existingValue ?? '').trim();
  const addition = String(additionValue ?? '').trim();
  if (!addition) return existing;
  if (existing.toLowerCase().includes(addition.toLowerCase())) return existing;
  return existing ? `${existing} | ${addition}` : addition;
};

const updatePosNoPayMetadata = async (params: {
  order_no: string;
  source_orders_id: string;
  reason_type: PickupNoPayReasonType;
  reason: string;
}) => {
  const before = await fetchRawPosOrderDetails({
    order_id: '0',
    s_order_id: params.source_orders_id,
    mode: '0',
    open_type: 'open',
  });
  const rowsByEntry = new Map<string, Record<string, any>>();
  for (const row of before.rows) {
    const entryId = String(row.each_sale_entry_id ?? '').trim();
    if (entryId && !rowsByEntry.has(entryId)) rowsByEntry.set(entryId, row);
  }
  const rows = Array.from(rowsByEntry.values());
  const first = rows[0];
  if (!first || rows.length === 0) throw new Error('POS order has no editable product rows.');

  const reasonText = params.reason_type === 'monthly_account' ? 'monthly account' : params.reason.trim();
  if (!reasonText) throw new Error('No Pay reason is required.');
  const updatedRemark =
    params.reason_type === 'monthly_account'
      ? appendUniquePosText(first.invoice_remark1, reasonText)
      : String(first.invoice_remark1 ?? '').trim();

  const payload = new URLSearchParams();
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const prefix = `final_product_list[final_sale_product_list][${index}]`;
    const productId = String(row.sale_prdt_id ?? '').trim();
    const unitPrice = normalizePosNumberish(row.sale_unit_price ?? row.sale_unit_actual_price, 0);
    const pDiscount = normalizePosNumberish(row.esp_pdisc, 0);
    const currentDescription = String(row.remark ?? row.other_description ?? '').trim();
    const updatedDescription =
      params.reason_type === 'other'
        ? appendUniquePosText(currentDescription, reasonText)
        : currentDescription;

    payload.set(`${prefix}[sale_order_dets_id]`, String(row.each_sale_entry_id ?? ''));
    payload.set(`${prefix}[prdt_id]`, productId);
    payload.set(`${prefix}[sale_unit_price]`, String(row.sale_unit_price ?? row.sale_unit_actual_price ?? 0));
    payload.set(`${prefix}[qty]`, String(row.sale_qty ?? 1));
    payload.set(`${prefix}[sale_unit]`, String(row.sale_unit_id ?? 1));
    payload.set(`${prefix}[sub_total]`, String(row.sale_sub_total ?? 0));
    payload.set(`${prefix}[tax_amount]`, String(row.sale_tax_amount ?? 0));
    payload.set(`${prefix}[pdiscount]`, String(row.esp_pdisc ?? 0));
    payload.set(`${prefix}[barcode]`, String(row.barcode ?? ''));

    const assignedTaxes = Array.isArray(before.product_assigned_tax?.[productId])
      ? before.product_assigned_tax[productId]
      : [];
    for (let taxIndex = 0; taxIndex < assignedTaxes.length; taxIndex += 1) {
      const tax = assignedTaxes[taxIndex];
      const taxPercentage = normalizePosNumberish(String(tax.tax_value ?? '').replace('%', ''), 0);
      const taxPrefix = `${prefix}[product_specific_taxes][${taxIndex}]`;
      payload.set(`${taxPrefix}[tax_id]`, String(tax.id ?? tax.tax_id ?? ''));
      payload.set(`${taxPrefix}[tax_percentage]`, String(taxPercentage));
      payload.set(`${taxPrefix}[tax_amount]`, String(((unitPrice - pDiscount) * taxPercentage) / 100));
    }

    payload.set(`${prefix}[multirate_id]`, String(row.multirate_id ?? 0));
    payload.set(`${prefix}[other_description]`, updatedDescription);
    payload.set(`${prefix}[kot_enabled]`, String(row.tagFlag ?? 0));
    payload.set(`${prefix}[others]`, String(row.others ?? ''));
    payload.set(`${prefix}[cloth_id]`, String(row.cloth_id ?? 0));
  }

  const orderPrefix = 'order_selected_details';
  const setOrder = (key: string, value: unknown) => payload.set(`${orderPrefix}[${key}]`, String(value ?? ''));
  setOrder('affected_action', '');
  setOrder('affected_inv', '');
  setOrder('order_date', formatPosDayFirstDate(first.order_date));
  setOrder('billing_date', first.billing_date ?? formatPosDayFirstDate(first.order_date));
  setOrder('delivery_date', first.delivery_date ?? '');
  setOrder('delivery_time', first.delivery_time ?? '');
  setOrder('invoice_remark1', updatedRemark);
  setOrder('invoice_remark2', first.invoice_remark2 ?? '');
  setOrder('invoice_tbl_id', '');
  setOrder('job_type', first.job_type ?? 0);
  setOrder('delivery_type', first.delivery_type_id ?? 1);
  setOrder('cust_type_id', first.customer_type_id ?? 76);
  setOrder('tender_cash', first.tender_cash ?? 0);
  setOrder('total_amount', first.total_amount ?? 0);
  setOrder('discount', first.discount ?? 0);
  setOrder('p_discount', first.p_discount ?? 0);
  setOrder('round_off', first.round_off ?? 0);
  setOrder('balance_amt', first.balance ?? 0);
  setOrder('tax_amount', first.tax_amount ?? 0);
  setOrder('received_amount', 0);
  setOrder('approval_req_received_amount', 0);
  setOrder('grand_total', first.grand_total ?? 0);
  setOrder('paid', first.received_amount ?? 0);
  setOrder('removed_amount_total', 0);
  setOrder('old_customer_head_id', first.customer_account_head_id ?? '');
  setOrder('assigned_salesman', first.assign_to_salesman ?? first.salesman_id ?? '');
  setOrder('assigned_salesman_name', '');
  setOrder('triggered_action', 'hold');
  setOrder('sale_order_id', params.source_orders_id);
  setOrder('can_create_sales_invoice', 0);
  setOrder('branch_id', first.branch_id ?? '');
  setOrder('single_cash_payment_entry', 0);
  setOrder('set_bill_date_on_worktime', 0);
  setOrder('multiple_salesman', first.multiple_salesman ?? '');
  setOrder('order_interval', first.order_interval ?? '');
  setOrder('extra_notes_id', 0);
  setOrder('processing_pickup', 0);
  setOrder('order_number', first.order_no ?? params.order_no);
  setOrder('driver_id', first.driver_id ?? 0);
  setOrder('split_and_merge', 0);
  setOrder('split_and_merge_inv', 0);

  const customerPrefix = 'customer_details';
  const setCustomer = (key: string, value: unknown) =>
    payload.set(`${customerPrefix}[${key}]`, String(value ?? ''));
  setCustomer('customer_id', first.cust_id ?? '');
  setCustomer('card_no', first.card_no ?? '');
  setCustomer('mobile', first.cust_ord_mobile ?? first.customer_mobile ?? first.mobile ?? '');
  setCustomer('customer_name', first.cust_ord_name ?? first.customer_name ?? '');
  setCustomer('addr1', first.cust_ord_address ?? first.customer_address ?? first.address1 ?? '');
  setCustomer('addr2', first.cust_ord_address ?? first.customer_address ?? first.address2 ?? '');
  setCustomer('remarks', updatedRemark);
  setCustomer('trn', first.cust_ord_trn ?? first.customer_trn ?? '');
  setCustomer('other_details', first.other_details ?? '');

  payload.set('cust_id', String(first.cust_auto_id ?? first.customer_id ?? ''));
  payload.set('operation', 'update');
  payload.set('order_id', '0');
  payload.set('whatsapp_check', '0');

  const financialBefore = {
    total_amount: normalizePosNumberish(first.total_amount, 0),
    tax_amount: normalizePosNumberish(first.tax_amount, 0),
    grand_total: normalizePosNumberish(first.grand_total, 0),
    received_amount: normalizePosNumberish(first.received_amount, 0),
    balance: normalizePosNumberish(first.balance, 0),
  };
  const saveResult = await postPosForm(POS_SAVE_ORDER_PATH, payload, {
    fallbackToGet: false,
    referer: POS_REFERER || POS_BASE_URL,
  });
  if (!Array.isArray(saveResult.parsed) || String(saveResult.parsed[0] ?? '') !== params.source_orders_id) {
    throw new Error(`POS did not confirm the No Pay reason update. ${saveResult.text.slice(0, 240)}`);
  }

  posConnectDetailsCache.clear();
  posConnectSearchCache.clear();
  const after = await fetchRawPosOrderDetails({
    order_id: '0',
    s_order_id: params.source_orders_id,
    mode: '0',
    open_type: 'open',
  });
  const afterFirst = after.rows[0] ?? {};
  const metadataSaved =
    params.reason_type === 'monthly_account'
      ? String(afterFirst.invoice_remark1 ?? '').toLowerCase().includes(reasonText.toLowerCase())
      : after.rows.every((row) =>
          String(row.remark ?? row.other_description ?? '').toLowerCase().includes(reasonText.toLowerCase())
        );
  const financialAfter = {
    total_amount: normalizePosNumberish(afterFirst.total_amount, 0),
    tax_amount: normalizePosNumberish(afterFirst.tax_amount, 0),
    grand_total: normalizePosNumberish(afterFirst.grand_total, 0),
    received_amount: normalizePosNumberish(afterFirst.received_amount, 0),
    balance: normalizePosNumberish(afterFirst.balance, 0),
  };
  const financialUnchanged = Object.keys(financialBefore).every(
    (key) =>
      Math.abs(financialBefore[key as keyof typeof financialBefore] - financialAfter[key as keyof typeof financialAfter]) <
      0.001
  );
  if (!metadataSaved) throw new Error('POS saved the order but the No Pay reason could not be verified.');
  if (!financialUnchanged) throw new Error('POS No Pay reason was saved but financial totals changed unexpectedly.');

  return {
    reason_type: params.reason_type,
    reason: reasonText,
    remark: String(afterFirst.invoice_remark1 ?? '').trim(),
  };
};

const updatePosSortingDescription = async (params: {
  order: SortingOrderRecord;
  item_names: string[];
  description?: string;
}) => {
  let sourceOrdersId = normalizePosDocumentId(params.order.source_orders_id);
  let sourceInvoiceId = normalizePosDocumentId(params.order.source_invoice_id);

  if (!sourceOrdersId) {
    const preview = await resolvePosConnectPreviewByDisplayedOrderNo(params.order.order_no);
    sourceOrdersId = normalizePosDocumentId(preview?.orders_id);
    sourceInvoiceId = normalizePosDocumentId(preview?.invoice_id);

    if (sourceOrdersId) {
      db.prepare(
        `UPDATE sorting_orders
         SET source_orders_id = ?,
             source_invoice_id = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE order_no = ?`
      ).run(sourceOrdersId, sourceInvoiceId || null, params.order.order_no);
    }
  }

  if (!sourceOrdersId || sourceInvoiceId) {
    throw new Error(
      sourceInvoiceId
        ? 'This POS order has already been converted to a Sales Invoice; Sales Order stage sync is not available.'
        : `Could not resolve the open POS Sales Order ID for ${params.order.order_no}.`
    );
  }

  const targetDescription = String(params.description ?? 'Sorting').trim() || 'Sorting';
  const targetNames = params.item_names.map(normalizePosLineMatch).filter(Boolean);
  if (targetNames.length === 0) {
    throw new Error('No sorted item name was available for POS stage sync.');
  }
  const quantityOnlyStage = targetNames.every(
    (name) => name === 'sorting quantity' || name === 'unsorted item'
  );

  const before = await fetchRawPosOrderDetails({
    order_id: '0',
    s_order_id: sourceOrdersId,
    mode: '0',
    open_type: 'open',
  });
  const rowsByEntry = new Map<string, Record<string, any>>();
  for (const row of before.rows) {
    const entryId = String(row.each_sale_entry_id ?? '').trim();
    if (entryId && !rowsByEntry.has(entryId)) rowsByEntry.set(entryId, row);
  }
  const rows = Array.from(rowsByEntry.values());
  const first = rows[0];
  if (!first || rows.length === 0) throw new Error('POS order has no editable product rows.');

  const receivedAmount = normalizePosNumberish(first.received_amount, 0);
  const salesInvoiceCreated = String(first.sales_invoice_created ?? '0').trim();
  if (salesInvoiceCreated !== '0' || receivedAmount !== 0) {
    throw new Error('POS stage sync is limited to unpaid Sales Orders during the trial.');
  }

  const matchesTarget = (row: Record<string, any>) => {
    const candidates = [
      row.primary_sale_prdt_name,
      row.secondary_sale_prdt_name,
      `${row.primary_sale_prdt_name ?? ''} ${row.secondary_sale_prdt_name ?? ''}`,
    ]
      .map(normalizePosLineMatch)
      .filter(Boolean);
    return targetNames.some((target) =>
      candidates.some((candidate) => candidate === target || candidate.includes(target) || target.includes(candidate))
    );
  };

  const matchedScannedRows = quantityOnlyStage ? rows : rows.filter(matchesTarget);
  if (matchedScannedRows.length === 0) {
    throw new Error(`POS product row was not matched for: ${params.item_names.join(', ')}`);
  }
  // POS stores the production stage per product row. The stage represents the
  // whole order, so write the same canonical value to every row in one update.
  const updatedEntryIds = rows.map((row) => String(row.each_sale_entry_id));

  const payload = new URLSearchParams();
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const prefix = `final_product_list[final_sale_product_list][${index}]`;
    const productId = String(row.sale_prdt_id ?? '').trim();
    const unitPrice = normalizePosNumberish(row.sale_unit_price ?? row.sale_unit_actual_price, 0);
    const pDiscount = normalizePosNumberish(row.esp_pdisc, 0);
    const rowDescription = targetDescription;

    payload.set(`${prefix}[sale_order_dets_id]`, String(row.each_sale_entry_id ?? ''));
    payload.set(`${prefix}[prdt_id]`, productId);
    payload.set(`${prefix}[sale_unit_price]`, String(row.sale_unit_price ?? row.sale_unit_actual_price ?? 0));
    payload.set(`${prefix}[qty]`, String(row.sale_qty ?? 1));
    payload.set(`${prefix}[sale_unit]`, String(row.sale_unit_id ?? 1));
    payload.set(`${prefix}[sub_total]`, String(row.sale_sub_total ?? 0));
    payload.set(`${prefix}[tax_amount]`, String(row.sale_tax_amount ?? 0));
    payload.set(`${prefix}[pdiscount]`, String(row.esp_pdisc ?? 0));
    payload.set(`${prefix}[barcode]`, String(row.barcode ?? ''));

    const assignedTaxes = Array.isArray(before.product_assigned_tax?.[productId])
      ? before.product_assigned_tax[productId]
      : [];
    for (let taxIndex = 0; taxIndex < assignedTaxes.length; taxIndex += 1) {
      const tax = assignedTaxes[taxIndex];
      const taxPercentage = normalizePosNumberish(String(tax.tax_value ?? '').replace('%', ''), 0);
      const taxPrefix = `${prefix}[product_specific_taxes][${taxIndex}]`;
      payload.set(`${taxPrefix}[tax_id]`, String(tax.id ?? tax.tax_id ?? ''));
      payload.set(`${taxPrefix}[tax_percentage]`, String(taxPercentage));
      payload.set(`${taxPrefix}[tax_amount]`, String(((unitPrice - pDiscount) * taxPercentage) / 100));
    }

    payload.set(`${prefix}[multirate_id]`, String(row.multirate_id ?? 0));
    payload.set(`${prefix}[other_description]`, rowDescription);
    payload.set(`${prefix}[kot_enabled]`, String(row.tagFlag ?? 0));
    payload.set(`${prefix}[others]`, String(row.others ?? ''));
    payload.set(`${prefix}[cloth_id]`, String(row.cloth_id ?? 0));
  }

  const orderPrefix = 'order_selected_details';
  const setOrder = (key: string, value: unknown) => payload.set(`${orderPrefix}[${key}]`, String(value ?? ''));
  setOrder('affected_action', '');
  setOrder('affected_inv', '');
  setOrder('order_date', formatPosDayFirstDate(first.order_date));
  setOrder('billing_date', first.billing_date ?? formatPosDayFirstDate(first.order_date));
  setOrder('delivery_date', first.delivery_date ?? '');
  setOrder('delivery_time', first.delivery_time ?? '');
  setOrder('invoice_remark1', first.invoice_remark1 ?? '');
  setOrder('invoice_remark2', first.invoice_remark2 ?? '');
  setOrder('invoice_tbl_id', '');
  setOrder('job_type', first.job_type ?? 0);
  setOrder('delivery_type', first.delivery_type_id ?? 1);
  setOrder('cust_type_id', first.customer_type_id ?? 76);
  setOrder('tender_cash', first.tender_cash ?? 0);
  setOrder('total_amount', first.total_amount ?? 0);
  setOrder('discount', first.discount ?? 0);
  setOrder('p_discount', first.p_discount ?? 0);
  setOrder('round_off', first.round_off ?? 0);
  setOrder('balance_amt', first.balance ?? 0);
  setOrder('tax_amount', first.tax_amount ?? 0);
  setOrder('received_amount', 0);
  setOrder('approval_req_received_amount', 0);
  setOrder('grand_total', first.grand_total ?? 0);
  setOrder('paid', first.received_amount ?? 0);
  setOrder('removed_amount_total', 0);
  setOrder('old_customer_head_id', first.customer_account_head_id ?? '');
  setOrder('assigned_salesman', first.assign_to_salesman ?? first.salesman_id ?? '');
  setOrder('assigned_salesman_name', '');
  setOrder('triggered_action', 'hold');
  setOrder('sale_order_id', sourceOrdersId);
  setOrder('can_create_sales_invoice', 0);
  setOrder('branch_id', first.branch_id ?? '');
  setOrder('single_cash_payment_entry', 0);
  setOrder('set_bill_date_on_worktime', 0);
  setOrder('multiple_salesman', first.multiple_salesman ?? '');
  setOrder('order_interval', first.order_interval ?? '');
  setOrder('extra_notes_id', 0);
  setOrder('processing_pickup', 0);
  setOrder('order_number', first.order_no ?? params.order.order_no);
  setOrder('driver_id', first.driver_id ?? 0);
  setOrder('split_and_merge', 0);
  setOrder('split_and_merge_inv', 0);

  const customerPrefix = 'customer_details';
  const setCustomer = (key: string, value: unknown) => payload.set(`${customerPrefix}[${key}]`, String(value ?? ''));
  setCustomer('customer_id', first.cust_id ?? '');
  setCustomer('card_no', first.card_no ?? '');
  setCustomer('mobile', first.cust_ord_mobile ?? first.customer_mobile ?? first.mobile ?? '');
  setCustomer('customer_name', first.cust_ord_name ?? first.customer_name ?? '');
  setCustomer('addr1', first.cust_ord_address ?? first.customer_address ?? first.address1 ?? '');
  setCustomer('addr2', first.cust_ord_address ?? first.customer_address ?? first.address2 ?? '');
  setCustomer('remarks', first.invoice_remark1 ?? '');
  setCustomer('trn', first.cust_ord_trn ?? first.customer_trn ?? '');
  setCustomer('other_details', first.other_details ?? '');

  payload.set('cust_id', String(first.cust_auto_id ?? first.customer_id ?? ''));
  payload.set('operation', 'update');
  payload.set('order_id', '0');
  payload.set('whatsapp_check', '0');

  const financialBefore = {
    total_amount: normalizePosNumberish(first.total_amount, 0),
    tax_amount: normalizePosNumberish(first.tax_amount, 0),
    grand_total: normalizePosNumberish(first.grand_total, 0),
    received_amount: normalizePosNumberish(first.received_amount, 0),
    balance: normalizePosNumberish(first.balance, 0),
  };
  const saveResult = await postPosForm(POS_SAVE_ORDER_PATH, payload, {
    fallbackToGet: false,
    referer: POS_REFERER || POS_BASE_URL,
  });
  if (!Array.isArray(saveResult.parsed) || String(saveResult.parsed[0] ?? '') !== sourceOrdersId) {
    throw new Error(`POS did not confirm the Sales Order update. ${saveResult.text.slice(0, 240)}`);
  }

  posConnectDetailsCache.clear();
  posConnectSearchCache.clear();
  const after = await fetchRawPosOrderDetails({
    order_id: '0',
    s_order_id: sourceOrdersId,
    mode: '0',
    open_type: 'open',
  });
  const afterRows = after.rows.filter((row) => updatedEntryIds.includes(String(row.each_sale_entry_id ?? '')));
  const verified = afterRows.length === updatedEntryIds.length &&
    afterRows.every((row) => String(row.remark ?? '').trim() === targetDescription);
  const afterFirst = after.rows[0] ?? {};
  const financialAfter = {
    total_amount: normalizePosNumberish(afterFirst.total_amount, 0),
    tax_amount: normalizePosNumberish(afterFirst.tax_amount, 0),
    grand_total: normalizePosNumberish(afterFirst.grand_total, 0),
    received_amount: normalizePosNumberish(afterFirst.received_amount, 0),
    balance: normalizePosNumberish(afterFirst.balance, 0),
  };
  const financialUnchanged = Object.keys(financialBefore).every(
    (key) => Math.abs(financialBefore[key as keyof typeof financialBefore] - financialAfter[key as keyof typeof financialAfter]) < 0.001
  );
  if (!verified) throw new Error('POS saved the order but the Sorting description could not be verified.');
  if (!financialUnchanged) throw new Error('POS stage update completed but financial totals changed unexpectedly.');

  return {
    success: true,
    verified: true,
    description: targetDescription,
    sales_order_id: sourceOrdersId,
    order_no: String(afterFirst.order_no ?? params.order.order_no),
    updated_line_ids: updatedEntryIds,
    financial_unchanged: true,
  };
};

type PickupDeliveryPaymentMethod = 'cash' | 'credit_card' | 'no_pay';

const formatPosDeliveryDateTime = () =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date());

const formatPosPackingDate = (value: unknown) => {
  const raw = String(value ?? '').trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : raw;
};

const resolvePosDeliveryPaymentAccount = (
  completePaymentMethod: unknown,
  paymentMethod: PickupDeliveryPaymentMethod
) => {
  const paymentMap =
    completePaymentMethod && typeof completePaymentMethod === 'object'
      ? (completePaymentMethod as Record<string, any>)
      : {};
  const expectedName = paymentMethod === 'cash' ? 'cash' : 'credit card';
  const matchingKey = Object.keys(paymentMap).find(
    (key) => key.trim().toLowerCase().replace(/[-_]+/g, ' ') === expectedName
  );
  const firstMatch = matchingKey && Array.isArray(paymentMap[matchingKey]) ? paymentMap[matchingKey][0] : null;
  const linkedAccount = String(
    firstMatch?.linked_account ??
      firstMatch?.linked_account_id ??
      (paymentMethod === 'cash' ? '1' : '33777')
  ).trim();

  return {
    label: paymentMethod === 'cash' ? 'Cash' : 'Credit-Card',
    linked_account_id: linkedAccount || (paymentMethod === 'cash' ? '1' : '33777'),
  };
};

const payAndDeliverPickupOrder = async (input: {
  order_no: string;
  source_orders_id?: string;
  source_invoice_id?: string;
  payment_method: PickupDeliveryPaymentMethod;
  no_pay_reason_type?: PickupNoPayReasonType;
  no_pay_reason?: string;
  dry_run?: boolean;
}) => {
  const orderNo = normalizeSortingOrderNo(input.order_no);
  if (!orderNo) throw new Error('Order number is required.');
  if (!['cash', 'credit_card', 'no_pay'].includes(input.payment_method)) {
    throw new Error('Payment method must be cash, credit_card, or no_pay.');
  }
  if (
    input.payment_method === 'no_pay' &&
    input.no_pay_reason_type !== 'monthly_account' &&
    input.no_pay_reason_type !== 'other'
  ) {
    throw new Error('No Pay reason type is required.');
  }
  if (
    input.payment_method === 'no_pay' &&
    input.no_pay_reason_type === 'other' &&
    !String(input.no_pay_reason ?? '').trim()
  ) {
    throw new Error('Write the other No Pay reason.');
  }

  let sourceOrdersId = normalizePosDocumentId(input.source_orders_id);
  let sourceInvoiceId = normalizePosDocumentId(input.source_invoice_id);
  if (!sourceOrdersId) {
    const preview = await resolvePosConnectPreviewByDisplayedOrderNo(orderNo);
    sourceOrdersId = normalizePosDocumentId(preview?.orders_id);
    sourceInvoiceId = normalizePosDocumentId(preview?.invoice_id);
  }
  if (!sourceOrdersId) throw new Error(`Could not resolve the POS Sales Order ID for ${orderNo}.`);
  let deliveryDocumentId = sourceInvoiceId || sourceOrdersId;

  const before = await fetchRawPosOrderDetails({
    order_id: '0',
    s_order_id: sourceOrdersId,
    mode: '0',
    open_type: 'open',
  });
  const first = before.rows[0];
  if (!first) throw new Error('POS order has no details.');

  const actualOrderNo = normalizeSortingOrderNo(first.order_no);
  if (actualOrderNo && actualOrderNo !== orderNo) {
    throw new Error(`POS opened order ${actualOrderNo} instead of ${orderNo}.`);
  }
  if (String(first.order_status ?? '').trim() === '3') {
    throw new Error(`Order ${orderNo} is already delivered.`);
  }
  // POS status 2 is fully packed, so it can move straight to delivery.
  const alreadyPackedForDelivery = String(first.order_status ?? '').trim() === '2';

  const branchId = String(first.branch_id ?? '').trim();
  if (!branchId) throw new Error('POS order branch is missing.');
  const staffSession = getActivePosStaffSession();
  const assignedDriverId = String(first.driver_id ?? '').trim();
  const deliveryUserId =
    assignedDriverId && Number(assignedDriverId) > 0
      ? assignedDriverId
      : staffSession?.pos_user_id ||
        POS_DELIVERY_USER_ID ||
        String(first.done_by ?? first.modified_user_id ?? '').trim();
  if (!deliveryUserId) throw new Error('POS delivery user is not configured.');
  const deliveryUserCandidates = Array.from(
    new Set(
      [
        deliveryUserId,
        staffSession?.pos_user_id,
        POS_DELIVERY_USER_ID,
        first.done_by,
        first.modified_user_id,
      ]
        .map((value) => String(value ?? '').trim())
        .filter((value) => value && Number(value) > 0)
    )
  );
  const clientIdentifier = staffSession?.client_identifier || POS_LOGIN_CLIENT_IDENTIFIER;

  const deliveryReferer = `${POS_PURCHASE_API_BASE_URL.replace(/\/+$/, '')}/delivery`;
  const deliveryOrderPayload = new URLSearchParams();
  deliveryOrderPayload.set('client_identifier', clientIdentifier);
  deliveryOrderPayload.set('branch_id', branchId);
  deliveryOrderPayload.set('s_order_id', deliveryDocumentId);
  deliveryOrderPayload.set('order_id', '0');
  const deliveryOrderResult = await postPosForm(
    resolvePosPurchaseApiEndpoint('/pos_api/findDeliveryOrderDetails'),
    deliveryOrderPayload,
    { fallbackToGet: false, referer: deliveryReferer }
  );
  const deliveryOrderResponse = deliveryOrderResult.parsed;
  if (
    !Array.isArray(deliveryOrderResponse) ||
    !Array.isArray(deliveryOrderResponse[0]) ||
    deliveryOrderResponse[0].length === 0
  ) {
    throw new Error(`POS delivery order details could not be loaded. ${deliveryOrderResult.text.slice(0, 240)}`);
  }
  let deliveryOrderRows = deliveryOrderResponse[0] as Array<Record<string, any>>;
  let deliveryFirst = deliveryOrderRows[0];
  let deliveryPaymentMethods = deliveryOrderResponse[1];
  let creditSaleEnabled = String(deliveryOrderResponse[2] ?? '').trim();

  const loadDeliveryConfig = async (candidateUserId: string) => {
    const configPayload = new URLSearchParams();
    configPayload.set('client_identifier', clientIdentifier);
    configPayload.set('branch_id', branchId);
    configPayload.set('user_id', candidateUserId);
    const configResult = await postPosForm(
      resolvePosPurchaseApiEndpoint('/pos_api/getDeliveryData'),
      configPayload,
      { fallbackToGet: false, referer: deliveryReferer }
    );
    return {
      payload: configPayload,
      result: configResult,
      config: configResult.parsed,
    };
  };

  let shiftOwnerUserId = '';
  let deliveryConfigPayload = new URLSearchParams();
  let deliveryConfigResult: Awaited<ReturnType<typeof postPosForm>> | null = null;
  let deliveryConfig: any = null;
  const deliveryUserShiftAttempts: Array<{
    user_id: string;
    shift_id: string;
    status: number;
    error?: string;
  }> = [];

  for (const candidateUserId of deliveryUserCandidates) {
    try {
      const loaded = await loadDeliveryConfig(candidateUserId);
      const candidateShiftId = String(loaded.config?.data?.shift_id ?? '').trim();
      deliveryUserShiftAttempts.push({
        user_id: candidateUserId,
        shift_id: candidateShiftId || '0',
        status: Number(loaded.config?.status ?? 0),
      });
      if (
        loaded.config &&
        Number(loaded.config.status) === 1 &&
        loaded.config.data &&
        Number(candidateShiftId) > 0
      ) {
        shiftOwnerUserId = candidateUserId;
        deliveryConfigPayload = loaded.payload;
        deliveryConfigResult = loaded.result;
        deliveryConfig = loaded.config;
        break;
      }
    } catch (error: any) {
      deliveryUserShiftAttempts.push({
        user_id: candidateUserId,
        shift_id: '0',
        status: 0,
        error: String(error?.message || error || 'Failed to load delivery settings.'),
      });
    }
  }

  if (!shiftOwnerUserId || !deliveryConfig || !deliveryConfigResult) {
    throw new Error(
      `No open POS shift for delivery users ${deliveryUserShiftAttempts
        .map((attempt) => `${attempt.user_id}:${attempt.shift_id}`)
        .join(', ')} in branch ${branchId}.`
    );
  }

  const shiftId = String(deliveryConfig.data.shift_id ?? '').trim();
  if (!shiftId || Number(shiftId) <= 0) {
    throw new Error(`No open POS shift for delivery user ${shiftOwnerUserId} in branch ${branchId}.`);
  }

  const branchKey = getPickupBranchKeyById(branchId);
  const actualOrderRef = actualOrderNo || orderNo;
  const normalizedOrderRef = normalizePosReference(orderNo);
  const normalizedActualOrderRef = normalizePosReference(actualOrderRef);
  const orderDigits = (normalizedActualOrderRef || normalizedOrderRef).replace(/\D/g, '');
  const branchOrderRef = branchKey && orderDigits ? `${branchKey}${orderDigits}` : '';
  const pendingDeliveryFilters = Array.from(
    new Set(
      [
        actualOrderRef,
        orderNo,
        normalizedActualOrderRef,
        normalizedOrderRef,
        branchOrderRef,
        sourceOrdersId,
        sourceInvoiceId,
      ].filter(Boolean)
    )
  );
  let lastPendingDeliverySample: any = null;
  let deliveryRouteAddResult: any = null;

  const getDeliveryBillInvoiceId = (bill: any) =>
    [
      bill?.invoice_id,
      bill?.bill_invoice_id,
      bill?.sales_invoice_id,
      bill?.sale_invoice_id,
      bill?.invoice_tbl_id,
    ]
      .map(normalizePosDocumentId)
      .find(Boolean) ?? '';

  const billMatchesPickupOrder = (bill: any) => {
    const idCandidates = [
      bill?.invoice_id,
      bill?.bill_invoice_id,
      bill?.sales_invoice_id,
      bill?.sale_invoice_id,
      bill?.invoice_tbl_id,
      bill?.order_id,
    ].map(normalizePosDocumentId);
    if (
      idCandidates.some(
        (id) => id && (id === deliveryDocumentId || id === sourceOrdersId || (sourceInvoiceId && id === sourceInvoiceId))
      )
    ) {
      return true;
    }

    const salesOrderCandidates = [
      bill?.orders_id,
      bill?.source_orders_id,
      bill?.sales_order_id,
      bill?.sale_order_id,
      bill?.s_order_id,
    ].map(normalizePosDocumentId);
    if (salesOrderCandidates.some((id) => id && id === sourceOrdersId)) return true;

    const orderCandidates = [
      bill?.order_no,
      bill?.order_number,
      bill?.invoice_no,
      bill?.bill_no,
      bill?.display_order_no,
    ].map(normalizePosReference);
    return orderCandidates.some((candidate) => {
      if (!candidate) return false;
      if (
        candidate === normalizedActualOrderRef ||
        candidate === normalizedOrderRef ||
        (branchOrderRef && candidate === branchOrderRef)
      ) {
        return true;
      }
      const candidateDigits = candidate.replace(/\D/g, '');
      return Boolean(orderDigits && candidateDigits && candidateDigits === orderDigits);
    });
  };

  const findBillInList = (bills: any[]) =>
    bills.find((bill: any) => getDeliveryBillInvoiceId(bill) && billMatchesPickupOrder(bill));

  const findPendingDeliveryBill = async (config: any) => {
    const configBills = Array.isArray(config?.data?.bills) ? config.data.bills : [];
    const configBill = findBillInList(configBills);
    if (configBill) return configBill;

    for (const filterContent of pendingDeliveryFilters) {
      const pendingPayload = new URLSearchParams();
      pendingPayload.set('order_id', '0');
      pendingPayload.set('user_id', shiftOwnerUserId || deliveryUserId);
      pendingPayload.set('branch_id', branchId);
      pendingPayload.set('client_identifier', clientIdentifier);
      pendingPayload.set('filter_content', filterContent);
      pendingPayload.set('shift_id', String(config?.data?.shift_id ?? '0'));
      const pendingResult = await postPosForm(
        resolvePosPurchaseApiEndpoint('/pos_api/fetchPendingDeliveries'),
        pendingPayload,
        { fallbackToGet: false, referer: deliveryReferer }
      );
      const pendingResponse = pendingResult.parsed;
      const pendingBills = Array.isArray(pendingResponse?.[0]) ? pendingResponse[0] : [];
      if (pendingBills.length > 0 && !lastPendingDeliverySample) {
        lastPendingDeliverySample = {
          filter_content: filterContent,
          count: pendingBills.length,
          keys: Object.keys(pendingBills[0] ?? {}).slice(0, 30),
          sample: pendingBills[0],
        };
      }
      const pendingBill = findBillInList(pendingBills);
      if (pendingBill) return pendingBill;
    }

    return null;
  };

  const addOrderToPendingDeliveryRoute = async () => {
    const scanCandidates = Array.from(
      new Set([actualOrderRef, branchOrderRef, orderNo, normalizedActualOrderRef, sourceOrdersId].filter(Boolean))
    );
    let searchData: any = null;
    let searchReference = '';
    let lastSearchMessage = '';

    for (const scanReference of scanCandidates) {
      const searchPayload = new URLSearchParams();
      searchPayload.set('del_oredrno', scanReference);
      searchPayload.set('client_identifier', clientIdentifier);
      searchPayload.set('user_id', shiftOwnerUserId || deliveryUserId);
      searchPayload.set('shift_id', shiftId);
      const searchResult = await postPosForm(
        resolvePosPurchaseApiEndpoint('/packing_api/searchdeliveryorder'),
        searchPayload,
        { fallbackToGet: false, referer: deliveryReferer }
      );
      const searchResponse = searchResult.parsed;
      lastSearchMessage = String(searchResponse?.message ?? searchResult.text.slice(0, 240)).trim();
      if (searchResponse?.ok && searchResponse.data && searchResponse.data !== '0') {
        searchData = searchResponse.data;
        searchReference = scanReference;
        break;
      }
    }

    if (!searchData) {
      throw new Error(
        `POS delivery scan could not find order ${actualOrderRef}. ${
          lastSearchMessage || 'The order is not available for delivery route assignment.'
        }`
      );
    }

    const addPayload = new URLSearchParams();
    addPayload.set('client_identifier', clientIdentifier);
    addPayload.set('user_id', shiftOwnerUserId || deliveryUserId);
    addPayload.set('shift_id', shiftId);
    addPayload.set('orders', JSON.stringify([searchData]));
    const addResult = await postPosForm(
      resolvePosPurchaseApiEndpoint('/packing_api/adddeliveryorders'),
      addPayload,
      { fallbackToGet: false, referer: deliveryReferer }
    );
    const addResponse = addResult.parsed;
    if (!addResponse?.ok) {
      throw new Error(
        `POS delivery route assignment failed for ${actualOrderRef}. ${String(
          addResponse?.message ?? addResult.text.slice(0, 240)
        ).trim()}`
      );
    }

    return {
      search_reference: searchReference,
      search_message: lastSearchMessage || null,
      add_message: String(addResponse.message ?? '').trim() || null,
    };
  };

  const applyDeliveryBillDocumentId = (bill: any) => {
    const billInvoiceId = getDeliveryBillInvoiceId(bill);
    if (billInvoiceId) {
      deliveryDocumentId = billInvoiceId;
      if (!sourceInvoiceId) sourceInvoiceId = billInvoiceId;
    }
  };

  let matchingDeliveryBill = await findPendingDeliveryBill(deliveryConfig);
  applyDeliveryBillDocumentId(matchingDeliveryBill);
  let packedForDelivery = false;
  if (!matchingDeliveryBill && !alreadyPackedForDelivery && !input.dry_run) {
    const packingConfigPayload = new URLSearchParams();
    packingConfigPayload.set('client_identifier', clientIdentifier);
    packingConfigPayload.set('branch_id', branchId);
    packingConfigPayload.set('user_id', deliveryUserId);
    const packingReferer = `${POS_PURCHASE_API_BASE_URL.replace(/\/+$/, '')}/packing`;
    const packingConfigResult = await postPosForm(
      resolvePosPurchaseApiEndpoint('/packing_api/getPackingData'),
      packingConfigPayload,
      { fallbackToGet: false, referer: packingReferer }
    );
    const packingConfig = packingConfigResult.parsed;
    if (!packingConfig || Number(packingConfig.status) !== 1 || !packingConfig.data) {
      throw new Error(`POS packing settings could not be loaded. ${packingConfigResult.text.slice(0, 240)}`);
    }

    const packingOrderPayload = new URLSearchParams();
    packingOrderPayload.set('client_identifier', clientIdentifier);
    packingOrderPayload.set('branch_id', branchId);
    packingOrderPayload.set('user_id', deliveryUserId);
    packingOrderPayload.set('order_id', sourceOrdersId);
    packingOrderPayload.set('time_zone', String(packingConfig.data.time_zone ?? 'Asia/Dubai'));
    const packingOrderResult = await postPosForm(
      resolvePosPurchaseApiEndpoint('/packing_api/getOrderDetails'),
      packingOrderPayload,
      { fallbackToGet: false, referer: packingReferer }
    );
    const packingOrder = packingOrderResult.parsed;
    const packingRows = Array.isArray(packingOrder?.data?.order_details)
      ? (packingOrder.data.order_details as Array<Record<string, any>>)
      : [];
    if (Number(packingOrder?.status) !== 1 || packingRows.length === 0) {
      throw new Error(`POS packing order details could not be loaded. ${packingOrderResult.text.slice(0, 240)}`);
    }

    const remainingPackingRows = packingRows
      .map((row) => ({
        id: String(row.id ?? '').trim(),
        quantity: Math.max(
          0,
          normalizePosNumberish(row.qty, 0) - normalizePosNumberish(row.delivered_qty, 0)
        ),
      }))
      .filter((row) => row.id && row.quantity > 0);
    if (remainingPackingRows.length === 0) {
      throw new Error('POS order has no remaining product quantity available for packing.');
    }

    const packingFirst = packingRows[0];
    const savePackingPayload = new URLSearchParams();
    savePackingPayload.set('client_identifier', clientIdentifier);
    savePackingPayload.set('order_id', sourceOrdersId);
    savePackingPayload.set('branch_id', branchId);
    savePackingPayload.set('packing_date', String(packingConfig.data.pack_date ?? ''));
    savePackingPayload.set('packing_time', String(packingConfig.data.pack_time ?? ''));
    savePackingPayload.set(
      'del_date',
      formatPosPackingDate(packingFirst.delivery_date ?? deliveryFirst.delivery_date ?? first.delivery_date)
    );
    savePackingPayload.set(
      'del_time',
      String(packingFirst.delivery_time ?? deliveryFirst.delivery_time ?? first.delivery_time ?? '')
    );
    savePackingPayload.set('salesman', String(packingFirst.done_by ?? first.done_by ?? deliveryUserId));
    savePackingPayload.set('send_sms', '0');
    savePackingPayload.set('send_whatsapp', '0');
    for (let index = 0; index < remainingPackingRows.length; index += 1) {
      savePackingPayload.set(
        `final_packed_product_list[${index}][item_db_id]`,
        remainingPackingRows[index].id
      );
      savePackingPayload.set(
        `final_packed_product_list[${index}][pack_qty]`,
        String(remainingPackingRows[index].quantity)
      );
    }
    savePackingPayload.set('time_zone', String(packingConfig.data.time_zone ?? 'Asia/Dubai'));
    savePackingPayload.set('user_id', deliveryUserId);
    savePackingPayload.set('full_packed', '1');
    savePackingPayload.set(
      'remark',
      String(packingFirst.remark ?? packingFirst.invoice_remark1 ?? first.remark ?? first.invoice_remark1 ?? '')
    );
    savePackingPayload.set('packing_note', 'Picked via Smart Storage Hub');

    const savePackingResult = await postPosForm(
      resolvePosPurchaseApiEndpoint('/packing_api/savePacking'),
      savePackingPayload,
      { fallbackToGet: false, referer: packingReferer }
    );
    if (!savePackingResult.parsed || Number(savePackingResult.parsed.status) !== 1) {
      const packingMessage = String(
        savePackingResult.parsed?.message ?? savePackingResult.parsed?.error ?? ''
      ).trim();
      throw new Error(packingMessage || `POS packing failed. ${savePackingResult.text.slice(0, 300)}`);
    }
    packedForDelivery = true;

    deliveryConfigResult = await postPosForm(
      resolvePosPurchaseApiEndpoint('/pos_api/getDeliveryData'),
      deliveryConfigPayload,
      { fallbackToGet: false, referer: deliveryReferer }
    );
    deliveryConfig = deliveryConfigResult.parsed;
    if (!deliveryConfig || Number(deliveryConfig.status) !== 1 || !deliveryConfig.data) {
      throw new Error('POS packing succeeded but delivery settings could not be reloaded.');
    }
    const refreshedDeliveryOrderResult = await postPosForm(
      resolvePosPurchaseApiEndpoint('/pos_api/findDeliveryOrderDetails'),
      deliveryOrderPayload,
      { fallbackToGet: false, referer: deliveryReferer }
    );
    const refreshedDeliveryOrderResponse = refreshedDeliveryOrderResult.parsed;
    if (
      Array.isArray(refreshedDeliveryOrderResponse) &&
      Array.isArray(refreshedDeliveryOrderResponse[0]) &&
      refreshedDeliveryOrderResponse[0].length > 0
    ) {
      deliveryOrderRows = refreshedDeliveryOrderResponse[0] as Array<Record<string, any>>;
      deliveryFirst = deliveryOrderRows[0];
      deliveryPaymentMethods = refreshedDeliveryOrderResponse[1] ?? deliveryPaymentMethods;
      creditSaleEnabled = String(refreshedDeliveryOrderResponse[2] ?? creditSaleEnabled).trim();
    }
    matchingDeliveryBill = await findPendingDeliveryBill(deliveryConfig);
    applyDeliveryBillDocumentId(matchingDeliveryBill);
    if (!matchingDeliveryBill) {
      console.warn('POS packing succeeded but pending delivery list did not include the order; continuing with deliveryProcess.', {
        order_no: orderNo,
        sales_order_id: sourceOrdersId,
        source_invoice_id: sourceInvoiceId || null,
        delivery_document_id: deliveryDocumentId,
        branch_id: branchId,
        branch_order_ref: branchOrderRef || null,
        user_id: deliveryUserId,
        shift_owner_user_id: shiftOwnerUserId,
        pending_delivery_filters: pendingDeliveryFilters,
        pending_delivery_sample: lastPendingDeliverySample,
        delivery_rows: deliveryOrderRows.length,
      });
    }
  }

  if (!matchingDeliveryBill && !input.dry_run) {
    deliveryRouteAddResult = await addOrderToPendingDeliveryRoute();
    matchingDeliveryBill = await findPendingDeliveryBill(deliveryConfig);
    applyDeliveryBillDocumentId(matchingDeliveryBill);
  }

  if (!input.dry_run && (!matchingDeliveryBill || !getDeliveryBillInvoiceId(matchingDeliveryBill))) {
    throw new Error(
      `POS delivery route did not return an invoice_id for ${actualOrderRef}. ` +
        `Filters: ${pendingDeliveryFilters.join(', ')}. ` +
        `Route add: ${
          deliveryRouteAddResult ? JSON.stringify(deliveryRouteAddResult) : 'not added'
        }. Pending sample: ${
          lastPendingDeliverySample ? JSON.stringify(lastPendingDeliverySample).slice(0, 500) : 'none'
        }.`
    );
  }

  const balance = Math.max(0, normalizePosNumberish(deliveryFirst.balance ?? first.balance, 0));
  if (balance <= 0) throw new Error(`Order ${orderNo} has no balance to collect.`);
  const noPayReason =
    input.payment_method === 'no_pay'
      ? input.no_pay_reason_type === 'monthly_account'
        ? 'monthly account'
        : String(input.no_pay_reason ?? '').trim()
      : '';
  if (input.payment_method === 'no_pay' && creditSaleEnabled !== '1') {
    throw new Error('POS does not allow No Pay / credit delivery for this order.');
  }
  let noPayMetadata: Awaited<ReturnType<typeof updatePosNoPayMetadata>> | null = null;
  let noPayMetadataError: string | null = null;
  if (input.payment_method === 'no_pay' && !input.dry_run) {
    try {
      noPayMetadata = await updatePosNoPayMetadata({
        order_no: orderNo,
        source_orders_id: sourceOrdersId,
        reason_type: input.no_pay_reason_type as PickupNoPayReasonType,
        reason: noPayReason,
      });
    } catch (error: any) {
      noPayMetadataError = String(error?.message || error || 'POS No Pay reason update failed.');
      console.warn('POS No Pay metadata update failed before delivery:', {
        order_no: orderNo,
        sales_order_id: sourceOrdersId,
        reason_type: input.no_pay_reason_type,
        error: noPayMetadataError,
      });
    }
    if (noPayMetadata) {
      deliveryConfigResult = await postPosForm(
        resolvePosPurchaseApiEndpoint('/pos_api/getDeliveryData'),
        deliveryConfigPayload,
        { fallbackToGet: false, referer: deliveryReferer }
      );
      if (deliveryConfigResult.parsed && Number(deliveryConfigResult.parsed.status) === 1) {
        deliveryConfig = deliveryConfigResult.parsed;
        matchingDeliveryBill = await findPendingDeliveryBill(deliveryConfig);
        applyDeliveryBillDocumentId(matchingDeliveryBill);
      }
      if (!matchingDeliveryBill) {
        deliveryRouteAddResult = await addOrderToPendingDeliveryRoute();
        matchingDeliveryBill = await findPendingDeliveryBill(deliveryConfig);
        applyDeliveryBillDocumentId(matchingDeliveryBill);
      }
      if (!matchingDeliveryBill || !getDeliveryBillInvoiceId(matchingDeliveryBill)) {
        throw new Error(
          `POS No Pay reason was saved, but delivery route invoice_id disappeared for ${actualOrderRef}.`
        );
      }
    }
  }
  const payment =
    input.payment_method === 'no_pay'
      ? null
      : resolvePosDeliveryPaymentAccount(
          deliveryPaymentMethods ?? deliveryConfig.data.complete_payment_method,
          input.payment_method
        );
  const dateTime = formatPosDeliveryDateTime();
  const customerId = String(deliveryFirst.customer_id ?? first.customer_id ?? first.cust_auto_id ?? '').trim();
  const shippingId = String(deliveryFirst.shipping_id ?? first.shipping_id ?? '0').trim() || '0';

  const payload = new URLSearchParams();
  const detailPrefix = 'order_delivery_details';
  payload.set(`${detailPrefix}[lat]`, String(deliveryFirst.latitude ?? first.latitude ?? ''));
  payload.set(`${detailPrefix}[lng]`, String(deliveryFirst.longitude ?? first.longitude ?? ''));
  payload.set(`${detailPrefix}[balance]`, String(balance));
  payload.set(`${detailPrefix}[customer_id]`, customerId);
  payload.set(`${detailPrefix}[order_id]`, deliveryDocumentId);
  payload.set(`${detailPrefix}[shift_id]`, shiftId);
  payload.set(`${detailPrefix}[update_location]`, '0');
  payload.set(`${detailPrefix}[send_whatsapp]`, '0');
  const receivedAmount = input.payment_method === 'no_pay' ? 0 : balance;
  payload.set(`${detailPrefix}[received_amount]`, String(receivedAmount));

  if (payment) {
    const paymentPrefix = `${detailPrefix}[received_amount_details][${payment.label}]`;
    payload.set(`${paymentPrefix}[amount]`, String(balance));
    payload.set(`${paymentPrefix}[date_time]`, dateTime);
    payload.set(`${paymentPrefix}[linked_account_id]`, payment.linked_account_id);
    if (input.payment_method === 'cash') {
      payload.set(`${paymentPrefix}[tender_cash]`, String(balance));
      payload.set(`${paymentPrefix}[change_given]`, '0');
    } else {
      const cardPrefix = `${paymentPrefix}[card_details][0]`;
      payload.set(`${cardPrefix}[card_name]`, '');
      payload.set(`${cardPrefix}[card_no]`, '');
      payload.set(`${cardPrefix}[card_amount]`, String(balance));
      payload.set(`${cardPrefix}[date]`, dateTime);
    }
  }

  payload.set(
    `${detailPrefix}[location_details][loc_building]`,
    String(deliveryFirst.map_loc_building ?? first.map_loc_building ?? '')
  );
  payload.set(
    `${detailPrefix}[location_details][loc_apartment]`,
    String(deliveryFirst.map_loc_apartment ?? first.map_loc_apartment ?? '')
  );
  payload.set(
    `${detailPrefix}[location_details][loc_name]`,
    String(deliveryFirst.map_loc_name ?? first.map_loc_name ?? '')
  );
  payload.set(
    `${detailPrefix}[location_details][loc_other]`,
    String(deliveryFirst.shipping_other_info ?? first.shipping_other_info ?? '')
  );
  payload.set(`${detailPrefix}[shipping_id]`, shippingId);
  payload.set('order_id', deliveryDocumentId);
  payload.set('client_identifier', clientIdentifier);
  payload.set('user_id', deliveryUserId);
  payload.set('branch_id', branchId);
  payload.set(
    'currency_id',
    String(staffSession?.currency_id ?? deliveryConfig.data.currency_id ?? POS_DELIVERY_CURRENCY_ID)
  );

  const requestSummary = {
    order_no: orderNo,
    sales_order_id: sourceOrdersId,
    source_invoice_id: sourceInvoiceId || null,
    delivery_document_id: deliveryDocumentId,
    branch_order_ref: branchOrderRef || null,
    branch_id: branchId,
    user_id: deliveryUserId,
    shift_owner_user_id: shiftOwnerUserId,
    pos_username: staffSession?.username ?? null,
    authenticated_pos_user_id: staffSession?.pos_user_id ?? null,
    assigned_driver_id: assignedDriverId || null,
    delivery_user_candidates: deliveryUserCandidates,
    delivery_user_shift_attempts: deliveryUserShiftAttempts,
    shift_id: shiftId,
    payment_method: input.payment_method,
    linked_account_id: payment?.linked_account_id ?? null,
    amount: receivedAmount,
    invoice_balance: balance,
    no_pay_reason_type: input.payment_method === 'no_pay' ? input.no_pay_reason_type ?? null : null,
    no_pay_reason: noPayReason || null,
    no_pay_metadata: noPayMetadata,
    no_pay_metadata_error: noPayMetadataError,
    credit_sale_enabled: creditSaleEnabled,
    delivery_order_details_loaded: true,
    delivery_payment_methods: Object.keys(
      deliveryPaymentMethods && typeof deliveryPaymentMethods === 'object'
        ? (deliveryPaymentMethods as Record<string, any>)
        : {}
    ),
    customer_id: customerId,
    shipping_id: shippingId,
    delivery_bill: matchingDeliveryBill ?? null,
    delivery_bill_invoice_id: getDeliveryBillInvoiceId(matchingDeliveryBill) || null,
    delivery_route_add_result: deliveryRouteAddResult,
    pending_delivery_filters: pendingDeliveryFilters,
    pending_delivery_sample: matchingDeliveryBill ? null : lastPendingDeliverySample,
    already_packed_for_delivery: alreadyPackedForDelivery,
    packed_for_delivery: packedForDelivery,
  };
  if (input.dry_run) return { success: true, dry_run: true, request: requestSummary };

  const deliveryResult = await postPosForm(
    resolvePosPurchaseApiEndpoint('/pos_api/deliveryProcess'),
    payload,
    { fallbackToGet: false, referer: deliveryReferer }
  );
  const deliveryResponse = deliveryResult.parsed;
  if (!deliveryResponse || Number(deliveryResponse.response_code) !== 200) {
    const message = String(deliveryResponse?.message ?? deliveryResponse?.error ?? '').trim();
    console.warn('POS deliveryProcess rejected request:', {
      request: requestSummary,
      response: deliveryResponse ?? deliveryResult.text.slice(0, 500),
    });
    throw new Error(
      `${
        message || `POS delivery failed. ${deliveryResult.text.slice(0, 300)}`
      } (delivery user ${deliveryUserId}, shift ${shiftId}, shift owner ${shiftOwnerUserId}, delivery document ${deliveryDocumentId}, sales order ${sourceOrdersId}, invoice ${sourceInvoiceId || 'none'}, method ${input.payment_method}, credit_sale ${creditSaleEnabled}, customer ${customerId || 'none'}, shipping ${shippingId || 'none'}, bill invoice ${
        getDeliveryBillInvoiceId(matchingDeliveryBill) || 'none'
      })`
    );
  }

  posConnectDetailsCache.clear();
  posConnectSearchCache.clear();

  if (!POS_DELIVERY_VERIFY_AFTER_PROCESS) {
    return {
      success: true,
      verified: true,
      pos_state_verified: true,
      verification_pending: false,
      verification_source: 'delivery_response',
      verification_warning: null,
      order_no: orderNo,
      pos_order_no: actualOrderRef,
      sales_order_id: sourceOrdersId,
      assigned_driver_id: assignedDriverId || null,
      authenticated_pos_user_id: staffSession?.pos_user_id ?? null,
      payment_method: input.payment_method,
      linked_account_id: payment?.linked_account_id ?? null,
      amount_paid: receivedAmount,
      remaining_balance: input.payment_method === 'no_pay' ? balance : 0,
      no_pay_reason_type: input.payment_method === 'no_pay' ? input.no_pay_reason_type ?? null : null,
      no_pay_reason: noPayReason || null,
      no_pay_metadata: noPayMetadata,
      no_pay_metadata_error: noPayMetadataError,
      order_status: '3',
      response: deliveryResponse,
    };
  }

  let afterFirst: Record<string, any> = {};
  let afterBalance = input.payment_method === 'no_pay' ? balance : 0;
  let afterReceived = input.payment_method === 'no_pay' ? 0 : receivedAmount;
  let delivered = false;
  let paymentRecorded = input.payment_method !== 'no_pay';
  let noPayBalancePreserved = input.payment_method === 'no_pay';
  let posStateVerified = false;
  let verificationError = '';

  // POS treats response_code=200 as the authoritative delivery success signal.
  // Its order details endpoint can lag behind, especially for credit/No Pay
  // deliveries where the invoice balance intentionally remains unchanged.
  for (const delayMs of [0, 750, 2_000]) {
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    try {
      const after = await fetchRawPosOrderDetails({
        order_id: '0',
        s_order_id: sourceOrdersId,
        mode: '0',
        open_type: 'open',
      });
      afterFirst = after.rows[0] ?? {};
      afterBalance = Math.max(0, normalizePosNumberish(afterFirst.balance, afterBalance));
      afterReceived = Math.max(0, normalizePosNumberish(afterFirst.received_amount, afterReceived));
      delivered = String(afterFirst.order_status ?? '').trim() === '3';
      paymentRecorded = afterReceived + 0.01 >= balance || afterBalance <= 0.5;
      noPayBalancePreserved = Math.abs(afterBalance - balance) < 0.01;
      posStateVerified =
        input.payment_method === 'no_pay'
          ? delivered && noPayBalancePreserved
          : paymentRecorded && (delivered || afterBalance <= 0.5);
      if (posStateVerified) break;
    } catch (error: any) {
      verificationError = String(error?.message || error || 'POS state verification failed.');
    }
  }

  if (!posStateVerified) {
    console.warn('POS delivery accepted; follow-up order state is still pending:', {
      request: requestSummary,
      response: deliveryResponse,
      delivered,
      balance: afterBalance,
      received_amount: afterReceived,
      verification_error: verificationError || null,
    });
  }

  const remainingBalance = posStateVerified
    ? afterBalance
    : input.payment_method === 'no_pay'
      ? balance
      : 0;

  return {
    success: true,
    verified: true,
    pos_state_verified: posStateVerified,
    verification_pending: !posStateVerified,
    verification_source: posStateVerified ? 'order_details' : 'delivery_response',
    verification_warning: !posStateVerified
      ? verificationError || 'POS accepted the delivery, but its order details are still updating.'
      : null,
    order_no: orderNo,
    pos_order_no: String(afterFirst.order_no ?? orderNo),
    sales_order_id: sourceOrdersId,
    assigned_driver_id: assignedDriverId || null,
    authenticated_pos_user_id: staffSession?.pos_user_id ?? null,
    payment_method: input.payment_method,
    linked_account_id: payment?.linked_account_id ?? null,
    amount_paid: receivedAmount,
    remaining_balance: remainingBalance,
    no_pay_reason_type: input.payment_method === 'no_pay' ? input.no_pay_reason_type ?? null : null,
    no_pay_reason: noPayReason || null,
    no_pay_metadata: noPayMetadata,
    no_pay_metadata_error: noPayMetadataError,
    order_status: delivered ? String(afterFirst.order_status ?? '3') : '3',
    response: deliveryResponse,
  };
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
      throw new Error('POS returned HTML while loading products. Check POS auto-login settings and products permission.');
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
  const matchVariants = [orderNo, `${orderNo}(%`, `${orderNo}-%`, `${orderNo} %`];

  if (USE_POSTGRES_LOCAL && pgPool) {
    const slots = await pgPool.query(
      `SELECT b.id,
              b.blanket_number,
              b.store,
              b.row,
              b."column",
              b.status,
              b.created_at,
              s.rows AS store_rows,
              s.columns AS store_columns,
              s.store_type
       FROM blankets b
       LEFT JOIN stores s ON s.store_name = b.store
       WHERE b.status = 'stored'
         AND (
           upper(trim(COALESCE(b.blanket_number, ''))) = $1
           OR upper(trim(COALESCE(b.blanket_number, ''))) LIKE $2
           OR upper(trim(COALESCE(b.blanket_number, ''))) LIKE $3
           OR upper(trim(COALESCE(b.blanket_number, ''))) LIKE $4
         )
       ORDER BY b.created_at ASC, b.id ASC`,
      matchVariants
    );
    if (slots.rows.length === 0) return null;
    const firstStoredAt = slots.rows.reduce((oldest: string | null, slot: any) => {
      const value = slot?.created_at ? String(slot.created_at) : null;
      if (!value) return oldest;
      if (!oldest) return value;
      return value.localeCompare(oldest) < 0 ? value : oldest;
    }, null);
    return {
      order_no: orderNo,
      qty_in_store: slots.rows.length,
      first_stored_at: firstStoredAt,
      store_slots: (slots.rows as any[]).map((slot) => ({
        blanket_id: Number(slot?.id ?? 0) || 0,
        store: String(slot?.store ?? ''),
        row: Number(slot?.row ?? 0) || 0,
        column: Number(slot?.column ?? 0) || 0,
        store_rows: Number(slot?.store_rows ?? 0) || undefined,
        store_columns: Number(slot?.store_columns ?? 0) || undefined,
        store_type: slot?.store_type ? String(slot.store_type) : undefined,
        status: String(slot?.status ?? 'stored'),
        created_at: slot?.created_at ? String(slot.created_at) : null,
      })),
    };
  }

  const slots = db
    .prepare(
      `SELECT b.id,
              b.blanket_number,
              b.store,
              b.row,
              b."column",
              b.status,
              b.created_at,
              s.rows AS store_rows,
              s.columns AS store_columns,
              s.store_type
       FROM blankets b
       LEFT JOIN stores s ON s.store_name = b.store
       WHERE b.status = 'stored'
         AND (
           upper(trim(COALESCE(b.blanket_number, ''))) = ?
           OR upper(trim(COALESCE(b.blanket_number, ''))) LIKE ?
           OR upper(trim(COALESCE(b.blanket_number, ''))) LIKE ?
           OR upper(trim(COALESCE(b.blanket_number, ''))) LIKE ?
         )
       ORDER BY datetime(b.created_at) ASC, b.id ASC`
    )
    .all(...matchVariants) as Array<{
    id: number;
    blanket_number: string;
    store: string;
    row: number;
    column: number;
    store_rows?: number;
    store_columns?: number;
    store_type?: string;
    status: string;
    created_at: string | null;
  }>;
  if (slots.length === 0) return null;

  const firstStoredAt = slots.reduce<string | null>((oldest, slot) => {
    const value = slot.created_at ? String(slot.created_at) : null;
    if (!value) return oldest;
    if (!oldest) return value;
    return value.localeCompare(oldest) < 0 ? value : oldest;
  }, null);

  return {
    order_no: orderNo,
    qty_in_store: slots.length,
    first_stored_at: firstStoredAt,
    store_slots: slots.map((slot) => ({
      blanket_id: Number(slot.id ?? 0) || 0,
      store: String(slot.store ?? ''),
      row: Number(slot.row ?? 0) || 0,
      column: Number(slot.column ?? 0) || 0,
      store_rows: Number(slot.store_rows ?? 0) || undefined,
      store_columns: Number(slot.store_columns ?? 0) || undefined,
      store_type: slot.store_type ? String(slot.store_type) : undefined,
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
    const search = await fetchCachedPosConnectSearch(normalizedOrderNo);
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
          const details = await fetchCachedPosConnectDetails({
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

  return fetchCachedPosConnectDetails({
    order_id: sourceInvoiceId || '0',
    s_order_id: sourceOrdersId || '0',
    mode: '0',
    open_type: 'preview',
  });
};

type ChatIntent =
  | 'help'
  | 'auth_login'
  | 'auth_status'
  | 'auth_logout'
  | 'order_review'
  | 'search_order'
  | 'search_phone'
  | 'show_location'
  | 'update_requested'
  | 'unknown';

type ParsedChatCommand = {
  intent: ChatIntent;
  query?: string;
  order_no?: string;
  username?: string;
  password?: string;
  raw: string;
};

const CHAT_HELP_TEXT = [
  'Smart Storage Hub Telegram MVP',
  '',
  'Available commands:',
  '- help',
  '- login USERNAME PASSWORD',
  '- whoami',
  '- logout',
  '- review',
  '- Z63588',
  '- 0504635888',
  '- search Z63588',
  '- location Z63588',
  '',
  'Use review to start the guided store order verification workflow.',
  'You can send the order number or customer phone directly. No search word is required.',
  'Use login to link Telegram with the employee POS account before update actions.',
].join('\n');

const recordChatMessage = (params: {
  channel: string;
  chat_user_id: string;
  message_id?: string;
  direction: 'in' | 'out';
  body: string;
  parsed_intent?: string;
  order_no?: string;
  status?: string;
}) => {
  db.prepare(
    `INSERT INTO chat_messages (channel, chat_user_id, message_id, direction, body, parsed_intent, order_no, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    params.channel,
    params.chat_user_id,
    params.message_id ?? null,
    params.direction,
    params.body,
    params.parsed_intent ?? null,
    params.order_no ?? null,
    params.status ?? null
  );
};

const upsertChatUser = (params: {
  channel: string;
  chat_user_id: string;
  display_name?: string;
}) => {
  db.prepare(
    `INSERT INTO chat_users (channel, chat_user_id, display_name, is_active, created_at, updated_at)
     VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     ON CONFLICT(channel, chat_user_id) DO UPDATE SET
       display_name = COALESCE(excluded.display_name, chat_users.display_name),
       updated_at = CURRENT_TIMESTAMP`
  ).run(params.channel, params.chat_user_id, params.display_name ?? null);
};

type ChatUserRecord = {
  id: number;
  channel: string;
  chat_user_id: string;
  chat_phone: string | null;
  display_name: string | null;
  smart_hub_user_id: number | null;
  pos_user_id: string | null;
  pos_username: string | null;
  pos_display_name: string | null;
  pos_branch_id: string | null;
  pos_branch_code: string | null;
  is_active: number;
  created_at: string | null;
  updated_at: string | null;
  linked_at: string | null;
};

const getChatUser = (channel: string, chatUserId: string) =>
  db
    .prepare('SELECT * FROM chat_users WHERE channel = ? AND chat_user_id = ? LIMIT 1')
    .get(channel, chatUserId) as ChatUserRecord | undefined;

const redactChatCommandBody = (parsed: ParsedChatCommand) => {
  if (parsed.intent !== 'auth_login') return parsed.raw;
  return `login ${parsed.username ?? ''} ********`.trim();
};

const linkChatUserToPosStaff = async (params: {
  channel: string;
  chat_user_id: string;
  username: string;
  password: string;
}) => {
  const profile = await authenticatePosStaff(params.username, params.password);
  const user = ensurePosStaffUser({
    username: profile.username,
    display_name: profile.display_name,
    branch_id: profile.branch_id,
  });

  db.prepare(
    `UPDATE chat_users
     SET smart_hub_user_id = ?,
         pos_user_id = ?,
         pos_username = ?,
         pos_display_name = ?,
         pos_branch_id = ?,
         pos_branch_code = ?,
         is_active = 1,
         linked_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE channel = ? AND chat_user_id = ?`
  ).run(
    user.id,
    profile.pos_user_id,
    profile.pos_username || profile.username,
    profile.display_name,
    profile.branch_id,
    profile.branch_code,
    params.channel,
    params.chat_user_id
  );

  return {
    user,
    profile,
  };
};

const unlinkChatUser = (channel: string, chatUserId: string) => {
  db.prepare(
    `UPDATE chat_users
     SET smart_hub_user_id = NULL,
         pos_user_id = NULL,
         pos_username = NULL,
         pos_display_name = NULL,
         pos_branch_id = NULL,
         pos_branch_code = NULL,
         linked_at = NULL,
         updated_at = CURRENT_TIMESTAMP
     WHERE channel = ? AND chat_user_id = ?`
  ).run(channel, chatUserId);
};

type TelegramInlineKeyboardMarkup = {
  inline_keyboard: Array<Array<{ text: string; callback_data: string }>>;
};

type ChatAutomationReply = {
  text: string;
  reply_markup?: TelegramInlineKeyboardMarkup;
};

const normalizeChatReply = (reply: string | ChatAutomationReply): ChatAutomationReply =>
  typeof reply === 'string' ? { text: reply } : reply;

const sendTelegramMessage = async (chatId: string, reply: string | ChatAutomationReply) => {
  const normalizedReply = normalizeChatReply(reply);
  const text = normalizedReply.text;
  const safeText = text.length > 3900 ? `${text.slice(0, 3900)}\n...` : text;
  recordChatMessage({
    channel: 'telegram',
    chat_user_id: chatId,
    direction: 'out',
    body: safeText,
    status: TELEGRAM_BOT_TOKEN ? 'queued' : 'mock',
  });

  if (!TELEGRAM_BOT_TOKEN) {
    console.log('Telegram bot token is not configured; outgoing message:', {
      chatId,
      text: safeText,
      reply_markup: normalizedReply.reply_markup,
    });
    return { ok: true, mock: true };
  }

  const payload: Record<string, unknown> = {
    chat_id: chatId,
    text: safeText,
    disable_web_page_preview: true,
  };
  if (normalizedReply.reply_markup) payload.reply_markup = normalizedReply.reply_markup;

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await response.text().catch(() => '');
  if (!response.ok) {
    throw new Error(`Telegram sendMessage failed: ${response.status} ${body.slice(0, 240)}`);
  }
  return body ? JSON.parse(body) : { ok: true };
};

const answerTelegramCallbackQuery = async (callbackQueryId: string, text = '') => {
  if (!TELEGRAM_BOT_TOKEN || !callbackQueryId) return { ok: true, skipped: true };
  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text,
      show_alert: false,
    }),
  });
  const body = await response.text().catch(() => '');
  if (!response.ok) {
    throw new Error(`Telegram answerCallbackQuery failed: ${response.status} ${body.slice(0, 240)}`);
  }
  return body ? JSON.parse(body) : { ok: true };
};

const parseChatCommand = (message: string): ParsedChatCommand => {
  const raw = String(message ?? '').trim();
  const normalized = raw.replace(/\s+/g, ' ').trim();
  const lower = normalized.toLowerCase();
  if (!normalized || lower === '/start' || lower === 'start' || lower === 'help' || lower === '/help') {
    return { intent: 'help', raw };
  }

  const loginMatch = normalized.match(/^(?:\/?login|دخول)\s+(\S+)\s+(.+)$/i);
  if (loginMatch) {
    return {
      intent: 'auth_login',
      username: loginMatch[1].trim(),
      password: loginMatch[2],
      raw,
    };
  }
  if (/^(?:\/?whoami|\/?me|حسابي|انا|من\s+انا)$/i.test(normalized)) {
    return { intent: 'auth_status', raw };
  }
  if (/^(?:\/?logout|\/?unlink|خروج|الغاء\s+الربط)$/i.test(normalized)) {
    return { intent: 'auth_logout', raw };
  }
  if (/^(?:\/?review|order\s+review|start\s+review|مراجعة)$/i.test(normalized)) {
    return { intent: 'order_review', raw };
  }

  const updateWords = /(حط|ضع|خلي|خليه|في\s+\S+|معلق|مطب[قك]|picked|deliver|delivery|no\s*pay|cash|card)/i;
  const explicitSearch = normalized.match(/^(?:بحث|ابحث|search|order|طلب|مكان|location)\s+(.+)$/i);
  const query = String(explicitSearch?.[1] ?? normalized).trim();
  const digits = normalizePosConnectPhone(query);
  const hasLetters = /[A-Za-z]/.test(query);
  const orderToken = query.match(/\b[A-Za-z]?\d{3,10}\b/i)?.[0] ?? '';

  if (/^(?:مكان|location)\b/i.test(normalized)) {
    return { intent: 'show_location', query, order_no: orderToken || query, raw };
  }
  if (!explicitSearch && updateWords.test(normalized) && orderToken) {
    return { intent: 'update_requested', query, order_no: orderToken, raw };
  }
  if (digits.length >= 5 && !hasLetters && digits.length >= 8) {
    return { intent: 'search_phone', query: digits, raw };
  }
  if (orderToken || isLikelyPosConnectOrderNoQuery(query)) {
    return { intent: 'search_order', query: orderToken || query, order_no: orderToken || query, raw };
  }
  if (digits.length >= 5) {
    return { intent: 'search_phone', query: digits, raw };
  }
  return { intent: 'unknown', query, raw };
};

const formatChatStorageSlots = (order: PickupSearchOrder | null) => {
  const slots = order?.blanket_storage?.store_slots ?? [];
  if (slots.length === 0) return 'Storage: not found';
  return [
    `Storage: ${order?.blanket_storage?.qty_in_store ?? slots.length} pcs`,
    ...slots.slice(0, 8).map((slot, index) => {
      const status = slot.status ? ` (${slot.status})` : '';
      return `${index + 1}. ${slot.store} R${slot.row} C${slot.column}${status}`;
    }),
    slots.length > 8 ? `+ ${slots.length - 8} more slots` : '',
  ]
    .filter(Boolean)
    .join('\n');
};

const formatChatOrder = (order: PickupSearchOrder) =>
  [
    `Order: ${order.order_no || '-'}`,
    `Customer: ${order.customer_name || '-'}`,
    `Phone: ${order.customer_phone || '-'}`,
    `Status: ${order.order_status || '-'}`,
    `Balance: AED ${Number(order.balance ?? 0).toFixed(2)}`,
    order.delivery_date ? `Delivery: ${order.delivery_date}${order.delivery_time ? ` ${order.delivery_time}` : ''}` : '',
    formatChatStorageSlots(order),
    order.remark ? `Remark: ${order.remark}` : '',
  ]
    .filter(Boolean)
    .join('\n');

const buildChatOrderKeyboard = (orderNo: string): TelegramInlineKeyboardMarkup | undefined => {
  const cleanOrderNo = normalizePosReference(orderNo);
  if (!cleanOrderNo) return undefined;
  return {
    inline_keyboard: [
      [
        { text: 'Refresh order', callback_data: `order:${cleanOrderNo}` },
        { text: 'Show storage', callback_data: `loc:${cleanOrderNo}` },
      ],
    ],
  };
};

const buildChatPhoneOrdersKeyboard = (orders: PickupSearchOrder[]): TelegramInlineKeyboardMarkup | undefined => {
  const buttons = orders.slice(0, 4).flatMap((order, index) => {
    const cleanOrderNo = normalizePosReference(order.order_no);
    if (!cleanOrderNo) return [];
    const balance = Number(order.balance ?? 0).toFixed(2);
    return [
      [
        {
          text: `${index + 1}. ${cleanOrderNo} | AED ${balance}`,
          callback_data: `order:${cleanOrderNo}`,
        },
      ],
    ];
  });
  return buttons.length > 0 ? { inline_keyboard: buttons } : undefined;
};

type OrderReviewStoreEntry = {
  store_name: string;
  orders: string[];
  skipped?: boolean;
};

type OrderReviewPayload = {
  stores: OrderReviewStoreEntry[];
};

type OrderReviewSessionRecord = {
  id: number;
  channel: string;
  chat_user_id: string;
  status: 'collecting' | 'processing' | 'completed' | 'cancelled';
  current_store_index: number;
  store_sequence_json: string;
  batch_payload_json: string;
  batch_id: number | null;
  created_at: string | null;
  updated_at: string | null;
  completed_at: string | null;
};

type OrderReviewProcessedItem = {
  store_name: string;
  order_no: string;
  customer_name: string;
  customer_phone: string;
  order_status: string;
  balance: number;
  remark: string;
  error_message?: string;
};

const normalizeOrderReviewPhone = (value: unknown) => {
  let digits = normalizePosConnectPhone(value);
  if (digits.startsWith('00971')) digits = digits.slice(2);
  if (digits.startsWith('971') && digits.length >= 12) digits = `0${digits.slice(3)}`;
  if (digits.startsWith('5') && digits.length === 9) digits = `0${digits}`;
  return digits;
};

const parseJsonOr = <T,>(value: unknown, fallback: T): T => {
  try {
    const parsed = JSON.parse(String(value ?? ''));
    return parsed == null ? fallback : (parsed as T);
  } catch {
    return fallback;
  }
};

const getOrderReviewStoreSequence = () => {
  const envStores = String(process.env.ORDER_REVIEW_STORE_SEQUENCE ?? '')
    .split(/[,\n|]+/)
    .map((store) => store.trim())
    .filter(Boolean);
  const sourceStores =
    envStores.length > 0
      ? envStores
      : (db
          .prepare('SELECT store_name FROM stores ORDER BY store_name ASC')
          .all() as Array<{ store_name: string }>)
          .map((store) => String(store.store_name ?? '').trim())
          .filter(Boolean);
  const stores = Array.from(new Set(sourceStores));
  return stores.length > 0 ? stores : ['A', 'B', 'C', 'D', 'upp1', 'upp2', 'Convery'];
};

const getActiveOrderReviewSession = (channel: string, chatUserId: string) =>
  db
    .prepare(
      `SELECT * FROM order_review_sessions
       WHERE channel = ? AND chat_user_id = ? AND status IN ('collecting', 'processing')
       ORDER BY id DESC
       LIMIT 1`
    )
    .get(channel, chatUserId) as OrderReviewSessionRecord | undefined;

const getOrderReviewSessionById = (sessionId: number) =>
  db
    .prepare('SELECT * FROM order_review_sessions WHERE id = ? LIMIT 1')
    .get(sessionId) as OrderReviewSessionRecord | undefined;

const getOrderReviewSessionStores = (session: OrderReviewSessionRecord) =>
  parseJsonOr<string[]>(session.store_sequence_json, []);

const getOrderReviewSessionPayload = (session: OrderReviewSessionRecord) =>
  parseJsonOr<OrderReviewPayload>(session.batch_payload_json, { stores: [] });

const createOrderReviewSession = (channel: string, chatUserId: string) => {
  db.prepare(
    `UPDATE order_review_sessions
     SET status = 'cancelled', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE channel = ? AND chat_user_id = ? AND status IN ('collecting', 'processing')`
  ).run(channel, chatUserId);

  const storeSequence = getOrderReviewStoreSequence();
  const result = db
    .prepare(
      `INSERT INTO order_review_sessions (
         channel, chat_user_id, status, current_store_index, store_sequence_json, batch_payload_json,
         created_at, updated_at
       )
       VALUES (?, ?, 'collecting', 0, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    )
    .run(channel, chatUserId, JSON.stringify(storeSequence), JSON.stringify({ stores: [] }));

  return getOrderReviewSessionById(Number(result.lastInsertRowid));
};

const buildOrderReviewStartReply = (): ChatAutomationReply => ({
  text: [
    'Order Review & Verification',
    '',
    'Press Start Review to begin checking stores one by one.',
    '',
    'The bot will ask for each store, then analyze all orders and find customers with multiple orders.',
  ].join('\n'),
  reply_markup: {
    inline_keyboard: [[{ text: 'Start Review', callback_data: 'review:start' }]],
  },
});

const buildOrderReviewStorePrompt = (
  session: OrderReviewSessionRecord,
  prefix = ''
): ChatAutomationReply => {
  const stores = getOrderReviewSessionStores(session);
  const storeName = stores[session.current_store_index] || 'this store';
  const text = [
    prefix,
    `Please send the orders currently in Store ${storeName}.`,
    '',
    'Send all order numbers in one message, one order per line.',
    '',
    'Example:',
    '256580',
    '255560',
    '260555',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    text,
    reply_markup: {
      inline_keyboard: [
        [
          { text: `Skip ${storeName}`, callback_data: `review:skip:${session.id}` },
          { text: 'Cancel', callback_data: `review:cancel:${session.id}` },
        ],
      ],
    },
  };
};

const extractOrderReviewOrderNumbers = (text: string) => {
  const matches = String(text ?? '').match(/[A-Za-z]?\d{3,10}/g) ?? [];
  return Array.from(new Set(matches.map(normalizePosReference).filter(Boolean)));
};

const isOrderReviewEmptyText = (text: string) => /^(empty|none|no orders|skip|فارغ|مافي|لا يوجد)$/i.test(text.trim());

const isOrderReviewCancelText = (text: string) => /^(cancel|stop|خروج|الغاء|إلغاء)$/i.test(text.trim());

const updateOrderReviewSessionPayload = (
  session: OrderReviewSessionRecord,
  entry: OrderReviewStoreEntry,
  nextIndex: number,
  status: OrderReviewSessionRecord['status'] = 'collecting'
) => {
  const payload = getOrderReviewSessionPayload(session);
  const stores = getOrderReviewSessionStores(session);
  const currentStore = stores[session.current_store_index] || entry.store_name;
  const nextStores = payload.stores.filter((store) => store.store_name !== currentStore);
  nextStores.push(entry);
  const updatedPayload: OrderReviewPayload = { stores: nextStores };
  db.prepare(
    `UPDATE order_review_sessions
     SET batch_payload_json = ?,
         current_store_index = ?,
         status = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).run(JSON.stringify(updatedPayload), nextIndex, status, session.id);
};

const cancelOrderReviewSession = (session: OrderReviewSessionRecord) => {
  db.prepare(
    `UPDATE order_review_sessions
     SET status = 'cancelled', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).run(session.id);
  return 'Review cancelled. No changes were made.';
};

const buildOrderReviewCustomerKeyboard = (
  batchId: number,
  groups: Array<{ phone: string; customer_name: string; orders: OrderReviewProcessedItem[] }>
): TelegramInlineKeyboardMarkup | undefined => {
  const rows = groups.slice(0, 8).map((group) => [
    {
      text: `Open ${group.phone} (${group.orders.length})`,
      callback_data: `reviewcust:${batchId}:${normalizePosConnectPhone(group.phone)}`,
    },
  ]);
  return rows.length > 0 ? { inline_keyboard: rows } : undefined;
};

const formatOrderReviewCustomerGroup = (group: {
  phone: string;
  customer_name: string;
  orders: OrderReviewProcessedItem[];
}) =>
  [
    `Customer Phone: ${group.phone}`,
    `Customer Name: ${group.customer_name || '-'}`,
    `Orders found: ${group.orders.length}`,
    '',
    ...group.orders.map(
      (order, index) =>
        `${index + 1}. ${order.order_no}\n` +
        `   Store: ${order.store_name}\n` +
        `   Status: ${order.order_status || '-'}\n` +
        `   Balance: AED ${Number(order.balance ?? 0).toFixed(2)}\n` +
        `   Remark: ${order.remark || '-'}`
    ),
    '',
    'Action Required:',
    'Collect these orders into one store or one hanger before customer pickup.',
  ].join('\n');

const getOrderReviewDuplicateGroups = (batchId: number) => {
  const rows = db
    .prepare(
      `SELECT *
       FROM order_review_items
       WHERE batch_id = ? AND COALESCE(customer_phone, '') <> '' AND COALESCE(error_message, '') = ''
       ORDER BY customer_phone ASC, store_name ASC, order_no ASC`
    )
    .all(batchId) as OrderReviewProcessedItem[];
  const byPhone = new Map<string, OrderReviewProcessedItem[]>();
  for (const row of rows) {
    const phone = normalizeOrderReviewPhone(row.customer_phone);
    if (phone.length < 5) continue;
    const existing = byPhone.get(phone) ?? [];
    existing.push({ ...row, customer_phone: phone });
    byPhone.set(phone, existing);
  }

  return Array.from(byPhone.entries())
    .filter(([, orders]) => orders.length > 1)
    .map(([phone, orders]) => ({
      phone,
      customer_name: orders.find((order) => order.customer_name)?.customer_name || '',
      orders,
    }))
    .sort((a, b) => b.orders.length - a.orders.length || a.phone.localeCompare(b.phone));
};

const formatOrderReviewResult = (params: {
  batchId: number;
  checkedOrders: number;
  storeCount: number;
  failedOrders: number;
}): ChatAutomationReply => {
  const groups = getOrderReviewDuplicateGroups(params.batchId);
  if (groups.length === 0) {
    return {
      text: [
        'Review completed.',
        `Checked orders: ${params.checkedOrders}`,
        `Stores reviewed: ${params.storeCount}`,
        params.failedOrders > 0 ? `Orders with lookup warnings: ${params.failedOrders}` : '',
        '',
        'No customers with multiple orders were found in the submitted stores.',
      ]
        .filter(Boolean)
        .join('\n'),
    };
  }

  return {
    text: [
      'Review completed.',
      `Checked orders: ${params.checkedOrders}`,
      `Stores reviewed: ${params.storeCount}`,
      params.failedOrders > 0 ? `Orders with lookup warnings: ${params.failedOrders}` : '',
      '',
      `Found ${groups.length} customer(s) with multiple orders.`,
      'Tap a customer button below to open the full details.',
      '',
      ...groups
        .slice(0, 8)
        .map(
          (group, index) =>
            `${index + 1}. ${group.phone} | ${group.orders.length} orders | ${group.customer_name || '-'}`
        ),
    ]
      .filter(Boolean)
      .join('\n'),
    reply_markup: buildOrderReviewCustomerKeyboard(params.batchId, groups),
  };
};

const createOrderReviewBatch = (params: {
  payload: OrderReviewPayload;
  channel: string;
  chatUserId?: string;
  submittedBy: string;
}) => {
  const totalOrders = new Set(params.payload.stores.flatMap((store) => store.orders)).size;
  const result = db
    .prepare(
      `INSERT INTO order_review_batches (
         channel, chat_user_id, submitted_by, submitted_text, total_orders, processed_orders,
         failed_orders, status, created_at
       )
       VALUES (?, ?, ?, ?, ?, 0, 0, 'processing', CURRENT_TIMESTAMP)`
    )
    .run(
      params.channel,
      params.chatUserId ?? null,
      params.submittedBy,
      JSON.stringify(params.payload),
      totalOrders
    );
  return Number(result.lastInsertRowid);
};

const processOrderReviewPayload = async (params: {
  payload: OrderReviewPayload;
  channel: string;
  chatUserId?: string;
  submittedBy: string;
  batchId?: number;
}) => {
  const { payload } = params;
  const submittedOrders = payload.stores.flatMap((store) =>
    store.orders.map((orderNo) => ({ store_name: store.store_name, order_no: orderNo }))
  );
  const uniqueOrderMap = new Map<string, { store_name: string; order_no: string }>();
  for (const order of submittedOrders) {
    if (!uniqueOrderMap.has(order.order_no)) uniqueOrderMap.set(order.order_no, order);
  }
  const deduped = Array.from(uniqueOrderMap.values());

  const batchId = params.batchId ?? createOrderReviewBatch(params);

  const processedItems: OrderReviewProcessedItem[] = [];
  const insertItem = db.prepare(
    `INSERT INTO order_review_items (
       batch_id, store_name, order_no, customer_name, customer_phone, order_status, balance, remark, error_message
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertMany = db.transaction((items: OrderReviewProcessedItem[]) => {
    for (const item of items) {
      insertItem.run(
        batchId,
        item.store_name,
        item.order_no,
        item.customer_name,
        item.customer_phone,
        item.order_status,
        item.balance,
        item.remark,
        item.error_message ?? null
      );
    }
  });
  const chunkSize = Math.max(
    1,
    Math.min(12, Number(process.env.ORDER_REVIEW_CONCURRENCY ?? 8) || 8)
  );
  for (let index = 0; index < deduped.length; index += chunkSize) {
    const chunk = deduped.slice(index, index + chunkSize);
    const chunkResults = await Promise.all(
      chunk.map(async (item): Promise<OrderReviewProcessedItem> => {
        try {
          const order = await lookupChatOrder(item.order_no, { fastOnly: true });
          if (!order) {
            return {
              store_name: item.store_name,
              order_no: item.order_no,
              customer_name: '',
              customer_phone: '',
              order_status: '',
              balance: 0,
              remark: '',
              error_message: 'Order details could not be loaded.',
            };
          }
          return {
            store_name: item.store_name,
            order_no: order.order_no || item.order_no,
            customer_name: order.customer_name || '',
            customer_phone: normalizeOrderReviewPhone(order.customer_phone),
            order_status: order.order_status || '',
            balance: Number(order.balance ?? 0) || 0,
            remark: order.remark || '',
          };
        } catch (error: any) {
          return {
            store_name: item.store_name,
            order_no: item.order_no,
            customer_name: '',
            customer_phone: '',
            order_status: '',
            balance: 0,
            remark: '',
            error_message: String(error?.message || 'POS lookup failed.'),
          };
        }
      })
    );
    processedItems.push(...chunkResults);
    insertMany(chunkResults);
    db.prepare(
      `UPDATE order_review_batches
       SET processed_orders = ?, failed_orders = ?
       WHERE id = ?`
    ).run(
      processedItems.length,
      processedItems.filter((item) => item.error_message).length,
      batchId
    );
  }

  const groups = getOrderReviewDuplicateGroups(batchId);
  db.prepare(
    `UPDATE order_review_batches
     SET duplicate_groups_count = ?, processed_orders = ?, failed_orders = ?,
         status = 'completed', completed_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).run(
    groups.length,
    processedItems.length,
    processedItems.filter((item) => item.error_message).length,
    batchId
  );

  return {
    batch_id: batchId,
    checked_orders: processedItems.length,
    stores_reviewed: payload.stores.length,
    failed_orders: processedItems.filter((item) => item.error_message).length,
    duplicate_groups: groups,
    warnings: processedItems.filter((item) => item.error_message),
  };
};

const processOrderReviewSession = async (sessionId: number): Promise<ChatAutomationReply> => {
  const session = getOrderReviewSessionById(sessionId);
  if (!session) return { text: 'Review session was not found.' };
  const payload = getOrderReviewSessionPayload(session);
  const chatUser = getChatUser(session.channel, session.chat_user_id);
  const result = await processOrderReviewPayload({
    payload,
    channel: session.channel,
    chatUserId: session.chat_user_id,
    submittedBy: chatUser?.pos_username || chatUser?.display_name || session.chat_user_id,
  });
  db.prepare('UPDATE order_review_sessions SET batch_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
    result.batch_id,
    session.id
  );
  db.prepare(
    `UPDATE order_review_sessions
     SET status = 'completed', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).run(session.id);

  return formatOrderReviewResult({
    batchId: result.batch_id,
    checkedOrders: result.checked_orders,
    storeCount: result.stores_reviewed,
    failedOrders: result.failed_orders,
  });
};

const finishOrderReviewCollection = (session: OrderReviewSessionRecord) => {
  db.prepare("UPDATE order_review_sessions SET status = 'processing', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(
    session.id
  );
  return [
    'All stores received.',
    '',
    'Processing now. This may take some time because POS details must be loaded for every order.',
    '',
    'The result will be sent shortly.',
  ].join('\n');
};

const submitOrderReviewStore = (
  session: OrderReviewSessionRecord,
  orders: string[],
  options?: { skipped?: boolean }
) => {
  const stores = getOrderReviewSessionStores(session);
  const storeName = stores[session.current_store_index] || `Store ${session.current_store_index + 1}`;
  const nextIndex = session.current_store_index + 1;
  const isLastStore = nextIndex >= stores.length;
  updateOrderReviewSessionPayload(
    session,
    { store_name: storeName, orders, skipped: options?.skipped || orders.length === 0 },
    nextIndex,
    isLastStore ? 'processing' : 'collecting'
  );

  const updatedSession = getOrderReviewSessionById(session.id) ?? session;
  if (isLastStore) {
    return {
      completed: true,
      reply: finishOrderReviewCollection(updatedSession),
    };
  }

  const nextStore = stores[nextIndex] || `Store ${nextIndex + 1}`;
  const prefix = options?.skipped
    ? `Skipped ${storeName}.\n`
    : `Received ${orders.length} order(s) for Store ${storeName}.\n`;
  return {
    completed: false,
    reply: buildOrderReviewStorePrompt(updatedSession, `${prefix}\nNext store: ${nextStore}`),
  };
};

const hydrateChatPreviewOrder = async (
  preview: PosOrderPreview,
  fallbackOrderNo = ''
): Promise<PickupSearchOrder | null> => {
  let details: PosOrderDetailsResult | null = null;
  let detailsError = '';

  try {
    details = await fetchCachedPosConnectDetails({
      order_id: preview.invoice_id || '0',
      s_order_id: preview.orders_id || '0',
      open_type: 'preview',
      mode: '0',
    });
  } catch (error: any) {
    detailsError = String(error?.message || 'Failed to load POS order details.');
  }

  return hydratePickupSearchOrder(preview, details, detailsError, fallbackOrderNo || preview.order_no);
};

const lookupChatOrder = async (
  query: string,
  options?: { fastOnly?: boolean }
): Promise<PickupSearchOrder | null> => {
  const cleanedQuery = String(query ?? '').trim();
  if (!cleanedQuery) return null;
  const branchReference = parsePickupBranchReference(cleanedQuery);
  const orderLookupQuery = branchReference?.invoice_reference ?? cleanedQuery;
  const searchQueries = buildPosConnectSearchQueries(orderLookupQuery);

  const packingDetails = await tryFetchPosOrderDetailsViaPackingSearch(cleanedQuery);
  if (packingDetails) return hydratePickupSearchOrder(null, packingDetails, '', cleanedQuery);

  if (options?.fastOnly) {
    const normalizedReference = normalizePosReference(orderLookupQuery);
    for (const candidateQuery of searchQueries) {
      try {
        const search = await fetchCachedPosConnectSearch(
          candidateQuery,
          branchReference ? { branch_id: branchReference.branch_id } : undefined
        );
        const preview = (search.orders ?? []).find((candidate) =>
          branchReference
            ? posPreviewMatchesBranchReference(candidate, branchReference)
            : [candidate.order_no, candidate.invoice_no].some(
                (value) => normalizePosReference(value) === normalizedReference
              )
        );
        if (preview) return hydrateChatPreviewOrder(preview, cleanedQuery);
      } catch {
        // Try the next direct query shape.
      }
    }
    const directDetails = await tryFetchPosConnectDetailsByDisplayedOrderNo(cleanedQuery, searchQueries, []);
    return directDetails ? hydratePickupSearchOrder(null, directDetails, '', cleanedQuery) : null;
  }

  try {
    const preview = await resolvePosConnectPreviewByDisplayedOrderNo(orderLookupQuery, {
      branchReference: branchReference ?? undefined,
    });
    if (preview) {
      return hydrateChatPreviewOrder(preview, cleanedQuery);
    }
  } catch {
    // Try direct details below.
  }

  const directDetails = await tryFetchPosConnectDetailsByDisplayedOrderNo(cleanedQuery, searchQueries, []);
  return directDetails ? hydratePickupSearchOrder(null, directDetails, '', cleanedQuery) : null;
};

const lookupChatPhoneOrders = async (phone: string) => {
  const searchQueries = buildPosConnectSearchQueries(phone);
  const previewsByKey = new Map<string, PosOrderPreview>();
  let lastSearchError: any = null;
  let successfulSearches = 0;
  const results = await Promise.all(
    searchQueries.map(async (candidateQuery) => {
      try {
        const candidateSearch = await fetchCachedPosConnectSearch(candidateQuery);
        return { candidateQuery, candidateSearch, error: null as any };
      } catch (error) {
        return { candidateQuery, candidateSearch: null, error };
      }
    })
  );
  for (const result of results) {
    if (result.error || !result.candidateSearch) {
      lastSearchError = result.error;
      continue;
    }

    successfulSearches += 1;
    for (const preview of result.candidateSearch.orders ?? []) {
      if (!posPhoneMatchesAnyQuery(preview.customer_phone, searchQueries)) continue;
      const key = [preview.orders_id, preview.invoice_id, preview.order_no].map((value) => String(value ?? '')).join(':');
      if (!previewsByKey.has(key)) previewsByKey.set(key, preview);
    }
  }

  if (previewsByKey.size === 0 && PICKUP_PHONE_FALLBACK_ENABLED) {
    const pageSize = POS_CONNECT_FALLBACK_PAGE_SIZE;
    const maxPages = PICKUP_PHONE_FALLBACK_MAX_PAGES;
    const batchSize = POS_CONNECT_FALLBACK_BATCH_SIZE;

    for (let pageStart = 0; pageStart < maxPages; pageStart += batchSize) {
      const pageNumbers = Array.from(
        { length: Math.min(batchSize, maxPages - pageStart) },
        (_unused, index) => pageStart + index
      );

      const batchResults = await Promise.all(
        pageNumbers.map(async (page) => {
          try {
            const candidateSearch = await fetchCachedPosConnectSearch(POS_CONNECT_FALLBACK_QUERY, {
              start: String(page * pageSize),
              length: String(pageSize),
              job_status: '0',
              branch_id: '0',
              prevent_depot_selection: '0',
            });
            return { page, candidateSearch, error: null as any };
          } catch (error) {
            return { page, candidateSearch: null, error };
          }
        })
      );

      batchResults.sort((a, b) => a.page - b.page);

      for (const result of batchResults) {
        if (result.error || !result.candidateSearch) {
          lastSearchError = result.error;
          continue;
        }

        successfulSearches += 1;
        for (const preview of result.candidateSearch.orders ?? []) {
          if (!posPhoneMatchesAnyQuery(preview.customer_phone, searchQueries)) continue;
          const key = [preview.orders_id, preview.invoice_id, preview.order_no].map((value) => String(value ?? '')).join(':');
          if (!previewsByKey.has(key)) previewsByKey.set(key, preview);
        }
      }

      if (previewsByKey.size >= 8) break;
      if (batchResults.some((result) => (result.candidateSearch?.orders?.length ?? 0) < pageSize)) break;
    }
  }

  if (previewsByKey.size === 0 && successfulSearches === 0 && lastSearchError) {
    throw lastSearchError;
  }

  const previews = Array.from(previewsByKey.values()).slice(0, 8);
  return Promise.all(
    previews.map(async (preview) => hydrateChatPreviewOrder(preview, preview.order_no))
  ).then((orders) => orders.filter(Boolean) as PickupSearchOrder[]);
};

const normalizeCustomerPortalPosStatus = (status: unknown) => {
  const normalized = normalizePickupStatus(status);
  if (normalized === 'delivered') return 'delivered';
  if (normalized === 'fully packed') return 'ready';
  if (normalized === 'partially packed') return 'washing';
  return 'washing';
};

const buildCustomerPortalPosSync = (order: PickupSearchOrder) => {
  const total = Number(order.price ?? 0) || 0;
  const balance = Number(order.balance ?? 0) || 0;
  const paid = Math.max(0, total - balance);
  const items = (order.line_items ?? []).map((item) => ({
    id: item.line_key || item.sale_entry_id || item.product_id || item.barcode || item.name,
    sale_entry_id: item.sale_entry_id,
    product_id: item.product_id,
    barcode: item.barcode,
    name: item.name,
    service: item.service,
    quantity: Number(item.qty ?? 0) || 0,
    unit_price: Number(item.unit_price ?? 0) || 0,
    subtotal: Number(item.sub_total ?? 0) || 0,
    tax_amount: Number(item.tax_amount ?? 0) || 0,
    total: Number(item.total_with_tax ?? item.sub_total ?? 0) || 0,
    unit: item.unit,
    remark: item.remark,
    category: item.category,
  }));

  return {
    synced_at: new Date().toISOString(),
    order_no: order.order_no,
    system_order_id: order.source_orders_id,
    source_orders_id: order.source_orders_id,
    invoice_id: order.source_invoice_id,
    invoice_no: order.source_invoice_id,
    status: order.order_status,
    mapped_status: normalizeCustomerPortalPosStatus(order.order_status),
    payment_status: balance <= 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid',
    total,
    paid,
    balance,
    order_date: order.order_date,
    delivery_date: order.delivery_date,
    delivery_time: order.delivery_time,
    customer_name: order.customer_name,
    customer_phone: order.customer_phone,
    customer_address: order.customer_address,
    remark: order.remark,
    item_count: items.reduce((sum, item) => sum + item.quantity, 0),
    items,
    details_error: order.details_error,
  };
};

const findCustomerPortalPosOrder = async (
  order: Record<string, unknown>,
  customer: CustomerUserRecord | null | undefined
) => {
  const existingPos = (order.pos && typeof order.pos === 'object' ? order.pos : {}) as Record<string, unknown>;
  const directReferences = [
    existingPos.order_no,
    existingPos.system_order_id,
    existingPos.source_orders_id,
    order.systemOrderId,
    order.posOrderNo,
  ]
    .map((value) => String(value ?? '').trim())
    .filter(Boolean);

  for (const reference of directReferences) {
    const direct = await lookupChatOrder(reference, { fastOnly: true }).catch(() => null);
    if (direct) return direct;
  }

  const phoneCandidates = Array.from(
    new Set([
      ...getOrderPhoneCandidates(order),
      normalizeCustomerPhone(customer?.phone_normalized ?? customer?.phone),
      normalizeCustomerPhone(existingPos.customer_phone),
    ].filter(Boolean) as string[])
  );

  for (const phone of phoneCandidates) {
    const matches = await lookupChatPhoneOrders(phone).catch(() => []);
    if (!matches.length) continue;

    const existingOrderNo = String(existingPos.order_no ?? '').trim();
    const existingSystemId = String(existingPos.system_order_id ?? existingPos.source_orders_id ?? '').trim();
    const matched =
      matches.find(
        (candidate) =>
          (existingOrderNo && String(candidate.order_no ?? '') === existingOrderNo) ||
          (existingSystemId && String(candidate.source_orders_id ?? '') === existingSystemId)
      ) ?? matches[0];

    if (matched) return matched;
  }

  return null;
};

const syncCustomerPortalOrderWithPos = async (
  order: Record<string, unknown>,
  customer: CustomerUserRecord | null | undefined
) => {
  const posOrder = await findCustomerPortalPosOrder(order, customer);
  if (!posOrder) return null;

  const pos = buildCustomerPortalPosSync(posOrder);
  const itemCount = pos.item_count > 0 ? pos.item_count : Number(order.itemCount ?? 0) || 0;
  const amount = pos.total > 0 ? pos.total : Number(order.amount ?? 0) || 0;
  const paymentStatus =
    pos.payment_status === 'paid'
      ? 'paid'
      : pos.payment_status === 'unpaid'
        ? 'unpaid'
        : String(order.paymentStatus ?? 'pending');

  return {
    ...order,
    pos,
    systemOrderId: pos.system_order_id || order.systemOrderId,
    posOrderNo: pos.order_no || order.posOrderNo,
    itemCount,
    amount,
    totalPrice: amount,
    paymentStatus,
  };
};

const handleChatAutomationMessage = async (params: {
  channel: 'telegram';
  chat_user_id: string;
  message_id?: string;
  display_name?: string;
  text: string;
}) => {
  upsertChatUser({
    channel: params.channel,
    chat_user_id: params.chat_user_id,
    display_name: params.display_name,
  });

  const parsed = parseChatCommand(params.text);
  recordChatMessage({
    channel: params.channel,
    chat_user_id: params.chat_user_id,
    message_id: params.message_id,
    direction: 'in',
    body: redactChatCommandBody(parsed),
    parsed_intent: parsed.intent,
    order_no: parsed.order_no,
    status: 'received',
  });

  if (parsed.intent === 'help') return CHAT_HELP_TEXT;
  if (parsed.intent === 'auth_login') {
    if (!parsed.username || !parsed.password) {
      return 'Use this format:\nlogin USERNAME PASSWORD';
    }
    try {
      const linked = await linkChatUserToPosStaff({
        channel: params.channel,
        chat_user_id: params.chat_user_id,
        username: parsed.username,
        password: parsed.password,
      });
      return [
        'Telegram is now linked to the POS employee account.',
        `User: ${linked.profile.pos_username || linked.profile.username}`,
        `Name: ${linked.profile.display_name || '-'}`,
        `POS user ID: ${linked.profile.pos_user_id || '-'}`,
        `Branch: ${linked.profile.branch_code || linked.profile.branch_id || '-'}`,
        '',
        'Future confirmed actions will be tracked under this employee.',
      ].join('\n');
    } catch (error: any) {
      return `POS login failed.\n${String(error?.message || 'Invalid POS username or password.')}`;
    }
  }
  if (parsed.intent === 'auth_status') {
    const chatUser = getChatUser(params.channel, params.chat_user_id);
    if (!chatUser?.smart_hub_user_id && !chatUser?.pos_user_id) {
      return 'This Telegram account is not linked to POS yet.\nUse:\nlogin USERNAME PASSWORD';
    }
    return [
      'Telegram linked account:',
      `User: ${chatUser.pos_username || '-'}`,
      `Name: ${chatUser.pos_display_name || chatUser.display_name || '-'}`,
      `POS user ID: ${chatUser.pos_user_id || '-'}`,
      `Branch: ${chatUser.pos_branch_code || chatUser.pos_branch_id || '-'}`,
      `Linked at: ${chatUser.linked_at || '-'}`,
    ].join('\n');
  }
  if (parsed.intent === 'auth_logout') {
    unlinkChatUser(params.channel, params.chat_user_id);
    return 'Telegram has been unlinked from the POS account.';
  }
  if (parsed.intent === 'order_review') {
    const activeSession = getActiveOrderReviewSession(params.channel, params.chat_user_id);
    if (activeSession?.status === 'collecting') {
      return buildOrderReviewStorePrompt(activeSession, 'A review is already in progress.');
    }
    if (activeSession?.status === 'processing') {
      return 'A review is already processing. The result will be sent shortly.';
    }
    return buildOrderReviewStartReply();
  }

  const activeReviewSession = getActiveOrderReviewSession(params.channel, params.chat_user_id);
  if (activeReviewSession) {
    if (activeReviewSession.status === 'processing') {
      return 'A review is currently processing. The result will be sent shortly.';
    }
    if (isOrderReviewCancelText(params.text)) {
      return cancelOrderReviewSession(activeReviewSession);
    }

    const submission = isOrderReviewEmptyText(params.text)
      ? submitOrderReviewStore(activeReviewSession, [], { skipped: true })
      : (() => {
          const orders = extractOrderReviewOrderNumbers(params.text);
          if (orders.length === 0) {
            return {
              completed: false,
              reply: buildOrderReviewStorePrompt(
                activeReviewSession,
                'No order numbers were detected. Please send order numbers only, or type empty to skip this store.'
              ),
            };
          }
          return submitOrderReviewStore(activeReviewSession, orders);
        })();

    if (submission.completed) {
      void processOrderReviewSession(activeReviewSession.id)
        .then((finalReply) => sendTelegramMessage(params.chat_user_id, finalReply))
        .catch((error: any) =>
          sendTelegramMessage(
            params.chat_user_id,
            `Order review processing failed.\n${String(error?.message || 'Unknown error')}`
          ).catch(() => null)
        );
    }
    return submission.reply;
  }

  if (parsed.intent === 'unknown') {
    return `I did not understand that yet.\n\n${CHAT_HELP_TEXT}`;
  }
  if (parsed.intent === 'update_requested') {
    const chatUser = getChatUser(params.channel, params.chat_user_id);
    if (!chatUser?.smart_hub_user_id || !chatUser?.pos_user_id) {
      return 'Before any update action, link Telegram to a POS account:\nlogin USERNAME PASSWORD';
    }
    return [
      'Update request received, but Telegram updates are not enabled yet.',
      'Current mode is search-only for safety.',
      '',
      `Received command: ${params.text}`,
      'Next step: add confirm flow before executing updates.',
    ].join('\n');
  }
  if (parsed.intent === 'search_phone') {
    const orders = await lookupChatPhoneOrders(parsed.query ?? '');
    if (orders.length === 0) return `No matching open orders for phone ${parsed.query}.`;
    return {
      text: [
        `Found ${orders.length} open order(s) for ${parsed.query}.`,
        'Tap an order button below to open details.',
        '',
        ...orders
          .slice(0, 4)
          .map(
            (order, index) =>
              `${index + 1}. ${order.order_no} | ${order.order_status} | AED ${Number(order.balance ?? 0).toFixed(2)}`
          ),
        orders.length > 4 ? `+ ${orders.length - 4} more order(s). Refine the search if needed.` : '',
      ]
        .filter(Boolean)
        .join('\n'),
      reply_markup: buildChatPhoneOrdersKeyboard(orders),
    };
  }

  const order = await lookupChatOrder(parsed.order_no ?? parsed.query ?? '');
  if (!order) return `No matching order found for ${parsed.query ?? parsed.order_no}.`;
  return {
    text: formatChatOrder(order),
    reply_markup: buildChatOrderKeyboard(order.order_no),
  };
};

const handleChatAutomationCallback = async (params: {
  channel: 'telegram';
  chat_user_id: string;
  message_id?: string;
  display_name?: string;
  data: string;
}) => {
  upsertChatUser({
    channel: params.channel,
    chat_user_id: params.chat_user_id,
    display_name: params.display_name,
  });

  const data = String(params.data ?? '').trim();
  const [action, rawValue = ''] = data.split(':', 2);
  const orderNo = normalizePosReference(rawValue);
  recordChatMessage({
    channel: params.channel,
    chat_user_id: params.chat_user_id,
    message_id: params.message_id,
    direction: 'in',
    body: `callback:${data}`,
    parsed_intent: action === 'loc' ? 'show_location' : action === 'order' ? 'search_order' : 'unknown',
    order_no: orderNo || undefined,
    status: 'received',
  });

  if (action === 'review') {
    const parts = data.split(':');
    const reviewAction = parts[1] || '';
    if (reviewAction === 'start') {
      const session = createOrderReviewSession(params.channel, params.chat_user_id);
      return session
        ? buildOrderReviewStorePrompt(session)
        : 'Could not start the order review session. Please try again.';
    }

    const sessionId = Number(parts[2] ?? 0);
    const session = Number.isFinite(sessionId) && sessionId > 0 ? getOrderReviewSessionById(sessionId) : null;
    if (!session || session.channel !== params.channel || session.chat_user_id !== params.chat_user_id) {
      return 'Review session was not found. Please start a new review.';
    }
    if (session.status === 'processing') return 'This review is already processing. The result will be sent shortly.';
    if (session.status !== 'collecting') return 'This review session is already closed. Please start a new review.';

    if (reviewAction === 'cancel') {
      return cancelOrderReviewSession(session);
    }
    if (reviewAction === 'skip') {
      const submission = submitOrderReviewStore(session, [], { skipped: true });
      if (submission.completed) {
        void processOrderReviewSession(session.id)
          .then((finalReply) => sendTelegramMessage(params.chat_user_id, finalReply))
          .catch((error: any) =>
            sendTelegramMessage(
              params.chat_user_id,
              `Order review processing failed.\n${String(error?.message || 'Unknown error')}`
            ).catch(() => null)
          );
      }
      return submission.reply;
    }

    return 'This review button is not supported. Please start again.';
  }

  if (action === 'reviewcust') {
    const parts = data.split(':');
    const batchId = Number(parts[1] ?? 0);
    const phone = normalizePosConnectPhone(parts[2] ?? '');
    if (!Number.isFinite(batchId) || batchId <= 0 || phone.length < 5) {
      return 'Customer review details could not be opened.';
    }
    const groups = getOrderReviewDuplicateGroups(batchId);
    const group = groups.find((candidate) => normalizePosConnectPhone(candidate.phone) === phone);
    if (!group) return 'This customer group is no longer available.';
    return formatOrderReviewCustomerGroup(group);
  }

  if (!orderNo) return 'Button data is missing an order number.';

  if (action === 'order') {
    const order = await lookupChatOrder(orderNo);
    if (!order) return `No matching order found for ${orderNo}.`;
    return {
      text: formatChatOrder(order),
      reply_markup: buildChatOrderKeyboard(order.order_no),
    };
  }

  if (action === 'loc') {
    const order = await lookupChatOrder(orderNo);
    if (!order) return `No matching order found for ${orderNo}.`;
    return {
      text: [`Order: ${order.order_no || orderNo}`, formatChatStorageSlots(order)].join('\n'),
      reply_markup: buildChatOrderKeyboard(order.order_no || orderNo),
    };
  }

  return 'This button is no longer supported. Please search again.';
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
    phone_normalized: '',
    pos_status: '',
    order_date: '',
    delivery_date: '',
    customer_address: '',
    remark: '',
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
    const meta = buildPosSortingMeta(null, details);
    const qtyInOrder = (details.line_items ?? []).reduce((sum, line) => sum + Math.max(0, Number(line.qty ?? 0) || 0), 0);
    const qtyInStore = Math.max(0, Number(snapshot.qty_in_store ?? 0) || 0);
    const phone = String(details.general.customer_mobile ?? '').trim();
    const match = evaluateAlertMatch(qtyInOrder, qtyInStore);
    return {
      ...fallback,
      customer_name: String(details.general.customer_name ?? '').trim(),
      phone,
      phone_normalized: normalizeCustomerPhone(phone) ?? normalizePosConnectPhone(phone),
      pos_status: meta.pos_order_status,
      order_date: meta.pos_order_date,
      delivery_date: meta.pos_delivery_date,
      customer_address: String(details.general.customer_address ?? '').trim(),
      remark: meta.pos_remark,
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

const severityRank: Record<CustomerAlertPhoneSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const maxPhoneAlertSeverity = (values: CustomerAlertPhoneSeverity[]) => {
  return values.reduce<CustomerAlertPhoneSeverity>(
    (best, value) => (severityRank[value] > severityRank[best] ? value : best),
    'low'
  );
};

const getStoredAgeDays = (storedAt: string | null) => {
  if (!storedAt) return 0;
  const timestamp = new Date(storedAt).getTime();
  if (!Number.isFinite(timestamp)) return 0;
  return Math.max(0, Math.floor((Date.now() - timestamp) / 86_400_000));
};

const buildCustomerAlertPhoneGroups = async (options?: {
  limit?: number;
  q?: string;
  severity?: string;
  posStatus?: string;
  oldDays?: number;
}) => {
  const limit = Math.max(1, Math.min(500, Number(options?.limit ?? 160) || 160));
  const oldDays = Math.max(1, Math.min(90, Number(options?.oldDays ?? 7) || 7));
  const candidates = await buildCustomerAlertCandidates(limit);
  const groups = new Map<string, CustomerAlertPhoneGroup>();

  for (const candidate of candidates) {
    const normalizedPhone =
      candidate.phone_normalized ||
      normalizeCustomerPhone(candidate.phone) ||
      normalizePosConnectPhone(candidate.phone);
    const key = normalizedPhone || `missing:${normalizeAlertOrderNo(candidate.order_no)}`;
    const existing = groups.get(key);
    const group =
      existing ??
      ({
        id: key,
        phone: normalizedPhone,
        display_phone: candidate.phone || (normalizedPhone ? normalizedPhone : 'رقم غير متوفر'),
        customer_names: [],
        order_count: 0,
        stored_piece_count: 0,
        delivered_stored_count: 0,
        mismatch_count: 0,
        oldest_stored_at: null,
        severity: 'low',
        alerts: [],
        orders: [],
      } satisfies CustomerAlertPhoneGroup);

    group.orders.push(candidate);
    if (candidate.customer_name && !group.customer_names.includes(candidate.customer_name)) {
      group.customer_names.push(candidate.customer_name);
    }
    if (!group.phone && normalizedPhone) group.phone = normalizedPhone;
    if ((!group.display_phone || group.display_phone === 'رقم غير متوفر') && candidate.phone) {
      group.display_phone = candidate.phone;
    }
    if (
      candidate.first_stored_at &&
      (!group.oldest_stored_at || new Date(candidate.first_stored_at).getTime() < new Date(group.oldest_stored_at).getTime())
    ) {
      group.oldest_stored_at = candidate.first_stored_at;
    }

    groups.set(key, group);
  }

  let out = Array.from(groups.values()).map((group) => {
    const alerts = new Set<string>();
    const severities: CustomerAlertPhoneSeverity[] = ['low'];
    const orderNos = new Set(group.orders.map((order) => normalizeAlertOrderNo(order.order_no)).filter(Boolean));
    const deliveredStored = group.orders.filter((order) => order.pos_status === 'Delivered' && order.qty_in_store > 0);
    const mismatched = group.orders.filter((order) => order.match_state === 'missing' || order.match_state === 'extra');
    const missing = group.orders.filter((order) => order.match_state === 'missing');
    const extra = group.orders.filter((order) => order.match_state === 'extra');
    const posErrors = group.orders.filter((order) => Boolean(order.pos_error));
    const oldOrders = group.orders.filter((order) => getStoredAgeDays(order.first_stored_at) >= oldDays);

    if (!group.phone) {
      alerts.add('رقم هاتف العميل غير متوفر، لا يمكن ربطه بطلبات أخرى تلقائياً.');
      severities.push('low');
    }
    if (orderNos.size > 1) {
      alerts.add(`هذا العميل لديه ${orderNos.size} طلبات مرتبطة بنفس رقم الهاتف.`);
      severities.push(missing.length > 0 || deliveredStored.length > 0 ? 'high' : 'medium');
    }
    if (deliveredStored.length > 0) {
      alerts.add(`${deliveredStored.length} طلب حالته Delivered في POS وما زال له قطع داخل الاستور.`);
      severities.push('critical');
    }
    if (missing.length > 0) {
      alerts.add(`${missing.length} طلب به قطع ناقصة بين POS والاستور.`);
      severities.push('high');
    }
    if (extra.length > 0) {
      alerts.add(`${extra.length} طلب به قطع زائدة أو مكررة داخل الاستور.`);
      severities.push('medium');
    }
    if (oldOrders.length > 0) {
      alerts.add(`${oldOrders.length} طلب موجود في الاستور منذ ${oldDays} أيام أو أكثر.`);
      severities.push('medium');
    }
    if (posErrors.length > 0) {
      alerts.add(`${posErrors.length} طلب تعذر جلب بياناته من POS.`);
      severities.push('medium');
    }

    group.orders.sort((a, b) => {
      if (a.pos_status === 'Delivered' && b.pos_status !== 'Delivered') return -1;
      if (a.pos_status !== 'Delivered' && b.pos_status === 'Delivered') return 1;
      const aAt = a.first_stored_at ? new Date(a.first_stored_at).getTime() : Number.MAX_SAFE_INTEGER;
      const bAt = b.first_stored_at ? new Date(b.first_stored_at).getTime() : Number.MAX_SAFE_INTEGER;
      return aAt - bAt;
    });

    return {
      ...group,
      order_count: orderNos.size || group.orders.length,
      stored_piece_count: group.orders.reduce((sum, order) => sum + Math.max(0, Number(order.qty_in_store ?? 0) || 0), 0),
      delivered_stored_count: deliveredStored.length,
      mismatch_count: mismatched.length,
      severity: maxPhoneAlertSeverity(severities),
      alerts: Array.from(alerts),
    };
  });

  const query = String(options?.q ?? '').trim().toLowerCase();
  if (query) {
    out = out.filter((group) => {
      const haystack = [
        group.phone,
        group.display_phone,
        group.customer_names.join(' '),
        group.alerts.join(' '),
        ...group.orders.flatMap((order) => [
          order.order_no,
          order.customer_name,
          order.phone,
          order.pos_status,
          order.remark,
          order.store_slots.map((slot) => `${slot.store} ${slot.row} ${slot.column}`).join(' '),
        ]),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }

  const severity = String(options?.severity ?? 'all').trim().toLowerCase();
  if (severity && severity !== 'all') {
    out = out.filter((group) => group.severity === severity);
  }

  const posStatus = String(options?.posStatus ?? 'all').trim().toLowerCase();
  if (posStatus && posStatus !== 'all') {
    out = out.filter((group) => group.orders.some((order) => String(order.pos_status ?? '').toLowerCase() === posStatus));
  }

  out.sort((a, b) => {
    const severityDelta = severityRank[b.severity] - severityRank[a.severity];
    if (severityDelta !== 0) return severityDelta;
    if (b.delivered_stored_count !== a.delivered_stored_count) return b.delivered_stored_count - a.delivered_stored_count;
    const aAt = a.oldest_stored_at ? new Date(a.oldest_stored_at).getTime() : Number.MAX_SAFE_INTEGER;
    const bAt = b.oldest_stored_at ? new Date(b.oldest_stored_at).getTime() : Number.MAX_SAFE_INTEGER;
    if (aAt !== bAt) return aAt - bAt;
    return a.display_phone.localeCompare(b.display_phone);
  });

  return out;
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

const QUANTITY_ONLY_SORTING_ITEM_NAME = 'Sorting quantity';
const BLANKET_PACKING_ITEM_LABEL = 'blanket items';
const isBlanketPackingOnlyItem = (itemName: string) => detectSortingItemCategory(itemName) === 'blanket_phase3';

const isQuantityOnlySortingItemName = (value: unknown) => {
  const normalized = String(value ?? '').trim().toLowerCase();
  return normalized === 'unsorted item' || normalized === QUANTITY_ONLY_SORTING_ITEM_NAME.toLowerCase();
};

const buildSortingPosStageDescription = (totalSorted: unknown) =>
  `Sorting ${Math.max(0, Math.floor(Number(totalSorted) || 0))}`;

const waitForSortingPosSyncWindow = async (promise: Promise<unknown>, timeoutMs = 3200) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  try {
    await Promise.race([
      promise,
      new Promise((_resolve, reject) => {
        timer = setTimeout(() => reject(new Error('sorting_pos_sync_window_elapsed')), timeoutMs);
      }),
    ]);
    return true;
  } catch (error: any) {
    if (error?.message !== 'sorting_pos_sync_window_elapsed') {
      console.warn('Quick POS hydrate before sorting scan failed:', error);
    }
    return false;
  } finally {
    if (timer) clearTimeout(timer);
  }
};

const ensureQuantityOnlySortingOrderInitialized = (params: { order_no: string; qty?: number }) => {
  const normalizedOrderNo = normalizeSortingOrderNo(params.order_no);
  if (!normalizedOrderNo) throw new Error('Order number is required.');
  const scanQty = coercePositiveInt(params.qty, 1);
  const existing = db
    .prepare('SELECT * FROM sorting_orders WHERE order_no = ?')
    .get(normalizedOrderNo) as SortingOrderRecord | undefined;
  const existingItems = existing
    ? (db.prepare('SELECT * FROM sorting_items WHERE order_no = ? ORDER BY id ASC').all(normalizedOrderNo) as SortingItemRecord[])
    : [];

  if (!existing) {
    const createTx = db.transaction(() => {
      db.prepare(
        `INSERT INTO sorting_orders (
          order_no, customer_name, customer_phone, total_required, total_sorted, total_ironed, status, source_orders_id, source_invoice_id, created_at, updated_at
        )
        VALUES (?, '', NULL, ?, 0, 0, 'sorting_pending', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      ).run(normalizedOrderNo, scanQty);
      db.prepare(
        `INSERT INTO sorting_items (order_no, item_name, qty_required, qty_sorted, qty_ironed, qty_packed, status)
         VALUES (?, ?, ?, 0, 0, 0, 'missing')`
      ).run(normalizedOrderNo, QUANTITY_ONLY_SORTING_ITEM_NAME, scanQty);
    });
    createTx();
    return;
  }

  const canUseQuantityOnly =
    existingItems.length === 0 ||
    existingItems.every((item) => isQuantityOnlySortingItemName(item.item_name));
  if (!canUseQuantityOnly) return;

  const currentSorted = existingItems.reduce((sum, item) => sum + Math.max(0, Number(item.qty_sorted) || 0), 0);
  const nextRequired = Math.max(
    scanQty,
    currentSorted + scanQty,
    existingItems.reduce((sum, item) => sum + Math.max(0, Number(item.qty_required) || 0), 0),
    Number(existing.total_required ?? 0) || 0
  );

  const updateTx = db.transaction(() => {
    if (existingItems.length === 0) {
      db.prepare(
        `INSERT INTO sorting_items (order_no, item_name, qty_required, qty_sorted, qty_ironed, qty_packed, status)
         VALUES (?, ?, ?, 0, 0, 0, 'missing')`
      ).run(normalizedOrderNo, QUANTITY_ONLY_SORTING_ITEM_NAME, nextRequired);
    } else {
      const first = existingItems[0];
      db.prepare(
        `UPDATE sorting_items
         SET item_name = ?, qty_required = ?, status = ?
         WHERE id = ?`
      ).run(
        QUANTITY_ONLY_SORTING_ITEM_NAME,
        nextRequired,
        toSortingItemStatus(first.qty_sorted, nextRequired),
        first.id
      );
      for (const extra of existingItems.slice(1)) {
        db.prepare('DELETE FROM sorting_items WHERE id = ?').run(extra.id);
      }
    }
    db.prepare(
      `UPDATE sorting_orders
       SET total_required = ?, updated_at = CURRENT_TIMESTAMP
       WHERE order_no = ?`
    ).run(nextRequired, normalizedOrderNo);
  });
  updateTx();
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
    ironing_sessions: listIroningSessions({ order_no: orderNo, limit: 20, offset: 0 }).rows,
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
         completed_at = CASE
           WHEN ? = 'sorted_complete' THEN COALESCE(completed_at, CURRENT_TIMESTAMP)
           ELSE NULL
         END,
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
  let customerPhone = String((existing as any)?.customer_phone ?? '').trim();
  let posSearchPreview: PosOrderPreview | null = null;
  let posMeta: PosSortingMeta | null = null;
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
      const search = await fetchCachedPosConnectSearch(normalizedOrderNo);
      const exact = search.orders.find(
        (order) => normalizeSortingOrderNo(order.order_no) === normalizedOrderNo
      );
      if (exact) {
        posSearchPreview = exact;
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
        const directDetails = await fetchCachedPosConnectDetails({
          order_id: candidate.order_id,
          s_order_id: candidate.s_order_id,
          mode: '0',
          open_type: 'preview',
        });
        const returnedOrderNo = normalizeSortingOrderNo(directDetails.general.order_no);
        if ((directDetails.line_items ?? []).length > 0 && returnedOrderNo === normalizedOrderNo) {
          posMeta = buildPosSortingMeta(null, directDetails);
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
      const details = await fetchCachedPosConnectDetails({
        order_id: sourceInvoiceId || '0',
        s_order_id: sourceOrdersId || '0',
        mode: '0',
        open_type: 'preview',
      });

      if (!customerName) {
        customerName = String(details.general.customer_name ?? '').trim();
      }
      if (!customerPhone) {
        customerPhone = normalizeDriverPhone(details.general.customer_mobile ?? '');
      }
      posMeta = buildPosSortingMeta(posSearchPreview, details);

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
          order_no, customer_name, customer_phone, total_required, total_sorted, total_ironed, status,
          source_orders_id, source_invoice_id, pos_order_status, pos_payment_status, pos_status_flags,
          pos_remark, pos_total, pos_paid, pos_balance, pos_order_date, pos_delivery_date,
          pos_delivery_time, pos_last_synced_at, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, 0, 0, 'sorting_pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      ).run(
        normalizedOrderNo,
        customerName,
        customerPhone || null,
        totalRequired,
        sourceOrdersId || null,
        sourceInvoiceId || null,
        posMeta?.pos_order_status ?? null,
        posMeta?.pos_payment_status ?? null,
        posMeta?.pos_status_flags ?? null,
        posMeta?.pos_remark ?? null,
        posMeta?.pos_total ?? 0,
        posMeta?.pos_paid ?? 0,
        posMeta?.pos_balance ?? 0,
        posMeta?.pos_order_date ?? null,
        posMeta?.pos_delivery_date ?? null,
        posMeta?.pos_delivery_time ?? null
      );
    } else {
      db.prepare(
        `UPDATE sorting_orders
         SET customer_name = ?,
             customer_phone = ?,
             total_required = ?,
             source_orders_id = ?,
             source_invoice_id = ?,
             pos_order_status = ?,
             pos_payment_status = ?,
             pos_status_flags = ?,
             pos_remark = ?,
             pos_total = ?,
             pos_paid = ?,
             pos_balance = ?,
             pos_order_date = ?,
             pos_delivery_date = ?,
             pos_delivery_time = ?,
             pos_last_synced_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE order_no = ?`
      ).run(
        customerName,
        customerPhone || null,
        totalRequired,
        sourceOrdersId || null,
        sourceInvoiceId || null,
        posMeta?.pos_order_status ?? (existing as any)?.pos_order_status ?? null,
        posMeta?.pos_payment_status ?? (existing as any)?.pos_payment_status ?? null,
        posMeta?.pos_status_flags ?? (existing as any)?.pos_status_flags ?? null,
        posMeta?.pos_remark ?? (existing as any)?.pos_remark ?? null,
        posMeta?.pos_total ?? (existing as any)?.pos_total ?? 0,
        posMeta?.pos_paid ?? (existing as any)?.pos_paid ?? 0,
        posMeta?.pos_balance ?? (existing as any)?.pos_balance ?? 0,
        posMeta?.pos_order_date ?? (existing as any)?.pos_order_date ?? null,
        posMeta?.pos_delivery_date ?? (existing as any)?.pos_delivery_date ?? null,
        posMeta?.pos_delivery_time ?? (existing as any)?.pos_delivery_time ?? null,
        normalizedOrderNo
      );

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

const loadPosSortingSnapshot = async (orderNo: string, order?: SortingOrderRecord | null) => {
  const normalizedOrderNo = normalizeSortingOrderNo(orderNo);
  let sourceOrdersId = String(order?.source_orders_id ?? '').trim();
  let sourceInvoiceId = String(order?.source_invoice_id ?? '').trim();
  let customerName = String(order?.customer_name ?? '').trim();
  let customerPhone = String(order?.customer_phone ?? '').trim();
  let details: Awaited<ReturnType<typeof fetchPosOrderDetails>> | null = null;
  let posSearchPreview: PosOrderPreview | null = null;

  if (!sourceOrdersId && !sourceInvoiceId) {
    try {
      const search = await fetchCachedPosConnectSearch(normalizedOrderNo);
      const exact = search.orders.find(
        (entry) => normalizeSortingOrderNo(entry.order_no) === normalizedOrderNo
      );
      if (exact) {
        posSearchPreview = exact;
        sourceOrdersId = String(exact.orders_id ?? '').trim();
        sourceInvoiceId = String(exact.invoice_id ?? '').trim();
        if (!customerName) customerName = String(exact.customer_name ?? '').trim();
      }
    } catch {
      // Direct lookup below may still resolve the order.
    }
  }

  if (sourceOrdersId || sourceInvoiceId) {
    details = await fetchCachedPosConnectDetails({
      order_id: sourceInvoiceId || '0',
      s_order_id: sourceOrdersId || '0',
      mode: '0',
      open_type: 'preview',
    });
  } else {
    const compact = normalizedOrderNo.replace(/[^0-9A-Z]/gi, '');
    const numericOnly = compact.replace(/\D+/g, '');
    const candidates = Array.from(new Set([normalizedOrderNo, compact, numericOnly].filter(Boolean)));
    for (const candidate of candidates) {
      for (const shape of [
        { order_id: '0', s_order_id: candidate, tag: 'orders' as const },
        { order_id: candidate, s_order_id: '0', tag: 'invoice' as const },
      ]) {
        try {
          const directDetails = await fetchCachedPosConnectDetails({
            order_id: shape.order_id,
            s_order_id: shape.s_order_id,
            mode: '0',
            open_type: 'preview',
          });
          const returnedOrderNo = normalizeSortingOrderNo(directDetails.general.order_no);
          if ((directDetails.line_items ?? []).length > 0 && returnedOrderNo === normalizedOrderNo) {
            details = directDetails;
            if (shape.tag === 'orders') sourceOrdersId = shape.s_order_id;
            else sourceInvoiceId = shape.order_id;
            break;
          }
        } catch {
          // Try the next known POS id shape.
        }
      }
      if (details) break;
    }
  }

  if (!details || (details.line_items ?? []).length === 0) return null;
  if (!customerName) customerName = String(details.general.customer_name ?? '').trim();
  if (!customerPhone) customerPhone = normalizeDriverPhone(details.general.customer_mobile ?? '');

  const aggregate = new Map<string, number>();
  for (const line of details.line_items) {
    const name = String(line.name ?? '').trim() || QUANTITY_ONLY_SORTING_ITEM_NAME;
    const qty = coercePositiveInt(line.qty, 1);
    aggregate.set(name, (aggregate.get(name) ?? 0) + qty);
  }
  const items = Array.from(aggregate.entries()).map(([item_name, qty_required]) => ({ item_name, qty_required }));
  if (items.length === 0) return null;

  return {
    sourceOrdersId,
    sourceInvoiceId,
    customerName,
    customerPhone,
    posMeta: buildPosSortingMeta(posSearchPreview, details),
    items,
    totalRequired: items.reduce((sum, item) => sum + item.qty_required, 0),
  };
};

const syncSortingOrderQuantityFromPos = async (orderNo: string) => {
  const normalizedOrderNo = normalizeSortingOrderNo(orderNo);
  const order = db
    .prepare('SELECT * FROM sorting_orders WHERE order_no = ?')
    .get(normalizedOrderNo) as SortingOrderRecord | undefined;
  if (!order) return { order_no: normalizedOrderNo, synced: false, reason: 'missing_order' };

  const snapshot = await loadPosSortingSnapshot(normalizedOrderNo, order);
  if (!snapshot) return { order_no: normalizedOrderNo, synced: false, reason: 'pos_not_found' };

  const previousItems = db
    .prepare('SELECT * FROM sorting_items WHERE order_no = ? ORDER BY id ASC')
    .all(normalizedOrderNo) as SortingItemRecord[];
  let remainingSorted = previousItems.reduce((sum, item) => sum + Math.max(0, Number(item.qty_sorted) || 0), 0);
  let remainingIroned = previousItems.reduce((sum, item) => sum + Math.max(0, Number(item.qty_ironed) || 0), 0);
  let remainingPacked = previousItems.reduce((sum, item) => sum + Math.max(0, Number(item.qty_packed) || 0), 0);

  const replaceTx = db.transaction(() => {
    db.prepare(
      `UPDATE sorting_orders
       SET customer_name = ?,
           customer_phone = ?,
           source_orders_id = ?,
           source_invoice_id = ?,
           pos_order_status = ?,
           pos_payment_status = ?,
           pos_status_flags = ?,
           pos_remark = ?,
           pos_total = ?,
           pos_paid = ?,
           pos_balance = ?,
           pos_order_date = ?,
           pos_delivery_date = ?,
           pos_delivery_time = ?,
           pos_last_synced_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE order_no = ?`
    ).run(
      snapshot.customerName,
      snapshot.customerPhone || null,
      snapshot.sourceOrdersId || null,
      snapshot.sourceInvoiceId || null,
      snapshot.posMeta.pos_order_status,
      snapshot.posMeta.pos_payment_status,
      snapshot.posMeta.pos_status_flags,
      snapshot.posMeta.pos_remark || null,
      snapshot.posMeta.pos_total,
      snapshot.posMeta.pos_paid,
      snapshot.posMeta.pos_balance,
      snapshot.posMeta.pos_order_date || null,
      snapshot.posMeta.pos_delivery_date || null,
      snapshot.posMeta.pos_delivery_time || null,
      normalizedOrderNo
    );

    db.prepare('DELETE FROM sorting_items WHERE order_no = ?').run(normalizedOrderNo);
    const insertItem = db.prepare(
      `INSERT INTO sorting_items (order_no, item_name, qty_required, qty_sorted, qty_ironed, qty_packed, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );

    for (const item of snapshot.items) {
      const required = Math.max(1, Number(item.qty_required) || 1);
      const sorted = Math.min(required, remainingSorted);
      remainingSorted -= sorted;
      const ironed = Math.min(required, remainingIroned);
      remainingIroned -= ironed;
      const packed = Math.min(required, remainingPacked);
      remainingPacked -= packed;
      insertItem.run(
        normalizedOrderNo,
        item.item_name || QUANTITY_ONLY_SORTING_ITEM_NAME,
        required,
        sorted,
        ironed,
        packed,
        toSortingItemStatus(sorted, required)
      );
    }
  });
  replaceTx();
  syncSortingOrderProgress(normalizedOrderNo);
  return { order_no: normalizedOrderNo, synced: true, pos_quantity: snapshot.totalRequired };
};

const syncActiveSortingOrdersWithPos = async (limit = 12) => {
  const safeLimit = Math.max(1, Math.min(40, Math.floor(Number(limit) || 12)));
  const orders = db
    .prepare(
      `SELECT *
       FROM sorting_orders
       WHERE status IN ('sorting_pending', 'sorting_partial', 'sorted_complete')
       ORDER BY updated_at DESC
       LIMIT ?`
    )
    .all(safeLimit) as SortingOrderRecord[];
  const results: Array<{ order_no: string; synced: boolean; reason?: string; pos_quantity?: number; error?: string }> = [];
  for (const batch of chunk(orders, 4)) {
    const batchResults = await Promise.all(
      batch.map(async (order) => {
        try {
          return await syncSortingOrderQuantityFromPos(order.order_no);
        } catch (error: any) {
          return {
            order_no: order.order_no,
            synced: false,
            error: error?.message || 'POS sync failed',
          };
        }
      })
    );
    results.push(...batchResults);
  }
  return {
    checked: orders.length,
    synced: results.filter((result) => result.synced).length,
    results,
  };
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
    updated_items: items
      .filter((item) => (increments.get(item.id) ?? 0) > 0)
      .map((item) => ({
        id: item.id,
        item_name: item.item_name,
        qty: increments.get(item.id) ?? 0,
      })),
    ...(synced ?? {}),
  };
};

const normalizeIroningTeamMembers = (raw: unknown, fallbackWorker = 'system') => {
  const values = Array.isArray(raw)
    ? raw
    : String(raw ?? '')
        .split(/[,\n،]+/g)
        .map((item) => item.trim());
  const members = values
    .map((item) => String(item ?? '').trim())
    .filter(Boolean)
    .slice(0, 4);
  if (members.length > 0) return Array.from(new Set(members));
  return [fallbackWorker].filter(Boolean).slice(0, 1);
};

const normalizeIroningSessionStatus = (raw: unknown): SortingIroningSessionRecord['status'] => {
  const status = String(raw ?? '').trim().toLowerCase();
  if (status === 'completed' || status === 'paused') return status;
  return 'in_progress';
};

const coerceQualityScore = (raw: unknown) => {
  if (raw === null || raw === undefined || raw === '') return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) return null;
  return Math.max(0, Math.min(5, value));
};

const serializeIroningSession = (session: SortingIroningSessionRecord) => {
  const startedAt = session.started_at ? new Date(session.started_at) : null;
  const endedAt = session.ended_at ? new Date(session.ended_at) : null;
  const durationMinutes =
    startedAt && endedAt && !Number.isNaN(startedAt.getTime()) && !Number.isNaN(endedAt.getTime())
      ? Math.max(0, Math.round((endedAt.getTime() - startedAt.getTime()) / 60000))
      : null;
  return {
    ...session,
    status: normalizeIroningSessionStatus(session.status),
    team_members: String(session.team_members ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    pieces_target: Math.max(0, Number(session.pieces_target) || 0),
    pieces_ironed: Math.max(0, Number(session.pieces_ironed) || 0),
    quality_score: session.quality_score === null || session.quality_score === undefined ? null : Number(session.quality_score),
    duration_minutes: durationMinutes,
  };
};

const getIroningSessionById = (sessionId: unknown) => {
  const id = Math.max(0, Number(sessionId) || 0);
  if (!id) return null;
  return db.prepare('SELECT * FROM sorting_ironing_sessions WHERE id = ?').get(id) as SortingIroningSessionRecord | undefined;
};

const listIroningSessions = (params: {
  order_no?: string;
  worker?: string;
  status?: string;
  q?: string;
  limit?: number;
  offset?: number;
}) => {
  const limit = Math.max(1, Math.min(200, Number(params.limit ?? 40) || 40));
  const offset = Math.max(0, Number(params.offset ?? 0) || 0);
  const where: string[] = [];
  const values: unknown[] = [];

  const orderNo = normalizeSortingOrderNo(params.order_no ?? '');
  if (orderNo) {
    where.push('s.order_no = ?');
    values.push(orderNo);
  }

  const worker = String(params.worker ?? '').trim();
  if (worker) {
    where.push('(s.worker = ? OR s.team_members LIKE ?)');
    values.push(worker, `%${worker}%`);
  }

  const status = String(params.status ?? '').trim().toLowerCase();
  if (status === 'in_progress' || status === 'completed' || status === 'paused') {
    where.push('s.status = ?');
    values.push(status);
  }

  const q = String(params.q ?? '').trim();
  if (q) {
    const like = `%${q}%`;
    where.push('(s.order_no LIKE ? OR s.worker LIKE ? OR s.team_members LIKE ? OR o.customer_name LIKE ?)');
    values.push(like, like, like, like);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
  const rows = db
    .prepare(
      `SELECT s.*, o.customer_name, o.customer_phone
       FROM sorting_ironing_sessions s
       LEFT JOIN sorting_orders o ON o.order_no = s.order_no
       ${whereSql}
       ORDER BY datetime(s.started_at) DESC, s.id DESC
       LIMIT ? OFFSET ?`
    )
    .all(...values, limit, offset) as Array<SortingIroningSessionRecord & { customer_name?: string | null; customer_phone?: string | null }>;
  const total = db
    .prepare(
      `SELECT COUNT(*) AS count
       FROM sorting_ironing_sessions s
       LEFT JOIN sorting_orders o ON o.order_no = s.order_no
       ${whereSql}`
    )
    .get(...values) as { count: number };
  return {
    rows: rows.map((row) => serializeIroningSession(row)),
    total: Number(total?.count ?? 0),
    limit,
  };
};

const startIroningSession = (params: {
  order_no: string;
  worker?: string;
  team_members?: unknown;
  pieces_target?: number;
  request_id?: string;
}) => {
  const orderNo = normalizeSortingOrderNo(params.order_no);
  if (!orderNo) throw new Error('Order number is required.');
  const worker = String(params.worker ?? 'system').trim() || 'system';
  const teamMembers = normalizeIroningTeamMembers(params.team_members, worker);
  const piecesTarget = coercePositiveInt(params.pieces_target, 1);

  const bundle = getSortingOrderBundle(orderNo);
  if (!bundle) throw new Error('Sorting order not found.');
  if (bundle.order.status === 'packed_complete') throw new Error('Order is already packed complete.');

  const clothesItems = bundle.items.filter((item) => detectSortingItemCategory(item.item_name) === 'clothes');
  const sortedAvailable = clothesItems.reduce((sum, item) => {
    const sorted = Math.min(item.qty_sorted, item.qty_required);
    return sum + Math.max(0, sorted - item.qty_ironed);
  }, 0);
  if (clothesItems.length === 0) throw new Error('No clothes items found in this order.');
  if (sortedAvailable <= 0) throw new Error('No sorted clothes are available for ironing yet.');

  const active = db
    .prepare(
      `SELECT * FROM sorting_ironing_sessions
       WHERE order_no = ? AND status = 'in_progress'
       ORDER BY datetime(started_at) DESC, id DESC
       LIMIT 1`
    )
    .get(orderNo) as SortingIroningSessionRecord | undefined;
  if (active) return serializeIroningSession(active);

  const requestId = String(params.request_id ?? '').trim() || null;
  const result = db
    .prepare(
      `INSERT INTO sorting_ironing_sessions
       (order_no, status, worker, team_members, pieces_target, pieces_ironed, request_id, started_at, created_at, updated_at)
       VALUES (?, 'in_progress', ?, ?, ?, 0, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    )
    .run(orderNo, worker, teamMembers.join(','), Math.min(piecesTarget, sortedAvailable), requestId);
  const created = db
    .prepare('SELECT * FROM sorting_ironing_sessions WHERE id = ?')
    .get(result.lastInsertRowid) as SortingIroningSessionRecord;
  return serializeIroningSession(created);
};

const finishIroningSession = (params: {
  session_id: number;
  quality_score?: unknown;
  notes?: unknown;
}) => {
  const session = getIroningSessionById(params.session_id);
  if (!session) throw new Error('Ironing session not found.');
  if (session.status === 'completed') return serializeIroningSession(session);
  const qualityScore = coerceQualityScore(params.quality_score);
  const notes = String(params.notes ?? '').trim().slice(0, 1000) || null;
  db.prepare(
    `UPDATE sorting_ironing_sessions
     SET status = 'completed',
         ended_at = COALESCE(ended_at, CURRENT_TIMESTAMP),
         quality_score = ?,
         notes = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).run(qualityScore, notes, session.id);
  const updated = getIroningSessionById(session.id) as SortingIroningSessionRecord;
  return serializeIroningSession(updated);
};

const applySortingIroningStart = (params: {
  order_no: string;
  qty?: number;
  user?: string;
  request_id?: string;
  session_id?: number;
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
  const session = getIroningSessionById(params.session_id);
  if (params.session_id && !session) {
    throw new Error('Ironing session not found.');
  }
  if (session && session.order_no !== normalizedOrderNo) {
    throw new Error('Ironing session belongs to another order.');
  }
  if (session && session.status !== 'in_progress') {
    throw new Error('Ironing session is not active.');
  }

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

    if (session) {
      db.prepare(
        `UPDATE sorting_ironing_sessions
         SET pieces_ironed = pieces_ironed + ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      ).run(consumed, session.id);
    }
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
    session: session ? serializeIroningSession(getIroningSessionById(session.id) as SortingIroningSessionRecord) : null,
    ...(synced ?? {}),
  };
};

const toBlanketPackingStatus = (
  packed: number,
  required: number,
  hasError = false
): BlanketPackingLogRecord['status'] => {
  if (hasError) return 'error';
  const safeRequired = Math.max(0, Number(required) || 0);
  const safePacked = Math.max(0, Number(packed) || 0);
  if (safeRequired <= 0 || safePacked <= 0) return 'not_packed';
  if (safePacked >= safeRequired) return 'fully_packed';
  return 'partially_packed';
};

const resolveBlanketItemBySequenceIndex = (items: SortingItemRecord[], sequenceIndex: number) => {
  const target = Math.max(1, Number(sequenceIndex) || 1);
  let cursor = 0;
  for (const item of items) {
    const required = Math.max(0, Number(item.qty_required) || 0);
    if (required <= 0) continue;
    const nextCursor = cursor + required;
    if (target <= nextCursor) {
      return {
        item_id: item.id,
        item_name: item.item_name,
        item_index: target - cursor,
        item_total: required,
      };
    }
    cursor = nextCursor;
  }
  return null;
};

const readBlanketPackingLogs = (orderNo: string, limit = 20) => {
  const normalizedOrderNo = normalizeSortingOrderNo(orderNo);
  const capped = Math.max(1, Math.min(100, Number(limit) || 20));
  return db
    .prepare(
      `SELECT id, order_number, customer_name, customer_phone, blanket_index, total_blankets, action, status, printed_at, packed_by, created_at, request_id
       FROM blanket_packing_logs
       WHERE order_number = ?
       ORDER BY id DESC
       LIMIT ?`
    )
    .all(normalizedOrderNo, capped) as BlanketPackingLogRecord[];
};

const searchBlanketPackingLogs = (params: {
  order_no?: string;
  action?: string;
  status?: string;
  q?: string;
  limit?: number;
  offset?: number;
}) => {
  const whereParts: string[] = [];
  const values: Array<string | number> = [];
  const normalizedOrderNo = normalizeSortingOrderNo(params.order_no ?? '');
  const normalizedAction = String(params.action ?? '').trim().toLowerCase();
  const normalizedStatus = String(params.status ?? '').trim().toLowerCase();
  const normalizedQuery = String(params.q ?? '').trim().toLowerCase();

  if (normalizedOrderNo) {
    whereParts.push('order_number = ?');
    values.push(normalizedOrderNo);
  }
  if (normalizedAction && ['printed', 'reprinted', 'packed'].includes(normalizedAction)) {
    whereParts.push('action = ?');
    values.push(normalizedAction);
  }
  if (normalizedStatus && ['not_packed', 'partially_packed', 'fully_packed', 'error'].includes(normalizedStatus)) {
    whereParts.push('status = ?');
    values.push(normalizedStatus);
  }
  if (normalizedQuery) {
    whereParts.push(
      `(lower(COALESCE(order_number, '')) LIKE ? OR lower(COALESCE(customer_name, '')) LIKE ? OR lower(COALESCE(customer_phone, '')) LIKE ? OR lower(COALESCE(packed_by, '')) LIKE ?)`
    );
    const like = `%${normalizedQuery}%`;
    values.push(like, like, like, like);
  }

  const whereSql = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';
  const safeLimit = Math.max(1, Math.min(200, Number(params.limit ?? 30) || 30));
  const safeOffset = Math.max(0, Number(params.offset ?? 0) || 0);

  const rows = db
    .prepare(
      `SELECT id, order_number, customer_name, customer_phone, blanket_index, total_blankets, action, status, printed_at, packed_by, created_at, request_id
       FROM blanket_packing_logs
       ${whereSql}
       ORDER BY id DESC
       LIMIT ? OFFSET ?`
    )
    .all(...values, safeLimit, safeOffset) as BlanketPackingLogRecord[];

  const totalRow = db
    .prepare(
      `SELECT COUNT(1) AS total
       FROM blanket_packing_logs
       ${whereSql}`
    )
    .get(...values) as { total?: number } | undefined;

  return {
    rows,
    total: Math.max(0, Number(totalRow?.total ?? 0) || 0),
    limit: safeLimit,
    offset: safeOffset,
  };
};

const insertBlanketPackingLog = (payload: {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  blanket_index: number;
  total_blankets: number;
  action: BlanketPackingLogRecord['action'];
  status: BlanketPackingLogRecord['status'];
  packed_by: string;
  request_id?: string | null;
}) => {
  const normalizedOrderNo = normalizeSortingOrderNo(payload.order_number);
  const requestId = payload.request_id ? String(payload.request_id).trim() : '';
  if (requestId) {
    const existing = db
      .prepare(
        `SELECT id, order_number, customer_name, customer_phone, blanket_index, total_blankets, action, status, printed_at, packed_by, created_at, request_id
         FROM blanket_packing_logs
         WHERE order_number = ? AND action = ? AND request_id = ?
         ORDER BY id DESC
         LIMIT 1`
      )
      .get(normalizedOrderNo, payload.action, requestId) as BlanketPackingLogRecord | undefined;
    if (existing) return existing;
  }

  const result = db.prepare(
    `INSERT INTO blanket_packing_logs
     (order_number, customer_name, customer_phone, blanket_index, total_blankets, action, status, printed_at, packed_by, request_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, CURRENT_TIMESTAMP)`
  ).run(
    normalizedOrderNo,
    String(payload.customer_name ?? '').trim() || null,
    normalizeDriverPhone(payload.customer_phone ?? '') || null,
    Math.max(0, Number(payload.blanket_index) || 0),
    Math.max(0, Number(payload.total_blankets) || 0),
    payload.action,
    payload.status,
    String(payload.packed_by ?? 'system').trim() || 'system',
    requestId || null
  );

  return db
    .prepare(
      `SELECT id, order_number, customer_name, customer_phone, blanket_index, total_blankets, action, status, printed_at, packed_by, created_at, request_id
       FROM blanket_packing_logs
       WHERE id = ?`
    )
    .get(Number(result.lastInsertRowid)) as BlanketPackingLogRecord | undefined;
};

const getLastBlanketPackingLog = (
  orderNo: string,
  actions: Array<BlanketPackingLogRecord['action']> = ['printed', 'reprinted', 'packed']
) => {
  const normalizedOrderNo = normalizeSortingOrderNo(orderNo);
  if (!actions.length) return null;
  const placeholders = actions.map(() => '?').join(', ');
  return db
    .prepare(
      `SELECT id, order_number, customer_name, customer_phone, blanket_index, total_blankets, action, status, printed_at, packed_by, created_at, request_id
       FROM blanket_packing_logs
       WHERE order_number = ?
         AND action IN (${placeholders})
       ORDER BY id DESC
       LIMIT 1`
    )
    .get(normalizedOrderNo, ...actions) as BlanketPackingLogRecord | undefined;
};

const resolveBlanketStatusLabel = (status: BlanketPackingLogRecord['status']) => {
  if (status === 'fully_packed') return 'Fully Packed';
  if (status === 'partially_packed') return 'Partially Packed';
  if (status === 'error') return 'Error';
  return 'Not Packed';
};

const resolveBlanketPackingItemTotals = (items: SortingItemRecord[]) => {
  return items.reduce(
    (acc, item) => {
      const required = Math.max(0, Number(item.qty_required) || 0);
      const packed = Math.max(0, Math.min(required, Number(item.qty_packed) || 0));
      acc.required += required;
      acc.packed += packed;
      return acc;
    },
    { required: 0, packed: 0 }
  );
};

const buildBlanketLabelPreview = (params: {
  order_no: string;
  customer_name: string;
  blanket_index: number;
  total_blankets: number;
  generated_at?: Date;
}) => {
  const safeTotal = Math.max(0, Number(params.total_blankets) || 0);
  const safeIndex = Math.max(0, Math.min(safeTotal || Number.MAX_SAFE_INTEGER, Number(params.blanket_index) || 0));
  const dateObj = params.generated_at instanceof Date ? params.generated_at : new Date();
  const barcode_payload = params.order_no;
  return {
    order_no: params.order_no,
    customer_name: String(params.customer_name ?? '').trim(),
    blanket_index: safeIndex,
    total_blankets: safeTotal,
    sequence_label: safeTotal > 0 && safeIndex > 0 ? `${safeIndex} of ${safeTotal}` : '-',
    barcode_payload,
    printed_at: dateObj.toISOString(),
    date_text: dateObj.toLocaleString('en-US'),
    lines: [
      'IN & OUT LAUNDRY',
      `Order: ${params.order_no}`,
      `Customer: ${String(params.customer_name ?? '').trim() || '-'}`,
      `Blanket: ${safeTotal > 0 && safeIndex > 0 ? `${safeIndex} of ${safeTotal}` : '-'}`,
      `Date: ${dateObj.toLocaleString('en-US')}`,
      `Barcode: ${barcode_payload}`,
    ],
  };
};

const buildBlanketPackingUiBundle = async (orderNo: string, activityLimit = 30) => {
  const normalizedOrderNo = normalizeSortingOrderNo(orderNo);
  const base = getBlanketPackingBundle(normalizedOrderNo);
  if (!base) return null;
  const orderWithDetails = await tryHydrateSortingOrderCustomerDetailsFromPos(base.order);
  const refreshed = getBlanketPackingBundle(normalizedOrderNo);
  if (!refreshed) return null;

  const required = Math.max(0, Number(refreshed.totals.required) || 0);
  const packed = Math.max(0, Number(refreshed.totals.packed) || 0);
  const remaining = Math.max(0, required - packed);
  const matched = required > 0 && packed === required;
  const hasQuantityError = packed > required;
  const status = toBlanketPackingStatus(packed, required, hasQuantityError);
  const statusLabel = resolveBlanketStatusLabel(status);
  const nextIndex = remaining > 0 ? packed + 1 : null;
  const lastActivity = getLastBlanketPackingLog(normalizedOrderNo);
  const previewIndex = nextIndex ?? Math.max(0, Number(lastActivity?.blanket_index ?? 0));
  const labelPreview =
    required > 0 && previewIndex > 0
      ? buildBlanketLabelPreview({
          order_no: normalizedOrderNo,
          customer_name: orderWithDetails.customer_name || refreshed.order.customer_name || '',
          blanket_index: previewIndex,
          total_blankets: required,
        })
      : null;
  const activity = readBlanketPackingLogs(normalizedOrderNo, activityLimit);

  return {
    order: {
      ...refreshed.order,
      customer_name: orderWithDetails.customer_name || refreshed.order.customer_name || '',
      customer_phone: orderWithDetails.customer_phone || refreshed.order.customer_phone || null,
    },
    items: refreshed.items,
    totals: {
      required,
      packed,
      remaining,
      complete: matched,
    },
    packing: {
      quantity_in_order: required,
      quantity_in_store: packed,
      matched,
      status,
      status_label: statusLabel,
      can_print_next: required > 0 && packed < required,
      next_blanket_index: nextIndex,
      sequence_label: nextIndex ? `${nextIndex} of ${required}` : required > 0 ? `${required} of ${required}` : '-',
    },
    label_preview: labelPreview,
    last_label: lastActivity
      ? {
          blanket_index: Math.max(0, Number(lastActivity.blanket_index) || 0),
          total_blankets: Math.max(0, Number(lastActivity.total_blankets) || 0),
          action: lastActivity.action,
          printed_at: lastActivity.printed_at,
          packed_by: lastActivity.packed_by,
        }
      : null,
    activity,
  };
};

const applyBlanketPackingPrintNext = async (params: {
  order_no: string;
  user?: string;
  request_id?: string | null;
}) => {
  const normalizedOrderNo = normalizeSortingOrderNo(params.order_no);
  const packedByUser = String(params.user ?? 'system').trim() || 'system';
  const requestId = params.request_id ? String(params.request_id).trim() : '';

  const order = db
    .prepare('SELECT * FROM sorting_orders WHERE order_no = ?')
    .get(normalizedOrderNo) as SortingOrderRecord | undefined;
  if (!order) {
    throw new Error('Sorting order was not initialized.');
  }

  const customerDetails = await tryHydrateSortingOrderCustomerDetailsFromPos(order);

  const txResult = db.transaction(() => {
    const allItems = db
      .prepare('SELECT * FROM sorting_items WHERE order_no = ? ORDER BY id ASC')
      .all(normalizedOrderNo) as SortingItemRecord[];
    const blanketItems = allItems.filter((item) => isBlanketPackingOnlyItem(item.item_name));
    if (blanketItems.length === 0) {
      throw new Error(`No ${BLANKET_PACKING_ITEM_LABEL} found in this order.`);
    }

    const totalsBefore = resolveBlanketPackingItemTotals(blanketItems);
    const required = totalsBefore.required;
    const packedBefore = totalsBefore.packed;
    if (required <= 0) {
      throw new Error('Packing quantity is invalid for this order.');
    }
    if (packedBefore >= required) {
      throw new Error('All blankets already packed for this order.');
    }

    const nextItem = blanketItems.find((item) => {
      const requiredQty = Math.max(0, Number(item.qty_required) || 0);
      const packedQty = Math.max(0, Number(item.qty_packed) || 0);
      return packedQty < requiredQty;
    });
    if (!nextItem) {
      throw new Error('No pending blanket item found for this order.');
    }

    const nextItemPacked = Math.max(0, Number(nextItem.qty_packed) || 0) + 1;
    const nextItemRequired = Math.max(0, Number(nextItem.qty_required) || 0);
    const nextPackedForItem = Math.min(nextItemRequired, nextItemPacked);
    db.prepare(
      `UPDATE sorting_items
       SET qty_packed = ?
       WHERE id = ?`
    ).run(nextPackedForItem, nextItem.id);

    const packedAfter = packedBefore + 1;
    const status = toBlanketPackingStatus(packedAfter, required, packedAfter > required);
    const blanketIndex = packedAfter;
    const inserted = insertBlanketPackingLog({
      order_number: normalizedOrderNo,
      customer_name: customerDetails.customer_name || order.customer_name || '',
      customer_phone: customerDetails.customer_phone || order.customer_phone || '',
      blanket_index: blanketIndex,
      total_blankets: required,
      action: 'packed',
      status,
      packed_by: packedByUser,
      request_id: requestId || null,
    });

    db.prepare(
      `INSERT INTO sorting_blanket_packing_events (order_no, item_name, qty, user, request_id, timestamp)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    ).run(normalizedOrderNo, nextItem.item_name, 1, packedByUser, requestId || null);

    db.prepare(
      `INSERT INTO logs (blanket_number, action, user, store, row, column, status, request_id, device, ip, notes, timestamp)
       VALUES (?, ?, ?, ?, NULL, NULL, ?, ?, NULL, NULL, ?, CURRENT_TIMESTAMP)`
    ).run(
      normalizedOrderNo,
      'packed',
      packedByUser,
      'blanket_packing',
      status,
      requestId || null,
      `Packed blanket ${blanketIndex}/${required} and printed label`
    );

    return {
      blanket_index: blanketIndex,
      total_blankets: required,
      status,
      inserted_log_id: inserted?.id ?? null,
    };
  })();

  const bundle = await buildBlanketPackingUiBundle(normalizedOrderNo);
  if (!bundle) {
    throw new Error('Failed to refresh blanket packing order.');
  }

  return {
    ...bundle,
    printed: txResult,
    label_preview: buildBlanketLabelPreview({
      order_no: normalizedOrderNo,
      customer_name: bundle.order.customer_name || '',
      blanket_index: txResult.blanket_index,
      total_blankets: txResult.total_blankets,
    }),
  };
};

const applyBlanketPackingReprintLast = async (params: {
  order_no: string;
  user?: string;
  request_id?: string | null;
  confirm?: boolean;
}) => {
  const normalizedOrderNo = normalizeSortingOrderNo(params.order_no);
  const packedByUser = String(params.user ?? 'system').trim() || 'system';
  const requestId = params.request_id ? String(params.request_id).trim() : '';
  if (!params.confirm) {
    throw new Error('Reprint confirmation is required.');
  }

  const order = db
    .prepare('SELECT * FROM sorting_orders WHERE order_no = ?')
    .get(normalizedOrderNo) as SortingOrderRecord | undefined;
  if (!order) {
    throw new Error('Sorting order was not initialized.');
  }

  const customerDetails = await tryHydrateSortingOrderCustomerDetailsFromPos(order);

  const reprintResult = db.transaction(() => {
    const allItems = db
      .prepare('SELECT * FROM sorting_items WHERE order_no = ? ORDER BY id ASC')
      .all(normalizedOrderNo) as SortingItemRecord[];
    const blanketItems = allItems.filter((item) => isBlanketPackingOnlyItem(item.item_name));
    if (blanketItems.length === 0) {
      throw new Error(`No ${BLANKET_PACKING_ITEM_LABEL} found in this order.`);
    }

    const totals = resolveBlanketPackingItemTotals(blanketItems);
    const required = totals.required;
    const packed = totals.packed;
    if (required <= 0) {
      throw new Error('Packing quantity is invalid for this order.');
    }

    const lastLog = getLastBlanketPackingLog(normalizedOrderNo);
    const fallbackIndex = packed > 0 ? packed : 0;
    const targetIndex = Math.max(0, Number(lastLog?.blanket_index ?? fallbackIndex) || 0);
    if (targetIndex <= 0) {
      throw new Error('No previous label found to reprint.');
    }

    const status = toBlanketPackingStatus(packed, required, packed > required);
    insertBlanketPackingLog({
      order_number: normalizedOrderNo,
      customer_name: customerDetails.customer_name || order.customer_name || '',
      customer_phone: customerDetails.customer_phone || order.customer_phone || '',
      blanket_index: targetIndex,
      total_blankets: required,
      action: 'reprinted',
      status,
      packed_by: packedByUser,
      request_id: requestId || null,
    });

    db.prepare(
      `INSERT INTO logs (blanket_number, action, user, store, row, column, status, request_id, device, ip, notes, timestamp)
       VALUES (?, ?, ?, ?, NULL, NULL, ?, ?, NULL, NULL, ?, CURRENT_TIMESTAMP)`
    ).run(
      normalizedOrderNo,
      'reprinted',
      packedByUser,
      'blanket_packing',
      status,
      requestId || null,
      `Reprint blanket label ${targetIndex}/${required}`
    );

    return {
      blanket_index: targetIndex,
      total_blankets: required,
      status,
    };
  })();

  const bundle = await buildBlanketPackingUiBundle(normalizedOrderNo);
  if (!bundle) {
    throw new Error('Failed to refresh blanket packing order.');
  }

  return {
    ...bundle,
    reprinted: reprintResult,
    label_preview: buildBlanketLabelPreview({
      order_no: normalizedOrderNo,
      customer_name: bundle.order.customer_name || '',
      blanket_index: reprintResult.blanket_index,
      total_blankets: reprintResult.total_blankets,
    }),
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
  const blanketItems = items.filter((item) => isBlanketPackingOnlyItem(item.item_name));
  const totals = resolveBlanketPackingItemTotals(blanketItems);
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
  const blanketItems = allItems.filter((item) => isBlanketPackingOnlyItem(item.item_name));
  if (blanketItems.length === 0) {
    throw new Error(`No ${BLANKET_PACKING_ITEM_LABEL} found in this order.`);
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
    throw new Error('Packing quantities are already fully packed for this order.');
  }

  const firstTouched = blanketItems.find((item) => (increments.get(item.id) ?? 0) > 0);
  const totalsBefore = resolveBlanketPackingItemTotals(blanketItems);
  const packedBefore = totalsBefore.packed;
  const required = totalsBefore.required;
  const commitTx = db.transaction(() => {
    for (const item of blanketItems) {
      const delta = increments.get(item.id) ?? 0;
      if (delta <= 0) continue;
      const requiredQty = Math.max(0, Number(item.qty_required) || 0);
      const nextPacked = Math.min(requiredQty, Math.max(0, Number(item.qty_packed) || 0) + delta);
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

    for (let step = 1; step <= consumed; step += 1) {
      const blanketIndex = Math.min(required, packedBefore + step);
      const status = toBlanketPackingStatus(blanketIndex, required, blanketIndex > required);
      insertBlanketPackingLog({
        order_number: normalizedOrderNo,
        customer_name: order.customer_name || '',
        customer_phone: order.customer_phone || '',
        blanket_index: blanketIndex,
        total_blankets: required,
        action: 'packed',
        status,
        packed_by: packedByUser,
        request_id: requestId ? `${requestId}:packed:${step}` : null,
      });
    }
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
const tryHydrateSortingOrderCustomerDetailsFromPos = async (order: SortingOrderRecord) => {
  const currentName = String(order.customer_name ?? '').trim();
  const currentPhone = normalizeDriverPhone((order as any).customer_phone ?? '');
  if (currentName && currentPhone) {
    return { customer_name: currentName, customer_phone: currentPhone };
  }

  try {
    let details: PosOrderDetailsResult | null = null;
    const sourceOrdersId = String(order.source_orders_id ?? '').trim();
    const sourceInvoiceId = String(order.source_invoice_id ?? '').trim();
    if (sourceOrdersId || sourceInvoiceId) {
      details = await fetchPosOrderDetails({
        order_id: sourceInvoiceId || '0',
        s_order_id: sourceOrdersId || '0',
        mode: '0',
        open_type: 'preview',
      });
    } else {
      details = await resolvePosOrderDetailsByOrderNo(order.order_no);
    }
    const posName = String(details?.general?.customer_name ?? '').trim();
    const posPhone = normalizeDriverPhone(details?.general?.customer_mobile ?? '');
    const nextName = posName || currentName;
    const nextPhone = posPhone || currentPhone;
    if (nextName !== currentName || nextPhone !== currentPhone) {
      db.prepare(
        `UPDATE sorting_orders
         SET customer_name = ?,
             customer_phone = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE order_no = ?`
      ).run(nextName || currentName || '', nextPhone || null, order.order_no);
    }
    return {
      customer_name: nextName || currentName || '',
      customer_phone: nextPhone || currentPhone || '',
    };
  } catch {
    return {
      customer_name: currentName || '',
      customer_phone: currentPhone || '',
    };
  }
};

const SORTING_STATE_PACKED_LIMIT = 100;

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

  const activeOrders = db
    .prepare(
      `SELECT *
       FROM sorting_orders
       WHERE status <> 'packed_complete'
       ORDER BY updated_at DESC, created_at DESC`
    )
    .all() as SortingOrderRecord[];
  const sortingOrders = activeOrders.filter((order) => order.status === 'sorting_pending' || order.status === 'sorting_partial');
  const readyForPackingOrders = activeOrders.filter(
    (order) => order.status === 'sorted_complete' || order.status === 'packing_in_progress'
  );
  const recentPackedOrders = db
    .prepare(
      `SELECT *
       FROM sorting_orders
       WHERE status = 'packed_complete'
       ORDER BY updated_at DESC, created_at DESC
       LIMIT ?`
    )
    .all(SORTING_STATE_PACKED_LIMIT) as SortingOrderRecord[];
  const orders = [...sortingOrders, ...readyForPackingOrders, ...recentPackedOrders].sort((a, b) => {
    const left = new Date(a.updated_at || a.created_at).getTime();
    const right = new Date(b.updated_at || b.created_at).getTime();
    return right - left;
  });
  const itemsByOrder = new Map<string, SortingItemRecord[]>();
  const orderNos = orders.map((order) => order.order_no);
  const items: SortingItemRecord[] = [];
  for (const orderNoBatch of chunk(orderNos, 400)) {
    if (orderNoBatch.length === 0) continue;
    items.push(
      ...(db
        .prepare(
          `SELECT *
           FROM sorting_items
           WHERE order_no IN (${orderNoBatch.map(() => '?').join(',')})
           ORDER BY order_no ASC, id ASC`
        )
        .all(...orderNoBatch) as SortingItemRecord[])
    );
  }
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

const isMetaWhatsappOtpEnabled = () =>
  CUSTOMER_SMS_PROVIDER === 'meta_whatsapp' &&
  META_WHATSAPP_ACCESS_TOKEN.length > 0 &&
  META_WHATSAPP_PHONE_NUMBER_ID.length > 0 &&
  META_WHATSAPP_OTP_TEMPLATE_NAME.length > 0;

const getMetaWhatsappOtpTemplateComponents = (code: string) => {
  const components: Array<Record<string, unknown>> = [];
  const codeParameter = { type: 'text', text: code };

  if (META_WHATSAPP_OTP_INCLUDE_BODY_CODE) {
    components.push({
      type: 'body',
      parameters: [codeParameter],
    });
  }

  if (META_WHATSAPP_OTP_INCLUDE_BUTTON_CODE) {
    components.push({
      type: 'button',
      sub_type: META_WHATSAPP_OTP_BUTTON_TYPE,
      index: META_WHATSAPP_OTP_BUTTON_INDEX,
      parameters: [codeParameter],
    });
  }

  if (components.length === 0) {
    throw new OtpProviderError(
      500,
      'META_WHATSAPP_TEMPLATE_PARAMETERS_DISABLED',
      'Meta WhatsApp OTP template parameters are disabled. Enable body or button code parameters.'
    );
  }

  return components;
};

const sendMetaWhatsappTemplateMessage = async (
  phoneE164: string,
  templateName: string,
  languageCode: string,
  components?: Array<Record<string, unknown>>
) => {
  const version = META_WHATSAPP_API_VERSION.replace(/^\/+|\/+$/g, '');
  const endpoint = `https://graph.facebook.com/${encodeURIComponent(version)}/${encodeURIComponent(
    META_WHATSAPP_PHONE_NUMBER_ID
  )}/messages`;
  const template: Record<string, unknown> = {
    name: templateName,
    language: {
      code: languageCode,
    },
  };
  if (components && components.length > 0) {
    template.components = components;
  }

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: phoneE164.replace(/^\+/, ''),
    type: 'template',
    template,
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${META_WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const rawBody = await response.text().catch(() => '');
    const parsed = tryParseJson(rawBody) as {
      error?: {
        message?: string;
        type?: string;
        code?: number | string;
        error_subcode?: number | string;
      };
    };
    const providerMessage = String(parsed.error?.message ?? rawBody ?? '').trim();
    throw new OtpProviderError(
      502,
      'META_WHATSAPP_SEND_FAILED',
      providerMessage || `Meta WhatsApp send failed (${response.status}).`,
      rawBody || `status=${response.status}`
    );
  }
};

const sendOtpViaMetaWhatsapp = async (phoneE164: string, code: string) => {
  await sendMetaWhatsappTemplateMessage(
    phoneE164,
    META_WHATSAPP_OTP_TEMPLATE_NAME,
    META_WHATSAPP_OTP_TEMPLATE_LANGUAGE,
    getMetaWhatsappOtpTemplateComponents(code)
  );
};

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

const sanitizeMetaWhatsappTextParameter = (value: unknown) =>
  String(value ?? '').replace(/[\r\n\t]+/g, ' ').replace(/ {2,}/g, ' ').trim();

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

  const normalizedMessage = sanitizeMetaWhatsappTextParameter(message);
  if (!normalizedMessage) {
    throw new Error('Message body is required.');
  }

  if (CUSTOMER_ALERT_WHATSAPP_PROVIDER === 'meta_whatsapp') {
    if (!META_WHATSAPP_ACCESS_TOKEN || !META_WHATSAPP_PHONE_NUMBER_ID || !META_WHATSAPP_ALERT_TEMPLATE_NAME) {
      throw new Error(
        'Meta WhatsApp alerts are not configured. Set META_WHATSAPP_ACCESS_TOKEN, META_WHATSAPP_PHONE_NUMBER_ID, and META_WHATSAPP_ALERT_TEMPLATE_NAME.'
      );
    }
    if (!phoneE164) {
      throw new Error('Customer phone cannot be normalized for Meta WhatsApp.');
    }

    await sendMetaWhatsappTemplateMessage(phoneE164, META_WHATSAPP_ALERT_TEMPLATE_NAME, META_WHATSAPP_ALERT_TEMPLATE_LANGUAGE, [
      {
        type: 'body',
        parameters: [{ type: 'text', text: normalizedMessage }],
      },
    ]);

    return {
      provider: 'meta_whatsapp',
      status: 'sent',
      response: 'Meta WhatsApp accepted template message.',
    };
  }

  if (CUSTOMER_ALERT_WHATSAPP_PROVIDER === 'mock') {
    return {
      provider: 'mock',
      status: 'sent',
      response: 'Mock provider accepted message.',
    };
  }

  if (CUSTOMER_ALERT_WHATSAPP_PROVIDER !== 'aipsoft') {
    throw new Error('Unsupported WhatsApp provider. Set CUSTOMER_ALERT_WHATSAPP_PROVIDER to mock, aipsoft, or meta_whatsapp.');
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

const selectDriverForCustomerOrder = (order: Record<string, unknown>) => {
  const drivers = getConfiguredDrivers().filter((driver) => driver.phone);
  if (drivers.length === 0) return null;

  const addressText = [
    order.deliveryAddress,
    order.area,
    order.branch,
    order.customerArea,
  ]
    .map((value) => String(value ?? '').trim().toLowerCase())
    .filter(Boolean)
    .join(' ');

  const availableDrivers = drivers.filter((driver) => {
    const status = String(driver.status ?? '').toLowerCase();
    return status !== 'off' && status !== 'offline';
  });
  const candidates = availableDrivers.length > 0 ? availableDrivers : drivers;

  const areaMatch = candidates.find((driver) => {
    const serviceAreas = Array.isArray(driver.service_areas) ? driver.service_areas : [];
    if (serviceAreas.some((area) => area && addressText.includes(String(area).toLowerCase()))) {
      return true;
    }

    const branchText = [driver.branch, driver.branch_id]
      .map((value) => String(value ?? '').trim().toLowerCase())
      .filter(Boolean);
    return branchText.some((value) => value.length > 0 && addressText.includes(value));
  });

  return areaMatch ?? candidates[0] ?? null;
};

const buildDriverNewOrderMessage = (order: Record<string, unknown>) => {
  const locationLink = String(order.locationLink ?? order.mapLocationLink ?? order.driverLocationLink ?? '').trim();
  const lines = [
    'New pickup order',
    `Order: ${String(order.id ?? '').trim() || '-'}`,
    `Customer: ${String(order.customerName ?? '').trim() || '-'}`,
    `Phone: ${String(order.customerPhone ?? order.phoneNumber ?? '').trim() || '-'}`,
    `Address: ${String(order.deliveryAddress ?? '').trim() || '-'}`,
    ...(locationLink ? [`Location: ${locationLink}`] : []),
    `Pickup: ${String(order.pickupSlot ?? order.timeSlotLabel ?? '').trim() || '-'}`,
    `Service: ${String(order.serviceType ?? '').trim() || '-'}`,
  ];
  const notes = String(order.notes ?? order.customerNotes ?? '').trim();
  if (notes) lines.push(`Notes: ${notes}`);
  return lines.join(' | ').replace(/[\r\n\t]+/g, ' ').replace(/ {2,}/g, ' ').trim();
};

const getDriverPickupTemplateValues = (order: Record<string, unknown>) => {
  const locationLink = String(order.locationLink ?? order.mapLocationLink ?? order.driverLocationLink ?? '').trim();
  const addressWithLocation = [order.deliveryAddress, locationLink ? `Location: ${locationLink}` : '']
    .map((value) => String(value ?? '').trim())
    .filter(Boolean)
    .join(' | ');

  return [
    String(order.id ?? '').trim() || '-',
    sanitizeMetaWhatsappTextParameter(order.customerName) || '-',
    sanitizeMetaWhatsappTextParameter(order.customerPhone ?? order.phoneNumber) || '-',
    sanitizeMetaWhatsappTextParameter(addressWithLocation) || '-',
    sanitizeMetaWhatsappTextParameter(order.pickupSlot ?? order.timeSlotLabel) || '-',
    sanitizeMetaWhatsappTextParameter(order.serviceType) || '-',
  ];
};

const sendDriverPickupAssignmentWhatsapp = async (phoneRaw: string, order: Record<string, unknown>) => {
  if (!META_WHATSAPP_DRIVER_PICKUP_TEMPLATE_NAME) {
    return sendCustomerAlertWhatsapp(phoneRaw, buildDriverNewOrderMessage(order));
  }

  if (!META_WHATSAPP_ACCESS_TOKEN || !META_WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error(
      'Meta WhatsApp driver pickup template is not configured. Set META_WHATSAPP_ACCESS_TOKEN and META_WHATSAPP_PHONE_NUMBER_ID.'
    );
  }

  const phoneNormalized = normalizeCustomerPhone(phoneRaw);
  const phoneE164 = phoneNormalized ? toCustomerPhoneE164(phoneNormalized) : null;
  if (!phoneE164) {
    throw new Error('Driver phone cannot be normalized for Meta WhatsApp.');
  }

  await sendMetaWhatsappTemplateMessage(
    phoneE164,
    META_WHATSAPP_DRIVER_PICKUP_TEMPLATE_NAME,
    META_WHATSAPP_DRIVER_PICKUP_TEMPLATE_LANGUAGE,
    [
      {
        type: 'body',
        parameters: getDriverPickupTemplateValues(order).map((text) => ({
          type: 'text',
          text,
        })),
      },
    ]
  );

  return {
    provider: 'meta_whatsapp',
    status: 'sent',
    response: 'Meta WhatsApp accepted driver pickup assignment template.',
  };
};

const getCustomerOrderConfirmationValues = (order: Record<string, unknown>) => [
  sanitizeMetaWhatsappTextParameter(order.customerName) || 'Customer',
  String(order.id ?? '').trim() || '-',
  sanitizeMetaWhatsappTextParameter(order.deliveryAddress) || '-',
  sanitizeMetaWhatsappTextParameter(order.pickupSlot ?? order.timeSlotLabel) || '-',
];

const getCustomerOrderStatusUpdateValues = (order: Record<string, unknown>) => [
  sanitizeMetaWhatsappTextParameter(order.customerName) || 'Customer',
  String(order.id ?? '').trim() || '-',
  'Received',
  'Pickup confirmation',
];

const sendCustomerOrderConfirmationWhatsapp = async (phoneRaw: string, order: Record<string, unknown>) => {
  if (!META_WHATSAPP_ACCESS_TOKEN || !META_WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error('Meta WhatsApp customer confirmation is not configured. Set META_WHATSAPP_ACCESS_TOKEN and META_WHATSAPP_PHONE_NUMBER_ID.');
  }

  const phoneNormalized = normalizeCustomerPhone(phoneRaw);
  const phoneE164 = phoneNormalized ? toCustomerPhoneE164(phoneNormalized) : null;
  if (!phoneE164) {
    throw new Error('Customer phone cannot be normalized for Meta WhatsApp confirmation.');
  }

  const templateName =
    META_WHATSAPP_CUSTOMER_ORDER_CONFIRMATION_TEMPLATE_NAME ||
    META_WHATSAPP_CUSTOMER_ORDER_STATUS_UPDATE_TEMPLATE_NAME;
  const templateLanguage = META_WHATSAPP_CUSTOMER_ORDER_CONFIRMATION_TEMPLATE_NAME
    ? META_WHATSAPP_CUSTOMER_ORDER_CONFIRMATION_TEMPLATE_LANGUAGE
    : META_WHATSAPP_CUSTOMER_ORDER_STATUS_UPDATE_TEMPLATE_LANGUAGE;
  const values = META_WHATSAPP_CUSTOMER_ORDER_CONFIRMATION_TEMPLATE_NAME
    ? getCustomerOrderConfirmationValues(order)
    : getCustomerOrderStatusUpdateValues(order);

  if (!templateName) {
    throw new Error(
      'Customer order confirmation template is not configured. Set META_WHATSAPP_CUSTOMER_ORDER_CONFIRMATION_TEMPLATE_NAME or META_WHATSAPP_CUSTOMER_ORDER_STATUS_UPDATE_TEMPLATE_NAME.'
    );
  }

  await sendMetaWhatsappTemplateMessage(phoneE164, templateName, templateLanguage, [
    {
      type: 'body',
      parameters: values.map((text) => ({
        type: 'text',
        text,
      })),
    },
  ]);

  return {
    provider: 'meta_whatsapp',
    status: 'sent',
    template: templateName,
  };
};

const notifyCustomerOrderConfirmation = async (order: Record<string, unknown>) => {
  const phone = String(order.customerPhone ?? order.phoneNumber ?? '').trim();
  if (!phone) {
    console.warn(`[customer-order] customer confirmation skipped order=${String(order.id ?? '').trim()} reason=missing_phone`);
    return {
      ...order,
      customerConfirmation: {
        status: 'skipped',
        reason: 'Customer phone is missing.',
        attempted_at: new Date().toISOString(),
      },
    };
  }

  try {
    const providerResult = await sendCustomerOrderConfirmationWhatsapp(phone, order);
    console.log(
      `[customer-order] customer confirmation sent order=${String(order.id ?? '').trim()} phone=${phone} template=${providerResult.template}`
    );
    return {
      ...order,
      customerConfirmation: {
        status: 'sent',
        sent_at: new Date().toISOString(),
        provider: providerResult.provider,
        template: providerResult.template,
      },
    };
  } catch (error: any) {
    console.error('Failed to notify customer order confirmation:', error);
    console.warn(`[customer-order] customer confirmation failed order=${String(order.id ?? '').trim()}`);
    return {
      ...order,
      customerConfirmation: {
        status: 'failed',
        attempted_at: new Date().toISOString(),
        error: error?.message || 'Failed to send customer order confirmation.',
      },
    };
  }
};

const assignDriverAndNotifyForCustomerOrder = async (order: Record<string, unknown>) => {
  const selectedDriver = selectDriverForCustomerOrder(order);
  if (!selectedDriver) {
    console.warn(`[customer-order] driver notification skipped order=${String(order.id ?? '').trim()} reason=no_configured_driver`);
    return {
      ...order,
      driverNotification: {
        status: 'skipped',
        reason: 'No configured driver with phone number.',
        attempted_at: new Date().toISOString(),
      },
    };
  }

  const nextOrder = {
    ...order,
    assignedDriverId: String(order.assignedDriverId ?? '').trim() || selectedDriver.id,
    assignedDriverName: String(order.assignedDriverName ?? '').trim() || selectedDriver.name,
  };

  try {
    const providerResult = await sendDriverPickupAssignmentWhatsapp(selectedDriver.phone, nextOrder);
    console.log(
      `[customer-order] driver notification sent order=${String(order.id ?? '').trim()} driver=${selectedDriver.id} phone=${selectedDriver.phone}`
    );
    return {
      ...nextOrder,
      driverNotification: {
        status: 'sent',
        sent_at: new Date().toISOString(),
        provider: providerResult.provider,
        driverId: selectedDriver.id,
        driverName: selectedDriver.name,
      },
    };
  } catch (error: any) {
    console.error('Failed to notify assigned driver:', error);
    console.warn(`[customer-order] driver notification failed order=${String(order.id ?? '').trim()} driver=${selectedDriver.id}`);
    return {
      ...nextOrder,
      driverNotification: {
        status: 'failed',
        attempted_at: new Date().toISOString(),
        driverId: selectedDriver.id,
        driverName: selectedDriver.name,
        error: error?.message || 'Failed to send driver WhatsApp notification.',
      },
    };
  }
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
  { id: 'DRV-001', name: 'Driver 1', phone: '0565865506', branch: '', branch_id: '', service_areas: [], status: 'online' },
];

const getConfiguredDrivers = () => {
  const row = db.prepare('SELECT payload FROM customer_site_config WHERE id = 1').get() as { payload: string } | undefined;
  if (!row?.payload) return DEFAULT_DRIVER_ACCOUNTS;
  try {
    const parsed = JSON.parse(row.payload) as {
      drivers?: Array<{
        id?: unknown;
        name?: unknown;
        phone?: unknown;
        branch?: unknown;
        branch_id?: unknown;
        service_areas?: unknown;
        status?: unknown;
      }>;
    };
    const list = Array.isArray(parsed.drivers) ? parsed.drivers : [];
    const normalized = list
      .map((driver) => ({
        id: String(driver?.id ?? '').trim(),
        name: String(driver?.name ?? '').trim(),
        phone: normalizeDriverPhone(driver?.phone ?? ''),
        branch: String(driver?.branch ?? '').trim(),
        branch_id: String(driver?.branch_id ?? '').trim(),
        service_areas: Array.isArray(driver?.service_areas)
          ? driver.service_areas.map((area) => String(area ?? '').trim()).filter(Boolean)
          : [],
        status: String(driver?.status ?? '').trim().toLowerCase(),
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

const getCustomerUserFromSession = (session: CustomerSessionRecord | undefined | null) => {
  if (!session?.user_id) return null;
  return db
    .prepare('SELECT * FROM customer_users WHERE id = ?')
    .get(session.user_id) as CustomerUserRecord | undefined;
};

const getOrderPhoneCandidates = (order: Record<string, unknown>) =>
  [
    order.customerPhoneNormalized,
    order.customerPhone,
    order.phoneNumber,
    order.phone,
    (order.customer as Record<string, unknown> | undefined)?.phone,
  ]
    .map((value) => normalizeCustomerPhone(value))
    .filter(Boolean) as string[];

const isCustomerOrderOwner = (order: Record<string, unknown>, customer: CustomerUserRecord | null | undefined) => {
  if (!customer) return false;

  const orderCustomerId = String(order.customerId ?? order.customer_id ?? '').trim();
  if (orderCustomerId && orderCustomerId === customer.id) return true;

  const customerPhone = normalizeCustomerPhone(customer.phone_normalized ?? customer.phone);
  if (!customerPhone) return false;

  return getOrderPhoneCandidates(order).includes(customerPhone);
};

const parseCustomerOrderRowPayload = (row: { payload: string }) => {
  try {
    const parsed = JSON.parse(row.payload);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
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
    .prepare(
      `SELECT token, user_id, username, role, expires_at, auth_provider,
              pos_user_id, pos_branch_id, pos_currency_id
       FROM app_sessions
       WHERE token = ?`
    )
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
    auth_provider: row.auth_provider === 'pos' ? 'pos' : 'local',
    pos_user_id: row.pos_user_id ?? null,
    pos_branch_id: row.pos_branch_id ?? null,
    pos_currency_id: row.pos_currency_id ?? null,
  };
  sessionStore.set(token, session);
  return session;
};

const issueSession = (
  user: Pick<SQLiteUserRecord, 'id' | 'username' | 'role'>,
  options?: {
    auth_provider?: 'local' | 'pos';
    pos_user_id?: string | null;
    pos_branch_id?: string | null;
    pos_currency_id?: string | null;
  }
) => {
  const token = randomUUID();
  const session: SessionRecord = {
    token,
    user_id: user.id,
    username: user.username,
    role: user.role,
    expires_at: Date.now() + SESSION_TTL_MS,
    auth_provider: options?.auth_provider ?? 'local',
    pos_user_id: options?.pos_user_id ?? null,
    pos_branch_id: options?.pos_branch_id ?? null,
    pos_currency_id: options?.pos_currency_id ?? null,
  };
  sessionStore.set(token, session);
  db.prepare('DELETE FROM app_sessions WHERE token = ?').run(token);
  db.prepare(
    `INSERT INTO app_sessions (
       token, user_id, username, role, expires_at, auth_provider,
       pos_user_id, pos_branch_id, pos_currency_id, created_at
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    token,
    session.user_id,
    session.username,
    session.role,
    session.expires_at,
    session.auth_provider,
    session.pos_user_id,
    session.pos_branch_id,
    session.pos_currency_id,
    new Date().toISOString()
  );
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

const requireReportAccess = (req: any, res: any, next: any) => {
  const providedToken = String(
    req.headers?.['x-report-api-key'] ?? req.headers?.['x-api-key'] ?? req.query?.api_key ?? req.body?.api_key ?? ''
  ).trim();
  const providedBuffer = Buffer.from(providedToken);
  const expectedBuffer = Buffer.from(REPORT_API_TOKEN);
  if (REPORT_API_TOKEN && providedToken && providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer)) {
    req.auth = {
      token: 'report-api',
      user_id: 'report-api',
      username: 'report-api',
      role: 'admin',
      expires_at: Date.now() + 60_000,
      auth_provider: 'local',
    };
    return next();
  }
  return requireAuth(req, res, next);
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

const requirePosStaffSession = (req: any, res: any, next: any) => {
  const session = (req.auth as SessionRecord | undefined) ?? getSessionFromRequest(req);
  if (!session || session.auth_provider !== 'pos') {
    return res.status(401).json({
      error: 'POS employee login is required. Sign in with your POS username and password.',
      code: 'POS_SESSION_REQUIRED',
    });
  }

  const posSession = posStaffSessionStore.get(session.token);
  if (!posSession || posSession.expires_at <= Date.now()) {
    posStaffSessionStore.delete(session.token);
    sessionStore.delete(session.token);
    db.prepare('DELETE FROM app_sessions WHERE token = ?').run(session.token);
    return res.status(401).json({
      error: 'POS employee session expired. Sign in again.',
      code: 'POS_SESSION_EXPIRED',
    });
  }

  req.auth = session;
  req.posStaff = posSession;
  return posStaffRequestContext.run(posSession, () => next());
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
  branch_id: user.branch_id == null ? 1 : Number(user.branch_id),
  branch_name:
    (db.prepare('SELECT name FROM branches WHERE id = ?').get(user.branch_id ?? 1) as { name?: string } | undefined)?.name ??
    null,
});

const ensurePosStaffUser = (profile: {
  username: string;
  display_name: string;
  branch_id: string;
}) => {
  const username = profile.username.trim();
  const existing = db
    .prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1')
    .get(username) as SQLiteUserRecord | undefined;
  const branchId = Math.max(1, Number(profile.branch_id) || 1);

  if (existing) {
    const displayName = profile.display_name.trim() || existing.full_name || existing.username;
    db.prepare(
      `UPDATE users
       SET full_name = ?, branch_id = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(displayName, branchId, existing.id);
    return db.prepare('SELECT * FROM users WHERE id = ?').get(existing.id) as SQLiteUserRecord;
  }

  const passwordSentinel = `pos-auth-only:${randomBytes(32).toString('hex')}`;
  const result = db
    .prepare(
      `INSERT INTO users (
         username, full_name, email, phone, avatar_url, role, password,
         is_active, branch_id, created_at, updated_at
       )
       VALUES (?, ?, ?, '', '', 'cashier', ?, 1, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    )
    .run(
      username,
      profile.display_name.trim() || username,
      normalizeManagedEmail({ username }),
      passwordSentinel,
      branchId
    );

  return db.prepare('SELECT * FROM users WHERE id = ?').get(Number(result.lastInsertRowid)) as SQLiteUserRecord;
};

const withPosSessionUser = (user: SQLiteUserRecord, session: SessionRecord, posSession: PosStaffSessionRecord) => ({
  ...normalizeSQLiteUser(user),
  auth_provider: 'pos' as const,
  pos_user_id: session.pos_user_id ?? null,
  pos_branch_id: session.pos_branch_id ?? null,
  pos_currency_id: session.pos_currency_id ?? null,
  pos_display_name: posSession.display_name,
  pos_user_type_name: posSession.user_type_name,
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

const extractPickScanOrderNumber = (raw: unknown) => {
  const value = String(raw ?? '').trim();
  if (!value) return '';
  try {
    const url = new URL(value);
    const fromQuery =
      url.searchParams.get('blanket') ||
      url.searchParams.get('blanket_number') ||
      url.searchParams.get('invoice') ||
      url.searchParams.get('ticket') ||
      url.searchParams.get('n') ||
      url.searchParams.get('number');
    if (fromQuery?.trim()) return fromQuery.trim();
  } catch {
    // Continue with raw barcode text.
  }
  const labeledMatch = value.match(/(?:order|invoice|ticket|job\s*order)\s*[:#\-]?\s*([A-Za-z]{0,3}\d{3,})/i);
  if (labeledMatch?.[1]) return labeledMatch[1].trim();
  const normalized = value.replace(/\*/g, ' ').replace(/\s+/g, ' ').trim();
  const strongMixedTokens = normalized.match(/\b[A-Za-z]{1,3}\d{3,}\b/g);
  if (strongMixedTokens?.length) return strongMixedTokens[0].trim();
  const splitTokens = normalized.split(/[^0-9A-Za-z]+/).filter(Boolean);
  const splitMixed = splitTokens.find((token) => /^[A-Za-z]{1,3}\d{3,}$/.test(token));
  if (splitMixed) return splitMixed.trim();
  const compact = normalized.replace(/^[^0-9A-Za-z]+|[^0-9A-Za-z]+$/g, '').replace(/\s+/g, '');
  if (!compact) return '';
  if (!/[A-Za-z]/.test(compact)) return compact.replace(/\D+/g, '');
  return compact.replace(/[^0-9A-Za-z_-]/g, '') || compact;
};

const normalizePickScanCompare = (value: unknown) => String(value ?? '').trim().toLowerCase();

const validatePickScanForStore = (params: {
  requirePickScan: unknown;
  storeType: unknown;
  scannedValue: unknown;
  expectedOrderNo: unknown;
}) => {
  const required = normalizeStoreRequirePickScan(params.requirePickScan, params.storeType);
  if (!required) return { ok: true as const, extracted: '' };
  const extracted = extractPickScanOrderNumber(params.scannedValue);
  const scanned = normalizePickScanCompare(extracted);
  const expected = normalizePickScanCompare(params.expectedOrderNo);
  if (!scanned) {
    return { ok: false as const, extracted, error: 'Pick scan required before marking this order as picked.' };
  }
  if (scanned !== expected) {
    return { ok: false as const, extracted, error: `Scanned order ${extracted} does not match required order ${params.expectedOrderNo}.` };
  }
  return { ok: true as const, extracted };
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

const parseBranchPayload = (body: any) => ({
  name: clampText(body?.name, 120) || 'New Branch',
  city: clampText(body?.city, 80),
  trade_license: clampText(body?.trade_license, 120),
  phone: clampText(body?.phone, 40),
  address: clampText(body?.address, 240),
  status: String(body?.status ?? 'active').toLowerCase() === 'inactive' ? 'inactive' : 'active',
  notes: clampText(body?.notes, 500),
});

const normalizeBranchRow = (row: any): BranchRecord => ({
  id: Number(row?.id ?? 0),
  name: String(row?.name ?? ''),
  city: String(row?.city ?? ''),
  trade_license: row?.trade_license == null ? null : String(row.trade_license),
  phone: row?.phone == null ? null : String(row.phone),
  address: row?.address == null ? null : String(row.address),
  status: String(row?.status ?? 'active') === 'inactive' ? 'inactive' : 'active',
  notes: row?.notes == null ? null : String(row.notes),
  created_at: row?.created_at == null ? null : String(row.created_at),
  updated_at: row?.updated_at == null ? null : String(row.updated_at),
});

const readSqliteBranches = () =>
  (db.prepare('SELECT * FROM branches ORDER BY id ASC').all() as any[]).map(normalizeBranchRow);

const isMissingStoreColorVisibleColumnError = (error: any) => {
  const code = String(error?.code ?? '').trim();
  const message = String(error?.message ?? '').toLowerCase();
  return code === '42703' && message.includes('store_color_visible');
};

const ensurePostgresColumn = async (tableName: string, columnName: string, definition: string) => {
  if (!USE_POSTGRES_LOCAL || !pgPool) return;
  const existsResult = await pgPool.query(
    `SELECT 1
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = $1
       AND column_name = $2
     LIMIT 1`,
    [tableName, columnName]
  );
  if (!Array.isArray(existsResult.rows) || existsResult.rows.length === 0) {
    await pgPool.query(`ALTER TABLE "${tableName}" ADD COLUMN ${columnName} ${definition}`);
  }
};

const ensurePostgresBranchSchema = async () => {
  if (!USE_POSTGRES_LOCAL || !pgPool) return;
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS branches (
      id serial PRIMARY KEY,
      name text NOT NULL,
      city text NOT NULL DEFAULT '',
      trade_license text,
      phone text,
      address text,
      status text NOT NULL DEFAULT 'active',
      notes text,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await ensurePostgresColumn('stores', 'branch_id', 'integer DEFAULT 1');
  const existing = await pgPool.query('SELECT id FROM branches ORDER BY id ASC LIMIT 1');
  if (!existing.rows?.[0]) {
    await pgPool.query(
      `INSERT INTO branches (id, name, city, trade_license, phone, address, status, notes, created_at, updated_at)
       SELECT 1, $1, $2, $3, $4, $5, 'active', $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
       WHERE NOT EXISTS (SELECT 1 FROM branches WHERE id = 1)`,
      ['فرع الفلاح', 'أبوظبي', '', '', 'Al Falah, Abu Dhabi', 'Default branch for existing storage and orders.']
    );
  }
  await pgPool.query('UPDATE stores SET branch_id = 1 WHERE branch_id IS NULL OR branch_id <= 0');
};

const ensurePostgresLocalStoreColumns = async () => {
  if (!USE_POSTGRES_LOCAL || !pgPool) return;
  const existsResult = await pgPool.query(
    `SELECT 1
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'stores'
       AND column_name = 'store_color_visible'
     LIMIT 1`
  );
  if (!Array.isArray(existsResult.rows) || existsResult.rows.length === 0) {
    await pgPool.query(
      'ALTER TABLE stores ADD COLUMN store_color_visible integer DEFAULT 1'
    );
  }
  await pgPool.query(
    'UPDATE stores SET store_color_visible = 1 WHERE store_color_visible IS NULL'
  );
};

const ensurePostgresLocalIdentityDefaults = async () => {
  if (!USE_POSTGRES_LOCAL || !pgPool) return;

  const tables = ['blankets', 'logs'] as const;

  for (const tableName of tables) {
    const columnResult = await pgPool.query(
      `SELECT column_default
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = $1
         AND column_name = 'id'
       LIMIT 1`,
      [tableName]
    );

    if (!Array.isArray(columnResult.rows) || columnResult.rows.length === 0) {
      continue;
    }

    const sequenceName = `${tableName}_id_seq`;
    const sequenceResult = await pgPool.query(
      `SELECT 1
       FROM pg_class c
       JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname = 'public'
         AND c.relname = $1
         AND c.relkind = 'S'
       LIMIT 1`,
      [sequenceName]
    );
    if (!Array.isArray(sequenceResult.rows) || sequenceResult.rows.length === 0) {
      await pgPool.query(`CREATE SEQUENCE "${sequenceName}"`);
    }
    await pgPool.query(`ALTER SEQUENCE "${sequenceName}" OWNED BY "${tableName}".id`);
    await pgPool.query(
      `SELECT setval(
        $1::regclass,
        GREATEST(COALESCE((SELECT MAX(id) FROM "${tableName}"), 0), 1),
        COALESCE((SELECT MAX(id) FROM "${tableName}"), 0) > 0
      )`,
      [`public.${sequenceName}`]
    );

    if (!columnResult.rows[0]?.column_default) {
      await pgPool.query(
        `ALTER TABLE "${tableName}" ALTER COLUMN id SET DEFAULT nextval('public.${sequenceName}'::regclass)`
      );
    }
  }
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

type PosConveyerStorageSyncResult = {
  synced: boolean;
  reason?: string;
  action?: 'inserted' | 'moved' | 'unchanged';
  order_no: string;
  remark: string;
  slot: number | null;
  store: string | null;
  row: number | null;
  column: number | null;
  blanket_id?: number | null;
  occupied_by?: string | null;
  message?: string;
};

const normalizeConveyerStoreKey = (value: unknown) => String(value ?? '').trim().toLowerCase();

const getConveyerStoreAliasKeys = () => {
  const aliases = [POS_CONVEYER_STORE_NAME, ...POS_CONVEYER_STORE_ALIASES, 'conveyer', 'conveyor', 'كونفير', 'كنفير'];
  return Array.from(new Set(aliases.map((item) => normalizeConveyerStoreKey(item)).filter(Boolean)));
};

const parsePosConveyerSlotFromRemark = (remark: unknown): number | null => {
  const text = String(remark ?? '').trim();
  if (!text) return null;

  const isValid = (value: unknown) => {
    const slot = Number(value);
    return Number.isInteger(slot) && slot >= 1 && slot <= POS_CONVEYER_MAX_SLOT ? slot : null;
  };

  const exact = isValid(text);
  if (exact !== null) return exact;

  const markerMatch = text.match(
    /(?:\bpack\b|\bpacking\b|\bstore\b|\bstorage\b|\bconveyer\b|\bconveyor\b|كونفير|كنفير|استور)\s*[:#=\-\s]*([1-9]\d{0,2})/i
  );
  const markerSlot = markerMatch ? isValid(markerMatch[1]) : null;
  if (markerSlot !== null) return markerSlot;

  const compactMarkerMatch = text.match(/\[(?:pack|packing|store|storage|conveyer|conveyor|كونفير|كنفير)\s*:?\s*([1-9]\d{0,2})\]/i);
  const compactSlot = compactMarkerMatch ? isValid(compactMarkerMatch[1]) : null;
  if (compactSlot !== null) return compactSlot;

  return null;
};

const ensureSqliteConveyerStore = (slot: number) => {
  const aliasKeys = getConveyerStoreAliasKeys();
  const stores = db
    .prepare('SELECT * FROM stores ORDER BY store_name ASC')
    .all() as Array<{
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
      store_type: string;
      hanger_slots: number;
      slot_capacity: number;
      require_pick_scan: number;
      store_color: string;
      store_color_visible: number;
      store_opacity: number;
      cell_width: number;
      cell_depth: number;
      cell_height: number;
    }>;

  let store = stores.find((candidate) => aliasKeys.includes(normalizeConveyerStoreKey(candidate.store_name)));
  if (!store) {
    const existingPositions = stores.map((candidate) => ({
      position_x: Number(candidate.position_x ?? 0),
      position_z: Number(candidate.position_z ?? 0),
    }));
    const availableSlot = defaultStoreSlots.find(
      (candidate) => !existingPositions.some((pos) => pos.position_x === candidate.x && pos.position_z === candidate.z)
    );
    const position_x = availableSlot ? availableSlot.x : (existingPositions.length ? existingPositions[existingPositions.length - 1].position_x + 15 : 0);
    const position_z = availableSlot ? availableSlot.z : 0;
    const columns = Math.max(slot, POS_CONVEYER_MAX_SLOT);
    const storeName = POS_CONVEYER_STORE_NAME;

    db.prepare(`
      INSERT INTO stores (
        store_name, position_x, position_y, position_z, width, depth, height,
        rows, columns, rotation_y, auto_settle, store_type, hanger_slots, slot_capacity, require_pick_scan,
        store_color, store_color_visible, store_opacity, cell_width, cell_depth, cell_height
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      storeName,
      position_x,
      0,
      position_z,
      10,
      1,
      3,
      1,
      columns,
      0,
      1,
      'grid',
      0,
      1,
      0,
      '#3b82f6',
      1,
      1,
      normalizeStoreCellDimension(undefined, deriveDefaultCellWidth(columns)),
      normalizeStoreCellDimension(undefined, deriveDefaultCellDepth(1)),
      normalizeStoreCellDimension(undefined, deriveDefaultCellHeight())
    );
    store = db.prepare('SELECT * FROM stores WHERE store_name = ?').get(storeName) as any;
  }

  const nextRows = Math.max(1, Number(store.rows ?? 1) || 1);
  const nextColumns = Math.max(Number(store.columns ?? 1) || 1, slot, POS_CONVEYER_MAX_SLOT);
  const needsResize =
    nextRows !== Number(store.rows ?? 1) ||
    nextColumns !== Number(store.columns ?? 1) ||
    String(store.store_type ?? 'grid') !== 'grid' ||
    Math.max(1, Number(store.slot_capacity ?? 1) || 1) !== 1;

  if (needsResize) {
    db.prepare(
      `UPDATE stores
       SET rows = ?, columns = ?, store_type = 'grid', hanger_slots = 0, slot_capacity = 1,
           cell_width = ?, cell_depth = ?, cell_height = ?
       WHERE store_name = ?`
    ).run(
      nextRows,
      nextColumns,
      normalizeStoreCellDimension(undefined, deriveDefaultCellWidth(nextColumns)),
      normalizeStoreCellDimension(undefined, deriveDefaultCellDepth(nextRows)),
      normalizeStoreCellDimension(undefined, deriveDefaultCellHeight()),
      store.store_name
    );
  }

  return String(store.store_name);
};

const ensurePostgresConveyerStore = async (slot: number) => {
  if (!pgPool) throw new Error('Postgres is not configured.');
  const aliasKeys = getConveyerStoreAliasKeys();
  const storesRes = await pgPool.query('SELECT * FROM stores ORDER BY store_name ASC');
  const stores = Array.isArray(storesRes.rows) ? storesRes.rows : [];
  let store = stores.find((candidate) => aliasKeys.includes(normalizeConveyerStoreKey(candidate.store_name)));

  if (!store) {
    const existingPositions = stores.map((candidate: any) => ({
      position_x: Number(candidate.position_x ?? 0),
      position_z: Number(candidate.position_z ?? 0),
    }));
    const availableSlot = defaultStoreSlots.find(
      (candidate) => !existingPositions.some((pos) => pos.position_x === candidate.x && pos.position_z === candidate.z)
    );
    const position_x = availableSlot ? availableSlot.x : (existingPositions.length ? existingPositions[existingPositions.length - 1].position_x + 15 : 0);
    const position_z = availableSlot ? availableSlot.z : 0;
    const columns = Math.max(slot, POS_CONVEYER_MAX_SLOT);
    const storeName = POS_CONVEYER_STORE_NAME;

    await pgPool.query(
      `INSERT INTO stores (
        store_name, position_x, position_y, position_z, width, depth, height, rows, columns,
        rotation_y, auto_settle, store_type, hanger_slots, slot_capacity, require_pick_scan,
        store_color, store_color_visible, store_opacity, cell_width, cell_depth, cell_height
      )
      VALUES ($1, $2, 0, $3, 10, 1, 3, 1, $4, 0, 1, 'grid', 0, 1, 0, '#3b82f6', 1, 1, $5, $6, $7)`,
      [
        storeName,
        position_x,
        position_z,
        columns,
        normalizeStoreCellDimension(undefined, deriveDefaultCellWidth(columns)),
        normalizeStoreCellDimension(undefined, deriveDefaultCellDepth(1)),
        normalizeStoreCellDimension(undefined, deriveDefaultCellHeight()),
      ]
    );
    const created = await pgPool.query('SELECT * FROM stores WHERE store_name = $1 LIMIT 1', [storeName]);
    store = created.rows?.[0];
  }

  const nextRows = Math.max(1, Number(store.rows ?? 1) || 1);
  const nextColumns = Math.max(Number(store.columns ?? 1) || 1, slot, POS_CONVEYER_MAX_SLOT);
  const needsResize =
    nextRows !== Number(store.rows ?? 1) ||
    nextColumns !== Number(store.columns ?? 1) ||
    String(store.store_type ?? 'grid') !== 'grid' ||
    Math.max(1, Number(store.slot_capacity ?? 1) || 1) !== 1;

  if (needsResize) {
    await pgPool.query(
      `UPDATE stores
       SET rows = $1, columns = $2, store_type = 'grid', hanger_slots = 0, slot_capacity = 1,
           cell_width = $3, cell_depth = $4, cell_height = $5
       WHERE store_name = $6`,
      [
        nextRows,
        nextColumns,
        normalizeStoreCellDimension(undefined, deriveDefaultCellWidth(nextColumns)),
        normalizeStoreCellDimension(undefined, deriveDefaultCellDepth(nextRows)),
        normalizeStoreCellDimension(undefined, deriveDefaultCellHeight()),
        store.store_name,
      ]
    );
  }

  return String(store.store_name);
};

const syncPosOrderToConveyerStorage = async (params: {
  order_no: unknown;
  remark: unknown;
  user?: unknown;
  meta?: ReturnType<typeof getLogMeta>;
}): Promise<PosConveyerStorageSyncResult> => {
  const orderNo = String(params.order_no ?? '').trim();
  const remark = String(params.remark ?? '').trim();
  const slot = parsePosConveyerSlotFromRemark(remark);
  const user = String(params.user ?? 'system').trim() || 'system';
  const meta = params.meta ?? { request_id: randomUUID(), device: null, ip: null, notes: null };

  if (!orderNo) {
    return { synced: false, reason: 'missing_order_no', order_no: '', remark, slot, store: null, row: null, column: null };
  }

  if (!POS_CONVEYER_AUTO_SYNC_ENABLED) {
    return { synced: false, reason: 'disabled', order_no: orderNo, remark, slot, store: null, row: null, column: null };
  }

  if (slot === null) {
    return { synced: false, reason: 'no_conveyer_slot_in_remark', order_no: orderNo, remark, slot, store: null, row: null, column: null };
  }

  const row = 1;
  const column = slot;

  if (USE_POSTGRES_LOCAL && pgPool) {
    const store = await ensurePostgresConveyerStore(slot);
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      const occupiedRes = await client.query(
        `SELECT id, blanket_number FROM blankets
         WHERE store = $1 AND row = $2 AND "column" = $3 AND status = 'stored' AND blanket_number <> $4
         LIMIT 1`,
        [store, row, column, orderNo]
      );
      const occupied = occupiedRes.rows?.[0];
      if (occupied) {
        await client.query('ROLLBACK');
        return {
          synced: false,
          reason: 'slot_occupied',
          order_no: orderNo,
          remark,
          slot,
          store,
          row,
          column,
          occupied_by: String(occupied.blanket_number ?? ''),
          message: `Conveyer slot ${slot} is already occupied by order ${occupied.blanket_number}.`,
        };
      }

      const sameAtTargetRes = await client.query(
        `SELECT id FROM blankets
         WHERE blanket_number = $1 AND store = $2 AND row = $3 AND "column" = $4 AND status = 'stored'
         ORDER BY created_at DESC
         LIMIT 1`,
        [orderNo, store, row, column]
      );
      const sameAtTarget = sameAtTargetRes.rows?.[0];
      if (sameAtTarget) {
        await client.query('COMMIT');
        return {
          synced: true,
          action: 'unchanged',
          order_no: orderNo,
          remark,
          slot,
          store,
          row,
          column,
          blanket_id: Number(sameAtTarget.id),
        };
      }

      const existingRes = await client.query(
        `SELECT id, store, row, "column", status FROM blankets
         WHERE blanket_number = $1 AND status = 'stored'
         ORDER BY created_at DESC
         LIMIT 1`,
        [orderNo]
      );
      const existing = existingRes.rows?.[0];
      const logNotes = `POS remark conveyer sync: remark="${remark}" -> ${store} R${row}:C${column}`;

      if (existing) {
        await client.query(
          `UPDATE blankets SET store = $1, row = $2, "column" = $3, status = 'stored' WHERE id = $4`,
          [store, row, column, Number(existing.id)]
        );
        await client.query(
          `INSERT INTO logs (blanket_number, action, "user", store, row, "column", status, request_id, device, ip, notes)
           VALUES ($1, 'moved', $2, $3, $4, $5, 'stored', $6, $7, $8, $9)`,
          [orderNo, user, store, row, column, meta.request_id, meta.device, meta.ip, logNotes]
        );
        await client.query('COMMIT');
        return { synced: true, action: 'moved', order_no: orderNo, remark, slot, store, row, column, blanket_id: Number(existing.id) };
      }

      const insertRes = await client.query(
        `INSERT INTO blankets (blanket_number, store, row, "column", status)
         VALUES ($1, $2, $3, $4, 'stored')
         RETURNING id`,
        [orderNo, store, row, column]
      );
      const insertedId = Number(insertRes.rows?.[0]?.id ?? 0) || null;
      await client.query(
        `INSERT INTO logs (blanket_number, action, "user", store, row, "column", status, request_id, device, ip, notes)
         VALUES ($1, 'stored', $2, $3, $4, $5, 'stored', $6, $7, $8, $9)`,
        [orderNo, user, store, row, column, meta.request_id, meta.device, meta.ip, logNotes]
      );
      await client.query('COMMIT');
      return { synced: true, action: 'inserted', order_no: orderNo, remark, slot, store, row, column, blanket_id: insertedId };
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // ignore rollback errors
      }
      throw error;
    } finally {
      client.release();
    }
  }

  const store = ensureSqliteConveyerStore(slot);
  const syncTx = db.transaction((): PosConveyerStorageSyncResult => {
    const occupied = db
      .prepare(
        `SELECT id, blanket_number FROM blankets
         WHERE store = ? AND row = ? AND column = ? AND status = 'stored' AND blanket_number <> ?
         LIMIT 1`
      )
      .get(store, row, column, orderNo) as { id: number; blanket_number: string } | undefined;

    if (occupied) {
      return {
        synced: false,
        reason: 'slot_occupied',
        order_no: orderNo,
        remark,
        slot,
        store,
        row,
        column,
        occupied_by: occupied.blanket_number,
        message: `Conveyer slot ${slot} is already occupied by order ${occupied.blanket_number}.`,
      };
    }

    const sameAtTarget = db
      .prepare(
        `SELECT id FROM blankets
         WHERE blanket_number = ? AND store = ? AND row = ? AND column = ? AND status = 'stored'
         ORDER BY created_at DESC
         LIMIT 1`
      )
      .get(orderNo, store, row, column) as { id: number } | undefined;

    if (sameAtTarget) {
      return { synced: true, action: 'unchanged', order_no: orderNo, remark, slot, store, row, column, blanket_id: sameAtTarget.id };
    }

    const existing = db
      .prepare(
        `SELECT id, store, row, column, status FROM blankets
         WHERE blanket_number = ? AND status = 'stored'
         ORDER BY created_at DESC
         LIMIT 1`
      )
      .get(orderNo) as { id: number; store: string; row: number; column: number; status: string } | undefined;

    const logNotes = `POS remark conveyer sync: remark="${remark}" -> ${store} R${row}:C${column}`;

    if (existing) {
      db.prepare(`UPDATE blankets SET store = ?, row = ?, column = ?, status = 'stored' WHERE id = ?`).run(
        store,
        row,
        column,
        existing.id
      );
      db.prepare(
        'INSERT INTO logs (blanket_number, action, user, store, row, column, status, request_id, device, ip, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(orderNo, 'moved', user, store, row, column, 'stored', meta.request_id, meta.device, meta.ip, logNotes);
      return { synced: true, action: 'moved', order_no: orderNo, remark, slot, store, row, column, blanket_id: existing.id };
    }

    const result = db.prepare(`INSERT INTO blankets (blanket_number, store, row, column, status) VALUES (?, ?, ?, ?, 'stored')`).run(
      orderNo,
      store,
      row,
      column
    );
    db.prepare(
      'INSERT INTO logs (blanket_number, action, user, store, row, column, status, request_id, device, ip, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(orderNo, 'stored', user, store, row, column, 'stored', meta.request_id, meta.device, meta.ip, logNotes);

    return {
      synced: true,
      action: 'inserted',
      order_no: orderNo,
      remark,
      slot,
      store,
      row,
      column,
      blanket_id: Number(result.lastInsertRowid),
    };
  });

  return syncTx();
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

type PgQueryExecutor = (queryText: string, params?: any[]) => Promise<{ rows: any[] }>;

const assertPostgresBlanketSlotWithQuery = async (
  query: PgQueryExecutor,
  storeName: string,
  row: number,
  column: number,
  status: string,
  excludeBlanketId?: number
) => {
  const storeRes = await query(
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
  const countRes = await query(countSql, params);
  const count = Number(countRes.rows?.[0]?.c ?? 0);
  if (count >= capacity) {
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
  await assertPostgresBlanketSlotWithQuery(
    pgPool.query.bind(pgPool) as PgQueryExecutor,
    storeName,
    row,
    column,
    status,
    excludeBlanketId
  );
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
  branch_id: Math.max(1, Number(body?.branch_id ?? 1) || 1),
});

const upsertSQLiteUser = (payload: ReturnType<typeof parseUserPayload>, existingId?: number) => {
  if (existingId) {
    if (payload.password) {
      db.prepare(`
        UPDATE users
        SET username = ?, full_name = ?, email = ?, phone = ?, avatar_url = ?, role = ?, is_active = ?, password = ?, branch_id = ?, updated_at = CURRENT_TIMESTAMP
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
        payload.branch_id,
        existingId
      );
    } else {
      db.prepare(`
        UPDATE users
        SET username = ?, full_name = ?, email = ?, phone = ?, avatar_url = ?, role = ?, is_active = ?, branch_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        payload.username,
        payload.full_name || payload.username,
        payload.email || normalizeManagedEmail(payload),
        payload.phone,
        payload.avatar_url,
        payload.role,
        payload.is_active ? 1 : 0,
        payload.branch_id,
        existingId
      );
    }

    return db.prepare('SELECT * FROM users WHERE id = ?').get(existingId) as SQLiteUserRecord;
  }

  db.prepare(`
    INSERT INTO users (username, full_name, email, phone, avatar_url, role, password, is_active, branch_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).run(
    payload.username,
    payload.full_name || payload.username,
    payload.email || normalizeManagedEmail(payload),
    payload.phone,
    payload.avatar_url,
    payload.role,
    payload.password || '',
    payload.is_active ? 1 : 0,
    payload.branch_id
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
      branch_id: 1,
      branch_name: 'فرع الفلاح',
    } satisfies ApiUser;
  });

  return username ? merged.filter((user) => user.username === username) : merged;
};

async function startServer() {
  // Only run Postgres schema checks if using PostgreSQL
  if (USE_POSTGRES_LOCAL && pgPool) {
    try {
      await ensurePostgresBranchSchema();
      await ensurePostgresLocalIdentityDefaults();
      await ensurePostgresLocalStoreColumns();
    } catch (error: any) {
      console.warn(
        'Postgres schema check failed:',
        error?.message || error
      );
    }
  } else {
    console.log(`ℹ️  Using DB_PROVIDER=${DB_PROVIDER} (skipping PostgreSQL schema checks)`);
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

  const aiOperations = createAiOperationsService({
    sqlite: db,
    pgPool,
    usePostgres: USE_POSTGRES_LOCAL,
    env: process.env,
  });

  try {
    await aiOperations.ensureSchema();
  } catch (error: any) {
    console.warn('AI Operations schema check failed:', error?.message || error);
  }

  const requireAiApiKeyIfConfigured = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const configuredKey = String(process.env.AI_AGENT_API_KEY || process.env.N8N_API_KEY || '').trim();
    if (!configuredKey) return next();
    const supplied =
      String(req.headers['x-api-key'] ?? '').trim() ||
      String(req.headers.authorization ?? '').replace(/^Bearer\s+/i, '').trim();
    if (supplied !== configuredKey) {
      return res.status(401).json({ ok: false, error: 'Invalid AI API key.' });
    }
    return next();
  };

  app.get('/api/webhooks/whatsapp', (req, res) => {
    const challenge = aiOperations.verifyWebhook(req.query);
    if (!challenge) {
      return res.status(403).send('Forbidden');
    }
    return res.status(200).send(challenge);
  });

  app.post(
    '/api/webhooks/whatsapp',
    asyncHandler(async (req: any, res: any) => {
      const results = await aiOperations.processWhatsappWebhook(req.body);
      res.json({ ok: true, processed: results.length, results });
    })
  );

  app.post(
    '/api/whatsapp/send',
    requireAiApiKeyIfConfigured,
    asyncHandler(async (req: any, res: any) => {
      const result = await aiOperations.sendAndLogWhatsAppText(req.body?.to, req.body?.message);
      res.json({ ok: true, provider_response: result });
    })
  );

  app.post(
    '/api/ai/router',
    requireAiApiKeyIfConfigured,
    asyncHandler(async (req: any, res: any) => {
      const routed = await aiOperations.routeIncomingMessage({
        channel: req.body?.channel || 'website',
        from: req.body?.from || req.body?.phone || req.body?.sender_phone,
        to: req.body?.to || req.body?.receiver_phone,
        name: req.body?.name,
        messageText: req.body?.message || req.body?.text || req.body?.message_text,
        messageType: req.body?.message_type || 'text',
        whatsappMessageId: req.body?.whatsapp_message_id,
      });
      res.json({ ok: true, ...routed });
    })
  );

  app.get(
    '/api/ai/conversations',
    requireAdmin,
    asyncHandler(async (req: any, res: any) => {
      const conversations = await aiOperations.listAiConversations(req.query || {});
      res.json({ ok: true, conversations });
    })
  );

  app.get(
    '/api/ai/conversations/:id/messages',
    requireAdmin,
    asyncHandler(async (req: any, res: any) => {
      const messages = await aiOperations.listAiConversationMessages(req.params.id);
      res.json({ ok: true, messages });
    })
  );

  app.patch(
    '/api/ai/conversations/:id',
    requireAdmin,
    asyncHandler(async (req: any, res: any) => {
      const conversation = await aiOperations.updateAiConversation(req.params.id, req.body || {});
      if (!conversation) return res.status(404).json({ ok: false, error: 'Conversation not found.' });
      res.json({ ok: true, conversation });
    })
  );

  app.get(
    '/api/pickups',
    requireAiApiKeyIfConfigured,
    asyncHandler(async (_req: any, res: any) => {
      res.json(await aiOperations.listPickupRequests());
    })
  );

  app.post(
    '/api/pickups',
    requireAiApiKeyIfConfigured,
    asyncHandler(async (req: any, res: any) => {
      const pickup = await aiOperations.createPickupRequest(req.body);
      res.status(201).json(pickup);
    })
  );

  app.patch(
    '/api/pickups/:id',
    requireAiApiKeyIfConfigured,
    asyncHandler(async (req: any, res: any) => {
      const pickup = await aiOperations.updatePickupRequest(req.params.id, req.body);
      if (!pickup) return res.status(404).json({ error: 'Pickup request not found.' });
      res.json(pickup);
    })
  );

  app.get(
    '/api/complaints',
    requireAiApiKeyIfConfigured,
    asyncHandler(async (_req: any, res: any) => {
      res.json(await aiOperations.listComplaints());
    })
  );

  app.post(
    '/api/complaints',
    requireAiApiKeyIfConfigured,
    asyncHandler(async (req: any, res: any) => {
      const complaint = await aiOperations.createComplaint(req.body);
      res.status(201).json(complaint);
    })
  );

  app.patch(
    '/api/complaints/:id',
    requireAiApiKeyIfConfigured,
    asyncHandler(async (req: any, res: any) => {
      const complaint = await aiOperations.updateComplaint(req.params.id, req.body);
      if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });
      res.json(complaint);
    })
  );

  app.get(
    '/api/orders/track/:orderId',
    requireAiApiKeyIfConfigured,
    asyncHandler(async (req: any, res: any) => {
      const trackedOrder = await aiOperations.trackOrder(req.params.orderId);
      if (!trackedOrder) return res.status(404).json({ error: 'Order not found.' });
      res.json(trackedOrder);
    })
  );

  app.get('/api/chat-automation/telegram/status', (_req, res) => {
    res.json({
      ok: true,
      channel: 'telegram',
      bot_configured: Boolean(TELEGRAM_BOT_TOKEN),
      webhook_secret_configured: Boolean(TELEGRAM_WEBHOOK_SECRET),
      mode: 'mvp_search_with_pos_linking',
      supported_commands: [
        'help',
        'login USERNAME PASSWORD',
        'whoami',
        'logout',
        'review',
        'Z63588',
        '0504635888',
        'search Z63588',
        'location Z63588',
      ],
    });
  });

  app.post(
    '/api/chat-automation/telegram/webhook',
    asyncHandler(async (req: any, res: any) => {
      if (TELEGRAM_WEBHOOK_SECRET) {
        const suppliedSecret = String(req.headers['x-telegram-bot-api-secret-token'] ?? '').trim();
        if (suppliedSecret !== TELEGRAM_WEBHOOK_SECRET) {
          return res.status(401).json({ ok: false, error: 'Invalid Telegram webhook secret.' });
        }
      }

      const callbackQuery = req.body?.callback_query;
      if (callbackQuery) {
        const chatId = String(callbackQuery?.message?.chat?.id ?? '').trim();
        const data = String(callbackQuery?.data ?? '').trim();
        if (!chatId || !data) return res.json({ ok: true, ignored: true });

        const from = callbackQuery?.from ?? {};
        const displayName = [from.first_name, from.last_name]
          .map((part) => String(part ?? '').trim())
          .filter(Boolean)
          .join(' ') || String(from.username ?? '').trim();
        await answerTelegramCallbackQuery(String(callbackQuery?.id ?? '').trim(), 'Opening...');
        const reply = await handleChatAutomationCallback({
          channel: 'telegram',
          chat_user_id: chatId,
          message_id: String(callbackQuery?.message?.message_id ?? '').trim(),
          display_name: displayName,
          data,
        });
        await sendTelegramMessage(chatId, reply);
        return res.json({ ok: true });
      }

      const message = req.body?.message ?? req.body?.edited_message;
      const chatId = String(message?.chat?.id ?? '').trim();
      const text = String(message?.text ?? '').trim();
      if (!chatId || !text) return res.json({ ok: true, ignored: true });

      const from = message?.from ?? {};
      const displayName = [from.first_name, from.last_name]
        .map((part) => String(part ?? '').trim())
        .filter(Boolean)
        .join(' ') || String(from.username ?? '').trim();
      const reply = await handleChatAutomationMessage({
        channel: 'telegram',
        chat_user_id: chatId,
        message_id: String(message?.message_id ?? '').trim(),
        display_name: displayName,
        text,
      });
      await sendTelegramMessage(chatId, reply);
      res.json({ ok: true });
    })
  );

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
    const pickScanValue =
      req.body?.pick_scan_value ?? req.body?.pickScanValue ?? req.body?.scanned_code ?? req.body?.scannedCode ?? '';

    const { data: blanket, error: fetchBlanketError } = await supabaseAdmin
      .from('blankets')
      .select('id, blanket_number, store, row, column, status')
      .eq('id', id)
      .single();
    if (fetchBlanketError) return res.status(500).json({ error: fetchBlanketError.message, code: (fetchBlanketError as any).code });
    if (!blanket) return res.status(404).json({ error: 'Blanket not found' });

    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('store_name, rows, columns, auto_settle, store_type, slot_capacity, require_pick_scan')
      .eq('store_name', blanket.store)
      .single();
    if (storeError) return res.status(500).json({ error: storeError.message, code: (storeError as any).code });
    if (!store) return res.status(400).json({ error: `Store not found: ${blanket.store}` });

    const scanCheck = validatePickScanForStore({
      requirePickScan: (store as any).require_pick_scan,
      storeType: (store as any).store_type,
      scannedValue: pickScanValue,
      expectedOrderNo: blanket.blanket_number,
    });
    if (!scanCheck.ok) {
      return res.status(409).json({ error: scanCheck.error });
    }

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

  app.post('/api/login', async (req, res) => {
    const username = String(req.body?.username ?? '').trim();
    const password = String(req.body?.password ?? '');
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
      const profile = await authenticatePosStaff(username, password);
      const user = ensurePosStaffUser(profile);
      if (user.is_active === 0) {
        return res.status(403).json({ error: 'This user is inactive.' });
      }

      const timestamp = new Date().toISOString();
      touchSQLiteLastLogin(user.id, timestamp);
      const session = issueSession(
        { id: user.id, username: user.username, role: user.role },
        {
          auth_provider: 'pos',
          pos_user_id: profile.pos_user_id,
          pos_branch_id: profile.branch_id,
          pos_currency_id: profile.currency_id,
        }
      );
      const posSession: PosStaffSessionRecord = {
        token: session.token,
        username: profile.pos_username,
        display_name: profile.display_name,
        user_type_name: profile.user_type_name,
        pos_user_id: profile.pos_user_id,
        branch_id: profile.branch_id,
        branch_code: profile.branch_code,
        currency_id: profile.currency_id,
        client_identifier: profile.client_identifier,
        cookie_header: profile.cookie_header,
        expires_at: session.expires_at,
      };
      posStaffSessionStore.set(session.token, posSession);

      return res.json({
        user: withPosSessionUser({ ...user, last_login_at: timestamp }, session, posSession),
        token: session.token,
        expires_at: session.expires_at,
      });
    } catch (posError) {
      const user = db
        .prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1')
        .get(username) as SQLiteUserRecord | undefined;

      if (!user || user.password !== password || user.password.startsWith('pos-auth-only:')) {
        const posErrorMessage = posError instanceof Error ? posError.message : String(posError);
        console.warn('POS employee login failed:', posErrorMessage);
        if (posErrorMessage === 'Invalid POS username or password.') {
          return res.status(401).json({ error: posErrorMessage });
        }
        return res.status(502).json({
          error: 'POS login service is unavailable. Please try again shortly.',
        });
      }

      if (user.is_active === 0) {
        return res.status(403).json({ error: 'This user is inactive.' });
      }

      const timestamp = new Date().toISOString();
      touchSQLiteLastLogin(user.id, timestamp);
      const normalizedUser = normalizeSQLiteUser({ ...user, last_login_at: timestamp });
      const session = issueSession({ id: user.id, username: user.username, role: user.role });
      return res.json({ user: normalizedUser, token: session.token, expires_at: session.expires_at });
    }
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
    if (auth.auth_provider === 'pos') {
      const posSession = posStaffSessionStore.get(auth.token);
      if (!posSession || posSession.expires_at <= Date.now()) {
        posStaffSessionStore.delete(auth.token);
        sessionStore.delete(auth.token);
        db.prepare('DELETE FROM app_sessions WHERE token = ?').run(auth.token);
        return res.status(401).json({ error: 'POS employee session expired. Sign in again.' });
      }
      return res.json(withPosSessionUser(user, auth, posSession));
    }
    res.json(normalizeSQLiteUser(user));
  });

  app.post('/api/logout', requireAuth, (req: any, res) => {
    const auth = req.auth as SessionRecord | undefined;
    if (auth) {
      posStaffSessionStore.delete(auth.token);
      sessionStore.delete(auth.token);
      db.prepare('DELETE FROM app_sessions WHERE token = ?').run(auth.token);
    }
    res.json({ success: true });
  });

  app.get('/api/branches', requireAuth, async (_req, res) => {
    try {
      const branches = readSqliteBranches();
      res.json(branches);
    } catch (error: any) {
      console.error('Failed to load branches:', error);
      res.status(500).json({ error: error?.message || 'Failed to load branches.' });
    }
  });

  app.post('/api/branches', requireOperationsManager, async (req, res) => {
    try {
      const payload = parseBranchPayload(req.body);
      const result = db
        .prepare(
          `INSERT INTO branches (name, city, trade_license, phone, address, status, notes, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
        )
        .run(payload.name, payload.city, payload.trade_license, payload.phone, payload.address, payload.status, payload.notes);
      const branch = db.prepare('SELECT * FROM branches WHERE id = ?').get(Number(result.lastInsertRowid)) as any;

      if (USE_POSTGRES_LOCAL && pgPool) {
        const pgUpdate = await pgPool.query(
          `UPDATE branches
           SET name = $2, city = $3, trade_license = $4, phone = $5, address = $6, status = $7, notes = $8, updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [Number(branch.id), branch.name, branch.city, branch.trade_license, branch.phone, branch.address, branch.status, branch.notes]
        );
        if ((pgUpdate.rowCount ?? 0) === 0) {
          await pgPool.query(
            `INSERT INTO branches (id, name, city, trade_license, phone, address, status, notes, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [Number(branch.id), branch.name, branch.city, branch.trade_license, branch.phone, branch.address, branch.status, branch.notes]
          );
        }
      }

      res.status(201).json(normalizeBranchRow(branch));
    } catch (error: any) {
      console.error('Failed to create branch:', error);
      res.status(500).json({ error: error?.message || 'Failed to create branch.' });
    }
  });

  app.put('/api/branches/:id', requireOperationsManager, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ error: 'Invalid branch id.' });
      const payload = parseBranchPayload(req.body);
      const result = db
        .prepare(
          `UPDATE branches
           SET name = ?, city = ?, trade_license = ?, phone = ?, address = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`
        )
        .run(payload.name, payload.city, payload.trade_license, payload.phone, payload.address, payload.status, payload.notes, id);
      if (result.changes <= 0) return res.status(404).json({ error: 'Branch not found.' });
      const branch = db.prepare('SELECT * FROM branches WHERE id = ?').get(id) as any;

      if (USE_POSTGRES_LOCAL && pgPool) {
        const pgUpdate = await pgPool.query(
          `UPDATE branches
           SET name = $2, city = $3, trade_license = $4, phone = $5, address = $6, status = $7, notes = $8, updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [id, branch.name, branch.city, branch.trade_license, branch.phone, branch.address, branch.status, branch.notes]
        );
        if ((pgUpdate.rowCount ?? 0) === 0) {
          await pgPool.query(
            `INSERT INTO branches (id, name, city, trade_license, phone, address, status, notes, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [id, branch.name, branch.city, branch.trade_license, branch.phone, branch.address, branch.status, branch.notes]
          );
        }
      }

      res.json(normalizeBranchRow(branch));
    } catch (error: any) {
      console.error('Failed to update branch:', error);
      res.status(500).json({ error: error?.message || 'Failed to update branch.' });
    }
  });

  app.get('/api/branches/dashboard', requireAuth, async (req: any, res) => {
    try {
      const auth = req.auth as SessionRecord | undefined;
      const currentUser = auth?.user_id
        ? (db.prepare('SELECT * FROM users WHERE id = ?').get(auth.user_id) as SQLiteUserRecord | undefined)
        : undefined;
      const branchFilter = Math.max(0, Number(req.query.branch_id ?? currentUser?.branch_id ?? 0) || 0);
      const allBranches = readSqliteBranches();
      const visibleBranches = branchFilter > 0 ? allBranches.filter((branch) => branch.id === branchFilter) : allBranches;

      let storesRows: any[] = [];
      let blanketsRows: any[] = [];
      let logsRows: any[] = [];
      if (USE_POSTGRES_LOCAL && pgPool) {
        const [storesResult, blanketsResult, logsResult] = await Promise.all([
          pgPool.query('SELECT * FROM stores'),
          pgPool.query('SELECT * FROM blankets'),
          pgPool.query('SELECT * FROM logs ORDER BY "timestamp" DESC, id DESC LIMIT 5000'),
        ]);
        storesRows = storesResult.rows ?? [];
        blanketsRows = blanketsResult.rows ?? [];
        logsRows = logsResult.rows ?? [];
      } else {
        storesRows = db.prepare('SELECT * FROM stores').all() as any[];
        blanketsRows = db.prepare('SELECT * FROM blankets').all() as any[];
        logsRows = db.prepare('SELECT * FROM logs ORDER BY timestamp DESC, id DESC LIMIT 5000').all() as any[];
      }
      const usersRows = db.prepare('SELECT * FROM users').all() as SQLiteUserRecord[];

      const summaries = visibleBranches.map((branch) => {
        const branchStores = storesRows.filter((store) => Number(store.branch_id ?? 1) === branch.id);
        const storeNames = new Set(branchStores.map((store) => String(store.store_name)));
        const branchBlankets = blanketsRows.filter((blanket) => storeNames.has(String(blanket.store)));
        const branchLogs = logsRows.filter((log) => !log.store || storeNames.has(String(log.store)));
        const branchUsers = usersRows.filter((user) => Number(user.branch_id ?? 1) === branch.id);
        const activeUsers = branchUsers.filter((user) => user.is_active !== 0);
        const stored = branchBlankets.filter((blanket) => String(blanket.status) === 'stored').length;
        const picked = branchBlankets.filter((blanket) => String(blanket.status) === 'picked').length;
        const retrieved = branchBlankets.filter((blanket) => String(blanket.status) === 'retrieved').length;
        const capacity = branchStores.reduce((sum, store) => {
          const rows = Math.max(1, Number(store.rows ?? 1) || 1);
          const columns = Math.max(1, Number(store.columns ?? 1) || 1);
          const slotCapacity = String(store.store_type ?? 'grid') === 'hanger' ? 1 : Math.max(1, Number(store.slot_capacity ?? 1) || 1);
          return sum + rows * columns * slotCapacity;
        }, 0);
        const activityByUser = new Map<string, number>();
        for (const log of branchLogs) {
          const username = String(log.user ?? 'system') || 'system';
          activityByUser.set(username, (activityByUser.get(username) ?? 0) + 1);
        }
        const topUsers = Array.from(activityByUser.entries())
          .map(([username, count]) => ({ username, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        return {
          branch,
          metrics: {
            stores: branchStores.length,
            users: branchUsers.length,
            active_users: activeUsers.length,
            stored_orders: stored,
            picked_orders: picked,
            retrieved_orders: retrieved,
            total_orders: branchBlankets.length,
            capacity,
            utilization: capacity > 0 ? Math.round((stored / capacity) * 100) : 0,
            activity_events: branchLogs.length,
          },
          top_users: topUsers,
          recent_activity: branchLogs.slice(0, 12),
        };
      });

      res.json({
        branches: summaries,
        totals: summaries.reduce(
          (acc, item) => ({
            stores: acc.stores + item.metrics.stores,
            users: acc.users + item.metrics.users,
            active_users: acc.active_users + item.metrics.active_users,
            stored_orders: acc.stored_orders + item.metrics.stored_orders,
            picked_orders: acc.picked_orders + item.metrics.picked_orders,
            total_orders: acc.total_orders + item.metrics.total_orders,
            capacity: acc.capacity + item.metrics.capacity,
            activity_events: acc.activity_events + item.metrics.activity_events,
          }),
          { stores: 0, users: 0, active_users: 0, stored_orders: 0, picked_orders: 0, total_orders: 0, capacity: 0, activity_events: 0 }
        ),
      });
    } catch (error: any) {
      console.error('Failed to load branch dashboard:', error);
      res.status(500).json({ error: error?.message || 'Failed to load branch dashboard.' });
    }
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
    const normalizedBranchId = Math.max(1, Number(req.body?.branch_id ?? 1) || 1);

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
              auto_settle, store_type, hanger_slots, slot_capacity, require_pick_scan, store_color, store_color_visible, store_opacity, cell_width, cell_depth, cell_height, branch_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
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
              normalizedBranchId,
            ]
          );
        } catch (error: any) {
          if (!isMissingStoreColorVisibleColumnError(error)) throw error;
          await pgPool.query(
            `
            INSERT INTO stores (
              store_name, position_x, position_z, width, depth, height, rows, columns,
              auto_settle, store_type, hanger_slots, slot_capacity, require_pick_scan, store_color, store_opacity, cell_width, cell_depth, cell_height, branch_id
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
              normalizedStoreOpacity,
              normalizedCellWidth,
              normalizedCellDepth,
              normalizedCellHeight,
              normalizedBranchId,
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
        auto_settle, store_type, hanger_slots, slot_capacity, require_pick_scan, store_color, store_color_visible, store_opacity, cell_width, cell_depth, cell_height, branch_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      normalizedCellHeight,
      normalizedBranchId
    );

    res.json({ success: true });
  });

  app.put('/api/stores/:name', requireOperationsManager, async (req, res) => {
    const { name } = req.params;
    const { position_x, position_y, position_z, width, depth, height, rows, columns, rotation_y, auto_settle, store_type, hanger_slots, slot_capacity, require_pick_scan, store_color, store_color_visible, store_opacity, cell_width, cell_depth, cell_height } = req.body;
    const normalizedBranchId = Math.max(1, Number(req.body?.branch_id ?? 1) || 1);

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
            SET position_x = $1, position_y = $2, position_z = $3, width = $4, depth = $5, height = $6, rows = $7, columns = $8, rotation_y = $9, auto_settle = $10, store_type = $11, hanger_slots = $12, slot_capacity = $13, require_pick_scan = $14, store_color = $15, store_color_visible = $16, store_opacity = $17, cell_width = $18, cell_depth = $19, cell_height = $20, branch_id = $21
            WHERE store_name = $22
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
              normalizedBranchId,
              name,
            ]
          );
        } catch (error: any) {
          if (!isMissingStoreColorVisibleColumnError(error)) throw error;
          await pgPool.query(
            `
            UPDATE stores
            SET position_x = $1, position_y = $2, position_z = $3, width = $4, depth = $5, height = $6, rows = $7, columns = $8, rotation_y = $9, auto_settle = $10, store_type = $11, hanger_slots = $12, slot_capacity = $13, require_pick_scan = $14, store_color = $15, store_opacity = $16, cell_width = $17, cell_depth = $18, cell_height = $19, branch_id = $20
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
              normalizedStoreOpacity,
              normalizedCellWidth,
              normalizedCellDepth,
              normalizedCellHeight,
              normalizedBranchId,
              name,
            ]
          );
        }
        const updatedStore = await pgPool.query('SELECT * FROM stores WHERE store_name = $1 LIMIT 1', [name]);
        if (!updatedStore.rows?.[0]) {
          return res.status(404).json({ error: `Store not found: ${name}` });
        }
        return res.json({ success: true, store: updatedStore.rows[0] });
      } catch (error: any) {
        return res.status(500).json({ error: error?.message || 'Failed to update store' });
      }
    }

    try {
      const result = db.prepare(`
        UPDATE stores
        SET position_x = ?, position_y = ?, position_z = ?, width = ?, depth = ?, height = ?, rows = ?, columns = ?, rotation_y = ?, auto_settle = ?, store_type = ?, hanger_slots = ?, slot_capacity = ?, require_pick_scan = ?, store_color = ?, store_color_visible = ?, store_opacity = ?, cell_width = ?, cell_depth = ?, cell_height = ?, branch_id = ?
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
        normalizedBranchId,
        name
      );
      if (result.changes <= 0) {
        return res.status(404).json({ error: `Store not found: ${name}` });
      }
      const updatedStore = db.prepare('SELECT * FROM stores WHERE store_name = ?').get(name);
      return res.json({ success: true, store: updatedStore });
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

  app.get('/api/cashier/order-status/:orderNo', requirePicker, async (req, res) => {
    try {
      const orderNo = normalizeSortingOrderNo(req.params.orderNo);
      if (!orderNo) return res.status(400).json({ error: 'Order number is required.' });

      let blanketRows: any[] = [];
      let logRows: any[] = [];
      if (USE_POSTGRES_LOCAL && pgPool) {
        const [blanketsResult, logsResult] = await Promise.all([
          pgPool.query('SELECT * FROM blankets WHERE upper(blanket_number) = upper($1) ORDER BY created_at DESC, id DESC', [orderNo]),
          pgPool.query('SELECT * FROM logs WHERE upper(blanket_number) = upper($1) ORDER BY "timestamp" DESC, id DESC LIMIT 100', [orderNo]),
        ]);
        blanketRows = Array.isArray(blanketsResult.rows) ? blanketsResult.rows : [];
        logRows = Array.isArray(logsResult.rows) ? logsResult.rows : [];
      } else {
        blanketRows = db
          .prepare('SELECT * FROM blankets WHERE upper(COALESCE(blanket_number, \'\')) = upper(?) ORDER BY datetime(created_at) DESC, id DESC')
          .all(orderNo) as any[];
        logRows = db
          .prepare('SELECT * FROM logs WHERE upper(COALESCE(blanket_number, \'\')) = upper(?) ORDER BY datetime(timestamp) DESC, id DESC LIMIT 100')
          .all(orderNo) as any[];
      }

      let packingEntries: BlanketPackingLogRecord[] = [];
      try {
        packingEntries = searchBlanketPackingLogs({ order_no: orderNo, limit: 100 }).rows;
      } catch (packingError) {
        console.warn('Cashier order status packing lookup failed:', packingError);
      }

      const storedCount = blanketRows.filter((item) => String(item.status ?? '').toLowerCase() === 'stored').length;
      const pickedCount = blanketRows.filter((item) => String(item.status ?? '').toLowerCase() === 'picked').length;
      const retrievedCount = blanketRows.filter((item) => String(item.status ?? '').toLowerCase() === 'retrieved').length;
      const pickedLogs = logRows.filter((item) => String(item.action ?? '').toLowerCase() === 'picked');
      const packedLogs = logRows.filter(
        (item) =>
          String(item.action ?? '').toLowerCase() === 'packed' &&
          String(item.store ?? '').toLowerCase() === 'blanket_packing'
      );
      const packedEntries = packingEntries.filter((item) => String(item.action ?? '').toLowerCase() === 'packed');
      const packedFromEntries = packedEntries.reduce(
        (max, item) => Math.max(max, Number(item.blanket_index) || 0),
        0
      );
      const packed = Math.max(packedFromEntries, packedEntries.length, packedLogs.length);
      const totalBlankets = packingEntries.reduce(
        (max, item) => Math.max(max, Number(item.total_blankets) || 0),
        0
      );
      const packingStatus =
        totalBlankets > 0 && packed >= totalBlankets
          ? 'fully_packed'
          : packed > 0
            ? 'partially_packed'
            : 'not_packed';
      const lastPacking = packingEntries[0] ?? null;
      const lastPicked = pickedLogs[0] ?? blanketRows.find((item) => String(item.status ?? '').toLowerCase() === 'picked') ?? null;

      return res.json({
        order_no: orderNo,
        found: blanketRows.length > 0 || logRows.length > 0 || packingEntries.length > 0,
        storage: {
          total: blanketRows.length,
          stored_count: storedCount,
          picked_count: Math.max(pickedCount, pickedLogs.length),
          retrieved_count: retrievedCount,
          rows: blanketRows,
          last_picked_at: lastPicked?.timestamp ?? lastPicked?.created_at ?? null,
        },
        packing: {
          packed,
          total_blankets: totalBlankets,
          remaining: totalBlankets > 0 ? Math.max(0, totalBlankets - packed) : null,
          status: packingStatus,
          last_at: lastPacking?.created_at ?? packedLogs[0]?.timestamp ?? null,
          last_by: lastPacking?.packed_by ?? packedLogs[0]?.user ?? null,
          entries: packingEntries.slice(0, 10),
        },
        logs: logRows.slice(0, 20),
      });
    } catch (error: any) {
      console.error('Failed to read cashier order status:', error);
      res.status(500).json({ error: error?.message || 'Failed to read order status.' });
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
        const skipped: Array<{ op: 'update' | 'insert'; reason: string; id?: number; store?: string; row?: number; column?: number; number?: string }> = [];
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
              try {
                await assertPostgresBlanketSlotWithQuery(
                  client.query.bind(client) as PgQueryExecutor,
                  nextStore,
                  nextRow,
                  nextColumn,
                  nextStatus,
                  id
                );
              } catch (error: any) {
                skipped.push({
                  op: 'update',
                  id,
                  store: nextStore,
                  row: nextRow,
                  column: nextColumn,
                  number: nextBlanketNumber,
                  reason: error?.message || 'Invalid slot',
                });
                continue;
              }
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
              try {
                await assertPostgresBlanketSlotWithQuery(
                  client.query.bind(client) as PgQueryExecutor,
                  store,
                  row,
                  column,
                  status
                );
              } catch (error: any) {
                skipped.push({
                  op: 'insert',
                  store,
                  row,
                  column,
                  number: blanketNumber,
                  reason: error?.message || 'Invalid slot',
                });
                continue;
              }
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
            skipped,
          });
        } catch (error: any) {
          await client.query('ROLLBACK');
          console.error('Postgres bulk apply failed:', error);
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
    const pickScanValue =
      req.body?.pick_scan_value ?? req.body?.pickScanValue ?? req.body?.scanned_code ?? req.body?.scannedCode ?? '';

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
          'SELECT rows, auto_settle, store_type, slot_capacity, require_pick_scan FROM stores WHERE store_name = $1 LIMIT 1',
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
          require_pick_scan: s.require_pick_scan,
        };

        const scanCheck = validatePickScanForStore({
          requirePickScan: store.require_pick_scan,
          storeType: store.store_type,
          scannedValue: pickScanValue,
          expectedOrderNo: blanket.blanket_number,
        });
        if (!scanCheck.ok) {
          await client.query('ROLLBACK');
          return res.status(409).json({ error: scanCheck.error });
        }

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

    const store = db.prepare('SELECT rows, auto_settle, store_type, slot_capacity, require_pick_scan FROM stores WHERE store_name = ?').get(blanket.store) as
      | { rows: number; auto_settle: number; store_type: string; slot_capacity: number; require_pick_scan: number }
      | undefined;
    if (!store) return res.status(400).json({ error: `Store not found: ${blanket.store}` });

    const scanCheck = validatePickScanForStore({
      requirePickScan: store.require_pick_scan,
      storeType: store.store_type,
      scannedValue: pickScanValue,
      expectedOrderNo: blanket.blanket_number,
    });
    if (!scanCheck.ok) {
      return res.status(409).json({ error: scanCheck.error });
    }

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

  app.get('/api/pos/session-status', requireAuth, (_req, res) => {
    const currentCookie = String(posCookieJar || POS_COOKIE || '').trim();
    res.json({
      auto_login_enabled: POS_AUTO_REFRESH_ENABLED,
      auto_login_configured: canAutoRefreshPosSession(),
      session_available: hasMinimalPosCookie(currentCookie),
      session_auto_refreshed: posCookieJarAutoRefreshed,
      login_endpoint_configured: /^https?:\/\//i.test(POS_LOGIN_ENDPOINT),
      base_url_configured: /^https?:\/\//i.test(POS_BASE_URL),
      last_refresh_error: posLastRefreshReason || null,
    });
  });

  app.get('/api/pos/expenses/accounts', requireAuth, async (req, res) => {
    try {
      const query = String(req.query.q ?? req.query.search ?? '').trim();
      if (query.length < 1) return res.status(400).json({ error: 'Search query is required.' });

      const clientIdentifier = String(req.query.client_identifier ?? POS_LOGIN_CLIENT_IDENTIFIER ?? 'inout').trim() || 'inout';
      const endpoint = resolvePosPurchaseApiEndpoint(
        `/purchase_api/accountHeadList/${encodeURIComponent(clientIdentifier)}/${encodeURIComponent(query)}`
      );
      const response = await postPosForm(endpoint, new URLSearchParams(), {
        fallbackToGet: false,
        referer: POS_EXPENSES_REFERER,
      });
      const parsed = parsePosJsonObject(String(response.text ?? ''), 'accountHeadList');
      const data = Array.isArray(parsed?.data) ? parsed.data : [];
      res.json({
        ok: true,
        query,
        accounts: data.map((item: any) => ({
          id: String(item?.id ?? '').trim(),
          text: String(item?.text ?? item?.acc_name1 ?? '').trim(),
          raw: item,
        })),
        raw: parsed,
      });
    } catch (error: any) {
      console.error('POS expense account search failed:', error);
      res.status(502).json({ error: error?.message || 'Failed to search POS expense accounts.' });
    }
  });

  app.get('/api/pos/expenses/pay-accounts', requireAuth, async (req, res) => {
    try {
      const clientIdentifier = String(req.query.client_identifier ?? POS_LOGIN_CLIENT_IDENTIFIER ?? 'inout').trim() || 'inout';
      const branchId = String(req.query.branch_id ?? '1').trim() || '1';
      const apiUserId = String(req.query.api_user_id ?? AIPSOFT_API_USER_ID ?? '').trim();
      const parsed = await postPosPurchaseApi('/purchase_api/payAccountList', {
        client_identifier: clientIdentifier,
        branch_id: branchId,
        api_user_id: apiUserId,
      });
      const data = Array.isArray(parsed?.data) ? parsed.data : [];
      res.json({
        ok: true,
        pay_accounts: data.map((item: any) => ({
          id: String(item?.id ?? '').trim(),
          name: String(item?.acc_name1 ?? item?.text ?? '').trim(),
          raw: item,
        })),
        raw: parsed,
      });
    } catch (error: any) {
      console.error('POS pay account list failed:', error);
      res.status(502).json({ error: error?.message || 'Failed to load POS pay accounts.' });
    }
  });

  app.post('/api/pos/expenses/test-create', requireOperationsManager, async (req: any, res) => {
    try {
      const result = await createPosExpenseInvoice(req.body);
      res.json(result);
    } catch (error: any) {
      console.error('POS expense creation failed:', error);
      res.status(502).json({ error: error?.message || 'Failed to create POS expense.' });
    }
  });

  app.get('/api/pos/find-laundry-orders', requireAuth, async (req, res) => {
    try {
      const query = String(req.query.q ?? req.query.search ?? '').trim();
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

  app.post('/api/pos/report/counter-cash', requireAuth, async (req, res) => {
    try {
      const payload = buildCounterCashReportPayload(req.body);
      const { text } = await postPosForm(POS_COUNTER_CASH_REPORT_PATH, payload, { fallbackToGet: false });
      const html = String(text ?? '').trim();

      if (!html) {
        return res.status(502).json({ error: 'POS returned an empty report response.' });
      }

      if (isLikelyPosLoginHtml(html)) {
        return res.status(502).json({ error: 'POS returned the login page. Check POS auto-login settings and Counter Cash report permission.' });
      }

      const summary = parseCounterCashReportHtml(html);
      res.json({
        ok: true,
        endpoint: resolvePosEndpointFromPath(POS_COUNTER_CASH_REPORT_PATH),
        request: Object.fromEntries(payload.entries()),
        summary,
        html,
      });
    } catch (error: any) {
      console.error('POS counter cash report failed:', error);
      res.status(502).json({ error: error?.message || 'Failed to fetch POS counter cash report.' });
    }
  });

  app.get('/api/reports/performance', requireAuth, async (req: any, res) => {
    try {
      const report = await buildPerformanceReport(req.query, req);
      res.json(report);
    } catch (error: any) {
      console.error('Performance report failed:', error);
      res.status(502).json({ error: error?.message || 'Failed to build performance report.' });
    }
  });

  app.post('/api/reports/performance', requireAuth, async (req: any, res) => {
    try {
      const report = await buildPerformanceReport(req.body, req);
      res.json(report);
    } catch (error: any) {
      console.error('Performance report failed:', error);
      res.status(502).json({ error: error?.message || 'Failed to build performance report.' });
    }
  });

  app.get('/api/reports/snapshot/:reportId', async (req: any, res) => {
    try {
      const snapshot = readReportSnapshot(req.params.reportId, req.query.token);
      if (!snapshot) return res.status(404).json({ error: 'Report snapshot not found or expired.' });
      res.json(snapshot);
    } catch (error: any) {
      console.error('Report snapshot read failed:', error);
      res.status(500).json({ error: error?.message || 'Failed to read report snapshot.' });
    }
  });

  app.get('/api/reports/daily-operations', requireReportAccess, async (req: any, res) => {
    try {
      const report = await buildDailyOperationsReport(req.query, req);
      res.json(report);
    } catch (error: any) {
      console.error('Daily operations report failed:', error);
      res.status(502).json({ error: error?.message || 'Failed to build daily operations report.' });
    }
  });

  app.post('/api/reports/daily-operations', requireReportAccess, async (req: any, res) => {
    try {
      const report = await buildDailyOperationsReport(req.body, req);
      res.json(report);
    } catch (error: any) {
      console.error('Daily operations report failed:', error);
      res.status(502).json({ error: error?.message || 'Failed to build daily operations report.' });
    }
  });

  app.post('/api/pos/sync-conveyer-storage', requireOperationsManager, async (req: any, res) => {
    try {
      const orderNo = String(req.body?.order_no ?? req.body?.orderNo ?? '').trim();
      const remark = String(req.body?.remark ?? '').trim();
      const result = await syncPosOrderToConveyerStorage({
        order_no: orderNo,
        remark,
        user: req.auth?.username || 'system',
        meta: getLogMeta(req),
      });
      res.json(result);
    } catch (error: any) {
      console.error('POS conveyer storage sync failed:', error);
      res.status(500).json({ error: error?.message || 'Failed to sync POS remark to conveyer storage.' });
    }
  });

  const pickupCategoryLabels: Record<string, string> = {
    hanging_clothes: 'Hanging Clothes',
    folded_clothes: 'Folded Clothes',
    home_phase2: 'Home Items (Phase 2)',
    blanket_phase3: 'Blankets (Phase 3)',
  };
  const pickupCategoryOrder = Object.keys(pickupCategoryLabels);
  const normalizePickupBarcode = (value: unknown) =>
    String(value ?? '')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
  const parseAipLinkOrderUrl = (rawValue: unknown, expectedClient: string) => {
    const raw = String(rawValue ?? '').trim();
    if (!raw || raw.length > 500) return null;

    try {
      const url = new URL(raw);
      const hostname = url.hostname.toLowerCase();
      if (
        url.protocol !== 'https:' ||
        (hostname !== 'view.aiplink.net' && hostname !== 'aiplink.net' && hostname !== 'www.aiplink.net')
      ) {
        return null;
      }
      const match = url.pathname.match(/^\/order\/([a-z0-9_-]+)\/([a-z0-9]+)\/?$/i);
      if (!match) return null;
      return {
        url: new URL(`https://view.aiplink.net/order/${match[1]}/${match[2]}`),
        client_identifier: match[1].toLowerCase(),
        share_id: match[2],
      };
    } catch {
      // Some barcode decoders return the URL without punctuation.
    }

    const compact = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
    const prefixes = [
      'httpsviewaiplinknetorder',
      'httpviewaiplinknetorder',
      'httpsaiplinknetorder',
      'httpaiplinknetorder',
      'viewaiplinknetorder',
      'aiplinknetorder',
    ];
    const prefix = prefixes.find((candidate) => compact.startsWith(candidate));
    if (!prefix || !expectedClient) return null;
    const orderPath = compact.slice(prefix.length);
    const client = expectedClient.toLowerCase();
    if (!orderPath.startsWith(client)) return null;
    const shareId = orderPath.slice(client.length);
    if (!/^[a-z0-9]{16,}$/i.test(shareId)) return null;
    return {
      url: new URL(`https://view.aiplink.net/order/${client}/${shareId}`),
      client_identifier: client,
      share_id: shareId,
    };
  };
  const resolveAipLinkOrderNo = async (rawValue: unknown, expectedClient: string) => {
    const parsed = parseAipLinkOrderUrl(rawValue, expectedClient);
    if (!parsed) throw new Error('Unsupported barcode link. Scan a valid view.aiplink.net order barcode.');
    if (expectedClient && parsed.client_identifier !== expectedClient.toLowerCase()) {
      throw new Error('This barcode belongs to a different POS client.');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), POS_REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(parsed.url, {
        method: 'GET',
        headers: {
          Accept: 'text/html,application/xhtml+xml',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          'User-Agent': 'Smart-Storage-Hub/1.0',
        },
        redirect: 'follow',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`AIPLink returned HTTP ${response.status}.`);

      const finalUrl = new URL(response.url || parsed.url.toString());
      if (finalUrl.protocol !== 'https:' || finalUrl.hostname.toLowerCase() !== 'view.aiplink.net') {
        throw new Error('AIPLink redirected to an unsupported host.');
      }

      const html = await response.text();
      if (html.length > 2_000_000) throw new Error('AIPLink response is too large.');
      const orderNo =
        html.match(
          /class=["'][^"']*\bnumber_to_arabic\b[^"']*["'][^>]*>\s*#?\s*([A-Za-z]{0,3}\d{3,})/i
        )?.[1] ??
        html.match(
          /class=["'][^"']*\bpreheader\b[^"']*["'][^>]*>[\s\S]{0,600}?<b[^>]*>\s*#?\s*([A-Za-z]{0,3}\d{3,})/i
        )?.[1] ??
        html.match(/(?:job\s*order|recent\s*order)[\s\S]{0,300}?#\s*([A-Za-z]{0,3}\d{3,})/i)?.[1] ??
        '';

      if (!orderNo) throw new Error('The order number could not be found inside the AIPLink barcode.');
      return {
        order_no: orderNo.trim(),
        client_identifier: parsed.client_identifier,
        share_id: parsed.share_id,
      };
    } finally {
      clearTimeout(timer);
    }
  };
  const getPickupPickState = async (orderNo: string) => {
    const rows = USE_POSTGRES_LOCAL && pgPool
      ? (
          await pgPool.query(
            `SELECT notes, store
             FROM logs
             WHERE upper(COALESCE(blanket_number, '')) = upper($1)
               AND status = 'received_from_store'
             ORDER BY timestamp ASC, id ASC`,
            [orderNo]
          )
        ).rows
      : db
          .prepare(
            `SELECT notes, store
             FROM logs
             WHERE upper(COALESCE(blanket_number, '')) = upper(?)
               AND status = 'received_from_store'
             ORDER BY datetime(timestamp) ASC, id ASC`
          )
          .all(orderNo);

    const picked = new Set<string>();
    const required = new Set<string>();
    for (const row of rows as Array<{ notes?: unknown; store?: unknown }>) {
      const notes = String(row?.notes ?? '');
      const requiredIds = notes.match(/Required Categories:\s*([^|]+)/i)?.[1]?.split(',') ?? [];
      for (const requiredId of requiredIds) {
        const normalized = requiredId.trim();
        if (pickupCategoryLabels[normalized]) required.add(normalized);
      }

      const categoryId = notes.match(/Category ID:\s*([^|]+)/i)?.[1]?.trim();
      if (categoryId && pickupCategoryLabels[categoryId]) {
        picked.add(categoryId);
        continue;
      }

      const categoryLabel = notes.match(/Category:\s*([^|]+)/i)?.[1]?.trim() || String(row?.store ?? '').trim();
      const fallbackCategory = pickupCategoryOrder.find(
        (candidate) => pickupCategoryLabels[candidate].toLowerCase() === categoryLabel.toLowerCase()
      );
      if (fallbackCategory) picked.add(fallbackCategory);
    }

    return {
      pickedCategories: pickupCategoryOrder.filter((category) => picked.has(category)),
      requiredCategories: pickupCategoryOrder.filter((category) => required.has(category)),
    };
  };

  app.get('/api/order-review/stores', requirePicker, requirePosStaffSession, (_req, res) => {
    res.json({ stores: getOrderReviewStoreSequence() });
  });

  app.post('/api/order-review/process', requirePicker, requirePosStaffSession, async (req: any, res) => {
    try {
      const rawStores = Array.isArray(req.body?.stores) ? req.body.stores : [];
      if (rawStores.length === 0 || rawStores.length > 200) {
        return res.status(400).json({ error: 'Provide between 1 and 200 stores.' });
      }

      const payload: OrderReviewPayload = {
        stores: rawStores.map((rawStore: any) => {
          const storeName = String(rawStore?.store_name ?? rawStore?.store ?? '').trim().slice(0, 120);
          const rawOrders = Array.isArray(rawStore?.orders)
            ? rawStore.orders
            : extractOrderReviewOrderNumbers(String(rawStore?.orders ?? rawStore?.text ?? ''));
          const orders = Array.from(
            new Set(rawOrders.map((order: unknown) => normalizePosReference(order)).filter(Boolean))
          ).slice(0, 500);
          return {
            store_name: storeName,
            orders,
            skipped: Boolean(rawStore?.skipped) || orders.length === 0,
          };
        }),
      };

      if (payload.stores.some((store) => !store.store_name)) {
        return res.status(400).json({ error: 'Every store must have a name.' });
      }
      const totalOrders = payload.stores.reduce((sum, store) => sum + store.orders.length, 0);
      if (totalOrders === 0) {
        return res.status(400).json({ error: 'Add at least one order before processing.' });
      }
      if (totalOrders > 1000) {
        return res.status(400).json({ error: 'A review can contain up to 1000 orders.' });
      }

      const auth = req.auth as SessionRecord | undefined;
      const batchParams = {
        payload,
        channel: 'web',
        submittedBy: auth?.username || 'system',
      };
      const batchId = createOrderReviewBatch(batchParams);
      void processOrderReviewPayload({ ...batchParams, batchId }).catch((processingError: any) => {
        console.error('Background order review processing failed:', processingError);
        db.prepare(
          `UPDATE order_review_batches
           SET status = 'failed', error_message = ?, completed_at = CURRENT_TIMESTAMP
           WHERE id = ?`
        ).run(String(processingError?.message || 'Order review processing failed.'), batchId);
      });
      res.status(202).json({ batch_id: batchId, status: 'processing' });
    } catch (error: any) {
      console.error('Order review processing failed:', error);
      res.status(502).json({ error: error?.message || 'Failed to process the order review.' });
    }
  });

  app.get('/api/order-review/batches/:batchId', requirePicker, requirePosStaffSession, (req: any, res) => {
    const batchId = Number(req.params.batchId ?? 0);
    if (!Number.isFinite(batchId) || batchId <= 0) {
      return res.status(400).json({ error: 'Invalid order review batch ID.' });
    }
    const batch = db
      .prepare('SELECT * FROM order_review_batches WHERE id = ? AND channel = ? LIMIT 1')
      .get(batchId, 'web') as
      | {
          id: number;
          status: string;
          error_message: string | null;
          submitted_text: string;
          total_orders: number;
          processed_orders: number;
          failed_orders: number;
        }
      | undefined;
    if (!batch) return res.status(404).json({ error: 'Order review batch was not found.' });
    if (batch.status === 'processing' || batch.status === 'created') {
      return res.json({
        batch_id: batch.id,
        status: 'processing',
        total_orders: Number(batch.total_orders ?? 0) || 0,
        processed_orders: Number(batch.processed_orders ?? 0) || 0,
        failed_orders: Number(batch.failed_orders ?? 0) || 0,
      });
    }
    if (batch.status === 'failed') {
      return res.status(502).json({
        batch_id: batch.id,
        status: 'failed',
        error: batch.error_message || 'Order review processing failed.',
      });
    }

    const counts = db
      .prepare(
        `SELECT COUNT(*) AS checked_orders,
                SUM(CASE WHEN COALESCE(error_message, '') <> '' THEN 1 ELSE 0 END) AS failed_orders
         FROM order_review_items
         WHERE batch_id = ?`
      )
      .get(batch.id) as { checked_orders?: number; failed_orders?: number } | undefined;
    const payload = parseJsonOr<OrderReviewPayload>(batch.submitted_text, { stores: [] });
    const warnings = db
      .prepare(
        `SELECT store_name, order_no, customer_name, customer_phone, order_status, balance, remark, error_message
         FROM order_review_items
         WHERE batch_id = ? AND COALESCE(error_message, '') <> ''
         ORDER BY store_name ASC, order_no ASC`
      )
      .all(batch.id) as OrderReviewProcessedItem[];
    return res.json({
      batch_id: batch.id,
      status: 'completed',
      checked_orders: Number(counts?.checked_orders ?? 0) || 0,
      stores_reviewed: payload.stores.length,
      failed_orders: Number(counts?.failed_orders ?? 0) || 0,
      duplicate_groups: getOrderReviewDuplicateGroups(batch.id),
      warnings,
    });
  });

  app.post('/api/pickup-search/resolve-barcode', requirePicker, requirePosStaffSession, async (req: any, res) => {
    try {
      const barcode = req.body?.barcode ?? req.body?.url ?? req.body?.raw;
      const posStaff = req.posStaff as PosStaffSessionRecord;
      const result = await resolveAipLinkOrderNo(barcode, posStaff.client_identifier);
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('AIPLink barcode resolution failed:', error);
      res.status(422).json({ error: error?.message || 'Failed to resolve the barcode link.' });
    }
  });

  app.get('/api/pickup-search/pick-progress', requirePicker, requirePosStaffSession, async (req, res) => {
    try {
      const orderNo = clampText(req.query.order_no ?? req.query.orderNo, 80);
      if (!orderNo) return res.status(400).json({ error: 'Order number is required.' });
      const state = await getPickupPickState(orderNo);
      res.json({
        success: true,
        order_no: orderNo,
        picked_categories: state.pickedCategories,
        required_categories: state.requiredCategories,
      });
    } catch (error: any) {
      console.error('Pickup progress lookup failed:', error);
      res.status(500).json({ error: error?.message || 'Failed to load pickup progress.' });
    }
  });

  app.post('/api/pickup-search/pick', requirePicker, requirePosStaffSession, async (req: any, res) => {
    try {
      const orderNo = clampText(req.body?.order_no ?? req.body?.orderNo, 80);
      if (!orderNo) return res.status(400).json({ error: 'Order number is required.' });

      const meta = getLogMeta(req);
      const user = req.auth?.username || 'system';
      const posStaff = req.posStaff as PosStaffSessionRecord;
      const category = clampText(req.body?.category, 80) || 'pickup';
      if (!pickupCategoryLabels[category]) {
        return res.status(400).json({ error: 'Invalid pickup category.' });
      }
      const requiredCategories = Array.from(
        new Set<string>(
          (Array.isArray(req.body?.required_categories) ? req.body.required_categories : [category])
            .map((candidate: unknown) => clampText(candidate, 80))
            .filter((candidate: string): candidate is string => Boolean(pickupCategoryLabels[candidate]))
        )
      );
      if (!requiredCategories.includes(category)) requiredCategories.push(category);
      const existingState = await getPickupPickState(orderNo);
      if (existingState.pickedCategories.includes(category)) {
        return res.json({
          success: true,
          already_picked: true,
          picked_categories: existingState.pickedCategories,
          required_categories:
            existingState.requiredCategories.length > 0 ? existingState.requiredCategories : requiredCategories,
        });
      }
      const categoryLabel = clampText(req.body?.category_label ?? req.body?.categoryLabel, 120) || category;
      const customerName = clampText(req.body?.customer_name ?? req.body?.customerName, 160);
      const customerPhone = clampText(req.body?.customer_phone ?? req.body?.customerPhone, 80);
      const remark = clampText(req.body?.remark, 600);

      const locations = Array.isArray(req.body?.locations) ? req.body.locations : [];
      const normalizedLocations = locations
        .map((location: any) => {
          const store = clampText(location?.store, 120);
          const row = Number(location?.row);
          const column = Number(location?.column);
          const label = clampText(location?.label, 220);
          return {
            store,
            row: Number.isFinite(row) ? row : null,
            column: Number.isFinite(column) ? column : null,
            label,
          };
        })
        .filter((location) => location.store || location.label)
        .slice(0, 20);

      const items = Array.isArray(req.body?.items) ? req.body.items : [];
      const itemSummary = items
        .map((item: any) => {
          const name = clampText(item?.name, 120);
          if (!name) return '';
          const qty = Number(item?.qty);
          return Number.isFinite(qty) && qty > 0 ? `${name} x${qty}` : name;
        })
        .filter(Boolean)
        .slice(0, 30)
        .join(', ');

      const firstLocation = normalizedLocations[0];
      const store = firstLocation?.store || categoryLabel;
      const row = firstLocation?.row ?? null;
      const column = firstLocation?.column ?? null;
      const locationSummary =
        normalizedLocations.map((location) => location.label || location.store).filter(Boolean).join(' | ') || 'No location details';
      const notes = [
          'تم الاستلام من الاستور',
          `Category ID: ${category}`,
          `Required Categories: ${requiredCategories.join(',')}`,
          `Category: ${categoryLabel}`,
          customerName ? `Customer: ${customerName}` : '',
          customerPhone ? `Phone: ${customerPhone}` : '',
          `Locations: ${locationSummary}`,
          itemSummary ? `Items: ${itemSummary}` : '',
          remark ? `Remark: ${remark}` : '',
          `POS User: ${posStaff.username}`,
          `POS User ID: ${posStaff.pos_user_id}`,
          meta.notes ? `Meta: ${meta.notes}` : '',
        ]
          .filter(Boolean)
          .join(' | ');

      const logEntry = {
        blanket_number: orderNo,
        action: 'تم الاستلام من الاستور',
        user,
        store,
        row,
        column,
        status: 'received_from_store',
        request_id: meta.request_id,
        device: meta.device,
        ip: meta.ip,
        notes,
      };

      if (USE_POSTGRES_LOCAL && pgPool) {
        await pgPool.query(
          `INSERT INTO logs (blanket_number, action, "user", store, row, "column", status, request_id, device, ip, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            logEntry.blanket_number,
            logEntry.action,
            logEntry.user,
            logEntry.store,
            logEntry.row,
            logEntry.column,
            logEntry.status,
            logEntry.request_id,
            logEntry.device,
            logEntry.ip,
            logEntry.notes,
          ]
        );
      } else {
        db.prepare(
          'INSERT INTO logs (blanket_number, action, user, store, row, column, status, request_id, device, ip, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).run(
          logEntry.blanket_number,
          logEntry.action,
          logEntry.user,
          logEntry.store,
          logEntry.row,
          logEntry.column,
          logEntry.status,
          logEntry.request_id,
          logEntry.device,
          logEntry.ip,
          logEntry.notes
        );
      }

      if (supabaseAdmin) {
        const { error } = await insertSupabaseLog(logEntry);
        if (error) console.warn('Pickup pick Supabase log sync failed:', error);
      }

      const state = await getPickupPickState(orderNo);
      res.json({
        success: true,
        log: logEntry,
        picked_categories: state.pickedCategories,
        required_categories: state.requiredCategories,
      });
    } catch (error: any) {
      console.error('Pickup pick log failed:', error);
      res.status(500).json({ error: error?.message || 'Failed to log pickup pick action.' });
    }
  });

  app.post('/api/pickup-search/pay-deliver', requirePicker, requirePosStaffSession, async (req: any, res) => {
    try {
      const orderNo = clampText(req.body?.order_no ?? req.body?.orderNo, 80);
      const sourceOrdersId = clampText(req.body?.source_orders_id ?? req.body?.sourceOrdersId, 80);
      const sourceInvoiceId = clampText(req.body?.source_invoice_id ?? req.body?.sourceInvoiceId, 80);
      const paymentMethod = String(req.body?.payment_method ?? req.body?.paymentMethod ?? '').trim().toLowerCase();
      const noPayReasonType = String(req.body?.no_pay_reason_type ?? req.body?.noPayReasonType ?? '')
        .trim()
        .toLowerCase();
      const noPayReason = clampText(req.body?.no_pay_reason ?? req.body?.noPayReason, 500);
      const scannedBarcode = clampText(req.body?.barcode ?? req.body?.scanned_barcode ?? req.body?.scannedBarcode, 120);
      const requiredCategories: string[] = Array.from(
        new Set<string>(
          (Array.isArray(req.body?.required_categories) ? req.body.required_categories : [])
            .map((category: unknown) => clampText(category, 80))
            .filter((category: string): category is string => Boolean(pickupCategoryLabels[category]))
        )
      );
      const dryRun = req.body?.dry_run === true || String(req.body?.dry_run ?? '').trim() === '1';
      if (!orderNo) return res.status(400).json({ error: 'Order number is required.' });
      if (paymentMethod !== 'cash' && paymentMethod !== 'credit_card' && paymentMethod !== 'no_pay') {
        return res.status(400).json({ error: 'Payment method must be cash, credit_card, or no_pay.' });
      }
      if (
        paymentMethod === 'no_pay' &&
        noPayReasonType !== 'monthly_account' &&
        noPayReasonType !== 'other'
      ) {
        return res.status(400).json({ error: 'Select a No Pay reason.' });
      }
      if (paymentMethod === 'no_pay' && noPayReasonType === 'other' && !noPayReason) {
        return res.status(400).json({ error: 'Enter the other No Pay reason.' });
      }
      if (requiredCategories.length === 0) {
        return res.status(400).json({ error: 'Pickup tasks are required before payment and delivery.' });
      }

      const pickupState = await getPickupPickState(orderNo);
      const enforcedRequiredCategories =
        pickupState.requiredCategories.length > 0 ? pickupState.requiredCategories : requiredCategories;
      const pickedCategories = pickupState.pickedCategories;
      const missingCategories = enforcedRequiredCategories.filter((category) => !pickedCategories.includes(category));
      if (missingCategories.length > 0) {
        return res.status(409).json({
          error: `Complete the Pick tasks first: ${missingCategories
            .map((category) => pickupCategoryLabels[category])
            .join(', ')}`,
          missing_categories: missingCategories,
          picked_categories: pickedCategories,
        });
      }

      if (!scannedBarcode) {
        return res.status(400).json({
          error: 'Scan the invoice barcode attached to the bag before payment and delivery.',
        });
      }
      if (normalizePickupBarcode(scannedBarcode) !== normalizePickupBarcode(orderNo)) {
        return res.status(409).json({
          error: 'The scanned barcode does not match the order number. Check that you have the correct bag.',
          expected_order_no: orderNo,
        });
      }

      const result = await payAndDeliverPickupOrder({
        order_no: orderNo,
        source_orders_id: sourceOrdersId,
        source_invoice_id: sourceInvoiceId,
        payment_method: paymentMethod as PickupDeliveryPaymentMethod,
        no_pay_reason_type:
          paymentMethod === 'no_pay' ? (noPayReasonType as PickupNoPayReasonType) : undefined,
        no_pay_reason: paymentMethod === 'no_pay' ? noPayReason : undefined,
        dry_run: dryRun,
      });

      if (!dryRun) {
        const meta = getLogMeta(req);
        const posStaff = req.posStaff as PosStaffSessionRecord;
        const action =
          paymentMethod === 'cash'
            ? 'Cash paid Delivery'
            : paymentMethod === 'credit_card'
              ? 'Credit card Delivery'
              : 'No Pay Delivery';
        const logEntry = {
          blanket_number: orderNo,
          action,
          user: req.auth?.username || 'system',
          store: 'Pickup Search',
          row: null,
          column: null,
          status: paymentMethod === 'no_pay' ? 'delivered_no_pay' : 'paid_and_delivered',
          request_id: meta.request_id,
          device: meta.device,
          ip: meta.ip,
          notes: [
            `Payment: ${
              paymentMethod === 'cash' ? 'Cash' : paymentMethod === 'credit_card' ? 'Credit Card' : 'No Pay'
            }`,
            `Amount: AED ${Number(result.amount_paid ?? 0).toFixed(2)}`,
            paymentMethod === 'no_pay' ? `No Pay Reason Type: ${noPayReasonType}` : '',
            paymentMethod === 'no_pay' ? `No Pay Reason: ${result.no_pay_reason ?? noPayReason}` : '',
            `POS Sales Order ID: ${result.sales_order_id}`,
            `POS User: ${posStaff.username}`,
            `POS User ID: ${posStaff.pos_user_id}`,
            `Assigned Driver ID: ${result.assigned_driver_id ?? ''}`,
            `Remaining balance: AED ${Number(result.remaining_balance ?? 0).toFixed(2)}`,
          ]
            .filter(Boolean)
            .join(' | '),
        };

        if (USE_POSTGRES_LOCAL && pgPool) {
          await pgPool.query(
            `INSERT INTO logs (blanket_number, action, "user", store, row, "column", status, request_id, device, ip, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
              logEntry.blanket_number,
              logEntry.action,
              logEntry.user,
              logEntry.store,
              logEntry.row,
              logEntry.column,
              logEntry.status,
              logEntry.request_id,
              logEntry.device,
              logEntry.ip,
              logEntry.notes,
            ]
          );
        } else {
          db.prepare(
            'INSERT INTO logs (blanket_number, action, user, store, row, column, status, request_id, device, ip, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
          ).run(
            logEntry.blanket_number,
            logEntry.action,
            logEntry.user,
            logEntry.store,
            logEntry.row,
            logEntry.column,
            logEntry.status,
            logEntry.request_id,
            logEntry.device,
            logEntry.ip,
            logEntry.notes
          );
        }

        if (supabaseAdmin) {
          const { error } = await insertSupabaseLog(logEntry);
          if (error) console.warn('Pickup delivery Supabase log sync failed:', error);
        }
      }

      res.json(result);
    } catch (error: any) {
      console.error('Pickup pay and deliver failed:', error);
      res.status(502).json({ error: error?.message || 'Failed to pay and deliver the POS order.' });
    }
  });

  app.get('/api/pickup-search/phone', requirePicker, requirePosStaffSession, async (req, res) => {
    try {
      const query = String(req.query.q ?? req.query.phone ?? req.query.order_no ?? req.query.orderNo ?? '').trim();
      const searchMode = String(req.query.mode ?? '').trim().toLowerCase();
      const queryDigits = normalizePosConnectPhone(query);
      const branchReference = parsePickupBranchReference(query);
      const isOrderQuery =
        searchMode === 'order' ||
        Boolean(branchReference) ||
        (searchMode !== 'phone' && isLikelyPosConnectOrderNoQuery(query) && queryDigits.length <= 8);

      if (!query || (!isOrderQuery && queryDigits.length < 5)) {
        return res.status(400).json({ error: 'Search must be a phone number or an order number.' });
      }

      const limit = Math.max(1, Math.min(50, Number(req.query.limit ?? 25) || 25));
      const orderLookupQuery = branchReference?.invoice_reference ?? query;
      const searchQueries = buildPosConnectSearchQueries(orderLookupQuery);
      const attempts: PosConnectSearchAttempt[] = [];

      if (isOrderQuery) {
        let order: PickupSearchOrder | null = null;
        let lastOrderError: any = null;

        try {
          const packingDetails = await tryFetchPosOrderDetailsViaPackingSearch(query, attempts);
          if (packingDetails) {
            order = await hydratePickupSearchOrder(null, packingDetails, '', query);
          }
        } catch (error) {
          lastOrderError = error;
        }

        if (!order) {
          try {
            const preview = await resolvePosConnectPreviewByDisplayedOrderNo(orderLookupQuery, {
              branchReference: branchReference ?? undefined,
            });
            if (preview) {
              let details: PosOrderDetailsResult | null = null;
              let detailsError = '';
              try {
                details = await fetchCachedPosConnectDetails({
                  order_id: preview.invoice_id || '0',
                  s_order_id: preview.orders_id || '0',
                  open_type: 'preview',
                  mode: '0',
                });
              } catch (error: any) {
                detailsError = String(error?.message || 'Failed to load POS order details.');
              }
              attempts.push({
                query: `${orderLookupQuery} order lookup`,
                records_total: 1,
                records_filtered: 1,
                parsed_orders: 1,
              });
              order = await hydratePickupSearchOrder(preview, details, detailsError, query);
            }
          } catch (error) {
            lastOrderError = error;
          }
        }

        if (!order && !branchReference) {
          try {
            const directDetails = await tryFetchPosConnectDetailsByDisplayedOrderNo(query, searchQueries, attempts);
            if (directDetails) {
              order = await hydratePickupSearchOrder(null, directDetails, '', query);
            }
          } catch (error) {
            lastOrderError = error;
          }
        }

        if (lastOrderError && attempts.length === 0) {
          return res.status(502).json({
            error: `POS connection failed while searching this order. ${String(
              lastOrderError?.cause?.message || lastOrderError?.message || ''
            ).trim()}`,
            query,
            orders: [],
            count: 0,
            searched_queries: searchQueries,
            attempts,
          });
        }

        const orders = order ? [order] : [];
        return res.json({
          query,
          mode: 'order',
          branch: branchReference
            ? { key: branchReference.key, branch_id: branchReference.branch_id }
            : null,
          orders,
          count: orders.length,
          searched_queries: searchQueries,
          attempts,
        });
      }

      const previewsByKey = new Map<string, PosOrderPreview>();
      let lastSearchError: any = null;
      let successfulSearches = 0;

      const searchResults = await Promise.all(
        searchQueries.map(async (candidateQuery) => {
          try {
            const candidateSearch = await fetchCachedPosConnectSearch(candidateQuery);
            return { candidateQuery, candidateSearch, error: null as any };
          } catch (error) {
            return { candidateQuery, candidateSearch: null, error };
          }
        })
      );

      for (const result of searchResults) {
        if (result.error || !result.candidateSearch) {
          lastSearchError = result.error;
          attempts.push({
            query: result.candidateQuery,
            records_total: 0,
            records_filtered: 0,
            parsed_orders: 0,
          });
          continue;
        }

        successfulSearches += 1;
        const candidateOrders = result.candidateSearch.orders ?? [];
        attempts.push({
          query: result.candidateQuery,
          records_total: Number(result.candidateSearch.recordsTotal ?? 0) || 0,
          records_filtered: Number(result.candidateSearch.recordsFiltered ?? 0) || 0,
          parsed_orders: candidateOrders.length,
        });

        for (const preview of candidateOrders) {
          if (!posPhoneMatchesAnyQuery(preview.customer_phone, searchQueries)) continue;
          const key = [
            String(preview.orders_id ?? '').trim(),
            String(preview.invoice_id ?? '').trim(),
            String(preview.order_no ?? '').trim(),
          ].join(':');
          if (!previewsByKey.has(key)) previewsByKey.set(key, preview);
        }
      }

      if (previewsByKey.size === 0 && successfulSearches === 0 && lastSearchError) {
        console.warn('Pickup phone search failed because POS did not respond:', lastSearchError);
        return res.status(502).json({
          error: `POS connection failed while searching this phone. ${String(
            lastSearchError?.cause?.message || lastSearchError?.message || ''
          ).trim()}`,
          query,
          phone: query,
          orders: [],
          count: 0,
          searched_queries: searchQueries,
          attempts,
        });
      }

      if (previewsByKey.size === 0 && PICKUP_PHONE_FALLBACK_ENABLED) {
        const pageSize = POS_CONNECT_FALLBACK_PAGE_SIZE;
        const maxPages = PICKUP_PHONE_FALLBACK_MAX_PAGES;
        const batchSize = POS_CONNECT_FALLBACK_BATCH_SIZE;

        for (let pageStart = 0; pageStart < maxPages; pageStart += batchSize) {
          const pageNumbers = Array.from(
            { length: Math.min(batchSize, maxPages - pageStart) },
            (_unused, index) => pageStart + index
          );

          const batchResults = await Promise.all(
            pageNumbers.map(async (page) => {
              try {
                const candidateSearch = await fetchCachedPosConnectSearch(POS_CONNECT_FALLBACK_QUERY, {
                  start: String(page * pageSize),
                  length: String(pageSize),
                  job_status: '0',
                  branch_id: '0',
                  prevent_depot_selection: '0',
                });
                return { page, candidateSearch, error: null as any };
              } catch (error) {
                return { page, candidateSearch: null, error };
              }
            })
          );

          batchResults.sort((a, b) => a.page - b.page);

          for (const result of batchResults) {
            if (result.error || !result.candidateSearch) {
              lastSearchError = result.error;
              attempts.push({
                query: `${POS_CONNECT_FALLBACK_QUERY} page ${result.page + 1}`,
                records_total: 0,
                records_filtered: 0,
                parsed_orders: 0,
              });
              continue;
            }

            successfulSearches += 1;
            const candidateOrders = result.candidateSearch.orders ?? [];
            attempts.push({
              query: `${POS_CONNECT_FALLBACK_QUERY} page ${result.page + 1}`,
              records_total: Number(result.candidateSearch.recordsTotal ?? 0) || 0,
              records_filtered: Number(result.candidateSearch.recordsFiltered ?? 0) || 0,
              parsed_orders: candidateOrders.length,
            });

            for (const preview of candidateOrders) {
              if (!posPhoneMatchesAnyQuery(preview.customer_phone, searchQueries)) continue;
              const key = [
                String(preview.orders_id ?? '').trim(),
                String(preview.invoice_id ?? '').trim(),
                String(preview.order_no ?? '').trim(),
              ].join(':');
              if (!previewsByKey.has(key)) previewsByKey.set(key, preview);
            }
          }

          if (previewsByKey.size >= limit) break;
          if (batchResults.some((result) => (result.candidateSearch?.orders?.length ?? 0) < pageSize)) break;
        }
      }

      const previews = Array.from(previewsByKey.values()).slice(0, limit);
      const hydratedOrders = await Promise.all(
        previews.map(async (preview): Promise<PickupSearchOrder | null> => {
          let details: PosOrderDetailsResult | null = null;
          let detailsError = '';

          try {
            details = await fetchCachedPosConnectDetails({
              order_id: preview.invoice_id || '0',
              s_order_id: preview.orders_id || '0',
              open_type: 'preview',
              mode: '0',
            });
          } catch (error: any) {
            detailsError = String(error?.message || 'Failed to load POS order details.');
          }

          return hydratePickupSearchOrder(preview, details, detailsError);
        })
      );

      const orders = hydratedOrders
        .filter((order): order is PickupSearchOrder => Boolean(order))
        .sort((a, b) => {
          const deliveredA = normalizePickupStatus(a.order_status) === 'delivered' ? 1 : 0;
          const deliveredB = normalizePickupStatus(b.order_status) === 'delivered' ? 1 : 0;
          if (deliveredA !== deliveredB) return deliveredA - deliveredB;
          return String(b.order_date ?? '').localeCompare(String(a.order_date ?? ''));
        });

      res.json({
        query,
        phone: query,
        mode: 'phone',
        orders,
        count: orders.length,
        searched_queries: searchQueries,
        attempts,
      });
    } catch (error: any) {
      console.error('Pickup phone search failed:', error);
      res.status(502).json({ error: error?.message || 'Failed to search pickup orders by phone.' });
    }
  });

  app.get('/api/pos/connect-order', requireAuth, async (req, res) => {
    try {
      const query = String(req.query.q ?? req.query.search ?? '').trim();
      if (query.length < 2) {
        return res.status(400).json({ error: 'Search query must be at least 2 characters.' });
      }

      const allSearchQueries = buildPosConnectSearchQueries(query);
      const deepSearch = /^(1|true|yes)$/i.test(String(req.query.deep ?? '').trim());
      const fastResponse =
        req.query.fast === undefined
          ? POS_CONNECT_FAST_RESPONSE_ENABLED
          : !/^(0|false|no)$/i.test(String(req.query.fast ?? '').trim());
      const directQueryLimit = deepSearch ? allSearchQueries.length : POS_CONNECT_DIRECT_QUERY_LIMIT;
      const searchQueries = allSearchQueries.slice(0, directQueryLimit);
      let search: Awaited<ReturnType<typeof fetchPosOrderSearch>> | null = null;
      let orders: PosOrderPreview[] = [];
      let searchedQuery = query;
      let lastSearchError: any = null;
      const attempts: PosConnectSearchAttempt[] = [];

      const directResults = await Promise.all(
        searchQueries.map(async (candidateQuery) => {
          try {
            const candidateSearch = await fetchCachedPosConnectSearch(candidateQuery);
            return { candidateQuery, candidateSearch, error: null as any };
          } catch (error) {
            return { candidateQuery, candidateSearch: null, error };
          }
        })
      );

      for (const result of directResults) {
        if (result.error || !result.candidateSearch) {
          lastSearchError = result.error;
          attempts.push({
            query: result.candidateQuery,
            records_total: 0,
            records_filtered: 0,
            parsed_orders: 0,
          });
          continue;
        }

        const candidateOrders = result.candidateSearch.orders ?? [];
        attempts.push({
          query: result.candidateQuery,
          records_total: Number(result.candidateSearch.recordsTotal ?? 0) || 0,
          records_filtered: Number(result.candidateSearch.recordsFiltered ?? 0) || 0,
          parsed_orders: candidateOrders.length,
        });
        search = result.candidateSearch;
        if (orders.length === 0 && candidateOrders.length > 0) {
          orders = candidateOrders;
          searchedQuery = result.candidateQuery;
        }
      }

      const remainingQueries = allSearchQueries.slice(searchQueries.length);
      if (orders.length === 0 && deepSearch && remainingQueries.length > 0) {
        const remainingResults = await Promise.all(
          remainingQueries.map(async (candidateQuery) => {
            try {
              const candidateSearch = await fetchCachedPosConnectSearch(candidateQuery);
              return { candidateQuery, candidateSearch, error: null as any };
            } catch (error) {
              return { candidateQuery, candidateSearch: null, error };
            }
          })
        );

        for (const result of remainingResults) {
          if (result.error || !result.candidateSearch) {
            lastSearchError = result.error;
            attempts.push({
              query: result.candidateQuery,
              records_total: 0,
              records_filtered: 0,
              parsed_orders: 0,
            });
            continue;
          }

          const candidateOrders = result.candidateSearch.orders ?? [];
          attempts.push({
            query: result.candidateQuery,
            records_total: Number(result.candidateSearch.recordsTotal ?? 0) || 0,
            records_filtered: Number(result.candidateSearch.recordsFiltered ?? 0) || 0,
            parsed_orders: candidateOrders.length,
          });
          search = result.candidateSearch;
          if (orders.length === 0 && candidateOrders.length > 0) {
            orders = candidateOrders;
            searchedQuery = result.candidateQuery;
          }
        }
      }

      if (orders.length === 0 && deepSearch) {
        const directDetails = await tryFetchPosConnectDetailsByDisplayedOrderNo(query, allSearchQueries, attempts);
        if (directDetails) {
          const parsedOrder = buildPosConnectOrder(null, directDetails);
          const order = parsedOrder.order_no ? parsedOrder : { ...parsedOrder, order_no: query };
          let storageSync: PosConveyerStorageSyncResult | null = null;
          try {
            storageSync = await syncPosOrderToConveyerStorage({
              order_no: order.order_no || query,
              remark: order.remark,
              user: (req as any).auth?.username || 'system',
              meta: getLogMeta(req),
            });
          } catch (syncError: any) {
            console.warn('POS conveyer storage sync skipped after direct details lookup:', syncError);
            storageSync = {
              synced: false,
              reason: 'sync_error',
              order_no: order.order_no || query,
              remark: order.remark,
              slot: parsePosConveyerSlotFromRemark(order.remark),
              store: null,
              row: null,
              column: null,
              message: syncError?.message || 'Failed to sync POS remark to conveyer storage.',
            };
          }
          return res.json({
            order,
            orders: [order],
            multiple: false,
            storage_sync: storageSync,
            details_pending: false,
            searched_queries: allSearchQueries,
            attempts,
          });
        }
      }

      if (orders.length === 0 && (deepSearch || POS_CONNECT_FALLBACK_ENABLED)) {
        const broadQuery = POS_CONNECT_FALLBACK_QUERY;
        const pageSize = POS_CONNECT_FALLBACK_PAGE_SIZE;
        const maxPages = deepSearch ? POS_CONNECT_DEEP_FALLBACK_MAX_PAGES : POS_CONNECT_FALLBACK_MAX_PAGES;
        const batchSize = POS_CONNECT_FALLBACK_BATCH_SIZE;

        for (let pageStart = 0; pageStart < maxPages; pageStart += batchSize) {
          const pageNumbers = Array.from(
            { length: Math.min(batchSize, maxPages - pageStart) },
            (_unused, index) => pageStart + index
          );

          const batchResults = await Promise.all(
            pageNumbers.map(async (page) => {
              try {
                const candidateSearch = await fetchCachedPosConnectSearch(broadQuery, {
                  start: String(page * pageSize),
                  length: String(pageSize),
                  job_status: '0',
                  branch_id: '0',
                  prevent_depot_selection: '0',
                });
                return { page, candidateSearch, error: null as any };
              } catch (error) {
                return { page, candidateSearch: null, error };
              }
            })
          );

          batchResults.sort((a, b) => a.page - b.page);

          for (const result of batchResults) {
            if (result.error || !result.candidateSearch) {
              lastSearchError = result.error;
              attempts.push({
                query: `${broadQuery} page ${result.page + 1}`,
                records_total: 0,
                records_filtered: 0,
                parsed_orders: 0,
              });
              continue;
            }

            const candidateSearch = result.candidateSearch;
            const candidateOrders = candidateSearch.orders ?? [];
            const localMatches = filterPosConnectPreviewMatches(candidateOrders, allSearchQueries);
            search = candidateSearch;
            attempts.push({
              query: `${broadQuery} page ${result.page + 1}`,
              records_total: Number(candidateSearch.recordsTotal ?? 0) || 0,
              records_filtered: Number(candidateSearch.recordsFiltered ?? 0) || 0,
              parsed_orders: candidateOrders.length,
            });
            if (localMatches.length > 0) {
              orders = localMatches;
              searchedQuery = query;
              break;
            }
          }

          if (orders.length > 0) break;
          if (batchResults.some((result) => (result.candidateSearch?.orders?.length ?? 0) < pageSize)) break;
        }
      }

      if (!search && lastSearchError) {
        throw lastSearchError;
      }

      if (orders.length === 0) {
        console.warn('POS Connect no parsed orders found.', {
          query,
          searchQueries,
          attempts,
        });
        return res.json({
          order: null,
          orders: [],
          multiple: false,
          searched_queries: deepSearch ? allSearchQueries : searchQueries,
          attempts,
        });
      }

      const selected = {
        orders_id: String(req.query.orders_id ?? '').trim(),
        invoice_id: String(req.query.invoice_id ?? '').trim(),
      };

      const queryPhone = normalizePosConnectPhone(query);
      const phoneMatches =
        isPosConnectPhoneQuery(query)
          ? orders.filter((order) => {
              const phone = normalizePosConnectPhone(order.customer_phone);
              return phone.length >= 5 && (phone.includes(queryPhone) || queryPhone.includes(phone));
            })
          : [];
      const exactOrder =
        orders.find((order) => String(order.order_no ?? '').trim().toUpperCase() === query.toUpperCase()) ??
        orders.find((order) => String(order.order_no ?? '').trim().toUpperCase() === searchedQuery.toUpperCase());
      const hasExplicitSelection = Boolean(selected.orders_id || selected.invoice_id);

      if (!hasExplicitSelection && !exactOrder && phoneMatches.length > 1) {
        return res.json({
          order: null,
          orders: phoneMatches.map((order) => buildPosConnectOrder(order, null)),
          multiple: true,
          searched_queries: deepSearch ? allSearchQueries : searchQueries,
          attempts,
        });
      }

      const preview = findBestPosConnectPreview(orders, query, selected) ?? findBestPosConnectPreview(orders, searchedQuery, selected);
      if (!preview) {
        return res.json({
          order: null,
          orders: [],
          multiple: false,
          searched_queries: deepSearch ? allSearchQueries : searchQueries,
          attempts,
        });
      }

      const detailParams = {
        order_id: preview.invoice_id || '0',
        s_order_id: preview.orders_id || '0',
        open_type: 'preview',
        mode: '0',
      };
      const cachedDetails = getCachedPosConnectDetails(detailParams);
      if (fastResponse && !cachedDetails) {
        const previewOrder = buildPosConnectOrder(preview, null);
        void fetchCachedPosConnectDetails(detailParams).catch((detailError) => {
          console.warn('POS Connect details prefetch failed:', detailError);
        });
        return res.json({
          order: previewOrder,
          orders: [previewOrder],
          multiple: false,
          storage_sync: null,
          details_pending: true,
          searched_queries: deepSearch ? allSearchQueries : searchQueries,
          attempts,
        });
      }

      let details: PosOrderDetailsResult | null = null;
      try {
        details = cachedDetails ?? (await fetchCachedPosConnectDetails(detailParams));
      } catch (detailError) {
        console.warn('POS Connect details lookup failed, returning preview data only:', detailError);
      }

      const order = buildPosConnectOrder(preview, details);
      let storageSync: PosConveyerStorageSyncResult | null = null;
      try {
        storageSync = await syncPosOrderToConveyerStorage({
          order_no: order.order_no,
          remark: order.remark,
          user: (req as any).auth?.username || 'system',
          meta: getLogMeta(req),
        });
      } catch (syncError: any) {
        console.warn('POS conveyer storage sync skipped after lookup:', syncError);
        storageSync = {
          synced: false,
          reason: 'sync_error',
          order_no: order.order_no,
          remark: order.remark,
          slot: parsePosConveyerSlotFromRemark(order.remark),
          store: null,
          row: null,
          column: null,
          message: syncError?.message || 'Failed to sync POS remark to conveyer storage.',
        };
      }
      res.json({
        order,
        orders: [order],
        multiple: false,
        storage_sync: storageSync,
        details_pending: false,
        searched_queries: deepSearch ? allSearchQueries : searchQueries,
        attempts,
      });
    } catch (error: any) {
      console.error('POS Connect order lookup failed:', error);
      res.status(502).json({ error: error?.message || 'Failed to fetch order from POS system.' });
    }
  });

  app.get('/api/pos/connect-order-details', requireAuth, async (req, res) => {
    try {
      const orderId = String(req.query.order_id ?? req.query.invoice_id ?? '').trim();
      const sOrderId = String(req.query.s_order_id ?? req.query.orders_id ?? '').trim();
      if (!orderId && !sOrderId) {
        return res.status(400).json({
          error: 'order_id (or invoice_id) or s_order_id (or orders_id) is required.',
        });
      }

      const details = await fetchCachedPosConnectDetails({
        order_id: orderId || '0',
        s_order_id: sOrderId || '0',
        open_type: 'preview',
        mode: '0',
      });
      const order = buildPosConnectOrder(null, details);
      let storageSync: PosConveyerStorageSyncResult | null = null;
      try {
        storageSync = await syncPosOrderToConveyerStorage({
          order_no: order.order_no,
          remark: order.remark,
          user: (req as any).auth?.username || 'system',
          meta: getLogMeta(req),
        });
      } catch (syncError: any) {
        console.warn('POS conveyer storage sync skipped after details lookup:', syncError);
        storageSync = {
          synced: false,
          reason: 'sync_error',
          order_no: order.order_no,
          remark: order.remark,
          slot: parsePosConveyerSlotFromRemark(order.remark),
          store: null,
          row: null,
          column: null,
          message: syncError?.message || 'Failed to sync POS remark to conveyer storage.',
        };
      }

      res.json({
        order,
        storage_sync: storageSync,
        details_pending: false,
      });
    } catch (error: any) {
      console.error('POS Connect order details lookup failed:', error);
      res.status(502).json({ error: error?.message || 'Failed to fetch POS order details.' });
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

  app.post('/api/pos/sales-print-script', requireAuth, async (req, res) => {
    try {
      let orderId = String(req.body?.order_id ?? req.body?.invoice_id ?? '').trim();
      let sourceOrdersId = String(req.body?.orders_id ?? req.body?.source_orders_id ?? '').trim();
      const orderNo = normalizeSortingOrderNo(req.body?.order_no ?? req.body?.orderNo ?? '');
      const printIdCandidates: string[] = [];
      const addPrintIdCandidate = (value: unknown) => {
        const candidate = String(value ?? '').trim();
        if (candidate && candidate !== '0' && !printIdCandidates.includes(candidate)) {
          printIdCandidates.push(candidate);
        }
      };
      addPrintIdCandidate(orderId);
      addPrintIdCandidate(sourceOrdersId);

      if (sourceOrdersId) {
        try {
          const details = await fetchPosOrderDetails({
            order_id: '0',
            s_order_id: sourceOrdersId,
            open_type: 'preview',
            mode: '0',
          });
          orderId = orderId || String(details.general.searched_invoice_id || '').trim();
          addPrintIdCandidate(details.general.searched_invoice_id);
          addPrintIdCandidate(details.general.order_id);
          addPrintIdCandidate(details.general.searched_order_id);
        } catch (detailsError) {
          console.warn('Could not resolve POS invoice id from source order id for printing:', detailsError);
        }
      }

      if (orderNo) {
        const search = await fetchPosOrderSearch(orderNo);
        const exact =
          (search.orders ?? []).find((entry) => String(entry.order_no ?? '').toUpperCase() === orderNo) ??
          (search.orders ?? [])[0];
        orderId = orderId || String(exact?.invoice_id ?? '').trim();
        sourceOrdersId = String(exact?.orders_id ?? sourceOrdersId ?? '').trim();
        addPrintIdCandidate(exact?.invoice_id);
        addPrintIdCandidate(exact?.orders_id);

        if (sourceOrdersId) {
          try {
            const details = await fetchPosOrderDetails({
              order_id: '0',
              s_order_id: sourceOrdersId,
              open_type: 'preview',
              mode: '0',
            });
            orderId = orderId || String(details.general.searched_invoice_id || '').trim();
            addPrintIdCandidate(details.general.searched_invoice_id);
            addPrintIdCandidate(details.general.order_id);
            addPrintIdCandidate(details.general.searched_order_id);
          } catch (detailsError) {
            console.warn('Could not resolve POS invoice id from POS search result for printing:', detailsError);
          }
        }

        if (orderId || sourceOrdersId) {
          db.prepare(
            `UPDATE sorting_orders
             SET source_orders_id = COALESCE(NULLIF(?, ''), source_orders_id),
                 source_invoice_id = COALESCE(NULLIF(?, ''), source_invoice_id),
                 updated_at = CURRENT_TIMESTAMP
             WHERE order_no = ?`
          ).run(sourceOrdersId, orderId, orderNo);
        }
      }

      if (!orderId) {
        orderId = printIdCandidates[0] || '';
      }

      if (printIdCandidates.length === 0) {
        return res.status(400).json({ error: 'A POS print id could not be resolved for this order.' });
      }

      let printOrigin = resolvePosOrigin();
      try {
        printOrigin = new URL(resolvePosEndpointFromPath(POS_SALES_PRINT_ENDPOINT)).origin;
      } catch {
        // Keep the normal POS origin fallback.
      }

      const buildPrintPayload = (candidateOrderId: string) => {
        const payload = new URLSearchParams();
        payload.set('print_item', String(req.body?.print_item ?? ''));
        payload.set('user_type', String(req.body?.user_type ?? '3'));
        payload.set('order_id', candidateOrderId);
        payload.set('paid', String(req.body?.paid ?? '0'));
        payload.set('printing', String(req.body?.printing ?? 'order'));
        payload.set('print_mode', String(req.body?.print_mode ?? ''));
        payload.set('printing_option', String(req.body?.printing_option ?? 'qz_print'));
        payload.set(
          'printing_design',
          String(req.body?.printing_design ?? 'QZ_PixelPrint_Laundry_With_Tag_Design01_QrCode_VAT')
        );
        payload.set('kot_option', String(req.body?.kot_option ?? 'kot_qz_print'));
        payload.set('kot_design', String(req.body?.kot_design ?? 'sales_print_KOT_42Char'));
        payload.set('reprint', String(req.body?.reprint ?? '0'));
        return payload;
      };

      const printAttempts: Array<{ order_id: string; sample: string }> = [];
      let script = '';
      let usedPrintOrderId = '';
      for (const candidateOrderId of printIdCandidates) {
        const { text } = await postPosForm(POS_SALES_PRINT_ENDPOINT, buildPrintPayload(candidateOrderId), {
          fallbackToGet: false,
          allowHtmlResponse: true,
          origin: printOrigin,
          referer: `${printOrigin}/inout/sales`,
        });
        if (/var\s+printdata\s*=|qz\.print/i.test(text)) {
          script = text;
          usedPrintOrderId = candidateOrderId;
          break;
        }
        printAttempts.push({
          order_id: candidateOrderId,
          sample: text.slice(0, 80),
        });
      }

      if (!script) {
        throw new Error(
          `POS print response did not contain a QZ print script. Tried IDs: ${printAttempts
            .map((attempt) => `${attempt.order_id} => ${attempt.sample || '(empty)'}`)
            .join(', ')}`
        );
      }

      res.json({
        success: true,
        order_id: usedPrintOrderId,
        script,
      });
    } catch (error: any) {
      console.error('POS sales print script failed:', error);
      res.status(502).json({ error: error?.message || 'Failed to fetch POS print script.' });
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
        .run(name, channel, body, isActive, (req as any).auth?.username || 'system');
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

  app.get('/api/customer-alerts/phone-groups', requirePicker, async (req, res) => {
    try {
      const limit = Math.max(1, Math.min(500, Number(req.query.limit ?? 160) || 160));
      const groups = await buildCustomerAlertPhoneGroups({
        limit,
        q: String(req.query.q ?? ''),
        severity: String(req.query.severity ?? 'all'),
        posStatus: String(req.query.posStatus ?? 'all'),
        oldDays: Math.max(1, Math.min(90, Number(req.query.oldDays ?? 7) || 7)),
      });
      res.json({
        groups,
        summary: {
          total_groups: groups.length,
          critical: groups.filter((group) => group.severity === 'critical').length,
          high: groups.filter((group) => group.severity === 'high').length,
          medium: groups.filter((group) => group.severity === 'medium').length,
          low: groups.filter((group) => group.severity === 'low').length,
          delivered_stored: groups.reduce((sum, group) => sum + group.delivered_stored_count, 0),
        },
        generated_at: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to load phone alert groups.' });
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

      const sentBy = String((req as any).auth?.username ?? 'system');
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
      const sentBy = String((req as any).auth?.username ?? 'system');

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
      const startedAt = Date.now();
      const state = buildSortingState();
      const elapsedMs = Date.now() - startedAt;
      if (elapsedMs > 3000) {
        console.warn(`Slow sorting state build: ${elapsedMs}ms`);
      }
      res.json(state);
    } catch (error: any) {
      console.error('Failed to build sorting state:', error);
      res.status(500).json({ error: error?.message || 'Failed to load sorting state.' });
    }
  });

  app.post('/api/sorting/sync-active', requireSorting, async (req, res) => {
    try {
      const summary = await syncActiveSortingOrdersWithPos(req.body?.limit);
      res.json({
        success: true,
        summary,
        state: buildSortingState(),
      });
    } catch (error: any) {
      console.error('Failed to sync active sorting orders with POS:', error);
      res.status(500).json({ error: error?.message || 'Failed to sync active sorting orders with POS.' });
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

      const posPreview = await resolvePosConnectPreviewByDisplayedOrderNo(orderNo).catch((resolveError) => {
        console.warn('Blanket packing POS preview resolve failed:', resolveError);
        return null;
      });
      if (posPreview?.orders_id || posPreview?.invoice_id) {
        db.prepare(
          `UPDATE sorting_orders
           SET source_orders_id = ?,
               source_invoice_id = ?,
               customer_name = COALESCE(NULLIF(?, ''), customer_name),
               customer_phone = COALESCE(NULLIF(?, ''), customer_phone),
               updated_at = CURRENT_TIMESTAMP
           WHERE order_no = ?`
        ).run(
          String(posPreview.orders_id ?? '').trim() || null,
          String(posPreview.invoice_id ?? '').trim() || null,
          String(posPreview.customer_name ?? '').trim(),
          normalizeDriverPhone(posPreview.customer_phone ?? ''),
          orderNo
        );
      }

      await syncSortingOrderQuantityFromPos(orderNo).catch((syncError) => {
        console.warn('Blanket packing POS refresh failed, using local order items:', syncError);
      });

      const bundle = await buildBlanketPackingUiBundle(orderNo);
      if (!bundle) return res.status(404).json({ error: 'Order not found.' });
      if ((bundle.items ?? []).length === 0) {
        const localItems = db
          .prepare('SELECT item_name FROM sorting_items WHERE order_no = ? ORDER BY id ASC')
          .all(orderNo) as Array<{ item_name: string }>;
        const names = localItems.map((item) => String(item.item_name ?? '').trim()).filter(Boolean).slice(0, 12);
        return res.status(409).json({
          error: names.length > 0
            ? `No ${BLANKET_PACKING_ITEM_LABEL} found in this order. POS/local items: ${names.join(', ')}`
            : `No ${BLANKET_PACKING_ITEM_LABEL} found in this order.`,
        });
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

  app.post('/api/sorting/tables/:id/force-clear', requireSorting, (req, res) => {
    try {
      const tableId = Number(req.params.id);
      if (!Number.isFinite(tableId) || tableId <= 0) {
        return res.status(400).json({ error: 'Invalid table id.' });
      }

      const table = db.prepare('SELECT * FROM sorting_tables WHERE id = ?').get(tableId) as SortingTableRecord | undefined;
      if (!table) return res.status(404).json({ error: 'Sorting table not found.' });

      const occupiedCells = db
        .prepare(
          `SELECT id, active_order_no
           FROM sorting_cells
           WHERE table_id = ?
             AND active_order_no IS NOT NULL
             AND TRIM(active_order_no) <> ''`
        )
        .all(tableId) as Array<{ id: number; active_order_no: string }>;

      const orderNos = Array.from(
        new Set(occupiedCells.map((cell) => String(cell.active_order_no ?? '').trim()).filter(Boolean))
      );

      const forceClearTx = db.transaction(() => {
        for (const orderNo of orderNos) {
          db.prepare(
            `UPDATE sorting_orders
             SET table_id = NULL,
                 row_no = NULL,
                 col_no = NULL,
                 updated_at = CURRENT_TIMESTAMP
             WHERE order_no = ?`
          ).run(orderNo);
        }

        db.prepare(
          `UPDATE sorting_cells
           SET active_order_no = NULL,
               status = 'empty',
               updated_at = CURRENT_TIMESTAMP
           WHERE table_id = ?`
        ).run(tableId);
      });
      forceClearTx();

      return res.json({
        success: true,
        cleared_cells: occupiedCells.length,
        affected_orders: orderNos,
        state: buildSortingState(),
      });
    } catch (error: any) {
      console.error('Failed to force clear sorting table:', error);
      return res.status(500).json({ error: error?.message || 'Failed to force clear sorting table.' });
    }
  });

  app.post('/api/sorting/scan', requireSorting, async (req: any, res) => {
    const startedAt = Date.now();
    try {
      const orderNo = normalizeSortingOrderNo(req.body?.order_no ?? req.body?.orderNo ?? req.body?.scanned_code);
      if (!orderNo) return res.status(400).json({ error: 'Order number is required.' });

      const existingOrder = db
        .prepare('SELECT * FROM sorting_orders WHERE order_no = ?')
        .get(orderNo) as SortingOrderRecord | undefined;
      if (!existingOrder) {
        ensureQuantityOnlySortingOrderInitialized({
          order_no: orderNo,
          qty: req.body?.qty,
        });
      }

      const currentItems = db
        .prepare('SELECT item_name FROM sorting_items WHERE order_no = ? ORDER BY id ASC')
        .all(orderNo) as Array<{ item_name: string }>;
      const needsFastPosHydrate =
        currentItems.length === 0 || currentItems.every((item) => isQuantityOnlySortingItemName(item.item_name));
      const fastPosHydratePromise = needsFastPosHydrate ? syncSortingOrderQuantityFromPos(orderNo) : null;
      const hydrateStartedAt = Date.now();
      const fastPosHydrated = fastPosHydratePromise
        ? await waitForSortingPosSyncWindow(fastPosHydratePromise)
        : true;
      if (needsFastPosHydrate) {
        console.info(
          `Sorting POS hydrate for ${orderNo}: ${fastPosHydrated ? 'ready' : 'deferred'} in ${Date.now() - hydrateStartedAt}ms`
        );
      }
      if (needsFastPosHydrate && !fastPosHydrated) {
        console.warn(`Sorting scan continuing with temporary quantity data for ${orderNo}; POS hydrate is still running.`);
      }

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
        pos_sync: null,
        details_pending: Boolean(needsFastPosHydrate && !fastPosHydrated),
        order: bundle?.order ?? null,
        items: bundle?.items ?? [],
        state: buildSortingState(),
        performance_ms: Date.now() - startedAt,
      });

      console.info(`Sorting scan fast response for ${orderNo}: ${Date.now() - startedAt}ms`);
      void (async () => {
        try {
          if (fastPosHydratePromise) {
            await fastPosHydratePromise;
          } else {
            await syncSortingOrderQuantityFromPos(orderNo);
          }
          if (scan.consumed > 0 && scan.updated_items.length > 0) {
            const refreshedBundle = getSortingOrderBundle(orderNo);
            if (refreshedBundle?.order) {
              await updatePosSortingDescription({
                order: refreshedBundle.order,
                item_names: scan.updated_items.map((item) => item.item_name),
                description: buildSortingPosStageDescription(refreshedBundle.order.total_sorted),
              });
            }
          }
        } catch (syncError) {
          console.warn('Background POS sync after sorting scan failed:', syncError);
        }
      })();
    } catch (error: any) {
      console.error('Failed to process sorting scan:', error);
      res.status(500).json({ error: error?.message || 'Failed to process sorting scan.' });
    }
  });

  app.post('/api/sorting/orders/:orderNo/sync-pos-stage', requireSorting, async (req: any, res) => {
    try {
      const orderNo = normalizeSortingOrderNo(req.params.orderNo);
      if (!orderNo) return res.status(400).json({ error: 'Order number is required.' });

      const bundle = getSortingOrderBundle(orderNo);
      if (!bundle?.order) return res.status(404).json({ error: 'Sorting order not found.' });
      if (bundle.items.length === 0) return res.status(409).json({ error: 'Sorting order has no items.' });

      const posSync = await updatePosSortingDescription({
        order: bundle.order,
        item_names: bundle.items.map((item) => item.item_name),
        description: String(
          req.body?.description ?? buildSortingPosStageDescription(bundle.order.total_sorted)
        ),
      });

      res.json({
        success: true,
        pos_sync: posSync,
        order: getSortingOrderBundle(orderNo)?.order ?? bundle.order,
      });
    } catch (error: any) {
      console.error('Failed to retry POS sorting stage sync:', error);
      res.status(502).json({ error: error?.message || 'POS Sorting description update failed.' });
    }
  });

  app.post('/api/sorting/ironing/session/start', requireSorting, (req: any, res) => {
    try {
      const orderNo = normalizeSortingOrderNo(req.body?.order_no ?? req.body?.orderNo ?? req.body?.scanned_code);
      if (!orderNo) return res.status(400).json({ error: 'Order number is required.' });
      const meta = getLogMeta(req);
      const session = startIroningSession({
        order_no: orderNo,
        worker: req.body?.worker || req.auth?.username || 'system',
        team_members: req.body?.team_members,
        pieces_target: req.body?.pieces_target ?? req.body?.qty,
        request_id: meta.request_id,
      });
      return res.json({
        success: true,
        session,
        sessions: listIroningSessions({ order_no: orderNo, limit: 20, offset: 0 }).rows,
      });
    } catch (error: any) {
      console.error('Failed to start ironing session:', error);
      const message = String(error?.message || 'Failed to start ironing session.');
      if (/not found|already packed|no clothes|no sorted clothes|required/i.test(message)) {
        return res.status(409).json({ error: message });
      }
      return res.status(500).json({ error: message });
    }
  });

  app.post('/api/sorting/ironing/session/:id/end', requireSorting, (req: any, res) => {
    try {
      const sessionId = Math.max(0, Number(req.params.id) || 0);
      if (!sessionId) return res.status(400).json({ error: 'Session id is required.' });
      const session = finishIroningSession({
        session_id: sessionId,
        quality_score: req.body?.quality_score,
        notes: req.body?.notes,
      });
      return res.json({
        success: true,
        session,
        sessions: listIroningSessions({ order_no: session.order_no, limit: 20, offset: 0 }).rows,
      });
    } catch (error: any) {
      console.error('Failed to end ironing session:', error);
      const message = String(error?.message || 'Failed to end ironing session.');
      if (/not found|required/i.test(message)) return res.status(404).json({ error: message });
      return res.status(500).json({ error: message });
    }
  });

  app.get('/api/sorting/ironing/history', requireSorting, (req: any, res) => {
    try {
      const auth = req.auth as SessionRecord | undefined;
      const orderNo = normalizeSortingOrderNo(req.query.order_no ?? req.query.orderNo ?? '');
      const status = String(req.query.status ?? '').trim().toLowerCase();
      const q = String(req.query.q ?? req.query.search ?? '').trim();
      const limit = Math.max(1, Math.min(200, Number(req.query.limit ?? 40) || 40));
      const page = Math.max(1, Number(req.query.page ?? 1) || 1);
      const offset = (page - 1) * limit;
      const scope = String(req.query.scope ?? '').trim().toLowerCase();
      const canViewAll = Boolean(auth?.role && (isOperationsManagerRole(auth.role) || isAdminRole(auth.role)));
      const worker = scope === 'all' && canViewAll ? String(req.query.worker ?? '').trim() : '';
      const result = listIroningSessions({
        order_no: orderNo || undefined,
        worker,
        status,
        q,
        limit,
        offset,
      });
      return res.json({
        success: true,
        sessions: result.rows,
        total: result.total,
        page,
        limit: result.limit,
      });
    } catch (error: any) {
      console.error('Failed to load ironing history:', error);
      return res.status(500).json({ error: error?.message || 'Failed to load ironing history.' });
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
        session_id: req.body?.session_id,
      });

      const bundle = getSortingOrderBundle(orderNo);
      res.json({
        success: true,
        event: {
          consumed: event.consumed,
          overflow: event.overflow,
          ironing_progress: event.ironing_progress,
          session: event.session,
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

  app.post('/api/sorting/blanket/print-next', requireSorting, async (req: any, res) => {
    try {
      const orderNo = normalizeSortingOrderNo(req.body?.order_no ?? req.body?.orderNo ?? req.body?.scanned_code);
      if (!orderNo) return res.status(400).json({ error: 'Order number is required.' });

      await ensureSortingOrderInitialized({
        order_no: orderNo,
        allow_unsorted_fallback: false,
      });

      const meta = getLogMeta(req);
      const result = await applyBlanketPackingPrintNext({
        order_no: orderNo,
        user: req.body?.user || req.auth?.username || 'system',
        request_id: meta.request_id,
      });

      return res.json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error('Failed to print next blanket label:', error);
      const message = String(error?.message || 'Failed to print next blanket label.');
      if (/already packed|no pending|no blanket|invalid/i.test(message)) {
        return res.status(409).json({ error: message });
      }
      return res.status(500).json({ error: message });
    }
  });

  app.post('/api/sorting/blanket/reprint-last', requireSorting, async (req: any, res) => {
    try {
      const orderNo = normalizeSortingOrderNo(req.body?.order_no ?? req.body?.orderNo ?? req.body?.scanned_code);
      const confirm = req.body?.confirm === true;
      if (!orderNo) return res.status(400).json({ error: 'Order number is required.' });
      if (!confirm) return res.status(400).json({ error: 'Reprint confirmation is required.' });

      await ensureSortingOrderInitialized({
        order_no: orderNo,
        allow_unsorted_fallback: false,
      });

      const meta = getLogMeta(req);
      const result = await applyBlanketPackingReprintLast({
        order_no: orderNo,
        user: req.body?.user || req.auth?.username || 'system',
        request_id: meta.request_id,
        confirm,
      });

      return res.json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error('Failed to reprint blanket label:', error);
      const message = String(error?.message || 'Failed to reprint blanket label.');
      if (/confirmation|required|no previous label|no blanket|invalid/i.test(message)) {
        return res.status(409).json({ error: message });
      }
      return res.status(500).json({ error: message });
    }
  });

  app.get('/api/sorting/blanket/history', requireSorting, (req, res) => {
    try {
      const orderNo = normalizeSortingOrderNo(req.query.order_no ?? req.query.orderNo ?? '');
      const action = String(req.query.action ?? '').trim().toLowerCase();
      const status = String(req.query.status ?? '').trim().toLowerCase();
      const q = String(req.query.q ?? req.query.search ?? '').trim();
      const limit = Math.max(1, Math.min(200, Number(req.query.limit ?? 40) || 40));
      const page = Math.max(1, Number(req.query.page ?? 1) || 1);
      const offset = (page - 1) * limit;

      const result = searchBlanketPackingLogs({
        order_no: orderNo || undefined,
        action,
        status,
        q,
        limit,
        offset,
      });

      return res.json({
        success: true,
        entries: result.rows,
        total: result.total,
        page,
        limit: result.limit,
      });
    } catch (error: any) {
      console.error('Failed to load blanket packing history:', error);
      return res.status(500).json({ error: error?.message || 'Failed to load blanket packing history.' });
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
      } else if (CUSTOMER_SMS_PROVIDER === 'meta_whatsapp') {
        if (channel !== 'whatsapp') {
          return res.status(400).json({ error: 'Selected OTP channel is not supported by current provider.' });
        }
        if (!isMetaWhatsappOtpEnabled()) {
          return res.status(500).json({
            error:
              'Meta WhatsApp is not configured. Set META_WHATSAPP_ACCESS_TOKEN, META_WHATSAPP_PHONE_NUMBER_ID, and META_WHATSAPP_OTP_TEMPLATE_NAME.',
          });
        }
        devCode = String(randomInt(0, 1_000_000)).padStart(6, '0');
        codeHash = hashCustomerPassword(devCode);
        await sendOtpViaMetaWhatsapp(phoneE164, devCode);
        provider = 'meta_whatsapp';
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

  app.get('/api/customer/orders', requireCustomerOrAdminAuth, (req: any, res) => {
    try {
      const rows = db
        .prepare('SELECT payload FROM customer_orders ORDER BY datetime(updated_at) DESC, datetime(created_at) DESC, id DESC')
        .all() as { payload: string }[];
      const customer = getCustomerUserFromSession(req.customerAuth as CustomerSessionRecord | undefined);

      const orders = rows
        .map(parseCustomerOrderRowPayload)
        .filter(Boolean)
        .filter((order) => !req.customerAuth || isCustomerOrderOwner(order as Record<string, unknown>, customer));

      res.json(orders);
    } catch (error: any) {
      console.error('Failed to fetch customer orders:', error);
      res.status(500).json({ error: error?.message || 'Failed to fetch customer orders' });
    }
  });

  app.get('/api/customer/orders/:id', requireCustomerOrAdminAuth, (req: any, res) => {
    try {
      const id = String(req.params.id ?? '').trim();
      if (!id) return res.status(400).json({ error: 'Order id is required.' });

      const row = db.prepare('SELECT payload FROM customer_orders WHERE id = ?').get(id) as { payload: string } | undefined;
      if (!row) return res.status(404).json({ error: 'Order not found.' });

      const order = parseCustomerOrderRowPayload(row);
      if (!order) return res.status(404).json({ error: 'Order not found.' });

      if (req.customerAuth) {
        const customer = getCustomerUserFromSession(req.customerAuth as CustomerSessionRecord | undefined);
        if (!isCustomerOrderOwner(order, customer)) {
          return res.status(404).json({ error: 'Order not found.' });
        }
      }

      res.json(order);
    } catch (error: any) {
      console.error('Failed to fetch customer order:', error);
      res.status(500).json({ error: error?.message || 'Failed to fetch customer order' });
    }
  });

  app.post('/api/customer/orders/:id/sync-pos', requireCustomerOrAdminAuth, async (req: any, res) => {
    try {
      const id = String(req.params.id ?? '').trim();
      if (!id) return res.status(400).json({ error: 'Order id is required.' });

      const row = db.prepare('SELECT payload FROM customer_orders WHERE id = ?').get(id) as { payload: string } | undefined;
      if (!row) return res.status(404).json({ error: 'Order not found.' });

      const order = parseCustomerOrderRowPayload(row);
      if (!order) return res.status(404).json({ error: 'Order not found.' });

      const customer = getCustomerUserFromSession(req.customerAuth as CustomerSessionRecord | undefined);
      if (req.customerAuth && !isCustomerOrderOwner(order, customer)) {
        return res.status(404).json({ error: 'Order not found.' });
      }

      const syncedOrder = await syncCustomerPortalOrderWithPos(order, customer);
      if (!syncedOrder) {
        return res.status(404).json({
          error: 'No matching POS order was found for this customer phone or saved system order reference.',
        });
      }

      const nextStatus = normalizeCustomerOrderStatus((syncedOrder as Record<string, unknown>).status);
      const nextPayload = {
        ...syncedOrder,
        status: nextStatus,
      };

      db.prepare(
        `UPDATE customer_orders
         SET status = ?, payload = ?, updated_at = ?
         WHERE id = ?`
      ).run(nextStatus, JSON.stringify(nextPayload), new Date().toISOString(), id);

      res.json(nextPayload);
    } catch (error: any) {
      console.error('Failed to sync customer order with POS:', error);
      res.status(500).json({ error: error?.message || 'Failed to sync customer order with POS' });
    }
  });

  app.post('/api/customer/orders', requireCustomerOrAdminAuth, async (req: any, res) => {
    try {
      const parsedOrder = parseCustomerOrderPayload(req.body);
      if (!parsedOrder) return res.status(400).json({ error: 'Valid order payload is required.' });
      const order = parsedOrder as Record<string, any> & { id: string; status: string };
      console.log(
        `[customer-order] create request id=${order.id} customerAuth=${Boolean(req.customerAuth)} phone=${String(
          order.customerPhone ?? order.phoneNumber ?? ''
        ).trim()}`
      );
      const customer = getCustomerUserFromSession(req.customerAuth as CustomerSessionRecord | undefined);
      const customerPhoneNormalized = normalizeCustomerPhone(customer?.phone_normalized ?? customer?.phone);
      const customerEnrichedOrder = customer
        ? {
            ...order,
            customerId: customer.id,
            customerName: String(customer.name ?? order.customerName ?? '').trim() || order.customerName,
            customerPhone: customer.phone || order.customerPhone || order.phoneNumber,
            customerPhoneNormalized: customerPhoneNormalized || order.customerPhoneNormalized,
            customerEmail: customer.email || order.customerEmail,
            customerArea: customer.area || order.customerArea,
            phoneNumber: customer.phone || order.phoneNumber,
          }
        : order;
      const shouldNotifyDriver = Boolean(req.customerAuth) && !String(customerEnrichedOrder.assignedDriverId ?? '').trim();
      const driverEnrichedOrder = (shouldNotifyDriver
        ? await assignDriverAndNotifyForCustomerOrder(customerEnrichedOrder)
        : customerEnrichedOrder) as Record<string, any> & { id: string; status: string };
      const finalOrder = (req.customerAuth
        ? await notifyCustomerOrderConfirmation(driverEnrichedOrder)
        : driverEnrichedOrder) as Record<string, any> & { id: string; status: string };

      const now = new Date().toISOString();
      db.prepare(
        `INSERT INTO customer_orders (id, status, payload, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           status = excluded.status,
           payload = excluded.payload,
           updated_at = excluded.updated_at`
      ).run(finalOrder.id, finalOrder.status, JSON.stringify(finalOrder), now, now);

      res.status(201).json(finalOrder);
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
    ['/report', '/smart-storage-hub/report'],
    ['/performance-report', '/smart-storage-hub/performance-report'],
    ['/operations-report', '/smart-storage-hub/operations-report'],
    ['/achievements', '/smart-storage-hub/achievements'],
    ['/training-academy', '/smart-storage-hub/training-academy'],
    ['/training-academy/translations', '/smart-storage-hub/training-academy/translations'],
  ]);
  for (const [fromPath, toPath] of hubLegacyRouteRedirects.entries()) {
    app.get(fromPath, (req, res) => {
      const queryIndex = req.originalUrl.indexOf('?');
      const query = queryIndex >= 0 ? req.originalUrl.slice(queryIndex) : '';
      res.redirect(302, `${toPath}${query}`);
    });
    app.get(`${fromPath}/`, (req, res) => {
      const queryIndex = req.originalUrl.indexOf('?');
      const query = queryIndex >= 0 ? req.originalUrl.slice(queryIndex) : '';
      res.redirect(302, `${toPath}${query}`);
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
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
