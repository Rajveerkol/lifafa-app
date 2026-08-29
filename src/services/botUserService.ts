import { supabase } from '../lib/supabase';
import { telegramBotEngine } from './telegramBotEngine';
import { BotUser } from '../types';

export const botUserService = {
  /**
   * Sync and import all real subscribers from Telegram getUpdates API and execute auto-replies
   */
  async syncSubscribersFromTelegram(botId: string): Promise<{ success: boolean; count: number; total: number; error?: string }> {
    const res = await telegramBotEngine.processUpdatesAndExecuteAutomations(botId);
    return {
      success: res.success,
      count: res.newUsersCount,
      total: res.totalUsers,
      error: res.error,
    };
  },

  /**
   * Get real subscribers of a bot with search, status filtering, and pagination
   */
  async getBotUsers(
    botId: string,
    searchQuery = '',
    statusFilter: 'all' | 'active' | 'inactive' | 'new' = 'all',
    limit = 50
  ): Promise<{ data: BotUser[]; total: number; error: Error | null }> {
    try {
      let query = supabase
        .from('bot_users')
        .select('*', { count: 'exact' })
        .eq('bot_id', botId)
        .order('last_seen_at', { ascending: false })
        .limit(limit);

      // Apply status filtering
      if (statusFilter === 'active') {
        query = query.eq('is_active', true);
      } else if (statusFilter === 'inactive') {
        query = query.eq('is_active', false);
      } else if (statusFilter === 'new') {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('first_seen_at', sevenDaysAgo);
      }

      // Apply search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim();
        query = query.or(`telegram_username.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`);
      }

      const { data, count, error } = await query;
      if (error || !data) {
        return { data: [], total: 0, error };
      }

      const mapped: BotUser[] = (data as any[]).map((u) => ({
        id: u.id,
        botId: u.bot_id,
        telegramUserId: Number(u.telegram_user_id),
        telegramUsername: u.telegram_username || undefined,
        firstName: u.first_name || undefined,
        lastName: u.last_name || undefined,
        isActive: u.is_active,
        firstSeenAt: u.first_seen_at,
        lastSeenAt: u.last_seen_at,
      }));

      return { data: mapped, total: count || mapped.length, error: null };
    } catch (err: any) {
      return { data: [], total: 0, error: err };
    }
  },
};
