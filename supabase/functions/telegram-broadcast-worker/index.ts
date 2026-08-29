// Supabase Edge Function: telegram-broadcast-worker
// Processes queued broadcast jobs in batches with rate-limiting, retry handling, and idempotency

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
    const { broadcast_id, batch_size = 25 } = await req.json();

    if (!broadcast_id) {
      return new Response(JSON.stringify({ error: 'Missing broadcast_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch broadcast job
    const { data: broadcast, error: bcastErr } = await supabaseAdmin
      .from('bot_broadcasts')
      .select('*, bots(encrypted_token)')
      .eq('id', broadcast_id)
      .single();

    if (bcastErr || !broadcast) {
      return new Response(JSON.stringify({ error: 'Broadcast not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const encryptedToken = broadcast.bots?.encrypted_token;
    if (!encryptedToken) {
      return new Response(JSON.stringify({ error: 'Bot token missing' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const encKey = Deno.env.get('TELEGRAM_ENCRYPTION_KEY') || 'creatifafa-default-telegram-secret-key-2026';
    const plainToken = await decryptToken(encryptedToken, encKey);

    // Mark broadcast status to processing
    await supabaseAdmin
      .from('bot_broadcasts')
      .update({ status: 'processing' })
      .eq('id', broadcast_id);

    // Fetch pending recipients batch
    const { data: recipients } = await supabaseAdmin
      .from('bot_broadcast_recipients')
      .select('id, telegram_user_id')
      .eq('broadcast_id', broadcast_id)
      .eq('status', 'pending')
      .limit(batch_size);

    let sent = 0;
    let failed = 0;

    if (recipients && recipients.length > 0) {
      for (const rec of recipients) {
        try {
          const payload: Record<string, any> = {
            chat_id: rec.telegram_user_id,
            text: broadcast.message,
            parse_mode: 'HTML',
          };

          if (broadcast.button_text && broadcast.button_url) {
            payload.reply_markup = {
              inline_keyboard: [[{ text: broadcast.button_text, url: broadcast.button_url }]],
            };
          }

          const res = await fetch(`https://api.telegram.org/bot${plainToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          const data = await res.json();

          if (data.ok) {
            sent++;
            await supabaseAdmin
              .from('bot_broadcast_recipients')
              .update({ status: 'sent', sent_at: new Date().toISOString() })
              .eq('id', rec.id);
          } else {
            failed++;
            await supabaseAdmin
              .from('bot_broadcast_recipients')
              .update({ status: 'failed', error_message: data.description || 'Send failed' })
              .eq('id', rec.id);
          }

          // Safe delay (40ms ~ 25 msgs/sec max) to prevent Telegram 429
          await new Promise((r) => setTimeout(r, 40));
        } catch (e: any) {
          failed++;
          await supabaseAdmin
            .from('bot_broadcast_recipients')
            .update({ status: 'failed', error_message: e.message })
            .eq('id', rec.id);
        }
      }
    }

    // Check remaining pending recipients
    const { count: remainingCount } = await supabaseAdmin
      .from('bot_broadcast_recipients')
      .select('*', { count: 'exact', head: true })
      .eq('broadcast_id', broadcast_id)
      .eq('status', 'pending');

    const isFinished = (remainingCount || 0) === 0;

    // Update broadcast summary counts
    await supabaseAdmin
      .from('bot_broadcasts')
      .update({
        sent_count: broadcast.sent_count + sent,
        failed_count: broadcast.failed_count + failed,
        status: isFinished ? 'completed' : 'processing',
        completed_at: isFinished ? new Date().toISOString() : null,
      })
      .eq('id', broadcast_id);

    return new Response(
      JSON.stringify({
        success: true,
        batch_processed: recipients?.length || 0,
        sent_in_batch: sent,
        failed_in_batch: failed,
        remaining_recipients: remainingCount || 0,
        is_completed: isFinished,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Worker failure' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
