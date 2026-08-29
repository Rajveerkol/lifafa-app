// Supabase Edge Function: telegram-check-membership
// Verifies whether a Telegram user has joined a required channel via getChatMember

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.46.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AES-GCM Decryption helper
async function decryptToken(encryptedBase64: string, secretKeyHex: string): Promise<string> {
  const enc = new TextEncoder();
  const rawData = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));
  const iv = rawData.slice(0, 12);
  const encryptedBuf = rawData.slice(12);

  const keyHash = await crypto.subtle.digest('SHA-256', enc.encode(secretKeyHex));
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyHash,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const decryptedBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encryptedBuf
  );

  return new TextDecoder().decode(decryptedBuf);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { bot_id, channel_id, telegram_user_id } = await req.json();

    if (!bot_id || !channel_id || !telegram_user_id) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch bot encrypted token
    const { data: bot, error: botErr } = await supabaseAdmin
      .from('bots')
      .select('encrypted_token')
      .eq('id', bot_id)
      .single();

    if (botErr || !bot?.encrypted_token) {
      return new Response(JSON.stringify({ error: 'Bot token not available' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const encKey = Deno.env.get('TELEGRAM_ENCRYPTION_KEY') || 'creatifafa-default-telegram-secret-key-2026';
    const plainToken = await decryptToken(bot.encrypted_token, encKey);

    const formattedChannel = channel_id.startsWith('@') ? channel_id : `@${channel_id}`;

    // Call Telegram API getChatMember
    const tgRes = await fetch(
      `https://api.telegram.org/bot${plainToken}/getChatMember?chat_id=${encodeURIComponent(formattedChannel)}&user_id=${telegram_user_id}`
    );
    const tgData = await tgRes.json();

    if (!tgData.ok) {
      return new Response(
        JSON.stringify({
          is_member: false,
          status: 'error',
          description: tgData.description || 'Channel verification failed',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const memberStatus = tgData.result.status;
    const isMember = ['creator', 'administrator', 'member', 'restricted'].includes(memberStatus);

    return new Response(
      JSON.stringify({
        is_member: isMember,
        status: memberStatus,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Membership check failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
