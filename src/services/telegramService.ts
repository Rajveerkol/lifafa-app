import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Bot } from '../types';

export interface ConnectBotParams {
  orderId?: string;
  planId?: string;
  botName: string;
  token: string;
}

export interface ConnectBotResponse {
  success: boolean;
  bot?: Bot;
  error?: string;
}

export const telegramService = {
  /**
   * Connect and verify Telegram bot authoritatively via Supabase Edge Function
   */
  async connectBot(params: ConnectBotParams): Promise<ConnectBotResponse> {
    if (!params.token || !params.token.includes(':')) {
      return { success: false, error: 'Invalid BotFather token format.' };
    }

    if (!isSupabaseConfigured) {
      // Offline / Local Demo fallback
      return {
        success: true,
        bot: {
          id: 'bot_demo_1',
          name: params.botName || 'Official Demo Bot',
          username: '@OfficialDemo_bot',
          telegramBotId: '7689123456',
          status: 'Active',
          planSlug: 'basic',
          planName: 'Basic Bot',
          planPriceDisplay: '₹99',
          isConnected: true,
          totalUsers: 1,
          totalMessages: 4,
          createdOn: new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
        },
      };
    }

    try {
      // Call Supabase Edge Function directly
      const { data, error } = await supabase.functions.invoke('connect-telegram-bot', {
        body: {
          order_id: params.orderId,
          plan_id: params.planId,
          bot_name: params.botName,
          token: params.token.trim(),
        },
      });

      if (error) {
        return { success: false, error: error.message || 'Unable to connect Telegram bot.' };
      }

      if (data?.error) {
        return { success: false, error: data.error };
      }

      return {
        success: true,
        bot: {
          id: data.bot.id,
          name: data.bot.name,
          username: data.bot.username,
          telegramBotId: data.bot.telegram_bot_id,
          status: data.bot.status,
          planSlug: data.bot.plan_slug,
          isConnected: true,
          totalUsers: 0,
          totalMessages: 0,
          createdOn: new Date(data.bot.created_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
        },
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Telegram connection failed.' };
    }
  },

  /**
   * Disconnect Telegram bot safely
   */
  async disconnectBot(botId: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      return { success: true };
    }

    try {
      const { data, error } = await (supabase.rpc as any)('disconnect_bot_secure', {
        p_bot_id: botId,
      });

      if (error) return { success: false, error: error.message };
      return { success: Boolean((data as any)?.success) };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};
