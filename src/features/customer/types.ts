import type { PaymentStatus } from '@/features/payments/types';

export type CustomerTab = 'overview' | 'sessions' | 'payments' | 'profile' | 'notifications';
export type SessionFilter = 'upcoming' | 'history' | 'all';

export interface ClientProfileData {
  id?: string;
  customer_id: string;
  date_of_birth: string | null;
  gender: string | null;
  occupation: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerPaymentItem {
  id: string;
  booking_id: string;
  booking_code: string;
  service_name: string;
  delivery_method: string;
  amount: number;
  status: PaymentStatus;
  midtrans_order_id: string;
  midtrans_transaction_id: string | null;
  payment_type: string | null;
  payment_time: string | null;
  created_at: string;
}

export interface CustomerConsentRecord {
  id: string;
  customer_id: string;
  consent_type: string;
  version: string;
  agreed_at: string;
  ip_address: string | null;
}

export interface CustomerNotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export interface ReceiptData {
  orderId: string;
  bookingCode: string;
  customerName: string;
  customerEmail: string;
  serviceName: string;
  psychologistName: string;
  sessionDate: string;
  sessionTime: string;
  deliveryMethod: string;
  amount: number;
  paymentType: string;
  paymentTime: string;
  status: PaymentStatus;
}
