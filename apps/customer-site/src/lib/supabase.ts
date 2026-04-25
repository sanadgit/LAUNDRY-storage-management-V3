import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseClient: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
};

// For backward compatibility if needed, but exporting it as null if vars missing
// However, it's better to use getSupabase() everywhere.
// Since createClient throws on empty URL, we can't export the result of a call directly.

export interface PriceItem {
  barcode: string;
  name_en: string;
  name_ar: string;
  category: 'men' | 'women' | 'kids' | 'home';
  wash_dry: string;
  wash_iron_urgent: string;
  iron: string;
  iron_urgent: string;
  icon: string;
}
