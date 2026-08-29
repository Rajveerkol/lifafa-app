import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { BotUser } from '../types';

export const botUserService = {
  /**
   * Get real subscribers of a bot with search, status filtering, and pagination
   */
  async getBotUsers(
    botId: string,
    searchQuery = '',
    statusFilter: 'all' | 'active' | 'inactive' | 'new' = 'all',
    limit = 50
  ): Promise<{ data: BotUser[]; total: number; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return {
        data: [
          {
            id: 'bu_1',
            botId,
            telegramUserId: 569842103,
            telegramUsername: '@alex_dev',
            firstName: 'Alex',
            lastName: 'Kumar',
            isActive: true,
            firstSeenAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            lastSeenAt: new Date().toISOString(),
          },
          {
            id: 'bu_2',
            botId,
            telegramUserId: 789123456,
            telegramUsername: '@priya_sharma',
            firstName: 'Priya',
            lastName: 'Sharma',
            isActive: true,
            firstSeenAt: new Date(Date.now() - 86400000 * 5).toISOString(),
            lastSeenAt: new Date(Date.now() - 86400000 * 1).toISOString(),
          },
          {
            id: 'bu_3',
            botId,
            telegramUserId: 998877665,
            telegramUsername: '@rohit_crypto',
            firstName: 'Rohit',
            lastName: 'Verma',
            isActive: false,
            firstSeenAt: new Date(Date.now() - 86400000 * 45).toISOString(),
            lastSeenAt: new Date(Date.now() - 86400000 * 35).toISOString(),
          },
        ],
        total: 3,
        error: null,
      };
    }

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
  },
};
