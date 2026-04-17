import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const client = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const normalizeDateKey = (value: string | null | undefined) => {
  if (!value) return '';

  const normalizedValue = /z|[+-]\d{2}:\d{2}$/i.test(value)
    ? value
    : `${value.replace(' ', 'T')}Z`;

  return new Date(normalizedValue).toISOString();
};

const blanketKey = (row: any) =>
  JSON.stringify([
    row.blanket_number,
    row.store,
    row.row,
    row.column,
    row.status,
    normalizeDateKey(row.created_at),
  ]);

const logKey = (row: any) =>
  JSON.stringify([
    row.blanket_number,
    row.action,
    row.user ?? 'system',
    row.store ?? '',
    row.row ?? '',
    row.column ?? '',
    row.status ?? '',
    normalizeDateKey(row.timestamp),
  ]);

const chunk = <T,>(items: T[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, index * size + size)
  );

const dedupeTable = async (table: 'blankets' | 'logs', keyBuilder: (row: any) => string) => {
  const dateColumn = table === 'blankets' ? 'created_at' : 'timestamp';
  const { data, error } = await client
    .from(table)
    .select('*')
    .order(dateColumn, { ascending: true });

  if (error) throw error;

  const seen = new Set<string>();
  const duplicateIds: number[] = [];

  for (const row of data ?? []) {
    const key = keyBuilder(row);
    if (seen.has(key)) {
      duplicateIds.push(row.id);
    } else {
      seen.add(key);
    }
  }

  for (const ids of chunk(duplicateIds, 100)) {
    const { error: deleteError } = await client.from(table).delete().in('id', ids);
    if (deleteError) throw deleteError;
  }

  return duplicateIds.length;
};

const blanketsDeleted = await dedupeTable('blankets', blanketKey);
const logsDeleted = await dedupeTable('logs', logKey);

console.log(`Removed ${blanketsDeleted} duplicate blankets and ${logsDeleted} duplicate logs.`);
