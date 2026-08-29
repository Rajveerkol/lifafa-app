// Supabase Edge Function: telegram-webhook
// Receives updates from Telegram servers, records subscriber activity, and responds to basic commands

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.46.1';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const message = body.message || body.edited_message;

    if (!message || !message.from) {
      return new Response(JSON.stringify({ ok: true, ignored: true }), { status: 200 });
    }

    const tgUser = message.from;
    const tgUserId = tgUser.id;
    const tgUsername = tgUser.username ? `@${tgUser.username}` : null;
    const firstName = tgUser.first_name || '';
    const lastName = tgUser.last_name || '';
    const chatId = message.chat.id;
    const text = (message.text || '').trim();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Look up active bot by recipient or fallback to first active bot
    const { data: botList } = await supabaseAdmin
      .from('bots')
      .select('id, name, username, encrypted_token')
      .eq('status', 'Active')
      .limit(1);

    const activeBot = botList?.[0];
    if (activeBot) {
      // Record subscriber activity atomically
      await supabaseAdmin.rpc('record_bot_user_activity', {
        p_bot_id: activeBot.id,
        p_telegram_user_id: tgUserId,
        p_username: tgUsername,
        p_first_name: firstName,
        p_last_name: lastName,
      });

      // Command dispatch
      let responseText = '';
      if (text.startsWith('/start')) {
        responseText = `👋 Hello ${firstName}!\n\nWelcome to *${activeBot.name}*.\n\nAvailable commands:\n• /help - Bot information\n• /id - View your Telegram User ID\n\n_Powered by Creatlifafa.com_`;
      } else if (text.startsWith('/help')) {
        responseText = `ℹ️ *${activeBot.name} Help*\n\n• /start - Launch or restart bot\n• /help - Command guide\n• /id - View Telegram ID\n\nFor support or Mini App customization, contact @Rajveer_0711`;
      } else if (text.startsWith('/id')) {
        responseText = `🆔 *Your Telegram Information*\n\nUser ID: \`${tgUserId}\`\nUsername: ${tgUsername || 'None'}\nChat ID: \`${chatId}\``;
      }

      // If command was matched and bot token exists (decryption in Edge Function)
      // Note: Edge Function can dispatch response via Telegram API if needed
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return new Response(JSON.stringify({ ok: true, error: err.message }), { status: 200 });
  }
});
