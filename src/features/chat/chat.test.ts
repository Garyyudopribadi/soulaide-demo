import { describe, it, expect } from 'vitest';
import {
  normalizeWhatsAppNumber,
  buildWhatsAppUrl,
  validateSafeWhatsAppContent,
  WHATSAPP_PRESET_TEMPLATES,
  DEFAULT_WHATSAPP_NUMBER,
} from './whatsappService';
import {
  EMERGENCY_HOTLINES,
  CRISIS_DISCLAIMER_TEXT,
  containsEmergencyKeywords,
} from './crisisService';
import { PRESENCE_CONFIG } from './presenceService';
import type { PresenceStatus } from './types';

describe('Phase 10 — Communications Module Tests', () => {
  describe('WhatsApp Integration & Sanitization', () => {
    it('normalizes Indonesian phone numbers into international wa.me format', () => {
      expect(normalizeWhatsAppNumber('+6289630869804')).toBe('6289630869804');
      expect(normalizeWhatsAppNumber('0896-3086-9804')).toBe('6289630869804');
      expect(normalizeWhatsAppNumber('89630869804')).toBe('6289630869804');
      expect(normalizeWhatsAppNumber('+62 812-3456-7890')).toBe('6281234567890');
      expect(normalizeWhatsAppNumber('')).toBe('6289630869804');
    });

    it('builds a valid wa.me URL with properly encoded message text', () => {
      const url = buildWhatsAppUrl('+6289630869804', 'Halo Soulaide, ingin bertanya.');
      expect(url).toBe('https://wa.me/6289630869804?text=Halo%20Soulaide%2C%20ingin%20bertanya.');
    });

    it('allows safe booking and coordination inquiries', () => {
      const general = validateSafeWhatsAppContent('Halo, saya ingin bertanya jadwal praktik hari Sabtu.');
      expect(general.isValid).toBe(true);

      const reschedule = validateSafeWhatsAppContent('Permisi admin, saya mau reschedule sesi booking SL-12345.');
      expect(reschedule.isValid).toBe(true);
    });

    it('strictly rejects sensitive clinical and assessment keywords in WhatsApp messages', () => {
      const clinical = validateSafeWhatsAppContent('Tolong lampirkan catatan klinis sesi kemarin.');
      expect(clinical.isValid).toBe(false);
      expect(clinical.warning).toContain('rekam medis');

      const assessment = validateSafeWhatsAppContent('Berikut jawaban asesmen DASS-21 saya: skor 25.');
      expect(assessment.isValid).toBe(false);

      const passwordLeak = validateSafeWhatsAppContent('Password akun saya adalah rahasia123');
      expect(passwordLeak.isValid).toBe(false);
    });

    it('provides preset templates covering all operational communication scenarios', () => {
      expect(WHATSAPP_PRESET_TEMPLATES.length).toBeGreaterThanOrEqual(4);
      const categories = WHATSAPP_PRESET_TEMPLATES.map((t) => t.category);
      expect(categories).toContain('general');
      expect(categories).toContain('booking');
      expect(categories).toContain('reschedule');
      expect(categories).toContain('technical');

      // Verify all preset templates pass safety validation
      WHATSAPP_PRESET_TEMPLATES.forEach((tmpl) => {
        const val = validateSafeWhatsAppContent(tmpl.text);
        expect(val.isValid).toBe(true);
      });
    });

    it('uses the verified default WhatsApp number +6289630869804', () => {
      expect(DEFAULT_WHATSAPP_NUMBER).toBe('+6289630869804');
    });
  });

  describe('Crisis Disclaimers & Emergency Hotlines', () => {
    it('contains certified 24-hour Indonesian emergency escalation contacts', () => {
      const kemenkes = EMERGENCY_HOTLINES.find((h) => h.phone.includes('119'));
      expect(kemenkes).toBeDefined();
      expect(kemenkes?.telUri).toBe('tel:119,8');
      expect(kemenkes?.is24Hours).toBe(true);

      const ambulans = EMERGENCY_HOTLINES.find((h) => h.phone.includes('118'));
      expect(ambulans).toBeDefined();
      expect(ambulans?.category).toBe('emergency_medical');
    });

    it('detects crisis keywords to trigger emergency escalation guidance', () => {
      expect(containsEmergencyKeywords('Saya merasa ingin bunuh diri')).toBe(true);
      expect(containsEmergencyKeywords('Seseorang berniat menyakiti diri sendiri')).toBe(true);
      expect(containsEmergencyKeywords('Ada situasi darurat medis')).toBe(true);
      expect(containsEmergencyKeywords('Saya mau konsultasi jadwal')).toBe(false);
    });

    it('includes clear crisis disclaimer stating chat is not emergency healthcare', () => {
      expect(CRISIS_DISCLAIMER_TEXT.short).toContain('bukan layanan tanggap darurat medis/krisis');
      expect(CRISIS_DISCLAIMER_TEXT.full).toContain('Hotline 119 ext. 8');
      expect(CRISIS_DISCLAIMER_TEXT.full).toContain('Instalasi Gawat Darurat (IGD)');
    });
  });

  describe('Presence Status Configuration', () => {
    const requiredStatuses: PresenceStatus[] = ['offline', 'online', 'available', 'busy', 'away'];

    it('properly maps all five mandatory presence statuses with labels and colors', () => {
      requiredStatuses.forEach((status) => {
        const cfg = PRESENCE_CONFIG[status];
        expect(cfg).toBeDefined();
        expect(cfg.label).toBeTruthy();
        expect(cfg.color).toBeTruthy();
        expect(cfg.badgeVariant).toBeTruthy();
      });
    });

    it('distinguishes between online and available statuses', () => {
      expect(PRESENCE_CONFIG.online.label).not.toBe(PRESENCE_CONFIG.available.label);
      expect(PRESENCE_CONFIG.available.label).toBe('Siap Melayani');
    });
  });
});
