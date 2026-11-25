import type { PaymentStatus } from './types';

/**
 * Computes the SHA-512 signature hash required by Midtrans.
 * Formula: SHA512(order_id + status_code + gross_amount + ServerKey)
 */
export async function calculateMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string | number,
  serverKey: string
): Promise<string> {
  const amountStr = typeof grossAmount === 'number' ? grossAmount.toFixed(2) : grossAmount;
  // Note: Midtrans standard notification payload gross_amount usually has 2 decimal places e.g. "250000.00"
  // or exact integer string matching the notification.
  const rawString = `${orderId}${statusCode}${amountStr}${serverKey}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(rawString);

  // Use standard Web Crypto API (supported natively in both modern browsers and Node 18+)
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifies whether the signature sent in the Midtrans notification matches the expected server-calculated signature.
 */
export async function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string | number,
  serverKey: string,
  providedSignature: string
): Promise<boolean> {
  if (!orderId || !statusCode || !grossAmount || !serverKey || !providedSignature) {
    return false;
  }

  // Calculate signature both with exact string and with formatted .00 if integer
  const sig1 = await calculateMidtransSignature(orderId, statusCode, grossAmount, serverKey);
  if (sig1.toLowerCase() === providedSignature.toLowerCase()) {
    return true;
  }

  // If grossAmount is an integer string, also check without fixed decimals
  const rawSig = await (async () => {
    const rawString = `${orderId}${statusCode}${grossAmount}${serverKey}`;
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-512', encoder.encode(rawString));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  })();

  return rawSig.toLowerCase() === providedSignature.toLowerCase();
}

export interface MidtransStatusMapping {
  paymentStatus: PaymentStatus;
  bookingStatus: 'confirmed' | 'cancelled' | 'pending_payment' | null;
}

/**
 * Pure function mapping Midtrans transaction_status and fraud_status
 * to Soulaide internal payment status and booking status.
 */
export function mapMidtransStatusToPaymentState(
  transactionStatus: string,
  fraudStatus?: string
): MidtransStatusMapping {
  const normalizedTx = transactionStatus.toLowerCase();
  const normalizedFraud = fraudStatus?.toLowerCase();

  if (normalizedTx === 'settlement') {
    return {
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
    };
  }

  if (normalizedTx === 'capture') {
    if (normalizedFraud === 'accept' || !normalizedFraud) {
      return {
        paymentStatus: 'paid',
        bookingStatus: 'confirmed',
      };
    }
    if (normalizedFraud === 'challenge') {
      return {
        paymentStatus: 'pending',
        bookingStatus: 'pending_payment',
      };
    }
    return {
      paymentStatus: 'failed',
      bookingStatus: 'cancelled',
    };
  }

  if (normalizedTx === 'pending') {
    return {
      paymentStatus: 'pending',
      bookingStatus: 'pending_payment',
    };
  }

  if (['deny', 'cancel'].includes(normalizedTx)) {
    return {
      paymentStatus: 'failed',
      bookingStatus: 'cancelled',
    };
  }

  if (normalizedTx === 'expire') {
    return {
      paymentStatus: 'expired',
      bookingStatus: 'cancelled',
    };
  }

  if (normalizedTx === 'refund') {
    return {
      paymentStatus: 'refunded',
      bookingStatus: null,
    };
  }

  if (normalizedTx === 'partial_refund') {
    return {
      paymentStatus: 'partially_refunded',
      bookingStatus: null,
    };
  }

  return {
    paymentStatus: 'pending',
    bookingStatus: null,
  };
}
