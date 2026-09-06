import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

declare const process: any;

// Environment variable extraction with cross-platform fallback for Vite & Next.js
const supabaseUrl: string =
  (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_SUPABASE_URL || process.env?.VITE_SUPABASE_URL)) ||
  (typeof import.meta !== 'undefined' && ((import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL || (import.meta as any).env?.VITE_SUPABASE_URL)) ||
  'https://buvjeybfvuiidcfmsunt.supabase.co';

const supabaseAnonKey: string =
  (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env?.VITE_SUPABASE_ANON_KEY)) ||
  (typeof import.meta !== 'undefined' && ((import.meta as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY)) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1dmpleWJmdnVpaWRjZm1zdW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMTUyODEsImV4cCI6MjEwMzU5MTI4MX0.Reg-7m5Yoz5TMhE-_tP3lWyhU-E0Z9-ieGa3Q59_0TI';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Check environment variables.');
}

// Global Supabase singleton client instance
export const supabase: SupabaseClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

// Factory helper function for components expecting createClient()
export function createClient(): SupabaseClient {
  return supabase;
}

export default supabase;
