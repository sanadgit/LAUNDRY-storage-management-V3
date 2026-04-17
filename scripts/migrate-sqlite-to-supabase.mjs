import 'dotenv/config';
import Database from 'better-sqlite3';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

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
const PAGE_SIZE = 1000;

const chunk = (items, size) => {
  const batches = [];
  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }
  return batches;
};

const normalizeDateKey = (value) => {
  if (!value) return '';
  const normalizedValue = /z|[+-]\d{2}:\d{2}$/i.test(value)
    ? value
    : `${String(value).replace(' ', 'T')}Z`;
  return new Date(normalizedValue).toISOString();
};

const blanketKey = (blanket) =>
  JSON.stringify([
    blanket.blanket_number,
    blanket.store,
    blanket.row,
    blanket.column,
    blanket.status,
    normalizeDateKey(blanket.created_at),
  ]);

const logKey = (log) =>
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

const toSupabaseUserEmail = (username) => `${username.trim().toLowerCase()}@laundrywarehouse.local`;

const normalizeManagedEmail = ({ username, email }) => {
  const normalized = email?.trim().toLowerCase();
  return normalized || toSupabaseUserEmail(username);
};

const buildUserMetadata = (payload) => ({
  username: payload.username,
  full_name: payload.full_name?.trim() || payload.username,
  phone: payload.phone?.trim() || '',
  avatar_url: payload.avatar_url?.trim() || '',
  role: payload.role,
  is_active: payload.is_active !== false,
  last_login_at: payload.last_login_at ?? null,
});

const listAllAuthUsers = async () => {
  const users = [];
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const batch = data?.users ?? [];
    users.push(...batch);
    if (batch.length < perPage) break;

    page += 1;
  }

  return users;
};

const ensureAuthUser = async (payload, existingAuthUserId) => {
  const email = normalizeManagedEmail(payload);
  const normalizedPassword = payload.password && payload.password.length >= 6 ? payload.password : undefined;

  let authUserId = existingAuthUserId ?? null;

  if (authUserId) {
    const { data: currentData, error: currentError } = await supabaseAdmin.auth.admin.getUserById(authUserId);
    if (currentError) throw currentError;

    const currentUser = currentData?.user;
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
      email,
      password: normalizedPassword,
      email_confirm: true,
      user_metadata: {
        ...(currentUser?.user_metadata ?? {}),
        ...buildUserMetadata(payload),
      },
    });
    if (error) throw error;
    return data.user.id;
  }

  if (payload.password && payload.password.length < 6) {
    throw new Error(`Password must be at least 6 characters for Supabase accounts (user: ${payload.username}).`);
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: normalizedPassword ?? randomUUID(),
    email_confirm: true,
    user_metadata: buildUserMetadata(payload),
  });

  if (error) throw error;
  if (!data.user) throw new Error(`Failed to create auth user for ${payload.username}`);

  return data.user.id;
};

const upsertPublicUser = async (payload, authUserId) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .upsert(
      {
        username: payload.username,
        role: payload.role,
        auth_user_id: authUserId,
      },
      { onConflict: 'username' }
    )
    .select('id, username, role, auth_user_id, created_at')
    .single();

  if (error) throw error;
  return data;
};

const fetchAllRows = async (queryBuilderFactory) => {
  const rows = [];
  let from = 0;

  while (true) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await queryBuilderFactory().range(from, to);
    if (error) throw error;

    const batch = data ?? [];
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) break;

    from += PAGE_SIZE;
  }

  return rows;
};

const migrate = async () => {
  {
    const { error: storesError } = await supabaseAdmin.from('stores').select('store_name').limit(1);
    if (storesError) throw storesError;

    const { error: slotCapacityError } = await supabaseAdmin.from('stores').select('slot_capacity').limit(1);
    if (slotCapacityError) {
      if (slotCapacityError.code === 'PGRST204' || slotCapacityError.code === '42703') {
        throw new Error(
          "Supabase schema is missing `stores.slot_capacity`.\nRun `supabase-schema.sql` in the Supabase SQL Editor, or run:\nALTER TABLE stores ADD COLUMN IF NOT EXISTS slot_capacity integer NOT NULL DEFAULT 1;"
        );
      }
      throw slotCapacityError;
    }

    const { error: blanketsError } = await supabaseAdmin.from('blankets').select('id').limit(1);
    if (blanketsError) throw blanketsError;

    const { error: logsError } = await supabaseAdmin.from('logs').select('id').limit(1);
    if (logsError) throw logsError;

    const { error: usersError } = await supabaseAdmin.from('users').select('id').limit(1);
    if (usersError) throw usersError;
  }

  const db = new Database(dbPath, { readonly: true });

  const users = db
    .prepare(
      'SELECT username, full_name, email, phone, avatar_url, role, is_active, last_login_at, password FROM users ORDER BY id'
    )
    .all();

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
    usersUpserted: 0,
    storesUpserted: 0,
    blanketsInserted: 0,
    blanketsSkipped: 0,
    logsInserted: 0,
    logsSkipped: 0,
  };

  const authUsers = await listAllAuthUsers();
  const authUserByEmail = new Map(
    authUsers
      .map((user) => [String(user.email ?? '').toLowerCase(), user.id])
      .filter(([email]) => Boolean(email))
  );

  for (const user of users) {
    const normalizedUser = {
      ...user,
      is_active: user.is_active !== 0,
    };

    const email = normalizeManagedEmail(normalizedUser);
    const existingAuthUserId = authUserByEmail.get(email.toLowerCase()) ?? null;

    const authUserId = await ensureAuthUser(normalizedUser, existingAuthUserId);
    authUserByEmail.set(email.toLowerCase(), authUserId);

    await upsertPublicUser(normalizedUser, authUserId);
    summary.usersUpserted += 1;
  }

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

  const existingBlankets = await fetchAllRows(() =>
    supabaseAdmin.from('blankets').select('blanket_number, store, row, column, status, created_at')
  );
  const blanketKeys = new Set(existingBlankets.map((blanket) => blanketKey(blanket)));

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

  for (const batch of chunk(blanketsToInsert, BATCH_SIZE)) {
    const { error } = await supabaseAdmin.from('blankets').insert(batch);
    if (error) throw error;
  }

  summary.blanketsInserted = blanketsToInsert.length;
  summary.blanketsSkipped = blankets.length - blanketsToInsert.length;

  const existingLogs = await fetchAllRows(() =>
    supabaseAdmin.from('logs').select('blanket_number, action, user, store, row, column, status, timestamp')
  );
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

  for (const batch of chunk(logsToInsert, BATCH_SIZE)) {
    const { error } = await supabaseAdmin.from('logs').insert(batch);
    if (error) throw error;
  }

  summary.logsInserted = logsToInsert.length;
  summary.logsSkipped = logs.length - logsToInsert.length;

  db.close();

  return summary;
};

try {
  const summary = await migrate();
  console.log('SQLite -> Supabase migration completed successfully.');
  console.table(summary);
} catch (error) {
  console.error('SQLite -> Supabase migration failed.');
  console.error(error);
  process.exit(1);
}
