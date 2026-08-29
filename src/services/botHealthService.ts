import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { BotHealth } from '../types';

export const botHealthService = {
  /**
   * Fetch bot health diagnostics from PostgreSQL RPC
   */
  async getHealthStatus(botId: string): Promise<{ data: BotHealth | null; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return {
        data: {
          botId,
          name: 'Creatlifafa Official Bot',
          username: '@Creatlifafa_bot',
          telegramBotId: '7689123456',
          status: 'Active',
          isConnected: true,
          webhookUrl: 'https://demo.supabase.co/functions/v1/telegram-webhook',
          lastSyncedAt: new Date().toISOString(),
          telegramConnection: 'CONNECTED',
          webhookStatus: 'ACTIVE',
          databaseStatus: 'HEALTHY',
          subscriberTracking: 'ACTIVE',
          totalSubscribers: 1420,
          activeChannelsCount: 1,
          activeAutomationsCount: 2,
          pendingBroadcastsCount: 0,
          totalMessagesProcessed: 8940,
          latencyMs: 142,
        },
        error: null,
      };
    }

    try {
      const { data, error } = await (supabase.rpc as any)('get_bot_health_status', {
        p_bot_id: botId,
      });

      if (error || !data) return { data: null, error };

      const health: BotHealth = {
        botId: data.bot_id,
        name: data.name,
        username: data.username,
        telegramBotId: data.telegram_bot_id,
        status: data.status,
        isConnected: data.is_connected,
        webhookUrl: data.webhook_url,
        lastSyncedAt: data.last_synced_at,
        telegramConnection: data.telegram_connection,
        webhookStatus: data.webhook_status,
        databaseStatus: data.database_status,
        subscriberTracking: data.subscriber_tracking,
        totalSubscribers: data.total_subscribers,
        activeChannelsCount: data.active_channels_count,
        activeAutomationsCount: data.active_automations_count,
        pendingBroadcastsCount: data.pending_broadcasts_count,
        totalMessagesProcessed: data.total_messages_processed,
      };

      return { data: health, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  /**
   * Authoritatively test Telegram API connection & latency via Edge Function
   */
  async testConnection(botId: string): Promise<{
    success: boolean;
    latencyMs?: number;
    botStatus?: string;
    webhookStatus?: string;
    pendingUpdates?: number;
    lastErrorMessage?: string;
    error?: string;
  }> {
    if (!isSupabaseConfigured) {
      return {
        success: true,
        latencyMs: 128,
        botStatus: 'CONNECTED',
        webhookStatus: 'ACTIVE',
        pendingUpdates: 0,
      };
    }

    try {
      const { data, error } = await supabase.functions.invoke('telegram-test-connection', {
        body: { bot_id: botId },
      });

      if (error) return { success: false, error: error.message };

      return {
        success: Boolean(data?.success),
        latencyMs: data?.latency_ms,
        botStatus: data?.bot_status,
        webhookStatus: data?.webhook_status,
        pendingUpdates: data?.pending_updates,
        lastErrorMessage: data?.last_error_message,
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};
