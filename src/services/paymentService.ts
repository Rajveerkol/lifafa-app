import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface PaymentOrderResult {
  success: boolean;
  orderId?: string;
  referenceId: string;
  amount: number;
  currency: string;
  providerConfigured: boolean;
  provider?: string;
  message?: string;
}

export const paymentService = {
  /**
   * Check whether live payment provider credentials are configured in the environment
   */
  isProviderConfigured(): boolean {
    const rzpKey = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID;
    return Boolean(rzpKey && rzpKey.length > 5);
  },

  /**
   * Initialize a deposit order securely via Supabase RPC / Edge Function
   */
  async createDepositOrder(
    amount: number,
    paymentMethod: 'upi' | 'qr' | 'card' = 'upi'
  ): Promise<{ data: PaymentOrderResult | null; error: Error | null }> {
    if (!amount || amount < 10) {
      return { data: null, error: new Error('Minimum deposit amount is ₹10.00') };
    }

    if (!isSupabaseConfigured) {
      const mockRef = 'DEP/' + Math.random().toString(36).substring(2, 9).toUpperCase();
      return {
        data: {
          success: true,
          referenceId: mockRef,
          amount,
          currency: 'INR',
          providerConfigured: false,
          message: 'Payment gateway configuration required for live processing (Demo Mode).',
        },
        error: null,
      };
    }

    try {
      const { data, error } = await (supabase.rpc as any)('create_deposit_order', {
        p_amount: amount,
        p_payment_method: paymentMethod,
      });

      if (error) {
        return { data: null, error };
      }

      const isConfigured = this.isProviderConfigured();

      return {
        data: {
          success: true,
          orderId: (data as any)?.transaction_id,
          referenceId: (data as any)?.reference_id,
          amount: Number((data as any)?.amount || amount),
          currency: (data as any)?.currency || 'INR',
          providerConfigured: isConfigured,
          message: isConfigured
            ? 'Order initialized with payment provider.'
            : 'Payment gateway configuration required for live online processing.',
        },
        error: null,
      };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },
};
