import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { BotOrder } from '../types';

export interface WalletPurchaseResult {
  success: boolean;
  orderId: string;
  transactionId: string;
  amountPaid: number;
  newBalance: number;
  status: 'paid';
}

export const botOrderService = {
  /**
   * Create pending bot order fetching authoritative price from database
   */
  async createBotOrder(
    botPlanId: string
  ): Promise<{ data: any | null; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return {
        data: {
          order_id: 'ord_' + Math.random().toString(36).substring(2, 9),
          plan_id: botPlanId,
          status: 'pending',
        },
        error: null,
      };
    }

    try {
      const { data, error } = await (supabase.rpc as any)('create_bot_order', {
        p_bot_plan_id: botPlanId,
      });

      return { data, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  /**
   * Purchase bot plan using wallet balance (Atomic, row-locked, double-spend protected)
   */
  async purchaseBotWithWallet(
    botPlanId: string
  ): Promise<{ data: WalletPurchaseResult | null; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return {
        data: {
          success: true,
          orderId: 'ORD/BOT-DEMO',
          transactionId: 'TX/BOT-DEMO',
          amountPaid: 399,
          newBalance: 0,
          status: 'paid',
        },
        error: null,
      };
    }

    try {
      const { data, error } = await (supabase.rpc as any)('process_wallet_bot_purchase', {
        p_bot_plan_id: botPlanId,
      });

      if (error) {
        return { data: null, error };
      }

      return {
        data: {
          success: Boolean((data as any)?.success),
          orderId: (data as any)?.order_id,
          transactionId: (data as any)?.transaction_id,
          amountPaid: Number((data as any)?.amount_paid),
          newBalance: Number((data as any)?.new_balance),
          status: 'paid',
        },
        error: null,
      };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  /**
   * Retrieve orders created by authenticated user
   */
  async getUserBotOrders(
    userId: string
  ): Promise<{ data: BotOrder[]; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('bot_orders')
      .select('*, bot_plans(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return { data: [], error };
    }

    const mapped: BotOrder[] = (data as any[]).map((row) => ({
      id: row.id,
      userId: row.user_id,
      botPlanId: row.bot_plan_id,
      botId: row.bot_id || undefined,
      amount: Number(row.amount),
      status: row.status,
      paymentReference: row.payment_reference || undefined,
      metadata: row.metadata || {},
      createdAt: row.created_at,
      planName: row.bot_plans?.name || 'Bot Plan',
    }));

    return { data: mapped, error: null };
  },
};
