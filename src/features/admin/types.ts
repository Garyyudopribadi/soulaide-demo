import type { PaymentStatus } from '@/features/payments/types';
import type { UserRole } from '@/types';

export type AdminTab =
  | 'overview'
  | 'bookings'
  | 'payments'
  | 'reports'
  | 'landing'
  | 'services'
  | 'psychologists'
  | 'staff'
  | 'audit-logs'
  | 'faqs'
  | 'settings'
  | 'profile';

export interface AdminBookingItem {
  id: string;
  booking_code: string;
  session_date: string;
  session_start_time: string;
  session_end_time: string;
  delivery_method: 'online' | 'offline';
  status: string;
  notes: string | null;
  meeting_link: string | null;
  location_address: string | null;
  created_at: string;
  customer: {
    id: string;
    full_name: string;
    email: string | null;
    phone_number: string | null;
  };
  psychologist: {
    id: string;
    full_name: string;
    credentials: string;
  };
  service: {
    id: string;
    name: string;
    price_online: number | null;
    price_offline: number | null;
  };
  payment?: {
    id: string;
    amount: number;
    status: PaymentStatus;
    midtrans_order_id: string;
  } | null;
}

export interface AdminPaymentItem {
  id: string;
  booking_id: string;
  booking_code: string;
  customer_name: string;
  customer_email: string | null;
  service_name: string;
  amount: number;
  status: PaymentStatus;
  midtrans_order_id: string;
  midtrans_transaction_id: string | null;
  payment_type: string | null;
  payment_time: string | null;
  created_at: string;
}

export interface AdminStaffItem {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string;
  phone_number?: string | null;
  avatar_url?: string | null;
  role: UserRole;
  created_at: string;
}

export interface AdminAuditLogItem {
  id: string;
  actor_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface AdminKpiSummary {
  totalBookings: number;
  confirmedBookings: number;
  pendingPayments: number;
  totalRevenue: number;
  verifiedPsychologists: number;
  activeServices: number;
}
