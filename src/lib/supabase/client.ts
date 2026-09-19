import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://idrkfjhgiodhbstktmcs.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkcmtmamhnaW9kaGJzdGt0bWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4MTQ1MjYsImV4cCI6MjEwNTM5MDUyNn0.zwmZ6Bwl6zsngmE44uT_SjVW1iFCGzC3SNXdO7UgaCk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export default supabase;
