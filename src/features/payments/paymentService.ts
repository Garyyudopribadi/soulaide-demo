import { supabase } from '@/lib/supabase/client.ts';
import type {
  PaymentRecord,
  QrisgateCheckoutResponse,
  QrisgateTransactionDetails,
} from './types';

export const paymentService = {
  /**
   * Request QRISGate checkout creation via server-side Edge Function 'qrisgate-checkout'.
   * Item price is resolved strictly from database (Soulaide_services), never trusted from client.
   * Server communicates with POST https://qrisgate.web.id/api/v1/transactions with Bearer API_KEY.
   */
  async createPaymentSession(bookingId: string): Promise<QrisgateCheckoutResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('qrisgate-checkout', {
        body: { booking_id: bookingId },
      });

      if (!error && data && data.checkout_url) {
        return data as QrisgateCheckoutResponse;
      }
    } catch {
      // In local preview/dev without Supabase Edge runtime active, graceful mock fallback
    }

    // Fallback for preview / dev environment without active Supabase Edge Runtime:
    // 1. Fetch booking and trusted service price directly from database
    const { data: booking, error: bookingErr } = await supabase
      .from('Soulaide_bookings')
      .select('id, booking_code, service_id, status, delivery_method')
      .eq('id', bookingId)
      .single();

    if (bookingErr || !booking) {
      throw new Error('Sesi konseling tidak ditemukan');
    }

    const { data: service, error: serviceErr } = await supabase
      .from('Soulaide_services')
      .select('id, name, price_online, price_offline')
      .eq('id', booking.service_id)
      .single();

    if (serviceErr || !service) {
      throw new Error('Informasi tarif layanan tidak ditemukan');
    }

    const externalOrderId = `SLD-${booking.booking_code}-${Date.now().toString().slice(-6)}`;
    const baseAmount = Math.round(
      Number(
        booking.delivery_method === 'offline'
          ? (service.price_offline || 0)
          : (service.price_online || 0)
      )
    );

    // Mock unique code (Rp 1 - 10)
    const uniqueCode = (Date.now() % 10) + 1;
    const totalAmount = baseAmount + uniqueCode;
    const mockTxId = `qg_tx_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // Record pending payment in database
    await supabase
      .from('Soulaide_payments')
      .insert({
        booking_id: booking.id,
        amount: totalAmount,
        status: 'pending',
        midtrans_order_id: externalOrderId,
        midtrans_transaction_id: mockTxId,
        payment_type: 'QRISGate (QRIS / Transfer Bank)',
      });

    const fallbackUrl = `/order/${externalOrderId}`;

    return {
      checkout_url: fallbackUrl,
      total_amount: totalAmount,
      unique_code: uniqueCode,
      expires_at: expiresAt,
      external_order_id: externalOrderId,
      transaction_id: mockTxId,
      mode: 'mock',
      message: 'Mode simulasi QRISGate. Selesaikan pembayaran dalam 15 menit.',
    };
  },

  /**
   * Fetches latest payment record for a booking.
   */
  async getPaymentForBooking(bookingId: string): Promise<PaymentRecord | null> {
    const { data, error } = await supabase
      .from('Soulaide_payments')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching payment for booking:', error);
      return null;
    }

    return (data as unknown) as PaymentRecord | null;
  },

  /**
   * Fetches payment record by external_order_id.
   */
  async getPaymentByExternalOrderId(externalOrderId: string): Promise<{
    payment: PaymentRecord | null;
    booking: {
      id: string;
      booking_code: string;
      session_date: string;
      session_start_time: string;
      delivery_method: string;
      status: string;
      service_name?: string;
    } | null;
  }> {
    const { data: payment, error } = await supabase
      .from('Soulaide_payments')
      .select('*')
      .eq('midtrans_order_id', externalOrderId)
      .maybeSingle();

    if (error || !payment) {
      return { payment: null, booking: null };
    }

    const { data: booking } = await supabase
      .from('Soulaide_bookings')
      .select('id, booking_code, session_date, session_start_time, delivery_method, status, service_id')
      .eq('id', payment.booking_id)
      .single();

    let serviceName = 'Sesi Konseling';
    if (booking?.service_id) {
      const { data: service } = await supabase
        .from('Soulaide_services')
        .select('name')
        .eq('id', booking.service_id)
        .single();
      if (service?.name) serviceName = service.name;
    }

    return {
      payment: (payment as unknown) as PaymentRecord,
      booking: booking ? { ...booking, service_name: serviceName } : null,
    };
  },

  /**
   * Polling order status directly from server / database.
   */
  async checkOrderStatus(externalOrderId: string): Promise<QrisgateTransactionDetails | null> {
    // 1. Try polling via backend endpoint / edge function if available
    try {
      const { data, error } = await supabase.functions.invoke('qrisgate-check-status', {
        body: { external_order_id: externalOrderId },
      });
      if (!error && data && data.status) {
        return data as QrisgateTransactionDetails;
      }
    } catch {
      // Proceed to database query
    }

    // 2. Query database directly
    const { data: payment } = await supabase
      .from('Soulaide_payments')
      .select('*')
      .eq('midtrans_order_id', externalOrderId)
      .maybeSingle();

    if (!payment) return null;

    const mappedStatus = ((): 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED' | 'FAILED' => {
      switch (payment.status) {
        case 'paid':
          return 'PAID';
        case 'expired':
          return 'EXPIRED';
        case 'failed':
          return 'FAILED';
        default:
          return 'PENDING';
      }
    })();

    return {
      id: payment.midtrans_transaction_id || payment.id,
      external_order_id: payment.midtrans_order_id,
      amount: payment.amount,
      total_amount: payment.amount,
      status: mappedStatus,
      paid_at: payment.payment_time,
      created_at: payment.created_at,
    };
  },

  /**
   * Verifies payment status directly from database.
   */
  async verifyPaymentFromDatabase(bookingId: string): Promise<{
    paymentStatus: string;
    bookingStatus: string;
  }> {
    const { data: booking } = await supabase
      .from('Soulaide_bookings')
      .select('status')
      .eq('id', bookingId)
      .single();

    const payment = await this.getPaymentForBooking(bookingId);

    return {
      paymentStatus: payment?.status || 'pending',
      bookingStatus: booking?.status || 'pending_payment',
    };
  },
};
