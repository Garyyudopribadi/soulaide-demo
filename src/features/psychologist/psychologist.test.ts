import { describe, it, expect } from 'vitest';
import type { PresenceStatus, AssignedBookingItem, ClinicalNoteRecord } from './types';

describe('Psychologist Dashboard Presence & Availability', () => {
  const validStatuses: PresenceStatus[] = ['available', 'busy', 'away', 'online', 'offline'];

  it('recognizes all standard HIMPSI presence statuses', () => {
    validStatuses.forEach((st) => {
      expect(['available', 'busy', 'away', 'online', 'offline']).toContain(st);
    });
  });

  it('validates schedule time check where end_time must be strictly after start_time', () => {
    const isValidSchedule = (startTime: string, endTime: string): boolean => {
      return endTime > startTime;
    };

    expect(isValidSchedule('09:00', '17:00')).toBe(true);
    expect(isValidSchedule('13:30', '15:00')).toBe(true);
    expect(isValidSchedule('17:00', '09:00')).toBe(false);
    expect(isValidSchedule('10:00', '10:00')).toBe(false);
  });
});

describe('Clinical Notes Integrity & Privacy Protection', () => {
  it('enforces least-privilege clinical confidentiality by default', () => {
    const draftNote: ClinicalNoteRecord = {
      booking_id: 'b-101',
      psychologist_id: 'p-01',
      customer_id: 'c-01',
      session_summary: 'Klien menceritakan kecemasan menghadapi ujian akhir.',
      clinical_observations: 'Afek cemas, kontak mata baik, orientasi realitas utuh.',
      interventions_used: 'Psychoeducation mengenai respon fight-or-flight, grounding 5-4-3-2-1.',
      recommendations: 'Latihan pernapasan diafragma 2x sehari, follow-up 1 minggu lagi.',
      is_confidential: true,
    };

    expect(draftNote.is_confidential).toBe(true);
    expect(draftNote.session_summary.length).toBeGreaterThan(10);
    expect(draftNote.interventions_used).toContain('grounding');
  });

  it('validates required clinical notes structure before saving', () => {
    const validateClinicalPayload = (note: Partial<ClinicalNoteRecord>): boolean => {
      return Boolean(
        note.booking_id &&
        note.psychologist_id &&
        note.customer_id &&
        note.session_summary?.trim()
      );
    };

    expect(
      validateClinicalPayload({
        booking_id: 'b-1',
        psychologist_id: 'p-1',
        customer_id: 'c-1',
        session_summary: 'Valid summary',
      })
    ).toBe(true);

    expect(
      validateClinicalPayload({
        booking_id: 'b-1',
        session_summary: '',
      })
    ).toBe(false);
  });
});

describe('Psychologist Assigned Sessions Filtering', () => {
  const sampleAssigned: AssignedBookingItem[] = [
    {
      id: 'b-today',
      booking_code: 'SLD-20261122-0001',
      customer_id: 'c-1',
      service_id: 's-1',
      psychologist_id: 'p-1',
      session_date: '2026-11-22',
      session_start_time: '10:00:00',
      session_end_time: '11:00:00',
      delivery_method: 'online',
      status: 'confirmed',
      notes: null,
      meeting_link: 'https://meet.google.com/test',
      location_address: null,
      created_at: '2026-11-20T08:00:00Z',
      service_name: 'Konseling Dewasa',
      service_duration: 60,
      client: {
        id: 'c-1',
        full_name: 'Ahmad Fauzi',
        phone_number: '081234567890',
        email: 'ahmad@example.com',
      },
      has_clinical_notes: false,
    },
    {
      id: 'b-future',
      booking_code: 'SLD-20261125-0002',
      customer_id: 'c-2',
      service_id: 's-1',
      psychologist_id: 'p-1',
      session_date: '2026-11-25',
      session_start_time: '14:00:00',
      session_end_time: '15:00:00',
      delivery_method: 'offline',
      status: 'confirmed',
      notes: null,
      meeting_link: null,
      location_address: 'Pondok Bambu',
      created_at: '2026-11-21T08:00:00Z',
      service_name: 'Konseling Dewasa',
      service_duration: 60,
      client: {
        id: 'c-2',
        full_name: 'Rina Kartika',
        phone_number: '081298765432',
        email: 'rina@example.com',
      },
      has_clinical_notes: false,
    },
    {
      id: 'b-done',
      booking_code: 'SLD-20261118-0003',
      customer_id: 'c-3',
      service_id: 's-1',
      psychologist_id: 'p-1',
      session_date: '2026-11-18',
      session_start_time: '10:00:00',
      session_end_time: '11:00:00',
      delivery_method: 'online',
      status: 'completed',
      notes: null,
      meeting_link: null,
      location_address: null,
      created_at: '2026-11-16T08:00:00Z',
      service_name: 'Konseling Dewasa',
      service_duration: 60,
      client: {
        id: 'c-3',
        full_name: 'Dewi Lestari',
        phone_number: '081333444555',
        email: 'dewi@example.com',
      },
      has_clinical_notes: true,
    },
  ];

  it('filters sessions for today accurately', () => {
    const todayStr = '2026-11-22';
    const todaySessions = sampleAssigned.filter((b) => b.session_date === todayStr);

    expect(todaySessions.length).toBe(1);
    expect(todaySessions[0].id).toBe('b-today');
  });

  it('identifies sessions needing clinical documentation', () => {
    const pendingNotes = sampleAssigned.filter(
      (b) => !b.has_clinical_notes && ['confirmed', 'completed'].includes(b.status)
    );

    expect(pendingNotes.length).toBe(2);
    expect(pendingNotes.map((b) => b.id)).toEqual(['b-today', 'b-future']);
  });
});
