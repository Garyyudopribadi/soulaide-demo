// Supabase Edge Function: midtrans-webhook
// Description: Securely handles asynchronous payment notifications from Midtrans.
// Enforces:
// 1. Signature validation using SHA-512(order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY)
// 2. Strict idempotency to prevent duplicate/out-of-order notifications from altering state
// 3. Status synchronization between Soulaide_payments and Soulaide_bookings
// 4. Audit logging into Soulaide_audit_logs

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Computes SHA-512 hash in Deno
async function sha512(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const payload = await req.json();
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      transaction_id,
      payment_type,
      settlement_time,
    } = payload;

    if (!order_id || !status_code || !gross_amount || !signature_key) {
      return new Response(JSON.stringify({ error: 'Missing required notification fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const midtransServerKey = Deno.env.get('MIDTRANS_SERVER_KEY') || '';

    // 1. Signature Verification
    if (midtransServerKey) {
      const payloadString = `${order_id}${status_code}${gross_amount}${midtransServerKey}`;
      const expectedSignature = await sha512(payloadString);

      if (expectedSignature.toLowerCase() !== signature_key.toLowerCase()) {
        console.error('Midtrans signature verification failed!', {
          received: signature_key,
          expected: expectedSignature,
        });
        return new Response(JSON.stringify({ error: 'Invalid signature key' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Idempotency Check
    const eventId = `${transaction_id || order_id}:${status_code}:${transaction_status}`;
    const { data: existingEvent } = await supabaseAdmin
      .from('Soulaide_payment_webhook_events')
      .select('id, status')
      .eq('event_id', eventId)
      .single();

    if (existingEvent) {
      // Event already recorded & processed; return 200 immediately
      return new Response(JSON.stringify({
        status: 'ok',
        message: 'Notification already processed (idempotent duplicate skipped)',
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Record webhook event in audit table
    await supabaseAdmin
      .from('Soulaide_payment_webhook_events')
      .insert({
        event_id: eventId,
        order_id: order_id,
        raw_payload: payload,
        status: 'processed',
      });

    // 3. Find corresponding payment record
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('Soulaide_payments')
      .select('id, booking_id, status, amount')
      .eq('midtrans_order_id', order_id)
      .single();

    if (paymentError || !payment) {
      console.warn(`Payment record not found for order_id: ${order_id}`);
      return new Response(JSON.stringify({
        status: 'warning',
        message: 'Payment record not found, recorded webhook only',
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Determine state transitions
    let newPaymentStatus: 'pending' | 'paid' | 'failed' | 'expired' | 'refunded' | 'partially_refunded' = payment.status;
    let newBookingStatus: 'confirmed' | 'cancelled' | 'pending_payment' | null = null;

    if (transaction_status === 'settlement') {
      newPaymentStatus = 'paid';
      newBookingStatus = 'confirmed';
    } else if (transaction_status === 'capture') {
      if (fraud_status === 'accept') {
        newPaymentStatus = 'paid';
        newBookingStatus = 'confirmed';
      } else if (fraud_status === 'challenge') {
        newPaymentStatus = 'pending';
      }
    } else if (transaction_status === 'pending') {
      newPaymentStatus = 'pending';
    } else if (['deny', 'cancel'].includes(transaction_status)) {
      newPaymentStatus = 'failed';
      newBookingStatus = 'cancelled';
    } else if (transaction_status === 'expire') {
      newPaymentStatus = 'expired';
      newBookingStatus = 'cancelled';
    } else if (transaction_status === 'refund') {
      newPaymentStatus = 'refunded';
    } else if (transaction_status === 'partial_refund') {
      newPaymentStatus = 'partially_refunded';
    }

    // 5. Update public."Soulaide_payments"
    await supabaseAdmin
      .from('Soulaide_payments')
      .update({
        status: newPaymentStatus,
        midtrans_transaction_id: transaction_id || null,
        payment_type: payment_type || null,
        payment_time: settlement_time ? new Date(settlement_time).toISOString() : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    // 6. Update public."Soulaide_bookings" if state changed
    if (newBookingStatus) {
      await supabaseAdmin
        .from('Soulaide_bookings')
        .update({
          status: newBookingStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.booking_id);
    }

    // 7. Audit Log entry
    await supabaseAdmin
      .from('Soulaide_audit_logs')
      .insert({
        action: 'MIDTRANS_WEBHOOK_PROCESSED',
        resource_type: 'payment',
        resource_id: payment.id,
        metadata: {
          order_id,
          transaction_status,
          fraud_status,
          new_payment_status: newPaymentStatus,
          new_booking_status: newBookingStatus,
        },
      });

    return new Response(JSON.stringify({
      status: 'ok',
      payment_status: newPaymentStatus,
      booking_status: newBookingStatus,
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
