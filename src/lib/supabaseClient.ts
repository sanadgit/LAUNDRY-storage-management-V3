import { createClient } from '@supabase/supabase-js';

type RuntimeConfig = Partial<{
  VITE_SUPABASE_ENABLED: string;
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_USE_SUPABASE: string;
  VITE_DB_PROVIDER: string;
  VITE_DB_ACTIVE: string;
}>;

const runtimeConfig: RuntimeConfig | undefined = (globalThis as any).__RUNTIME_CONFIG__;

const supabaseUrl = (runtimeConfig?.VITE_SUPABASE_URL ?? (import.meta.env.VITE_SUPABASE_URL as string | undefined))?.trim();
const supabaseAnonKey = (runtimeConfig?.VITE_SUPABASE_ANON_KEY ?? (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined))?.trim();

const enabledRaw =
  (runtimeConfig?.VITE_SUPABASE_ENABLED ??
    runtimeConfig?.VITE_USE_SUPABASE ??
    (import.meta.env.VITE_SUPABASE_ENABLED as string | undefined) ??
    (import.meta.env.VITE_USE_SUPABASE as string | undefined))?.trim().toLowerCase();

const supabaseExplicitEnabled = enabledRaw === 'true' ? true : enabledRaw === 'false' ? false : undefined;

// Default behavior:
// - If URL + anon key are present, Supabase is enabled unless explicitly disabled.
// - This makes static deployments safer: you can provide runtime config in `public/runtime-config.js`
//   without needing to rebuild the app just to flip an enable flag.
export const isSupabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey) && (supabaseExplicitEnabled ?? true);
export const supabase = isSupabaseEnabled ? createClient(supabaseUrl as string, supabaseAnonKey as string) : null;

const dbProviderRaw =
  (runtimeConfig?.VITE_DB_ACTIVE ??
    runtimeConfig?.VITE_DB_PROVIDER ??
    (import.meta.env.VITE_DB_ACTIVE as string | undefined) ??
    (import.meta.env.VITE_DB_PROVIDER as string | undefined) ??
    '')?.trim().toLowerCase();

export const backendDbProvider: 'postgres' | 'sqlite' =
  dbProviderRaw === 'postgres' ? 'postgres' : 'sqlite';
export const backendDbLabel = backendDbProvider === 'postgres' ? 'Postgres' : 'SQLite';
