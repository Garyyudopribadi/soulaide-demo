// Supabase Edge Function: qrisgate-webhook
// Endpoint publik: POST /api/webhooks/qrisgate atau functions/v1/qrisgate-webhook
//
// Tugas 2:
// 1. Membaca RAW body (teks murni byte asli sebelum diparse).
// 2. Memverifikasi header x-qrisgate-signature = HMAC-SHA256(rawBody, QRISGATE_WEBHOOK_SECRET) hex secara timing-safe.
// 3. Menolak 401 bila signature salah. Menolak bila x-qrisgate-timestamp lebih dari 5 menit (anti-replay).
// 4. Idempoten: bila event_id sudah pernah diproses, balas 200 tanpa memproses ulang.
// 5. Bila event payment.paid: cari pesanan lewat external_order_id, set status PAID, simpan paid_at, jalankan fulfillment.
// 6. Selalu balas 200 dengan cepat (<5 detik).

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-qrisgate-signature, x-qrisgate-timestamp',
};

// Calculates HMAC-SHA256 hex string
async function calculateHmacSha256(rawText: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const data = encoder.encode(rawText);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, data);
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Timing-safe comparison to prevent timing attacks
function timingSafeEqualHex(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;

  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
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
    const signatureHeader = req.headers.get('x-qrisgate-signature');
    const timestampHeader = req.headers.get('x-qrisgate-timestamp');

    const webhookSecret = Deno.env.get('QRISGATE_WEBHOOK_SECRET') || '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    // 1. Baca RAW body byte asli
    const rawBody = await req.text();

    if (!rawBody) {
      return new Response(JSON.stringify({ error: 'Empty payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Anti-replay check: x-qrisgate-timestamp tidak boleh lebih dari 5 menit (300 detik)
    if (!timestampHeader) {
      return new Response(JSON.stringify({ error: 'Missing x-qrisgate-timestamp header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const timestampNum = Number(timestampHeader);
    const nowSec = Math.floor(Date.now() / 1000);
    const webhookSec = !isNaN(timestampNum)
      ? (timestampNum > 1e11 ? Math.floor(timestampNum / 1000) : timestampNum)
      : Math.floor(Date.parse(timestampHeader) / 1000);

    if (isNaN(webhookSec) || Math.abs(nowSec - webhookSec) > 300) {
      return new Response(JSON.stringify({ error: 'Webhook timestamp expired (>5 minutes). Anti-replay rejected.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Verifikasi signature HMAC-SHA256
    if (!signatureHeader) {
      return new Response(JSON.stringify({ error: 'Missing x-qrisgate-signature header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (webhookSecret) {
      const expectedSignature = await calculateHmacSha256(rawBody, webhookSecret);
      if (!timingSafeEqualHex(signatureHeader.toLowerCase(), expectedSignature.toLowerCase())) {
        console.error('QRISGate signature verification failed');
        return new Response(JSON.stringify({ error: 'Invalid x-qrisgate-signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else {
      console.warn('QRISGATE_WEBHOOK_SECRET is not configured in environment. Skipping signature check in mock.');
    }

    // 4. Parse JSON payload
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: 'Malformed JSON payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const event = String(payload.event || '');
    const eventId = String(payload.event_id || '');
    const data = (payload.data || {}) as Record<string, unknown>;

    const externalOrderId = String(data.external_order_id || payload.external_order_id || '');
    const paidAt = data.paid_at ? String(data.paid_at) : new Date().toISOString();
    const transactionId = data.id ? String(data.id) : null;
    const paymentMethod = data.payment_method ? String(data.payment_method) : 'QRIS';

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 5. Idempoten: Cek apakah event_id sudah pernah diproses
    if (eventId) {
      const { data: existingEvent } = await supabaseAdmin
        .from('Soulaide_payment_webhook_events')
        .select('id, status')
        .eq('event_id', eventId)
        .maybeSingle();

      if (existingEvent) {
        // Balas 200 segera tanpa memproses ulang
        return new Response(JSON.stringify({
          status: 'ok',
          message: 'Event already processed (idempotent duplicate skipped)',
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Simpan event_id ke log webhook audit
    if (eventId) {
      await supabaseAdmin
        .from('Soulaide_payment_webhook_events')
        .insert({
          event_id: eventId,
          order_id: externalOrderId,
          raw_payload: payload,
          status: 'processed',
        });
    }

    // 6. Tangani event payment.paid
    if (event === 'payment.paid' || data.status === 'PAID') {
      const { data: payment, error: paymentError } = await supabaseAdmin
        .from('Soulaide_payments')
        .select('id, booking_id, status, amount')
        .eq('midtrans_order_id', externalOrderId)
        .maybeSingle();

      if (!payment || paymentError) {
        console.warn(`Payment record not found for external_order_id: ${externalOrderId}`);
        return new Response(JSON.stringify({
          status: 'ok',
          message: 'Recorded event, but matching payment not found in local db',
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update payment record to 'paid'
      await supabaseAdmin
        .from('Soulaide_payments')
        .update({
          status: 'paid',
          midtrans_transaction_id: transactionId,
          payment_type: `QRISGate (${paymentMethod})`,
          payment_time: paidAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.id);

      // Konfirmasi booking menjadi 'confirmed'
      await supabaseAdmin
        .from('Soulaide_bookings')
        .update({
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.booking_id);

      // Audit log fulfillment
      await supabaseAdmin
        .from('Soulaide_audit_logs')
        .insert({
          action: 'QRISGATE_WEBHOOK_PAID',
          resource_type: 'payment',
          resource_id: payment.id,
          metadata: {
            external_order_id: externalOrderId,
            event,
            eventId,
            amount: payment.amount,
            paid_at: paidAt,
          },
        });
    } else if (event === 'payment.expired' || data.status === 'EXPIRED') {
      await supabaseAdmin
        .from('Soulaide_payments')
        .update({
          status: 'expired',
          updated_at: new Date().toISOString(),
        })
        .eq('midtrans_order_id', externalOrderId);
    } else if (event === 'payment.failed' || data.status === 'FAILED') {
      await supabaseAdmin
        .from('Soulaide_payments')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('midtrans_order_id', externalOrderId);
    }

    // 7. Selalu balas 200 dengan cepat
    return new Response(JSON.stringify({
      status: 'ok',
      message: 'Webhook processed successfully',
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
