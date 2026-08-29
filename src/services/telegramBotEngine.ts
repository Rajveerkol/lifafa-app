import { supabase } from '../lib/supabase';
import { automationService } from './automationService';

export const telegramBotEngine = {
  /**
   * Process all pending Telegram updates, register subscribers, and execute automation rules (e.g. /start -> hello)
   */
  async processUpdatesAndExecuteAutomations(botId: string): Promise<{
    success: boolean;
    processedCount: number;
    newUsersCount: number;
    totalUsers: number;
    error?: string;
  }> {
    try {
      // 1. Fetch bot record and token
      const { data: bot, error: botError } = await supabase
        .from('bots')
        .select('*')
        .eq('id', botId)
        .single();

      if (botError || !bot) {
        return { success: false, processedCount: 0, newUsersCount: 0, totalUsers: 0, error: 'Bot not found.' };
      }

      const token =
        bot.encrypted_token ||
        (typeof window !== 'undefined'
          ? localStorage.getItem(`tg_token_${botId}`) || localStorage.getItem('tg_token_current')
          : null);

      if (!token || !token.includes(':')) {
        return {
          success: false,
          processedCount: 0,
          newUsersCount: 0,
          totalUsers: bot.total_users || 0,
          error: 'Bot token not linked. Please link your BotFather token.',
        };
      }

      // 2. Clear any lingering webhook conflict on Telegram servers
      try {
        await fetch(`https://api.telegram.org/bot${token}/deleteWebhook?drop_pending_updates=false`);
      } catch (e) {
        console.warn('deleteWebhook warning:', e);
      }

      // 3. Fetch Telegram updates
      const tgRes = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=100`);
      const tgJson = await tgRes.json();

      if (!tgJson.ok || !Array.isArray(tgJson.result)) {
        return {
          success: false,
          processedCount: 0,
          newUsersCount: 0,
          totalUsers: bot.total_users || 0,
          error: tgJson.description || 'Failed to fetch Telegram updates.',
        };
      }

      const updates = tgJson.result;
      if (updates.length === 0) {
        return {
          success: true,
          processedCount: 0,
          newUsersCount: 0,
          totalUsers: bot.total_users || 0,
        };
      }

      // 4. Fetch bot automations and settings
      const { data: rules } = await automationService.getRules(botId);
      const activeRules = rules.filter((r) => r.isActive);

      const { data: settings } = await supabase
        .from('bot_settings')
        .select('*')
        .eq('bot_id', botId)
        .single();

      const userMap = new Map<number, { id: number; username?: string; first_name?: string; last_name?: string }>();
      let processedCount = 0;
      let highestUpdateId = 0;

      // 5. Process each update
      for (const update of updates) {
        if (update.update_id > highestUpdateId) {
          highestUpdateId = update.update_id;
        }

        const msg = update.message || update.callback_query?.message;
        const fromUser = update.message?.from || update.callback_query?.from || update.my_chat_member?.from;
        const text = (msg?.text || '').trim();
        const chatId = msg?.chat?.id || fromUser?.id;

        if (fromUser && fromUser.id && !fromUser.is_bot) {
          userMap.set(fromUser.id, {
            id: fromUser.id,
            username: fromUser.username,
            first_name: fromUser.first_name,
            last_name: fromUser.last_name,
          });
        }

        if (chatId && text) {
          let replyText: string | null = null;

          // Check if text matches /start
          if (text.startsWith('/start')) {
            // Find start_command automation rule
            const startRule = activeRules.find(
              (r) =>
                r.triggerType === 'start_command' ||
                (r.triggerValue && r.triggerValue.toLowerCase() === '/start') ||
                (r.triggerValue && r.triggerValue.toLowerCase() === 'start')
            );

            if (startRule && startRule.actionPayload?.text) {
              replyText = startRule.actionPayload.text;
            } else if (settings?.welcome_message && settings.welcome_enabled !== false) {
              replyText = settings.welcome_message;
            } else {
              replyText = `👋 Hello ${fromUser?.first_name || 'there'}! Welcome to ${bot.name}.`;
            }
          } else {
            // Check custom command or keyword rules
            const matchingRule = activeRules.find(
              (r) =>
                (r.triggerValue && r.triggerValue.toLowerCase() === text.toLowerCase()) ||
                (r.triggerType === 'custom_command' && r.triggerValue && text.toLowerCase().startsWith(r.triggerValue.toLowerCase()))
            );

            if (matchingRule && matchingRule.actionPayload?.text) {
              replyText = matchingRule.actionPayload.text;
            }
          }

          // If a reply rule matched, send message to user on Telegram in real-time
          if (replyText) {
            try {
              const formattedReply = replyText
                .replace(/{first_name}/g, fromUser?.first_name || 'Subscriber')
                .replace(/{username}/g, fromUser?.username ? `@${fromUser.username}` : '')
                .replace(/{bot_name}/g, bot.name);

              const tgSendRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: formattedReply,
                }),
              });
              const tgSendJson = await tgSendRes.json();
              if (tgSendJson.ok) {
                processedCount++;
              }
            } catch (sendErr) {
              console.warn('Auto-reply sendMessage error:', sendErr);
            }
          }
        }
      }

      // 6. Acknowledge processed updates so they don't repeat endlessly
      if (highestUpdateId > 0) {
        try {
          await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${highestUpdateId + 1}&limit=1`);
        } catch {}
      }

      // 7. Upsert discovered subscribers into database
      let newUsersCount = 0;
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
        newUsersCount++;
      }

      // 8. Update total subscribers on bots table
      const { count: totalUsers } = await supabase
        .from('bot_users')
        .select('*', { count: 'exact', head: true })
        .eq('bot_id', botId);

      const finalCount = totalUsers || 0;

      await supabase
        .from('bots')
        .update({
          total_users: finalCount,
          total_messages: (bot.total_messages || 0) + processedCount,
          is_connected: true,
          status: 'Active',
          last_synced_at: new Date().toISOString(),
        })
        .eq('id', botId);

      return {
        success: true,
        processedCount,
        newUsersCount,
        totalUsers: finalCount,
      };
    } catch (err: any) {
      return { success: false, processedCount: 0, newUsersCount: 0, totalUsers: 0, error: err.message };
    }
  },
};
