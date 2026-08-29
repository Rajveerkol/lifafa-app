import { supabase } from '../lib/supabase';
import { botUserService } from './botUserService';
import { BotBroadcast } from '../types';

export const broadcastService = {
  /**
   * Directly send real Telegram broadcast messages to all active bot subscribers
   */
  async createBroadcast(
    botId: string,
    message: string,
    targetAudience: 'all' | 'active' | 'new' | 'inactive' = 'all',
    buttonText?: string,
    buttonUrl?: string
  ): Promise<{ data: any; error: Error | null }> {
    try {
      // 1. Fetch bot and token
      const { data: bot, error: botError } = await supabase
        .from('bots')
        .select('*')
        .eq('id', botId)
        .single();

      if (botError || !bot) {
        return { data: null, error: new Error('Bot not found.') };
      }

      const token = bot.encrypted_token;
      if (!token || !token.includes(':')) {
        return {
          data: null,
          error: new Error('Bot token is not linked. Please reconnect your BotFather token in Manage Bot first.'),
        };
      }

      // 2. Sync latest subscribers from Telegram getUpdates
      await botUserService.syncSubscribersFromTelegram(botId);

      // 3. Fetch recipient subscribers from bot_users table
      let userQuery = supabase
        .from('bot_users')
        .select('*')
        .eq('bot_id', botId);

      if (targetAudience === 'active') {
        userQuery = userQuery.eq('is_active', true);
      } else if (targetAudience === 'inactive') {
        userQuery = userQuery.eq('is_active', false);
      } else if (targetAudience === 'new') {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        userQuery = userQuery.gte('first_seen_at', sevenDaysAgo);
      }

      const { data: subscribers, error: usersError } = await userQuery;

      if (usersError) return { data: null, error: usersError };

      if (!subscribers || subscribers.length === 0) {
        return {
          data: null,
          error: new Error(
            `No Telegram subscribers found yet for this bot. Please open @${bot.username.replace('@', '')} on Telegram and send /start to subscribe before broadcasting!`
          ),
        };
      }

      // 4. Dispatch Telegram sendMessage in real-time
      let sentCount = 0;
      let failedCount = 0;

      const broadcastPayload: any = {
        text: message.trim(),
        parse_mode: 'HTML',
      };

      if (buttonText && buttonUrl) {
        broadcastPayload.reply_markup = {
          inline_keyboard: [[{ text: buttonText.trim(), url: buttonUrl.trim() }]],
        };
      }

      for (const recipient of subscribers) {
        try {
          const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...broadcastPayload,
              chat_id: recipient.telegram_user_id,
            }),
          });

          const json = await res.json();
          if (json.ok) {
            sentCount++;
          } else {
            failedCount++;
          }
        } catch {
          failedCount++;
        }
      }

      // 5. Save broadcast record into bot_broadcasts table
      const { data: { user } } = await supabase.auth.getUser();

      const { data: broadcastRecord, error: insertError } = await supabase
        .from('bot_broadcasts')
        .insert({
          bot_id: botId,
          user_id: user?.id || bot.user_id,
          message: message.trim(),
          button_text: buttonText?.trim() || null,
          button_url: buttonUrl?.trim() || null,
          target_audience: targetAudience,
          status: 'completed',
          total_recipients: subscribers.length,
          sent_count: sentCount,
          failed_count: failedCount,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.warn('Broadcast record insert warning:', insertError);
      }

      return {
        data: {
          broadcast_id: broadcastRecord?.id || 'bcast_' + Date.now(),
          total_recipients: subscribers.length,
          sent_count: sentCount,
          failed_count: failedCount,
          status: 'completed',
        },
        error: null,
      };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  /**
   * Fetch all broadcast history for a bot
   */
  async getBotBroadcasts(botId: string): Promise<{ data: BotBroadcast[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('bot_broadcasts')
        .select('*')
        .eq('bot_id', botId)
        .order('created_at', { ascending: false });

      if (error || !data) return { data: [], error };

      const mapped: BotBroadcast[] = (data as any[]).map((row) => ({
        id: row.id,
        botId: row.bot_id,
        userId: row.user_id,
        message: row.message,
        buttonText: row.button_text,
        buttonUrl: row.button_url,
        targetAudience: row.target_audience,
        status: row.status,
        totalRecipients: row.total_recipients || 0,
        sentCount: row.sent_count || 0,
        failedCount: row.failed_count || 0,
        createdAt: row.created_at,
        completedAt: row.completed_at,
      }));

      return { data: mapped, error: null };
    } catch (err: any) {
      return { data: [], error: err };
    }
  },
};
