import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Bot, BotChannel, BotSettings, BotActivityLog, BotReferral, MenuItem } from '../types';

export const botService = {
  /**
   * Get all bots owned by user
   */
  async getUserBots(userId: string): Promise<{ data: Bot[]; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return {
        data: [
          {
            id: 'bot_demo_1',
            name: 'Creatlifafa Official Bot',
            username: '@Creatlifafa_bot',
            telegramBotId: '7689123456',
            status: 'Active',
            planSlug: 'basic',
            planName: 'Basic Bot',
            planPriceDisplay: '₹99',
            isConnected: true,
            totalUsers: 1420,
            totalMessages: 8940,
            createdOn: '24 Aug 2026',
            bonusAmount: 10,
            referReward: 5,
          },
        ],
        error: null,
      };
    }

    const { data, error } = await supabase
      .from('bots')
      .select('*, bot_plans(name, price_display, slug)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return { data: [], error };
    }

    const mapped: Bot[] = (data as any[]).map((row) => ({
      id: row.id,
      userId: row.user_id,
      botPlanId: row.bot_plan_id,
      botOrderId: row.bot_order_id,
      name: row.name,
      username: row.username,
      telegramBotId: row.telegram_bot_id,
      status: row.status,
      planSlug: row.plan_slug || row.bot_plans?.slug || 'basic',
      planName: row.bot_plans?.name || 'Basic Bot',
      planPriceDisplay: row.bot_plans?.price_display || '₹99',
      isConnected: row.is_connected ?? true,
      avatarUrl: row.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${row.id}`,
      qrCodeUrl: row.qr_code_url,
      channelsCount: row.channels_count || 0,
      bonusAmount: Number(row.bonus_amount || 10),
      referReward: Number(row.refer_reward || 5),
      totalUsers: row.total_users || 0,
      totalMessages: row.total_messages || 0,
      createdOn: new Date(row.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      lastSyncedAt: row.last_synced_at,
    }));

    return { data: mapped, error: null };
  },

  /**
   * Get single bot by ID
   */
  async getBotById(botId: string): Promise<{ data: Bot | null; error: Error | null }> {
    if (!isSupabaseConfigured) {
      const botsRes = await this.getUserBots('demo');
      return { data: botsRes.data[0] || null, error: null };
    }

    const { data, error } = await supabase
      .from('bots')
      .select('*, bot_plans(name, price_display, slug)')
      .eq('id', botId)
      .single();

    if (error || !data) {
      return { data: null, error };
    }

    const row = data as any;
    const bot: Bot = {
      id: row.id,
      userId: row.user_id,
      botPlanId: row.bot_plan_id,
      botOrderId: row.bot_order_id,
      name: row.name,
      username: row.username,
      telegramBotId: row.telegram_bot_id,
      status: row.status,
      planSlug: row.plan_slug || row.bot_plans?.slug || 'basic',
      planName: row.bot_plans?.name || 'Basic Bot',
      planPriceDisplay: row.bot_plans?.price_display || '₹99',
      isConnected: row.is_connected ?? true,
      avatarUrl: row.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${row.id}`,
      channelsCount: row.channels_count || 0,
      bonusAmount: Number(row.bonus_amount || 10),
      referReward: Number(row.refer_reward || 5),
      totalUsers: row.total_users || 0,
      totalMessages: row.total_messages || 0,
      createdOn: new Date(row.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    };

    return { data: bot, error: null };
  },

  /**
   * Provision bot record upon purchase so the user immediately gets /bot/manage
   */
  async provisionPurchasedBot({
    userId,
    botPlanId,
    botOrderId,
    name,
    username,
    planSlug = 'basic',
  }: {
    userId: string;
    botPlanId: string;
    botOrderId?: string;
    name: string;
    username?: string;
    planSlug?: string;
  }): Promise<{ data: Bot | null; error: Error | null }> {
    const cleanUsername = username
      ? username.startsWith('@')
        ? username
        : `@${username}`
      : `@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}_bot`;
    const cleanName = name || 'My Telegram Bot';

    if (!isSupabaseConfigured) {
      return {
        data: {
          id: 'bot_' + Math.random().toString(36).substring(2, 9),
          userId,
          botPlanId,
          botOrderId,
          name: cleanName,
          username: cleanUsername,
          status: 'Active',
          planSlug,
          planName: 'Purchased Bot',
          planPriceDisplay: 'Active',
          isConnected: true,
          totalUsers: 0,
          totalMessages: 0,
          createdOn: new Date().toLocaleDateString('en-IN'),
        },
        error: null,
      };
    }

    try {
      const { data: botRecord, error } = await supabase
        .from('bots')
        .insert({
          user_id: userId,
          bot_plan_id: botPlanId,
          bot_order_id: botOrderId || null,
          name: cleanName,
          username: cleanUsername,
          status: 'Active',
          plan_slug: planSlug,
          is_connected: false,
          avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${Date.now()}`,
          channels_count: 0,
          bonus_amount: 10.0,
          refer_reward: 5.0,
          total_users: 0,
          total_messages: 0,
        })
        .select('*, bot_plans(name, price_display, slug)')
        .single();

      if (error) return { data: null, error };

      // Initialize default settings
      await supabase.from('bot_settings').upsert(
        {
          bot_id: botRecord.id,
          welcome_message: `Welcome to ${cleanName}! Use /help to get started.`,
          welcome_enabled: true,
        },
        { onConflict: 'bot_id' }
      );

      const mapped: Bot = {
        id: botRecord.id,
        userId: botRecord.user_id,
        botPlanId: botRecord.bot_plan_id || undefined,
        botOrderId: botRecord.bot_order_id || undefined,
        name: botRecord.name,
        username: botRecord.username,
        status: botRecord.status,
        planSlug: botRecord.plan_slug || (botRecord as any).bot_plans?.slug || 'basic',
        planName: (botRecord as any).bot_plans?.name || 'Basic Bot',
        planPriceDisplay: (botRecord as any).bot_plans?.price_display || '₹99',
        isConnected: false,
        totalUsers: 0,
        totalMessages: 0,
        createdOn: new Date(botRecord.created_at).toLocaleDateString('en-IN'),
      };

      return { data: mapped, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  /**
   * Get connected channels for a bot
   */
  async getBotChannels(botId: string): Promise<{ data: BotChannel[]; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('bot_channels')
      .select('*')
      .eq('bot_id', botId)
      .eq('is_active', true);

    if (error || !data) return { data: [], error };

    const mapped: BotChannel[] = (data as any[]).map((c) => ({
      id: c.id,
      botId: c.bot_id,
      channelId: c.channel_id,
      channelTitle: c.channel_title,
      channelUsername: c.channel_username,
      isActive: c.is_active,
      createdAt: c.created_at,
    }));

    return { data: mapped, error: null };
  },

  /**
   * Add a channel requirement to a bot
   */
  async addBotChannel(
    botId: string,
    channelUsername: string
  ): Promise<{ data: any; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return { data: { success: true }, error: null };
    }

    const { data, error } = await supabase.from('bot_channels').insert({
      bot_id: botId,
      channel_id: channelUsername.replace('@', ''),
      channel_title: channelUsername,
      channel_username: channelUsername,
      is_active: true,
    } as any);

    return { data, error };
  },

  /**
   * Remove a channel requirement
   */
  async removeBotChannel(channelId: string): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured) return { error: null };
    const { error } = await supabase.from('bot_channels').delete().eq('id', channelId);
    return { error };
  },

  /**
   * Check channel membership through Edge Function
   */
  async checkChannelMembership(
    botId: string,
    channelId: string,
    telegramUserId: number
  ): Promise<{ isMember: boolean; error?: string }> {
    if (!isSupabaseConfigured) return { isMember: true };

    try {
      const { data, error } = await supabase.functions.invoke('telegram-check-membership', {
        body: { bot_id: botId, channel_id: channelId, telegram_user_id: telegramUserId },
      });

      if (error) return { isMember: false, error: error.message };
      return { isMember: Boolean(data?.is_member) };
    } catch (err: any) {
      return { isMember: false, error: err.message };
    }
  },

  /**
   * Get bot settings
   */
  async getBotSettings(botId: string): Promise<{ data: BotSettings | null; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return {
        data: {
          botId,
          welcomeMessage: 'Welcome to our official Telegram Bot! Use /help to get started.',
          welcomeEnabled: true,
          channelLockEnabled: true,
          channelLockMessage: 'Please join our official channel to continue.',
          customMenu: [],
          referralEnabled: false,
          referralBonus: 5.00,
          minWithdrawal: 50.00,
        },
        error: null,
      };
    }

    const { data, error } = await supabase
      .from('bot_settings')
      .select('*')
      .eq('bot_id', botId)
      .single();

    if (error || !data) return { data: null, error };

    const s = data as any;
    return {
      data: {
        id: s.id,
        botId: s.bot_id,
        welcomeMessage: s.welcome_message || '',
        welcomeEnabled: s.welcome_enabled ?? true,
        channelLockEnabled: s.channel_lock_enabled ?? true,
        channelLockMessage: s.channel_lock_message || '',
        customMenu: (s.custom_menu as MenuItem[]) || [],
        referralEnabled: s.referral_enabled ?? false,
        referralBonus: Number(s.referral_bonus || 5),
        minWithdrawal: Number(s.min_withdrawal || 50),
      },
      error: null,
    };
  },

  /**
   * Update bot settings securely via RPC
   */
  async updateBotSettings(
    botId: string,
    settings: Partial<BotSettings>
  ): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured) return { error: null };

    try {
      const { error } = await (supabase.rpc as any)('update_bot_settings_secure', {
        p_bot_id: botId,
        p_settings: {
          welcome_message: settings.welcomeMessage,
          welcome_enabled: settings.welcomeEnabled,
          channel_lock_enabled: settings.channelLockEnabled,
          channel_lock_message: settings.channelLockMessage,
          referral_enabled: settings.referralEnabled,
          referral_bonus: settings.referralBonus,
          min_withdrawal: settings.minWithdrawal,
        },
      });

      return { error };
    } catch (err: any) {
      return { error: err };
    }
  },

  /**
   * Update custom bot menu via RPC
   */
  async updateCustomMenu(
    botId: string,
    menuItems: MenuItem[]
  ): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured) return { error: null };

    try {
      const { error } = await (supabase.rpc as any)('update_bot_custom_menu', {
        p_bot_id: botId,
        p_menu_items: menuItems,
      });

      return { error };
    } catch (err: any) {
      return { error: err };
    }
  },

  /**
   * Get bot referrals tracking
   */
  async getBotReferrals(botId: string): Promise<{ data: BotReferral[]; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return {
        data: [
          {
            id: 'ref_1',
            botId,
            referrerUserId: 569842103,
            referredUserId: 789123456,
            referralCode: 'REF_ALEX',
            status: 'completed',
            pointsAwarded: 5.00,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
        error: null,
      };
    }

    const { data, error } = await supabase
      .from('bot_referrals')
      .select('*')
      .eq('bot_id', botId)
      .order('created_at', { ascending: false });

    if (error || !data) return { data: [], error };

    const mapped: BotReferral[] = (data as any[]).map((r) => ({
      id: r.id,
      botId: r.bot_id,
      referrerUserId: Number(r.referrer_user_id),
      referredUserId: Number(r.referred_user_id),
      referralCode: r.referral_code,
      status: r.status,
      pointsAwarded: Number(r.points_awarded || 0),
      createdAt: r.created_at,
    }));

    return { data: mapped, error: null };
  },

  /**
   * Get bot activity logs with optional action filter
   */
  async getBotActivityLogs(
    botId: string,
    actionFilter = ''
  ): Promise<{ data: BotActivityLog[]; error: Error | null }> {
    if (!isSupabaseConfigured) return { data: [], error: null };

    let query = supabase
      .from('bot_activity_logs')
      .select('*')
      .eq('bot_id', botId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (actionFilter && actionFilter !== 'all') {
      query = query.ilike('action', `%${actionFilter}%`);
    }

    const { data, error } = await query;

    if (error || !data) return { data: [], error };

    const mapped: BotActivityLog[] = (data as any[]).map((l) => ({
      id: l.id,
      botId: l.bot_id,
      action: l.action,
      details: l.details || {},
      createdAt: l.created_at,
    }));

    return { data: mapped, error: null };
  },
};
