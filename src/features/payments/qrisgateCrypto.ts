/**
 * QRISGate Cryptographic & Webhook Security Utilities
 *
 * Requirements:
 * 1. Signature generation & verification using HMAC-SHA256(rawBody, QRISGATE_WEBHOOK_SECRET) in hex format.
 * 2. Timing-safe comparison to prevent side-channel timing attacks.
 * 3. Anti-replay verification: reject webhook requests if x-qrisgate-timestamp is older than 5 minutes (300 seconds).
 */

/**
 * Calculates HMAC-SHA256 signature in hex for raw webhook body using Web Crypto API.
 */
export async function calculateQrisgateSignature(
  rawBody: string | Uint8Array,
  secret: string
): Promise<string> {
  const encoder = new TextEncoder();
  const keyBytes = encoder.encode(secret);
  const bodyBytes = typeof rawBody === 'string' ? encoder.encode(rawBody) : rawBody;

  // Create clean ArrayBuffer to satisfy strict DOM BufferSource typings
  const keyBuffer = new Uint8Array(keyBytes).buffer as ArrayBuffer;
  const bodyBuffer = new Uint8Array(bodyBytes).buffer as ArrayBuffer;

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, bodyBuffer);
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Performs constant-time (timing-safe) comparison between two hex strings.
 */
export function timingSafeEqualHex(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;

  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Verifies timestamp to protect against replay attacks (within 5 minutes tolerance).
 * @param timestamp Header timestamp as Unix epoch seconds or ISO string
 * @param maxAgeSeconds Max allowable age in seconds (default: 300 = 5 minutes)
 */
export function verifyTimestamp(
  timestamp: string | number,
  maxAgeSeconds = 300,
  currentTimestampSec = Math.floor(Date.now() / 1000)
): boolean {
  if (!timestamp) return false;

  let parsedSec: number;
  if (typeof timestamp === 'number') {
    parsedSec = timestamp > 1e11 ? Math.floor(timestamp / 1000) : timestamp;
  } else {
    const num = Number(timestamp);
    if (!isNaN(num)) {
      parsedSec = num > 1e11 ? Math.floor(num / 1000) : num;
    } else {
      const dateMs = Date.parse(timestamp);
      if (isNaN(dateMs)) return false;
      parsedSec = Math.floor(dateMs / 1000);
    }
  }

  const age = Math.abs(currentTimestampSec - parsedSec);
  return age <= maxAgeSeconds;
}

/**
 * Comprehensive verification of incoming QRISGate webhook headers & body.
 */
export async function verifyQrisgateWebhook(params: {
  rawBody: string | Uint8Array;
  signatureHeader: string | null;
  timestampHeader: string | null;
  webhookSecret: string;
  maxAgeSeconds?: number;
}): Promise<{ valid: boolean; error?: string }> {
  const { rawBody, signatureHeader, timestampHeader, webhookSecret, maxAgeSeconds = 300 } = params;

  if (!webhookSecret) {
    return { valid: false, error: 'QRISGATE_WEBHOOK_SECRET is not configured' };
  }

  if (!signatureHeader) {
    return { valid: false, error: 'Missing x-qrisgate-signature header' };
  }

  if (!timestampHeader) {
    return { valid: false, error: 'Missing x-qrisgate-timestamp header' };
  }

  // 1. Verify anti-replay timestamp
  if (!verifyTimestamp(timestampHeader, maxAgeSeconds)) {
    return { valid: false, error: 'Webhook timestamp expired or beyond 5-minute tolerance (anti-replay check failed)' };
  }

  // 2. Compute expected HMAC-SHA256
  const expectedSignature = await calculateQrisgateSignature(rawBody, webhookSecret);

  // 3. Constant-time signature comparison
  if (!timingSafeEqualHex(signatureHeader.toLowerCase(), expectedSignature.toLowerCase())) {
    return { valid: false, error: 'Invalid webhook signature' };
  }

  return { valid: true };
}
