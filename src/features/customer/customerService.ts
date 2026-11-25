import { supabase } from '@/lib/supabase/client';
import type {
  ClientProfileData,
  CustomerPaymentItem,
  CustomerConsentRecord,
  CustomerNotificationItem,
} from './types';
import type { PaymentStatus } from '@/features/payments/types';

export const customerService = {
  /**
   * Fetch extra client intake profile (DOB, occupation, emergency contact)
   */
  async fetchCustomerClientProfile(userId: string): Promise<ClientProfileData | null> {
    const { data, error } = await supabase
      .from('Soulaide_client_profiles')
      .select('*')
      .eq('customer_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching client profile:', error);
      return null;
    }

    return (data as unknown) as ClientProfileData | null;
  },

  /**
   * Update or upsert client demographic & emergency contact profile
   */
  async updateCustomerClientProfile(
    userId: string,
    profileData: Partial<ClientProfileData>
  ): Promise<ClientProfileData> {
    const { data, error } = await supabase
      .from('Soulaide_client_profiles')
      .upsert({
        customer_id: userId,
        date_of_birth: profileData.date_of_birth || null,
        gender: profileData.gender || null,
        occupation: profileData.occupation || null,
        emergency_contact_name: profileData.emergency_contact_name || null,
        emergency_contact_phone: profileData.emergency_contact_phone || null,
        emergency_contact_relation: profileData.emergency_contact_relation || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'customer_id' })
      .select()
      .single();

    if (error) {
      throw new Error(`Gagal menyimpan data profil: ${error.message}`);
    }

    return (data as unknown) as ClientProfileData;
  },

  /**
   * Update base user profile (Full name, phone)
   */
  async updateUserProfile(
    userId: string,
    data: { full_name?: string; phone_number?: string | null; avatar_url?: string | null }
  ): Promise<void> {
    const { error } = await supabase
      .from('Soulaide_profiles')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Gagal memperbarui profil pengguna: ${error.message}`);
    }
  },

  /**
   * Fetch complete customer payment transactions with booking details
   */
  async fetchCustomerPaymentHistory(userId: string): Promise<CustomerPaymentItem[]> {
    // 1. Fetch all bookings for this customer
    const { data: bookings, error: bookingsError } = await supabase
      .from('Soulaide_bookings')
      .select('id, booking_code, delivery_method, service_id')
      .eq('customer_id', userId);

    if (bookingsError || !bookings || bookings.length === 0) {
      return [];
    }

    const bookingIds = bookings.map((b) => b.id);
    const serviceIds = Array.from(new Set(bookings.map((b) => b.service_id)));

    // 2. Fetch service names
    const { data: services } = await supabase
      .from('Soulaide_services')
      .select('id, name')
      .in('id', serviceIds);

    const serviceNameMap = new Map((services || []).map((s) => [s.id, s.name]));
    const bookingMap = new Map(
      bookings.map((b) => [
        b.id,
        {
          code: b.booking_code,
          method: b.delivery_method,
          serviceName: serviceNameMap.get(b.service_id) || 'Konseling Psikologi',
        },
      ])
    );

    // 3. Fetch payments
    const { data: payments, error: paymentsError } = await supabase
      .from('Soulaide_payments')
      .select('*')
      .in('booking_id', bookingIds)
      .order('created_at', { ascending: false });

    if (paymentsError || !payments) {
      return [];
    }

    return payments.map((p) => {
      const bInfo = bookingMap.get(p.booking_id);
      return {
        id: p.id,
        booking_id: p.booking_id,
        booking_code: bInfo?.code || 'SLD-UNKNOWN',
        service_name: bInfo?.serviceName || 'Layanan Psikologi',
        delivery_method: bInfo?.method || 'online',
        amount: Number(p.amount),
        status: p.status as PaymentStatus,
        midtrans_order_id: p.midtrans_order_id,
        midtrans_transaction_id: p.midtrans_transaction_id,
        payment_type: p.payment_type,
        payment_time: p.payment_time,
        created_at: p.created_at,
      };
    });
  },

  /**
   * Fetch customer signed consent records
   */
  async fetchCustomerConsents(userId: string): Promise<CustomerConsentRecord[]> {
    const { data, error } = await supabase
      .from('Soulaide_consent_records')
      .select('*')
      .eq('customer_id', userId)
      .order('agreed_at', { ascending: false });

    if (error) {
      console.error('Error fetching consent records:', error);
      return [];
    }

    return (data as unknown) as CustomerConsentRecord[];
  },

  /**
   * Fetch customer notifications
   */
  async fetchCustomerNotifications(userId: string): Promise<CustomerNotificationItem[]> {
    const { data, error } = await supabase
      .from('Soulaide_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return (data as unknown) as CustomerNotificationItem[];
  },

  /**
   * Mark single notification as read
   */
  async markNotificationRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('Soulaide_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification read:', error);
    }
  },

  /**
   * Mark all notifications as read for current user
   */
  async markAllNotificationsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('Soulaide_notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications read:', error);
    }
  },
};
