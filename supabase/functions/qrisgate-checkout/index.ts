// Supabase Edge Function: qrisgate-checkout
// Endpoint: POST /api/checkout atau functions/v1/qrisgate-checkout
//
// Tugas 1:
// 1. Menerima item pesanan / booking_id dari frontend.
// 2. Menghitung total dari harga di DATABASE (Soulaide_services), bukan dari nilai yang dikirim browser.
// 3. Memanggil POST {QRISGATE_BASE_URL}/api/v1/transactions dengan header Authorization: Bearer QRISGATE_API_KEY
//    dan body JSON: { external_order_id, amount, customer_name, return_url }
// 4. Menyimpan ke database: external_order_id, transaction_id, total_amount, status PENDING.
// 5. Mengembalikan checkout_url, total_amount, unique_code, qr_string, expires_at ke frontend.
//
// Aturan:
// - API key hanya di server (QRISGATE_API_KEY).
// - Semua nominal Rupiah integer.
// - Menangani status: 402 = saldo kredit merchant habis, 400 = validasi gagal, 429 = rate limit.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckoutRequest {
  booking_id: string;
  payment_method?: 'QRIS' | 'BANK_TRANSFER' | 'ANY';
  bank_code?: string;
  return_url?: string;
}

serve(async (req: Request) => {
  // CORS Preflight
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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const qrisgateBaseUrl = Deno.env.get('QRISGATE_BASE_URL') || 'https://qrisgate.web.id';
    const qrisgateApiKey = Deno.env.get('QRISGATE_API_KEY') || '';

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized user token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: CheckoutRequest = await req.json();
    const { booking_id, payment_method = 'ANY', bank_code, return_url } = body;

    if (!booking_id) {
      return new Response(JSON.stringify({ error: 'Missing booking_id parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Fetch booking and verify ownership
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('Soulaide_bookings')
      .select('id, booking_code, customer_id, service_id, psychologist_id, status, delivery_method')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return new Response(JSON.stringify({ error: 'Sesi konseling tidak ditemukan' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (booking.customer_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden: Anda tidak berhak atas pesanan ini' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (booking.status !== 'pending_payment') {
      return new Response(JSON.stringify({ error: `Pesanan tidak dapat dibayar karena status: ${booking.status}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Fetch trusted service price directly from database
    const { data: service, error: serviceError } = await supabaseAdmin
      .from('Soulaide_services')
      .select('id, name, price_online, price_offline')
      .eq('id', booking.service_id)
      .single();

    if (serviceError || !service) {
      return new Response(JSON.stringify({ error: 'Tarif layanan tidak ditemukan di basis data' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: profile } = await supabaseAdmin
      .from('Soulaide_profiles')
      .select('full_name, phone_number')
      .eq('id', user.id)
      .single();

    const customerName = profile?.full_name || 'Pelanggan Soulaide';
    const rawPrice = booking.delivery_method === 'offline'
      ? (service.price_offline || 0)
      : (service.price_online || 0);

    // Strictly IDR integer
    const amount = Math.round(Number(rawPrice));
    const externalOrderId = `SLD-${booking.booking_code}-${Date.now().toString().slice(-6)}`;
    const defaultReturnUrl = return_url || `https://soulaide.my.id/order/${externalOrderId}`;

    // 3. Handle live vs mock environment if QRISGATE_API_KEY is not yet provisioned
    if (!qrisgateApiKey) {
      const mockUniqueCode = (Date.now() % 10) + 1;
      const totalAmount = amount + mockUniqueCode;
      const mockTransactionId = `qg_mock_${Date.now()}`;
      const mockExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      const mockCheckoutUrl = `/order/${externalOrderId}`;

      // Save pending payment record into database
      await supabaseAdmin
        .from('Soulaide_payments')
        .insert({
          booking_id: booking.id,
          amount: totalAmount,
          status: 'pending',
          midtrans_order_id: externalOrderId,
          midtrans_transaction_id: mockTransactionId,
          payment_type: 'QRISGate (Simulasi)',
        });

      return new Response(JSON.stringify({
        checkout_url: mockCheckoutUrl,
        total_amount: totalAmount,
        unique_code: mockUniqueCode,
        qr_string: '00020101021226670016ID.CO.QRISGATE.WWW01189360091100000000005204541153033605802ID5916SOULAIDE6007JAKARTA6304ABCD',
        expires_at: mockExpiresAt,
        external_order_id: externalOrderId,
        mode: 'mock',
        message: 'Kunci QRISGATE_API_KEY belum disetel. Berjalan dalam mode simulasi terverifikasi.',
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Request QRISGate API: POST /api/v1/transactions
    const qrisgatePayload: Record<string, unknown> = {
      external_order_id: externalOrderId,
      amount: amount,
      customer_name: customerName,
      return_url: defaultReturnUrl,
      payment_method: payment_method,
    };

    if (bank_code) {
      qrisgatePayload.bank_code = bank_code;
    }

    const qrisgateResponse = await fetch(`${qrisgateBaseUrl}/api/v1/transactions`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${qrisgateApiKey}`,
      },
      body: JSON.stringify(qrisgatePayload),
    });

    if (!qrisgateResponse.ok) {
      const statusCode = qrisgateResponse.status;
      const errorText = await qrisgateResponse.text();

      if (statusCode === 402) {
        return new Response(JSON.stringify({
          error: 'Saldo kredit merchant QRISGate habis. Silakan hubungi admin.',
          code: 'MERCHANT_CREDIT_EMPTY',
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (statusCode === 429) {
        return new Response(JSON.stringify({
          error: 'Layanan QRISGate sedang padat (rate limit). Coba beberapa saat lagi.',
          code: 'RATE_LIMIT',
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        error: 'Gagal membuat sesi pembayaran di QRISGate',
        details: errorText,
      }), {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const qgData = await qrisgateResponse.json();
    const transactionData = qgData.data || qgData;

    const totalAmount = Number(transactionData.total_amount || amount);
    const uniqueCode = transactionData.unique_code;
    const checkoutUrl = transactionData.checkout_url;
    const qrString = transactionData.qr_string;
    const expiresAt = transactionData.expires_at || new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const transactionId = transactionData.id;

    // 5. Store into database with PENDING status
    await supabaseAdmin
      .from('Soulaide_payments')
      .insert({
        booking_id: booking.id,
        amount: totalAmount,
        status: 'pending',
        midtrans_order_id: externalOrderId,
        midtrans_transaction_id: transactionId || null,
        payment_type: `QRISGate (${payment_method})`,
      });

    return new Response(JSON.stringify({
      checkout_url: checkoutUrl,
      total_amount: totalAmount,
      unique_code: uniqueCode,
      qr_string: qrString,
      expires_at: expiresAt,
      external_order_id: externalOrderId,
      transaction_id: transactionId,
      mode: 'live',
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
