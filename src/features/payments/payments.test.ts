import { describe, it, expect } from 'vitest';
import {
  calculateQrisgateSignature,
  timingSafeEqualHex,
  verifyQrisgateWebhook,
} from './qrisgateCrypto';
import {
  calculateMidtransSignature,
  verifyMidtransSignature,
  mapMidtransStatusToPaymentState,
} from './midtransCrypto';

describe('QRISGate Cryptographic Signature & Webhook Verification', () => {
  const sampleSecret = 'whsec_test_secret_998877665544332211';
  const sampleRawBody = JSON.stringify({
    event: 'payment.paid',
    event_id: 'evt_20261125_0001',
    timestamp: Math.floor(Date.now() / 1000),
    data: {
      id: 'tx_qg_8899',
      external_order_id: 'SLD-20261125-0001-123456',
      amount: 250000,
      total_amount: 250007,
      unique_code: 7,
      status: 'PAID',
      payment_method: 'QRIS',
      paid_at: '2026-11-25T12:00:00Z',
    },
  });

  it('computes valid HMAC-SHA256 hex signature matching raw payload', async () => {
    const signature = await calculateQrisgateSignature(sampleRawBody, sampleSecret);

    expect(typeof signature).toBe('string');
    expect(signature.length).toBe(64); // SHA-256 = 32 bytes = 64 hex chars
    expect(/^[0-9a-f]{64}$/.test(signature)).toBe(true);

    // Deterministic calculation
    const repeatSignature = await calculateQrisgateSignature(sampleRawBody, sampleSecret);
    expect(repeatSignature).toBe(signature);
  });

  it('successfully verifies genuine webhook request with valid timestamp', async () => {
    const signature = await calculateQrisgateSignature(sampleRawBody, sampleSecret);
    const currentTimestamp = Math.floor(Date.now() / 1000).toString();

    const result = await verifyQrisgateWebhook({
      rawBody: sampleRawBody,
      signatureHeader: signature,
      timestampHeader: currentTimestamp,
      webhookSecret: sampleSecret,
    });

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('rejects tampered raw body bytes (different amount or status)', async () => {
    const signature = await calculateQrisgateSignature(sampleRawBody, sampleSecret);
    const currentTimestamp = Math.floor(Date.now() / 1000).toString();

    // Attacker altered amount in body
    const tamperedBody = sampleRawBody.replace('"amount":250000', '"amount":10000');

    const result = await verifyQrisgateWebhook({
      rawBody: tamperedBody,
      signatureHeader: signature,
      timestampHeader: currentTimestamp,
      webhookSecret: sampleSecret,
    });

    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid webhook signature');
  });

  it('rejects webhook requests with expired timestamp (anti-replay check > 5 minutes)', async () => {
    const signature = await calculateQrisgateSignature(sampleRawBody, sampleSecret);
    // 6 minutes ago (360 seconds ago)
    const expiredTimestamp = (Math.floor(Date.now() / 1000) - 360).toString();

    const result = await verifyQrisgateWebhook({
      rawBody: sampleRawBody,
      signatureHeader: signature,
      timestampHeader: expiredTimestamp,
      webhookSecret: sampleSecret,
    });

    expect(result.valid).toBe(false);
    expect(result.error).toContain('anti-replay');
  });

  it('timing-safe comparator accurately matches identical strings and rejects differing ones', () => {
    const hex1 = 'a1b2c3d4e5f60718293a4b5c6d7e8f90';
    const hex2 = 'a1b2c3d4e5f60718293a4b5c6d7e8f90';
    const hexDiff = 'a1b2c3d4e5f60718293a4b5c6d7e8f99';

    expect(timingSafeEqualHex(hex1, hex2)).toBe(true);
    expect(timingSafeEqualHex(hex1, hexDiff)).toBe(false);
    expect(timingSafeEqualHex(hex1, 'short')).toBe(false);
  });

  it('validates integer rules: IDR amounts must be integers without rounding errors', () => {
    const servicePrice = 250000;
    const uniqueCode = 7;
    const totalAmount = servicePrice + uniqueCode;

    expect(Number.isInteger(servicePrice)).toBe(true);
    expect(Number.isInteger(uniqueCode)).toBe(true);
    expect(Number.isInteger(totalAmount)).toBe(true);
    expect(totalAmount).toBe(250007);
  });
});

describe('Legacy Compatibility & Fallback Verification', () => {
  const sampleOrderId = 'SLD-20261122-0001-123456';
  const sampleStatusCode = '200';
  const sampleGrossAmount = '250000.00';
  const sampleServerKey = 'SB-Mid-server-TESTKEY123456';

  it('computes consistent signature hash', async () => {
    const signature = await calculateMidtransSignature(
      sampleOrderId,
      sampleStatusCode,
      sampleGrossAmount,
      sampleServerKey
    );

    expect(typeof signature).toBe('string');
    expect(signature.length).toBe(128);
  });

  it('verifies valid incoming signature accurately', async () => {
    const validSignature = await calculateMidtransSignature(
      sampleOrderId,
      sampleStatusCode,
      sampleGrossAmount,
      sampleServerKey
    );

    const isValid = await verifyMidtransSignature(
      sampleOrderId,
      sampleStatusCode,
      sampleGrossAmount,
      sampleServerKey,
      validSignature
    );

    expect(isValid).toBe(true);
  });

  it('maps transaction states properly', () => {
    expect(mapMidtransStatusToPaymentState('settlement')).toEqual({
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
    });
    expect(mapMidtransStatusToPaymentState('pending')).toEqual({
      paymentStatus: 'pending',
      bookingStatus: 'pending_payment',
    });
    expect(mapMidtransStatusToPaymentState('expire')).toEqual({
      paymentStatus: 'expired',
      bookingStatus: 'cancelled',
    });
  });
});
