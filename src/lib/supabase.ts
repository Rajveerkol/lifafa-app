/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

// Authoritative Live Supabase project credentials
const DEFAULT_SUPABASE_URL = 'https://ozyximxfacypstcvzmxz.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_UFfiGVu-GMObpIICyN-AwA_WpWLfsiK';

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
