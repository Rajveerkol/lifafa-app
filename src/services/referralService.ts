import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Database } from '../types/database.types';

export type ReferralRow = Database['public']['Tables']['referrals']['Row'];

export const referralService = {
  async getReferrals(userId: string): Promise<{ data: ReferralRow[]; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false });

    return { data: data || [], error };
  },
};
