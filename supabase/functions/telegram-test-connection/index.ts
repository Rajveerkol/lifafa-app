// Supabase Edge Function: telegram-test-connection
// Verifies Telegram getMe and getWebhookInfo authoritatively server-side

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.46.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const { bot_id } = await req.json();

    if (!bot_id) {
      return new Response(JSON.stringify({ error: 'Missing bot_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: bot, error: botErr } = await supabaseAdmin
      .from('bots')
      .select('encrypted_token, name, username')
      .eq('id', bot_id)
      .single();

    if (botErr || !bot?.encrypted_token) {
      return new Response(JSON.stringify({ error: 'Bot token not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const encKey = Deno.env.get('TELEGRAM_ENCRYPTION_KEY') || 'creatifafa-default-telegram-secret-key-2026';
    const plainToken = await decryptToken(bot.encrypted_token, encKey);

    // Measure Telegram getMe latency
    const start = Date.now();
    const tgRes = await fetch(`https://api.telegram.org/bot${plainToken}/getMe`);
    const latency = Date.now() - start;
    const tgData = await tgRes.json();

    // Query webhook info
    const whRes = await fetch(`https://api.telegram.org/bot${plainToken}/getWebhookInfo`);
    const whData = await whRes.json();

    return new Response(
      JSON.stringify({
        success: Boolean(tgData.ok),
        latency_ms: latency,
        bot_status: tgData.ok ? 'CONNECTED' : 'ERROR',
        webhook_status: whData.ok && whData.result?.url ? 'ACTIVE' : 'INACTIVE',
        pending_updates: whData.result?.pending_update_count || 0,
        last_error_date: whData.result?.last_error_date || null,
        last_error_message: whData.result?.last_error_message || null,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Diagnostic test failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
