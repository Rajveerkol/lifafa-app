import { supabase } from '../lib/supabase';
import { BotUser } from '../types';

export const botUserService = {
  /**
   * Sync and import all real subscribers from Telegram getUpdates API
   */
  async syncSubscribersFromTelegram(botId: string): Promise<{ success: boolean; count: number; total: number; error?: string }> {
    try {
      // 1. Fetch bot and token
      const { data: bot, error: botError } = await supabase
        .from('bots')
        .select('*')
        .eq('id', botId)
        .single();

      if (botError || !bot) {
        return { success: false, count: 0, total: 0, error: 'Bot not found.' };
      }

      const token = bot.encrypted_token;
      if (!token || !token.includes(':')) {
        return {
          success: false,
          count: 0,
          total: bot.total_users || 0,
          error: 'Bot token not configured. Please link your BotFather token in Manage Bot.',
        };
      }

      // 2. Fetch updates from Telegram API
      let newCount = 0;
      try {
        const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=-100&limit=100`);
        const json = await res.json();

        if (json.ok && Array.isArray(json.result)) {
          const userMap = new Map<number, { id: number; username?: string; first_name?: string; last_name?: string }>();

          for (const update of json.result) {
            const fromUser =
              update.message?.from ||
              update.callback_query?.from ||
              update.my_chat_member?.from ||
              update.chat_member?.from;

            if (fromUser && fromUser.id && !fromUser.is_bot) {
              userMap.set(fromUser.id, {
                id: fromUser.id,
                username: fromUser.username,
                first_name: fromUser.first_name,
                last_name: fromUser.last_name,
              });
            }
          }

          // 3. Upsert unique users into bot_users table
          for (const [tgId, u] of userMap.entries()) {
            await supabase.from('bot_users').upsert(
              {
                bot_id: botId,
                telegram_user_id: tgId,
                telegram_username: u.username ? `@${u.username}` : null,
                first_name: u.first_name || 'Subscriber',
                last_name: u.last_name || null,
                is_active: true,
                last_seen_at: new Date().toISOString(),
              },
              { onConflict: 'bot_id,telegram_user_id' }
            );
            newCount++;
          }
        }
      } catch (tgErr: any) {
        console.warn('Telegram getUpdates error:', tgErr);
      }

      // 4. Update total user count on the bots table
      const { count: totalUsers } = await supabase
        .from('bot_users')
        .select('*', { count: 'exact', head: true })
        .eq('bot_id', botId);

      const finalCount = totalUsers || 0;

      await supabase
        .from('bots')
        .update({
          total_users: finalCount,
          last_synced_at: new Date().toISOString(),
        })
        .eq('id', botId);

      return {
        success: true,
        count: newCount,
        total: finalCount,
      };
    } catch (err: any) {
      return { success: false, count: 0, total: 0, error: err.message };
    }
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
