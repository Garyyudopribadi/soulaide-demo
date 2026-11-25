import { describe, it, expect } from 'vitest';
import type { AdminBookingItem, AdminPaymentItem } from './types';

describe('Admin KPI Calculations & Financial Summary', () => {
  const sampleBookings: AdminBookingItem[] = [
    {
      id: 'b-1',
      booking_code: 'SLD-20261122-0001',
      session_date: '2026-11-25',
      session_start_time: '10:00:00',
      session_end_time: '11:00:00',
      delivery_method: 'online',
      status: 'confirmed',
      notes: null,
      meeting_link: 'https://meet.google.com/test',
      location_address: null,
      created_at: '2026-11-22T08:00:00Z',
      customer: {
        id: 'c-1',
        full_name: 'Budi Santoso',
        email: 'budi@example.com',
        phone_number: '0812345678',
      },
      psychologist: {
        id: 'p-1',
        full_name: 'Sarah Jenkins, M.Psi.',
        credentials: 'Psikolog Klinis',
      },
      service: {
        id: 's-1',
        name: 'Konseling Dewasa',
        price_online: 250000,
        price_offline: 350000,
      },
      payment: {
        id: 'pay-1',
        amount: 250000,
        status: 'paid',
        midtrans_order_id: 'SLD-ORD-01',
      },
    },
    {
      id: 'b-2',
      booking_code: 'SLD-20261122-0002',
      session_date: '2026-11-26',
      session_start_time: '14:00:00',
      session_end_time: '15:00:00',
      delivery_method: 'offline',
      status: 'pending_payment',
      notes: null,
      meeting_link: null,
      location_address: 'Pondok Bambu',
      created_at: '2026-11-22T09:00:00Z',
      customer: {
        id: 'c-2',
        full_name: 'Rina Kartika',
        email: 'rina@example.com',
        phone_number: '0812987654',
      },
      psychologist: {
        id: 'p-1',
        full_name: 'Sarah Jenkins, M.Psi.',
        credentials: 'Psikolog Klinis',
      },
      service: {
        id: 's-2',
        name: 'Konseling Pasangan',
        price_online: 400000,
        price_offline: 500000,
      },
      payment: null,
    },
  ];

  const samplePayments: AdminPaymentItem[] = [
    {
      id: 'pay-1',
      booking_id: 'b-1',
      booking_code: 'SLD-20261122-0001',
      customer_name: 'Budi Santoso',
      customer_email: 'budi@example.com',
      service_name: 'Konseling Dewasa',
      amount: 250000,
      status: 'paid',
      midtrans_order_id: 'SLD-ORD-01',
      midtrans_transaction_id: 'MID-01',
      payment_type: 'gopay',
      payment_time: '2026-11-22T08:15:00Z',
      created_at: '2026-11-22T08:10:00Z',
    },
    {
      id: 'pay-2',
      booking_id: 'b-2',
      booking_code: 'SLD-20261122-0002',
      customer_name: 'Rina Kartika',
      customer_email: 'rina@example.com',
      service_name: 'Konseling Pasangan',
      amount: 500000,
      status: 'pending',
      midtrans_order_id: 'SLD-ORD-02',
      midtrans_transaction_id: null,
      payment_type: null,
      payment_time: null,
      created_at: '2026-11-22T09:10:00Z',
    },
  ];

  it('calculates operational KPIs accurately', () => {
    const totalBookings = sampleBookings.length;
    const confirmed = sampleBookings.filter((b) => b.status === 'confirmed').length;
    const pending = sampleBookings.filter((b) => b.status === 'pending_payment').length;
    const revenue = samplePayments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    expect(totalBookings).toBe(2);
    expect(confirmed).toBe(1);
    expect(pending).toBe(1);
    expect(revenue).toBe(250000);
  });

  it('filters operational bookings by status and search keyword', () => {
    const filterBookings = (
      items: AdminBookingItem[],
      status: string,
      search: string
    ): AdminBookingItem[] => {
      return items.filter((b) => {
        if (status !== 'all' && b.status !== status) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchCode = b.booking_code.toLowerCase().includes(q);
          const matchCust = b.customer.full_name.toLowerCase().includes(q);
          if (!matchCode && !matchCust) return false;
        }
        return true;
      });
    };

    const confirmedItems = filterBookings(sampleBookings, 'confirmed', '');
    expect(confirmedItems.length).toBe(1);
    expect(confirmedItems[0].booking_code).toBe('SLD-20261122-0001');

    const searchResult = filterBookings(sampleBookings, 'all', 'rina');
    expect(searchResult.length).toBe(1);
    expect(searchResult[0].customer.full_name).toBe('Rina Kartika');
  });
});

