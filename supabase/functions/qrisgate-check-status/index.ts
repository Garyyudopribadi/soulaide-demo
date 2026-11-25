// Supabase Edge Function: qrisgate-check-status
// Endpoint: POST functions/v1/qrisgate-check-status
// Deskripsi: Polling endpoint fallback ke GET https://qrisgate.web.id/api/v1/transactions/{id}
// dengan Bearer API_KEY untuk sinkronisasi bila webhook tertunda/gagal.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { external_order_id } = await req.json();

    if (!external_order_id) {
      return new Response(JSON.stringify({ error: 'Missing external_order_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const qrisgateBaseUrl = Deno.env.get('QRISGATE_BASE_URL') || 'https://qrisgate.web.id';
    const qrisgateApiKey = Deno.env.get('QRISGATE_API_KEY') || '';

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Cek status di database lokal
    const { data: payment } = await supabaseAdmin
      .from('Soulaide_payments')
      .select('id, booking_id, status, amount, midtrans_transaction_id, payment_time, created_at')
      .eq('midtrans_order_id', external_order_id)
      .maybeSingle();

    if (!payment) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Bila sudah paid di DB, langsung kembalikan
    if (payment.status === 'paid') {
      return new Response(JSON.stringify({
        id: payment.midtrans_transaction_id || payment.id,
        external_order_id,
        amount: payment.amount,
        total_amount: payment.amount,
        status: 'PAID',
        paid_at: payment.payment_time,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Bila ada API Key dan transaction ID, lakukan polling ke QRISGate
    if (qrisgateApiKey && payment.midtrans_transaction_id) {
      try {
        const qgRes = await fetch(`${qrisgateBaseUrl}/api/v1/transactions/${payment.midtrans_transaction_id}`, {
          headers: {
            'Authorization': `Bearer ${qrisgateApiKey}`,
            'Accept': 'application/json',
          },
        });

        if (qgRes.ok) {
          const qgData = await qgRes.json();
          const tx = qgData.data || qgData;

          if (tx.status === 'PAID') {
            await supabaseAdmin
              .from('Soulaide_payments')
              .update({
                status: 'paid',
                payment_time: tx.paid_at || new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', payment.id);

            await supabaseAdmin
              .from('Soulaide_bookings')
              .update({
                status: 'confirmed',
                updated_at: new Date().toISOString(),
              })
              .eq('id', payment.booking_id);

            return new Response(JSON.stringify({
              id: tx.id,
              external_order_id,
              amount: tx.amount,
              total_amount: tx.total_amount,
              status: 'PAID',
              paid_at: tx.paid_at,
            }), {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      } catch (err) {
        console.warn('QRISGate polling warning:', err);
      }
    }

    return new Response(JSON.stringify({
      id: payment.midtrans_transaction_id || payment.id,
      external_order_id,
      amount: payment.amount,
      total_amount: payment.amount,
      status: payment.status === 'paid' ? 'PAID' : (payment.status === 'expired' ? 'EXPIRED' : 'PENDING'),
      paid_at: payment.payment_time,
      created_at: payment.created_at,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
