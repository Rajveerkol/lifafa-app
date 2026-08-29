// Supabase Edge Function: create-payment-order
// Serves as the secure server-side boundary for initiating payment gateway orders

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.46.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { amount, purpose, plan_id, payment_method } = await req.json();

    if (!amount || Number(amount) <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check for configured payment provider credentials
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpaySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!razorpayKeyId || !razorpaySecret) {
      // Clean status response when payment gateway credentials are not yet set
      return new Response(
        JSON.stringify({
          provider_configured: false,
          message: 'Payment gateway configuration required for live processing.',
          mock_order: {
            reference_id: `REF-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
            amount: Number(amount),
            currency: 'INR',
          },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Live provider order initialization logic (e.g. Razorpay/Cashfree)
    const orderPayload = {
      amount: Math.round(Number(amount) * 100), // convert to paise
      currency: 'INR',
      receipt: `rcpt_${user.id.substring(0, 6)}_${Date.now()}`,
      notes: {
        user_id: user.id,
        purpose: purpose || 'deposit',
        plan_id: plan_id || '',
      },
    };

    const authHeader = btoa(`${razorpayKeyId}:${razorpaySecret}`);
    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });

    const rzpData = await rzpResponse.json();

    return new Response(
      JSON.stringify({
        provider_configured: true,
        provider: 'razorpay',
        key_id: razorpayKeyId,
        order: rzpData,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
