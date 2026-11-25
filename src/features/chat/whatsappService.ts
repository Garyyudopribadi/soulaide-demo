import type { WhatsAppTemplate } from './types.ts';

export const DEFAULT_WHATSAPP_NUMBER = '+6289630869804';

export const WHATSAPP_PRESET_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'general_inquiry',
    label: 'Pertanyaan Umum Layanan',
    text: 'Halo Soulaide, saya ingin bertanya mengenai layanan dan alur konseling psikologi.',
    category: 'general',
  },
  {
    id: 'booking_assistance',
    label: 'Bantuan Pendaftaran / Jadwal',
    text: 'Halo Soulaide, saya membutuhkan panduan dalam memilih jadwal konsultasi psikolog.',
    category: 'booking',
  },
  {
    id: 'reschedule_assistance',
    label: 'Perubahan Jadwal (Reschedule)',
    text: 'Halo Soulaide, saya ingin meminta bantuan perihal pengajuan perubahan jadwal sesi saya (min. 8 jam sebelum sesi).',
    category: 'reschedule',
  },
  {
    id: 'technical_support',
    label: 'Bantuan Teknis / Link Sesi',
    text: 'Halo Soulaide, saya mengalami kendala teknis terkait tautan panggilan sesi konsultasi saya.',
    category: 'technical',
  },
];

/**
 * Normalizes an Indonesian / International phone number to WhatsApp international wa.me format (e.g. "6289630869804")
 */
export function normalizeWhatsAppNumber(phone: string): string {
  if (!phone) return '6289630869804';
  let cleaned = phone.replace(/[^0-9]/g, '');

  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }

  return cleaned || '6289630869804';
}

/**
 * Builds a secure WhatsApp wa.me click-to-chat URL with safe preformatted message.
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalized = normalizeWhatsAppNumber(phone);
  const encoded = encodeURIComponent(message.trim());
  return `https://wa.me/${normalized}?text=${encoded}`;
}

const FORBIDDEN_CLINICAL_PATTERNS = [
  /catatan klinis/i,
  /clinical note/i,
  /diagnosis psikiatri/i,
  /skor mhcu/i,
  /dass-?21/i,
  /jawaban asesmen/i,
  /password/i,
  /kata sandi/i,
];

/**
 * Validates that WhatsApp messages do NOT leak clinical data or assessment records.
 */
export function validateSafeWhatsAppContent(content: string): { isValid: boolean; warning?: string } {
  if (!content) return { isValid: true };

  for (const pattern of FORBIDDEN_CLINICAL_PATTERNS) {
    if (pattern.test(content)) {
      return {
        isValid: false,
        warning: 'Pesan mengandung informasi medis/klinis rahasia. Sesuai standar privasi HIMPSI, data asesmen dan rekam medis tidak boleh dikirimkan melalui WhatsApp.',
      };
    }
  }

  return { isValid: true };
}
