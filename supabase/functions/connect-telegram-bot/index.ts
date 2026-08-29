// Supabase Edge Function: connect-telegram-bot
// Authoritatively verifies BotFather token via getMe, encrypts token server-side, sets webhook, and provisions bot

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.46.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AES-GCM Server-side encryption helper
async function encryptToken(token: string, secretKeyHex: string): Promise<string> {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Hash key to ensure 256-bit
  const keyHash = await crypto.subtle.digest('SHA-256', enc.encode(secretKeyHex));
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyHash,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const encryptedBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    enc.encode(token)
  );

  const combined = new Uint8Array(iv.length + encryptedBuf.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encryptedBuf), iv.length);

  return btoa(String.fromCharCode(...combined));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { order_id, plan_id, bot_name, token } = await req.json();

    if (!token || typeof token !== 'string' || !token.includes(':')) {
      return new Response(JSON.stringify({ error: 'Invalid BotFather token format.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 1: Call Telegram Bot API getMe to verify token authoritatively
    const telegramRes = await fetch(`https://api.telegram.org/bot${token.trim()}/getMe`);
    const telegramData = await telegramRes.json();

    if (!telegramData.ok || !telegramData.result) {
      return new Response(
        JSON.stringify({
          error: 'Telegram BotFather token verification failed. Please check the token.',
          description: telegramData.description || 'Invalid token',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tgBot = telegramData.result;
    const tgBotId = tgBot.id.toString();
    const tgUsername = '@' + (tgBot.username || '').replace('@', '');
    const officialName = bot_name || tgBot.first_name || 'Telegram Bot';

    // Step 2: Encrypt token with server secret
    const encKey = Deno.env.get('TELEGRAM_ENCRYPTION_KEY') || 'creatifafa-default-telegram-secret-key-2026';
    const encryptedToken = await encryptToken(token.trim(), encKey);

    // Step 3: Set Webhook to telegram-webhook Edge Function
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const webhookUrl = `${supabaseUrl}/functions/v1/telegram-webhook`;

    try {
      await fetch(`https://api.telegram.org/bot${token.trim()}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message', 'callback_query'],
          drop_pending_updates: true,
        }),
      });
    } catch (whErr) {
      console.warn('Webhook auto-registration warning:', whErr);
    }

    // Step 4: Admin Supabase client to record bot safely
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Determine plan slug
    let planSlug = 'basic';
    if (plan_id) {
      const { data: planRow } = await supabaseAdmin
        .from('bot_plans')
        .select('slug')
        .eq('id', plan_id)
        .single();
      if (planRow?.slug) planSlug = planRow.slug;
    }

    // Upsert bot record
    const { data: botRecord, error: botInsertErr } = await supabaseAdmin
      .from('bots')
      .upsert({
        user_id: user.id,
        bot_plan_id: plan_id || null,
        bot_order_id: order_id || null,
        name: officialName,
        username: tgUsername,
        telegram_bot_id: tgBotId,
        status: 'Active',
        plan_slug: planSlug,
        encrypted_token: encryptedToken,
        webhook_url: webhookUrl,
        is_connected: true,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${tgBotId}`,
        channels_count: 0,
        bonus_amount: 10.00,
        refer_reward: 5.00,
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'telegram_bot_id' as any })
      .select('id, name, username, telegram_bot_id, status, plan_slug, avatar_url, created_at')
      .single();

    if (botInsertErr || !botRecord) {
      return new Response(JSON.stringify({ error: botInsertErr?.message || 'Failed to save bot' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize bot settings
    await supabaseAdmin
      .from('bot_settings')
      .upsert({
        bot_id: botRecord.id,
        welcome_message: `Welcome to ${officialName}! Use /help to view available commands.`,
        welcome_enabled: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'bot_id' });

    // SAFE RESPONSE: NEVER RETURN THE TOKEN
    return new Response(
      JSON.stringify({
        success: true,
        bot: {
          id: botRecord.id,
          name: botRecord.name,
          username: botRecord.username,
          telegram_bot_id: botRecord.telegram_bot_id,
          status: botRecord.status,
          plan_slug: botRecord.plan_slug,
          avatar_url: botRecord.avatar_url,
          created_at: botRecord.created_at,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Connection error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
