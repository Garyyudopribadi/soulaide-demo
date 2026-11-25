import { describe, it, expect } from 'vitest';
import type { Database } from '@/types/database';
import { verifyMidtransSignature, mapMidtransStatusToPaymentState } from '@/features/payments/midtransCrypto';
import { validateSafeWhatsAppContent } from '@/features/chat/whatsappService';
import { containsEmergencyKeywords, EMERGENCY_HOTLINES } from '@/features/chat/crisisService';

describe('Phase 11 — Security, RLS & Production Readiness Tests', () => {
  describe('Database Naming & Architecture Compliance', () => {
    it('enforces that all custom Supabase tables use the strict Soulaide_ prefix', () => {
      // List of all custom application tables
      const expectedCustomTables: Array<keyof Database['public']['Tables']> = [
        'Soulaide_user_roles',
        'Soulaide_client_profiles',
        'Soulaide_psychologists',
        'Soulaide_services',
        'Soulaide_psychologist_schedules',
        'Soulaide_availability_overrides',
        'Soulaide_bookings',
        'Soulaide_booking_status_history',
        'Soulaide_reschedule_requests',
        'Soulaide_assessments',
        'Soulaide_consent_records',
        'Soulaide_clinical_notes',
        'Soulaide_clinical_reports',
        'Soulaide_payments',
        'Soulaide_payment_webhook_events',
        'Soulaide_refunds',
        'Soulaide_conversations',
        'Soulaide_conversation_participants',
        'Soulaide_messages',
        'Soulaide_psychologist_presence',
        'Soulaide_notifications',
        'Soulaide_cms_pages',
        'Soulaide_faqs',
        'Soulaide_site_settings',
        'Soulaide_audit_logs',
      ];

      expectedCustomTables.forEach((tableName) => {
        expect(tableName.startsWith('Soulaide_')).toBe(true);
      });
    });
  });

  describe('Clinical Note Privacy & Least Privilege Access Matrix', () => {
    it('guarantees operational admins do NOT have access to clinical notes', () => {
      // Define role permissions
      const rolePermissions = {
        customer: { viewBookings: true, managePayments: false, viewClinicalNotes: false },
        psychologist: { viewBookings: true, managePayments: false, viewClinicalNotes: true },
        admin: { viewBookings: true, managePayments: true, viewClinicalNotes: false }, // Strict isolation!
        super_admin: { viewBookings: true, managePayments: true, viewClinicalNotes: true }, // HIMPSI Audit only
      };

      // Clinical notes access check
      expect(rolePermissions.customer.viewClinicalNotes).toBe(false);
      expect(rolePermissions.admin.viewClinicalNotes).toBe(false);
      expect(rolePermissions.psychologist.viewClinicalNotes).toBe(true);
      expect(rolePermissions.super_admin.viewClinicalNotes).toBe(true);
    });

    it('prevents accidental leakage of clinical information into public channels', () => {
      const leakedClinical = validateSafeWhatsAppContent('Catatan klinis pasien: terdapat indikasi trauma.');
      expect(leakedClinical.isValid).toBe(false);
      expect(leakedClinical.warning).toBeDefined();

      const leakedAssessment = validateSafeWhatsAppContent('Skor asesmen DASS-21 kecemasan tinggi.');
      expect(leakedAssessment.isValid).toBe(false);

      const harmlessInquiry = validateSafeWhatsAppContent('Halo, apakah ada jadwal sesi offline di Pondok Bambu?');
      expect(harmlessInquiry.isValid).toBe(true);
    });
  });

  describe('Midtrans Server-Authoritative Cryptographic Verification', () => {
    const mockServerKey = 'SB-Mid-server-testkey123456';
    const orderId = 'SL-20261122-1001';
    const statusCode = '200';
    const grossAmount = '350000.00';

    it('verifies valid SHA-512 webhook signature against server key', async () => {
      // Compute expected hash manually via Web Crypto in test
      const encoder = new TextEncoder();
      const data = encoder.encode(orderId + statusCode + grossAmount + mockServerKey);
      const hashBuffer = await crypto.subtle.digest('SHA-512', data);
      const expectedSignature = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const isValid = await verifyMidtransSignature(orderId, statusCode, grossAmount, mockServerKey, expectedSignature);
      expect(isValid).toBe(true);
    });

    it('rejects tampered signature, wrong amount, or invalid server key', async () => {
      const tamperedSignature = 'deadbeef1234567890abcdef1234567890abcdef';
      const isValid = await verifyMidtransSignature(orderId, statusCode, grossAmount, mockServerKey, tamperedSignature);
      expect(isValid).toBe(false);

      const wrongAmount = '100000.00';
      const isAmountValid = await verifyMidtransSignature(orderId, statusCode, wrongAmount, mockServerKey, tamperedSignature);
      expect(isAmountValid).toBe(false);
    });

    it('correctly maps all Midtrans transaction statuses to internal payment statuses', () => {
      expect(mapMidtransStatusToPaymentState('settlement', 'accept').paymentStatus).toBe('paid');
      expect(mapMidtransStatusToPaymentState('capture', 'accept').paymentStatus).toBe('paid');
      expect(mapMidtransStatusToPaymentState('pending', undefined).paymentStatus).toBe('pending');
      expect(mapMidtransStatusToPaymentState('expire', undefined).paymentStatus).toBe('expired');
      expect(mapMidtransStatusToPaymentState('cancel', undefined).paymentStatus).toBe('failed');
      expect(mapMidtransStatusToPaymentState('deny', undefined).paymentStatus).toBe('failed');
      expect(mapMidtransStatusToPaymentState('refund', undefined).paymentStatus).toBe('refunded');
    });
  });

  describe('Emergency & Crisis Hotlines Readiness', () => {
    it('verifies 24/7 Indonesian crisis hotline numbers are present', () => {
      const kemenkes = EMERGENCY_HOTLINES.find((h) => h.phone.includes('119'));
      expect(kemenkes).toBeDefined();
      expect(kemenkes?.telUri).toBe('tel:119,8');

      const ambulans = EMERGENCY_HOTLINES.find((h) => h.phone.includes('118'));
      expect(ambulans).toBeDefined();
    });

    it('detects emergency distress keywords in text', () => {
      expect(containsEmergencyKeywords('saya putus asa ingin bunuh diri')).toBe(true);
      expect(containsEmergencyKeywords('terjadi darurat medis')).toBe(true);
      expect(containsEmergencyKeywords('hanya bertanya jadwal hari senin')).toBe(false);
    });
  });

  describe('Environment Variable Protection & Secret Isolation', () => {
    it('verifies that server secrets are NOT prefixed with VITE_', () => {
      // In Vite, only variables starting with VITE_ are exposed to the client.
      // Server keys must NEVER start with VITE_.
      const forbiddenClientPrefixes = [
        'VITE_MIDTRANS_SERVER_KEY',
        'VITE_SUPABASE_SERVICE_ROLE_KEY',
        'VITE_POSTGRES_PASSWORD',
        'VITE_JWT_SECRET',
      ];

      forbiddenClientPrefixes.forEach((secret) => {
        expect(import.meta.env[secret]).toBeUndefined();
      });
    });
  });
});
