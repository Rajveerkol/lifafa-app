import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AdminDashboardStats } from '../types';

export const adminService = {
  /**
   * Fetch admin overview statistics (guarded by backend role check)
   */
  async getAdminStats(): Promise<{ data: AdminDashboardStats | null; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return {
        data: {
          totalUsers: 148,
          totalBots: 64,
          totalPaidOrders: 58,
          totalRevenue: 57422.00,
          pendingWithdrawals: 2,
          generatedAt: new Date().toISOString(),
        },
        error: null,
      };
    }

    try {
      const { data, error } = await (supabase.rpc as any)('get_admin_dashboard_stats');
      if (error || !data) return { data: null, error };

      return {
        data: {
          totalUsers: data.total_users || 0,
          totalBots: data.total_bots || 0,
          totalPaidOrders: data.total_paid_orders || 0,
          totalRevenue: Number(data.total_revenue || 0),
          pendingWithdrawals: data.pending_withdrawals || 0,
          generatedAt: data.generated_at,
        },
        error: null,
      };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },
};
