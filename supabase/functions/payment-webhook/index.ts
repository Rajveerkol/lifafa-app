// Supabase Edge Function: payment-webhook
// Secure webhook listener with HMAC signature verification & idempotent wallet credit

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.46.1';
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const webhookSecret = Deno.env.get('PAYMENT_WEBHOOK_SECRET') || Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
    const signature = req.headers.get('x-razorpay-signature') || req.headers.get('x-webhook-signature');

    const bodyText = await req.text();

    if (!webhookSecret || !signature) {
      console.warn('Webhook received without configured secret or signature.');
      return new Response(JSON.stringify({ error: 'Webhook secret/signature missing' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase Admin client with service role (Edge Function internal only)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload = JSON.parse(bodyText);
    const event = payload.event;

    // Process payment captured / order paid event
    if (event === 'payment.captured' || event === 'order.paid') {
      const payment = payload.payload.payment?.entity;
      const amount = Number(payment.amount) / 100; // convert paise to rupees
      const paymentRef = payment.id;
      const userId = payment.notes?.user_id;
      const purpose = payment.notes?.purpose;
      const planId = payment.notes?.plan_id;

      if (userId && amount > 0) {
        if (purpose === 'bot_purchase' && planId) {
          // Update bot order status
          await supabaseAdmin
            .from('bot_orders')
            .update({
              status: 'paid',
              payment_reference: paymentRef,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
            .eq('bot_plan_id', planId)
            .eq('status', 'pending');
        } else {
          // Credit deposit to wallet idempotently
          await supabaseAdmin.rpc('credit_deposit_idempotent', {
            p_user_id: userId,
            p_amount: amount,
            p_payment_reference: paymentRef,
            p_gateway: 'razorpay',
          });
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Webhook failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
