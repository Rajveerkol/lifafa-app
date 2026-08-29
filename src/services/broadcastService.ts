import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { BotBroadcast } from '../types';

export const broadcastService = {
  /**
   * Create a queued broadcast job authoritatively via RPC
   */
  async createBroadcast(
    botId: string,
    message: string,
    targetAudience: 'all' | 'active' | 'new' | 'inactive' = 'all',
    buttonText?: string,
    buttonUrl?: string
  ): Promise<{ data: any; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return {
        data: {
          broadcast_id: 'bcast_demo_1',
          total_recipients: 1420,
          status: 'pending',
        },
        error: null,
      };
    }

    try {
      const { data, error } = await (supabase.rpc as any)('create_broadcast_job', {
        p_bot_id: botId,
        p_message: message.trim(),
        p_target_audience: targetAudience,
        p_button_text: buttonText?.trim() || null,
        p_button_url: buttonUrl?.trim() || null,
      });

      if (error) return { data: null, error };

      // Trigger Edge Function worker asynchronously
      if (data?.broadcast_id) {
        supabase.functions.invoke('telegram-broadcast-worker', {
          body: { broadcast_id: data.broadcast_id, batch_size: 50 },
        }).catch((e) => console.warn('Worker invocation notice:', e));
      }

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  /**
   * Fetch all broadcast jobs for a bot
   */
  async getBotBroadcasts(botId: string): Promise<{ data: BotBroadcast[]; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return {
        data: [
          {
            id: 'bcast_1',
            botId,
            userId: 'user_1',
            message: '🎉 Special Weekend Lifafa Giveaway! Click the link below to claim rewards.',
            buttonText: 'Claim Giveaway',
            buttonUrl: 'https://creatlifafa.com',
            targetAudience: 'all',
            status: 'completed',
            totalRecipients: 1420,
            sentCount: 1412,
            failedCount: 8,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            completedAt: new Date(Date.now() - 86000000).toISOString(),
          },
        ],
        error: null,
      };
    }

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
      totalRecipients: row.total_recipients,
      sentCount: row.sent_count,
      failedCount: row.failed_count,
      createdAt: row.created_at,
      completedAt: row.completed_at,
    }));

    return { data: mapped, error: null };
  },
};