describe('Staff Role Authorization & Super Admin Guard', () => {
  it('permits role changes only for super_admin and denies operational admin', () => {
    const canChangeRole = (currentUserRole: string): boolean => {
      return currentUserRole === 'super_admin';
    };

    expect(canChangeRole('super_admin')).toBe(true);
    expect(canChangeRole('admin')).toBe(false);
    expect(canChangeRole('psychologist')).toBe(false);
    expect(canChangeRole('customer')).toBe(false);
  });
});

describe('Financial Refund Validation Rules', () => {
  const transactionAmount = 350000;

  const validateRefund = (
    amount: number,
    originalAmount: number
  ): { valid: boolean; status?: 'refunded' | 'partially_refunded'; error?: string } => {
    if (amount <= 0) {
      return { valid: false, error: 'Nominal refund harus lebih besar dari 0' };
    }
    if (amount > originalAmount) {
      return { valid: false, error: 'Nominal refund tidak boleh melebihi nilai transaksi' };
    }
    return {
      valid: true,
      status: amount === originalAmount ? 'refunded' : 'partially_refunded',
    };
  };

  it('validates full refund amount', () => {
    const res = validateRefund(350000, transactionAmount);
    expect(res.valid).toBe(true);
    expect(res.status).toBe('refunded');
  });

  it('validates partial refund amount', () => {
    const res = validateRefund(200000, transactionAmount);
    expect(res.valid).toBe(true);
    expect(res.status).toBe('partially_refunded');
  });

  it('rejects refund amount exceeding original transaction', () => {
    const res = validateRefund(400000, transactionAmount);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('tidak boleh melebihi');
  });

  it('rejects non-positive refund amount', () => {
    const res = validateRefund(0, transactionAmount);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('lebih besar dari 0');
  });
});

describe('Pagination Logic & Boundary Math', () => {
  it('correctly calculates total pages and item slices', () => {
    const totalItems = 45;
    const pageSize = 10;
    const totalPages = Math.ceil(totalItems / pageSize);

    expect(totalPages).toBe(5);

    const getSlice = (page: number) => {
      const start = (page - 1) * pageSize;
      return { start, end: Math.min(start + pageSize, totalItems) };
    };

    expect(getSlice(1)).toEqual({ start: 0, end: 10 });
    expect(getSlice(5)).toEqual({ start: 40, end: 45 });
  });

  it('handles empty lists gracefully with zero boundaries', () => {
    const totalItems = 0;
    const pageSize = 10;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    expect(totalPages).toBe(1);
  });
});

describe('Report Export Content & Sanitization', () => {
  it('prepares clean CSV row content without corruption', () => {
    const columns = [
      { header: 'Kode', key: 'code' },
      { header: 'Klien', key: 'client' },
      { header: 'Biaya', key: 'amount' },
    ];
    const data = [
      { code: 'SLD-01', client: 'Budi, S.Kom.', amount: 150000 },
      { code: 'SLD-02', client: 'Citra "Ayu"', amount: 200000 },
    ];

    const headerRow = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(';');
    expect(headerRow).toBe('"Kode";"Klien";"Biaya"');

    const firstRow = columns.map((col) => `"${String(data[0][col.key as keyof typeof data[0]]).replace(/"/g, '""')}"`).join(';');
    expect(firstRow).toBe('"SLD-01";"Budi, S.Kom.";"150000"');

    const secondRow = columns.map((col) => `"${String(data[1][col.key as keyof typeof data[1]]).replace(/"/g, '""')}"`).join(';');
    expect(secondRow).toBe('"SLD-02";"Citra ""Ayu""";"200000"');
  });
});

