import 'dotenv/config';
import Database from 'better-sqlite3';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase admin configuration.');
  console.error('Required env vars: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const dbPath = process.argv[2] ?? 'blanket_storage.db';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BATCH_SIZE = 100;

const chunk = (items, size) => {
  const batches = [];
  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }
  return batches;
};

const requireSchema = async () => {
  const { error: storesError } = await supabaseAdmin.from('stores').select('store_name').limit(1);
  if (storesError) throw storesError;

  const { error: slotCapacityError } = await supabaseAdmin.from('stores').select('slot_capacity').limit(1);
  if (slotCapacityError) throw slotCapacityError;

  const { error: blanketsError } = await supabaseAdmin.from('blankets').select('id').limit(1);
  if (blanketsError) throw blanketsError;

  const { error: logsError } = await supabaseAdmin.from('logs').select('id').limit(1);
  if (logsError) throw logsError;
};

const resetSupabaseData = async () => {
  await requireSchema();

  const db = new Database(dbPath, { readonly: true });

  let stores = [];
  try {
    stores = db
      .prepare(
        'SELECT store_name, position_x, position_y, position_z, width, depth, height, rows, columns, rotation_y, auto_settle, store_type, hanger_slots, slot_capacity FROM stores ORDER BY store_name'
      )
      .all();
  } catch {
    stores = db
      .prepare(
        'SELECT store_name, position_x, position_y, position_z, width, depth, height, rows, columns, rotation_y, auto_settle, store_type, hanger_slots FROM stores ORDER BY store_name'
      )
      .all()
      .map((store) => ({ ...store, slot_capacity: null }));
  }

  const blankets = db
    .prepare('SELECT blanket_number, store, row, column, status, created_at FROM blankets ORDER BY created_at')
    .all();

  const logs = db
    .prepare('SELECT blanket_number, action, user, store, row, column, status, timestamp FROM logs ORDER BY timestamp')
    .all();

  const summary = {
    storesUpserted: 0,
    blanketsDeleted: 0,
    logsDeleted: 0,
    blanketsInserted: 0,
    logsInserted: 0,
  };

  if (stores.length > 0) {
    const normalizedStores = stores.map((store) => ({
      ...store,
      auto_settle: Boolean(store.auto_settle),
      slot_capacity:
        store.store_type === 'hanger'
          ? 1
          : Math.max(1, Number(store.slot_capacity ?? (/^folding\\b/i.test(store.store_name) ? 20 : 1))),
    }));

    const { error } = await supabaseAdmin.from('stores').upsert(normalizedStores, { onConflict: 'store_name' });
    if (error) throw error;
    summary.storesUpserted = stores.length;
  }

  // Delete logs first, then blankets (blankets has FK to stores only, but keep order predictable).
  {
    const { count: logsCount, error: logsCountError } = await supabaseAdmin
      .from('logs')
      .select('*', { head: true, count: 'exact' });
    if (logsCountError) throw logsCountError;

    const { error: deleteLogsError } = await supabaseAdmin.from('logs').delete().gt('id', 0);
    if (deleteLogsError) throw deleteLogsError;

    summary.logsDeleted = logsCount ?? 0;
  }

  {
    const { count: blanketsCount, error: blanketsCountError } = await supabaseAdmin
      .from('blankets')
      .select('*', { head: true, count: 'exact' });
    if (blanketsCountError) throw blanketsCountError;

    const { error: deleteBlanketsError } = await supabaseAdmin.from('blankets').delete().gt('id', 0);
    if (deleteBlanketsError) throw deleteBlanketsError;

    summary.blanketsDeleted = blanketsCount ?? 0;
  }

  for (const batch of chunk(blankets, BATCH_SIZE)) {
    const payload = batch.map((blanket) => ({
      blanket_number: blanket.blanket_number,
      store: blanket.store,
      row: blanket.row,
      column: blanket.column,
      status: blanket.status,
      created_at: blanket.created_at,
    }));

    const { error } = await supabaseAdmin.from('blankets').insert(payload);
    if (error) throw error;
  }
  summary.blanketsInserted = blankets.length;

  for (const batch of chunk(logs, BATCH_SIZE)) {
    const payload = batch.map((log) => ({
      blanket_number: log.blanket_number,
      action: log.action,
      user: log.user ?? 'system',
      store: log.store,
      row: log.row,
      column: log.column,
      status: log.status,
      timestamp: log.timestamp,
    }));

    const { error } = await supabaseAdmin.from('logs').insert(payload);
    if (error) throw error;
  }
  summary.logsInserted = logs.length;

  db.close();
  return summary;
};

try {
  const summary = await resetSupabaseData();
  console.log('Supabase reset completed successfully (blankets/logs replaced from SQLite).');
  console.table(summary);
} catch (error) {
  console.error('Supabase reset failed.');
  console.error(error);
  process.exit(1);
}

