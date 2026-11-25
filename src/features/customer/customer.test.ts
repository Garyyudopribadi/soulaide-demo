import { describe, it, expect } from 'vitest';
import type { CustomerBookingRecord } from '@/features/booking/bookingService';
import type { CustomerPaymentItem, CustomerNotificationItem } from './types';

describe('Customer Dashboard Utilities & Business Logic', () => {
  const sampleBookings: CustomerBookingRecord[] = [
    {
      id: 'b-1',
      bookingCode: 'SLD-20261125-0001',
      sessionDate: '2026-11-25',
      sessionStartTime: '10:00:00',
      sessionEndTime: '11:00:00',
      deliveryMethod: 'online',
      status: 'confirmed',
      notes: null,
      meetingLink: 'https://meet.google.com/abc-def-ghi',
      locationAddress: null,
      createdAt: '2026-11-22T08:00:00Z',
      service: {
        id: 's-1',
        name: 'Konseling Individu Dewasa',
        durationMinutes: 60,
        priceOnline: 250000,
        priceOffline: 350000,
      },
      psychologist: {
        id: 'p-1',
        fullName: 'Sarah Jenkins, M.Psi., Psikolog',
        credentials: 'S.Psi, M.Psi, Psikolog Klinis Dewasa',
        cardImageUrl: null,
      },
    },
    {
      id: 'b-2',
      bookingCode: 'SLD-20261120-0002',
      sessionDate: '2026-11-20',
      sessionStartTime: '14:00:00',
      sessionEndTime: '15:00:00',
      deliveryMethod: 'offline',
      status: 'completed',
      notes: null,
      meetingLink: null,
      locationAddress: 'Pondok Bambu',
      createdAt: '2026-11-15T08:00:00Z',
      service: {
        id: 's-2',
        name: 'Konseling Pasangan & Pernikahan',
        durationMinutes: 90,
        priceOnline: 400000,
        priceOffline: 500000,
      },
      psychologist: {
        id: 'p-2',
        fullName: 'Budi Santoso, M.Psi., Psikolog',
        credentials: 'S.Psi, M.Psi, Psikolog Klinis',
        cardImageUrl: null,
      },
    },
    {
      id: 'b-3',
      bookingCode: 'SLD-20261126-0003',
      sessionDate: '2026-11-26',
      sessionStartTime: '16:00:00',
      sessionEndTime: '17:00:00',
      deliveryMethod: 'online',
      status: 'pending_payment',
      notes: null,
      meetingLink: null,
      locationAddress: null,
      createdAt: '2026-11-22T09:00:00Z',
      service: {
        id: 's-1',
        name: 'Konseling Individu Dewasa',
        durationMinutes: 60,
        priceOnline: 250000,
        priceOffline: 350000,
      },
      psychologist: {
        id: 'p-1',
        fullName: 'Sarah Jenkins, M.Psi., Psikolog',
        credentials: 'S.Psi, M.Psi, Psikolog Klinis Dewasa',
        cardImageUrl: null,
      },
    },
  ];

  it('accurately categorizes upcoming sessions versus past/history sessions', () => {
    const todayStr = '2026-11-22';

    const upcoming = sampleBookings.filter((b) => {
      const isPast =
        b.sessionDate < todayStr || ['completed', 'cancelled', 'no_show'].includes(b.status);
      return !isPast;
    });

    const history = sampleBookings.filter((b) => {
      const isPast =
        b.sessionDate < todayStr || ['completed', 'cancelled', 'no_show'].includes(b.status);
      return isPast;
    });

    expect(upcoming.length).toBe(2);
    expect(upcoming.map((b) => b.id)).toEqual(['b-1', 'b-3']);

    expect(history.length).toBe(1);
    expect(history[0].id).toBe('b-2');
    expect(history[0].status).toBe('completed');
  });

  it('filters sessions by search query across booking code, psychologist, or service', () => {
    const query = 'sarah';
    const matches = sampleBookings.filter((b) => {
      const q = query.toLowerCase();
      return (
        b.bookingCode.toLowerCase().includes(q) ||
        b.psychologist.fullName.toLowerCase().includes(q) ||
        b.service.name.toLowerCase().includes(q)
      );
    });

    expect(matches.length).toBe(2);
    expect(matches.every((m) => m.psychologist.fullName.includes('Sarah'))).toBe(true);
  });

  it('calculates total successful payments accurately without including pending or failed amounts', () => {
    const samplePayments: CustomerPaymentItem[] = [
      {
        id: 'pay-1',
        booking_id: 'b-1',
        booking_code: 'SLD-20261125-0001',
        service_name: 'Konseling Individu',
        delivery_method: 'online',
        amount: 250000,
        status: 'paid',
        midtrans_order_id: 'SLD-ORD-01',
        midtrans_transaction_id: 'MID-TX-01',
        payment_type: 'gopay',
        payment_time: '2026-11-22T08:15:00Z',
        created_at: '2026-11-22T08:10:00Z',
      },
      {
        id: 'pay-2',
        booking_id: 'b-3',
        booking_code: 'SLD-20261126-0003',
        service_name: 'Konseling Individu',
        delivery_method: 'online',
        amount: 250000,
        status: 'pending',
        midtrans_order_id: 'SLD-ORD-02',
        midtrans_transaction_id: null,
        payment_type: null,
        payment_time: null,
        created_at: '2026-11-22T09:10:00Z',
      },
    ];

    const totalPaid = samplePayments
      .filter((p) => p.status === 'paid')
      .reduce((acc, curr) => acc + curr.amount, 0);

    expect(totalPaid).toBe(250000);
  });

  it('counts unread notifications accurately', () => {
    const notifications: CustomerNotificationItem[] = [
      {
        id: 'n-1',
        user_id: 'u-1',
        title: 'Pembayaran Dikonfirmasi',
        message: 'Sesi Anda telah dikonfirmasi.',
        type: 'success',
        is_read: true,
        link: '/dashboard',
        created_at: '2026-11-22T10:00:00Z',
      },
      {
        id: 'n-2',
        user_id: 'u-1',
        title: 'Pengingat Sesi',
        message: 'Sesi konseling Anda besok pukul 10:00 WIB.',
        type: 'info',
        is_read: false,
        link: '/dashboard',
        created_at: '2026-11-22T11:00:00Z',
      },
    ];

    const unread = notifications.filter((n) => !n.is_read).length;
    expect(unread).toBe(1);
  });
});
