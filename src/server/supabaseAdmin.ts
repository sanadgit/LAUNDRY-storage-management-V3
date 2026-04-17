import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { toSupabaseUserEmail } from '../lib/userEmail';

export type AppUserRole = 'super-admin' | 'admin' | 'cashier';

export interface ManagedUserPayload {
  username: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  role: AppUserRole;
  is_active?: boolean;
  last_login_at?: string | null;
  password?: string;
}

export interface PublicUserRecord {
  id: number;
  username: string;
  role: AppUserRole;
  auth_user_id: string | null;
  created_at?: string | null;
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseAdminEnabled = Boolean(supabaseUrl && supabaseServiceRoleKey);

export const supabaseAdmin = isSupabaseAdminEnabled
  ? createClient(supabaseUrl!, supabaseServiceRoleKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

const requireSupabaseAdmin = () => {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client is not configured. Add SUPABASE_SERVICE_ROLE_KEY to the server environment.');
  }

  return supabaseAdmin;
};

export const normalizeManagedEmail = (payload: Pick<ManagedUserPayload, 'username' | 'email'>) => {
  const normalized = payload.email?.trim().toLowerCase();
  return normalized || toSupabaseUserEmail(payload.username);
};

export const buildUserMetadata = (payload: ManagedUserPayload) => ({
  username: payload.username,
  full_name: payload.full_name?.trim() || payload.username,
  phone: payload.phone?.trim() || '',
  avatar_url: payload.avatar_url?.trim() || '',
  role: payload.role,
  is_active: payload.is_active !== false,
  last_login_at: payload.last_login_at ?? null,
});

export const listAllAuthUsers = async () => {
  const client = requireSupabaseAdmin();
  const users: Array<{ id: string; email?: string | null; created_at?: string; updated_at?: string; user_metadata?: Record<string, unknown> | null }> = [];
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const batch = data?.users ?? [];
    users.push(...batch);

    if (batch.length < perPage) {
      break;
    }

    page += 1;
  }

  return users;
};

export const getAuthUserById = async (authUserId: string) => {
  const client = requireSupabaseAdmin();
  const { data, error } = await client.auth.admin.getUserById(authUserId);
  if (error) throw error;
  return data.user;
};

export const ensureAuthUser = async (
  payload: ManagedUserPayload,
  existingAuthUserId?: string | null
) => {
  const client = requireSupabaseAdmin();
  const email = normalizeManagedEmail(payload);
  const normalizedPassword = payload.password && payload.password.length >= 6 ? payload.password : undefined;

  let authUserId = existingAuthUserId ?? null;

  if (!authUserId) {
    const authUsers = await listAllAuthUsers();
    const matchedUser = authUsers.find((user) => user.email?.toLowerCase() === email);
    authUserId = matchedUser?.id ?? null;
  }

  if (authUserId) {
    const currentUser = await getAuthUserById(authUserId);
    const { data, error } = await client.auth.admin.updateUserById(authUserId, {
      email,
      password: normalizedPassword,
      email_confirm: true,
      user_metadata: {
        ...(currentUser.user_metadata ?? {}),
        ...buildUserMetadata(payload),
      },
    });

    if (error) throw error;
    return data.user.id;
  }

  if (payload.password && payload.password.length < 6) {
    throw new Error('Password must be at least 6 characters for Supabase accounts.');
  }

  const { data, error } = await client.auth.admin.createUser({
    email,
    password: normalizedPassword ?? randomUUID(),
    email_confirm: true,
    user_metadata: buildUserMetadata(payload),
  });

  if (error) throw error;
  if (!data.user) {
    throw new Error(`Failed to create auth user for ${payload.username}`);
  }

  return data.user.id;
};

export const updateAuthLoginStamp = async (authUserId: string, lastLoginAt: string) => {
  const client = requireSupabaseAdmin();
  const currentUser = await getAuthUserById(authUserId);

  const { error } = await client.auth.admin.updateUserById(authUserId, {
    user_metadata: {
      ...(currentUser.user_metadata ?? {}),
      last_login_at: lastLoginAt,
    },
  });

  if (error) throw error;
};

export const upsertPublicUser = async (
  payload: ManagedUserPayload,
  authUserId: string
) => {
  const client = requireSupabaseAdmin();
  const { data, error } = await client
    .from('users')
    .upsert(
      {
        username: payload.username,
        role: payload.role,
        auth_user_id: authUserId,
      },
      {
        onConflict: 'username',
      }
    )
    .select('id, username, role, auth_user_id, created_at')
    .single();

  if (error) throw error;
  return data as PublicUserRecord;
};
