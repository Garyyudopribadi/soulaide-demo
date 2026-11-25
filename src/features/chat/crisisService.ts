import type { CrisisHotline } from './types.ts';

export const EMERGENCY_HOTLINES: CrisisHotline[] = [
  {
    name: 'Hotline Kesehatan Jiwa Kemenkes RI',
    phone: '119 (ext. 8)',
    telUri: 'tel:119,8',
    description: 'Layanan konseling krisis dan kedaruratan kesehatan jiwa resmi Kementerian Kesehatan RI.',
    is24Hours: true,
    category: 'mental_health',
  },
  {
    name: 'Sejiwa (HIMPSI & KemenPPPA/Kemenkes)',
    phone: '119 (ext. 8)',
    telUri: 'tel:119,8',
    description: 'Layanan konsultasi psikologis cepat tanggap terkoordinasi Himpunan Psikologi Indonesia.',
    is24Hours: true,
    category: 'suicide_prevention',
  },
  {
    name: 'Ambulans Gawat Darurat (SPGDT)',
    phone: '118 / 119',
    telUri: 'tel:118',
    description: 'Pelayanan kedaruratan medis ambulans dan evakuasi ke Instalasi Gawat Darurat terdekat.',
    is24Hours: true,
    category: 'emergency_medical',
  },
  {
    name: 'Halo Kemkes',
    phone: '1500-567',
    telUri: 'tel:1500567',
    description: 'Layanan pengaduan dan informasi fasilitas rujukan medis/psikiatri seluruh Indonesia.',
    is24Hours: true,
    category: 'mental_health',
  },
];

export const CRISIS_DISCLAIMER_TEXT = {
  short: 'Layanan chat dan pesan Soulaide khusus koordinasi teknis, bukan layanan tanggap darurat medis/krisis.',
  full: 'Platform Soulaide, pesan WhatsApp, dan fitur live chat BUKAN merupakan layanan gawat darurat mental, psikiatri, atau penanganan krisis bunuh diri. Jika Anda atau orang terdekat berada dalam bahaya cedera diri atau krisis darurat, segera hubungi Hotline 119 ext. 8 atau datangi Instalasi Gawat Darurat (IGD) rumah sakit terdekat.',
};

const EMERGENCY_KEYWORDS = [
  'bunuh diri',
  'suicide',
  'akhiri hidup',
  'ingin mati',
  'menyakiti diri',
  'self harm',
  'darurat medis',
  'overdosis',
  'gantung diri',
];

export function containsEmergencyKeywords(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
}
