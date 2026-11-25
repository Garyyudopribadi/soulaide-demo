// Supabase Edge Function: create-payment
// Description: Securely creates a Midtrans Snap transaction for a Soulaide booking.
// Enforces:
// 1. JWT authentication and customer ownership check
// 2. Booking status validation (must be 'pending_payment')
// 3. Price validation directly from database (Soulaide_services.price), never trusting client-sent amount
// 4. Server-side communication with Midtrans Snap API using MIDTRANS_SERVER_KEY

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreatePaymentRequest {
  booking_id: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
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
    const midtransServerKey = Deno.env.get('MIDTRANS_SERVER_KEY') || '';
    const isProduction = Deno.env.get('MIDTRANS_IS_PRODUCTION') === 'true';

    // Create admin Supabase client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized user token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { booking_id }: CreatePaymentRequest = await req.json();
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
      return new Response(JSON.stringify({ error: 'Booking not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (booking.customer_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden: You do not own this booking' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (booking.status !== 'pending_payment') {
      return new Response(JSON.stringify({ error: `Cannot pay for booking with status: ${booking.status}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Fetch trusted service price directly from Soulaide_services
    const { data: service, error: serviceError } = await supabaseAdmin
      .from('Soulaide_services')
      .select('id, name, price_online, price_offline')
      .eq('id', booking.service_id)
      .single();

    if (serviceError || !service) {
      return new Response(JSON.stringify({ error: 'Service details not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch customer profile for payment details
    const { data: profile } = await supabaseAdmin
      .from('Soulaide_profiles')
      .select('full_name, phone_number')
      .eq('id', user.id)
      .single();

    const grossAmount = Number(
      booking.delivery_method === 'offline'
        ? (service.price_offline || 0)
        : (service.price_online || 0)
    );
    const orderId = `SLD-${booking.booking_code}-${Date.now().toString().slice(-6)}`;

    // 3. Check if Midtrans Server Key is configured
    if (!midtransServerKey) {
      // Local dev / test mock mode when Midtrans keys are pending merchant onboarding
      const mockSnapToken = `mock-snap-token-${Date.now()}`;
      const mockRedirectUrl = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${mockSnapToken}`;

      // Insert or update payment record
      await supabaseAdmin
        .from('Soulaide_payments')
        .insert({
          booking_id: booking.id,
          amount: grossAmount,
          status: 'pending',
          midtrans_order_id: orderId,
        });

      return new Response(JSON.stringify({
        order_id: orderId,
        amount: grossAmount,
        token: mockSnapToken,
        redirect_url: mockRedirectUrl,
        mode: 'mock',
        message: 'Midtrans server key not set in environment. Running in mock simulation mode.',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // 4. Midtrans Snap API call
    const snapUrl = isProduction
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

    const snapPayload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      item_details: [
        {
          id: service.id,
          price: grossAmount,
          quantity: 1,
          name: service.name.slice(0, 50),
        },
      ],
      customer_details: {
        first_name: profile?.full_name || 'Pelanggan Soulaide',
        email: user.email || 'customer@soulaide.my.id',
        phone: profile?.phone_number || '',
      },
      expiry: {
        duration: 30,
        unit: 'minute',
      },
    };

    const midtransAuth = btoa(`${midtransServerKey}:`);
    const midtransResponse = await fetch(snapUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${midtransAuth}`,
      },
      body: JSON.stringify(snapPayload),
    });

    if (!midtransResponse.ok) {
      const errorBody = await midtransResponse.text();
      return new Response(JSON.stringify({
        error: 'Failed to create transaction with Midtrans',
        details: errorBody,
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const midtransData = await midtransResponse.json();

    // 5. Save payment entry into public."Soulaide_payments"
    const { error: paymentInsertError } = await supabaseAdmin
      .from('Soulaide_payments')
      .insert({
        booking_id: booking.id,
        amount: grossAmount,
        status: 'pending',
        midtrans_order_id: orderId,
      });

    if (paymentInsertError) {
      console.error('Error inserting payment record:', paymentInsertError);
    }

    return new Response(JSON.stringify({
      order_id: orderId,
      amount: grossAmount,
      token: midtransData.token,
      redirect_url: midtransData.redirect_url,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
