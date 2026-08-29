/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

// Authoritative Live Supabase project credentials
const DEFAULT_SUPABASE_URL = 'https://ozyximxfacypstcvzmxz.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96eXhpbXhmYWN5cHN0Y3Z6bXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5OTYxMDQsImV4cCI6MjEwMzU3MjEwNH0.-PzrwWTZZkPMJIrAbkRyONqgLjrZwXSgopgstSIcjWI';

const supabaseUrl =
  (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder-project')
);

// Centralized typed Supabase client
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
