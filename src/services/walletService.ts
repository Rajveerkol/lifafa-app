import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';

export type WalletRow = Database['public']['Tables']['wallets']['Row'];

export interface WithdrawalResult {
  success: boolean;
  withdrawalId: string;
  transactionId: string;
  referenceId: string;
  amount: number;
  newBalance: number;
  status: 'pending';
}

export const walletService = {
  /**
   * Fetch current real user's wallet record from Supabase
   */
  async getWallet(userId: string): Promise<{ data: WalletRow | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      return { data: (data as WalletRow) || null, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  /**
   * Submit withdrawal request via atomic PostgreSQL RPC function
   */
  async requestWithdrawal(
    amount: number,
    payoutDetails: { upiId?: string; accountNumber?: string; ifsc?: string; name?: string }
  ): Promise<{ data: WithdrawalResult | null; error: Error | null }> {
    if (!amount || amount < 50) {
      return { data: null, error: new Error('Minimum withdrawal amount is ₹50.00') };
    }

    try {
      const { data, error } = await (supabase.rpc as any)('request_withdrawal', {
        p_amount: amount,
        p_payout_details: payoutDetails,
      });

      if (error) {
        return { data: null, error };
      }

      return {
        data: {
          success: Boolean((data as any)?.success),
          withdrawalId: (data as any)?.withdrawal_id,
          transactionId: (data as any)?.transaction_id,
          referenceId: (data as any)?.reference_id,
          amount: Number((data as any)?.amount),
          newBalance: Number((data as any)?.new_balance),
          status: 'pending',
        },
        error: null,
      };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },
};