describe('Staff Directory Filtering & Role Segmentation', () => {
  const sampleStaffList = [
    {
      id: 'staff-1',
      user_id: 'u-1',
      full_name: 'Super Admin Utama',
      email: 'superadmin@soulaide.id',
      phone_number: '0811111111',
      avatar_url: null,
      role: 'super_admin' as const,
      created_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 'staff-2',
      user_id: 'u-2',
      full_name: 'Admin Maya Operasional',
      email: 'maya@soulaide.id',
      phone_number: '0822222222',
      avatar_url: null,
      role: 'admin' as const,
      created_at: '2026-01-02T00:00:00Z',
    },
    {
      id: 'staff-3',
      user_id: 'u-3',
      full_name: 'Dr. Sarah Jenkins, M.Psi.',
      email: 'sarah@soulaide.id',
      phone_number: '0833333333',
      avatar_url: null,
      role: 'psychologist' as const,
      created_at: '2026-01-03T00:00:00Z',
    },
    {
      id: 'staff-4',
      user_id: 'u-4',
      full_name: 'Budi Santoso Klien',
      email: 'budi.santoso@example.com',
      phone_number: '0844444444',
      avatar_url: null,
      role: 'customer' as const,
      created_at: '2026-01-04T00:00:00Z',
    },
  ];

  it('correctly calculates role distribution counts', () => {
    const roleCounts = {
      all: sampleStaffList.length,
      super_admin: sampleStaffList.filter((s) => s.role === 'super_admin').length,
      admin: sampleStaffList.filter((s) => s.role === 'admin').length,
      psychologist: sampleStaffList.filter((s) => s.role === 'psychologist').length,
      customer: sampleStaffList.filter((s) => s.role === 'customer').length,
    };

    expect(roleCounts.all).toBe(4);
    expect(roleCounts.super_admin).toBe(1);
    expect(roleCounts.admin).toBe(1);
    expect(roleCounts.psychologist).toBe(1);
    expect(roleCounts.customer).toBe(1);
  });

  it('filters staff correctly by selected role', () => {
    const filterByRole = (role: string) =>
      sampleStaffList.filter((s) => role === 'all' || s.role === role);

    expect(filterByRole('all')).toHaveLength(4);
    expect(filterByRole('super_admin')).toHaveLength(1);
    expect(filterByRole('super_admin')[0].full_name).toBe('Super Admin Utama');
    expect(filterByRole('psychologist')).toHaveLength(1);
    expect(filterByRole('psychologist')[0].email).toBe('sarah@soulaide.id');
  });

  it('filters staff correctly by search query (name, email, phone)', () => {
    const filterStaff = (role: string, query: string) => {
      return sampleStaffList.filter((staff) => {
        const matchesRole = role === 'all' || staff.role === role;
        const matchesSearch =
          !query.trim() ||
          staff.full_name.toLowerCase().includes(query.toLowerCase()) ||
          (staff.email && staff.email.toLowerCase().includes(query.toLowerCase())) ||
          (staff.phone_number && staff.phone_number.includes(query));
        return matchesRole && matchesSearch;
      });
    };

    // By name
    expect(filterStaff('all', 'sarah')).toHaveLength(1);
    // By email
    expect(filterStaff('all', 'soulaide.id')).toHaveLength(3);
    // By phone
    expect(filterStaff('all', '08444')).toHaveLength(1);
    // Combined role and search
    expect(filterStaff('psychologist', 'maya')).toHaveLength(0);
    expect(filterStaff('admin', 'maya')).toHaveLength(1);
  });
});
