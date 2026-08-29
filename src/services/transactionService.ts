import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Database } from '../types/database.types';

export type TransactionRow = Database['public']['Tables']['transactions']['Row'];

export const transactionService = {
  async getTransactions(
    userId: string,
    limit = 50
  ): Promise<{ data: TransactionRow[]; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data: data || [], error };
  },
};
