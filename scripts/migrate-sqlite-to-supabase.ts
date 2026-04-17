import 'dotenv/config';
import { migrateSqliteToSupabase } from '../src/server/migrateSqliteToSupabase';

try {
  const summary = await migrateSqliteToSupabase();
  console.log('SQLite -> Supabase migration completed successfully.');
  console.table(summary);
} catch (error) {
  console.error('SQLite -> Supabase migration failed.');
  console.error(error);
  process.exit(1);
}
