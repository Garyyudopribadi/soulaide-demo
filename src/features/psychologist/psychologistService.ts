import { supabase } from '@/lib/supabase/client';
import type {
  PsychologistProfileData,
  AssignedBookingItem,
  ClinicalNoteRecord,
  ScheduleDayItem,
  PresenceStatus,
} from './types';

const DAY_NAMES = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

export const psychologistService = {
  /**
   * Fetch psychologist profile by linked user_id, or fallback to first active psychologist
   */
  async fetchMyPsychologistProfile(userId: string): Promise<PsychologistProfileData | null> {
    // 1. Try finding linked psychologist by user_id
    const { data: linked } = await supabase
      .from('Soulaide_psychologists')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (linked) {
      return (linked as unknown) as PsychologistProfileData;
    }

    // 2. Fallback to active psychologist in system for previewing dashboard
    const { data: firstPsych } = await supabase
      .from('Soulaide_psychologists')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    return ((firstPsych as unknown) as PsychologistProfileData) || null;
  },

  /**
   * Fetch all bookings assigned to this psychologist with client details
   */
  async fetchMyAssignedBookings(psychologistId: string): Promise<AssignedBookingItem[]> {
    // 1. Fetch bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('Soulaide_bookings')
      .select('*')
      .eq('psychologist_id', psychologistId)
      .order('session_date', { ascending: true });

    if (bookingsError || !bookings || bookings.length === 0) {
      return [];
    }

    const customerIds = Array.from(new Set(bookings.map((b) => b.customer_id)));
    const serviceIds = Array.from(new Set(bookings.map((b) => b.service_id)));
    const bookingIds = bookings.map((b) => b.id);

    // 2. Fetch customers profile
    const { data: profiles } = await supabase
      .from('Soulaide_profiles')
      .select('id, full_name, phone_number, email')
      .in('id', customerIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    // 3. Fetch emergency contacts from client_profiles
    const { data: clientProfiles } = await supabase
      .from('Soulaide_client_profiles')
      .select('customer_id, emergency_contact_name, emergency_contact_phone, emergency_contact_relation')
      .in('customer_id', customerIds);

    const clientProfileMap = new Map((clientProfiles || []).map((cp) => [cp.customer_id, cp]));

    // 4. Fetch services
    const { data: services } = await supabase
      .from('Soulaide_services')
      .select('id, name, duration_minutes')
      .in('id', serviceIds);

    const serviceMap = new Map((services || []).map((s) => [s.id, s]));

    // 5. Check which bookings already have clinical notes
    const { data: notes } = await supabase
      .from('Soulaide_clinical_notes')
      .select('booking_id')
      .in('booking_id', bookingIds);

    const notesSet = new Set((notes || []).map((n) => n.booking_id));

    return bookings.map((b) => {
      const p = profileMap.get(b.customer_id);
      const cp = clientProfileMap.get(b.customer_id);
      const s = serviceMap.get(b.service_id);

      return {
        id: b.id,
        booking_code: b.booking_code,
        customer_id: b.customer_id,
        service_id: b.service_id,
        psychologist_id: b.psychologist_id,
        session_date: b.session_date,
        session_start_time: b.session_start_time,
        session_end_time: b.session_end_time,
        delivery_method: b.delivery_method as 'online' | 'offline',
        status: b.status,
        notes: b.notes,
        meeting_link: b.meeting_link,
        location_address: b.location_address,
        created_at: b.created_at,
        service_name: s?.name || 'Konseling Psikologi',
        service_duration: s?.duration_minutes || 60,
        client: {
          id: b.customer_id,
          full_name: p?.full_name || 'Klien Soulaide',
          phone_number: p?.phone_number || null,
          email: p?.email || null,
          emergency_contact_name: cp?.emergency_contact_name || null,
          emergency_contact_phone: cp?.emergency_contact_phone || null,
          emergency_contact_relation: cp?.emergency_contact_relation || null,
        },
        has_clinical_notes: notesSet.has(b.id),
      };
    });
  },

  /**
   * Fetch presence status of psychologist
   */
  async fetchPresence(psychologistId: string): Promise<PresenceStatus> {
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let targetId = psychologistId;
    if (!UUID_REGEX.test(targetId)) {
      const { data: found } = await supabase
        .from('Soulaide_psychologists')
        .select('id')
        .eq('slug', targetId)
        .maybeSingle();
      if (found?.id && UUID_REGEX.test(found.id)) {
        targetId = found.id;
      } else {
        return 'available';
      }
    }

    const { data } = await supabase
      .from('Soulaide_psychologist_presence')
      .select('status')
      .eq('psychologist_id', targetId)
      .maybeSingle();

    return (data?.status as PresenceStatus) || 'offline';
  },

  /**
   * Update presence status
   */
  async updatePresence(psychologistId: string, status: PresenceStatus): Promise<void> {
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let targetId = psychologistId;
    if (!UUID_REGEX.test(targetId)) {
      const { data: found } = await supabase
        .from('Soulaide_psychologists')
        .select('id')
        .eq('slug', targetId)
        .maybeSingle();
      if (found?.id && UUID_REGEX.test(found.id)) {
        targetId = found.id;
      } else {
        return;
      }
    }

    const { error } = await supabase
      .from('Soulaide_psychologist_presence')
      .upsert(
        {
          psychologist_id: targetId,
          status,
          last_active_at: new Date().toISOString(),
        },
        { onConflict: 'psychologist_id' }
      );

    if (error) {
      console.error('Error updating presence:', error);
      const cleanMessage = error.message.replace(/supabase/gi, 'layanan').replace(/webp/gi, 'gambar');
      throw new Error(`Gagal memperbarui status: ${cleanMessage}`);
    }
  },

  /**
   * Save or update all weekly recurring schedules
   */
  async saveWeeklySchedules(
    psychologistId: string,
    schedules: ScheduleDayItem[]
  ): Promise<void> {
    for (const item of schedules) {
      const startTime = item.start_time.length === 5 ? `${item.start_time}:00` : item.start_time;
      const endTime = item.end_time.length === 5 ? `${item.end_time}:00` : item.end_time;

      if (item.id && !item.id.startsWith('default-')) {
        const { error } = await supabase
          .from('Soulaide_psychologist_schedules')
          .update({
            is_active: item.is_active,
            start_time: startTime,
            end_time: endTime,
          })
          .eq('id', item.id);

        if (error) {
          console.error(`Error updating schedule for day ${item.day_of_week}:`, error);
          throw new Error(`Gagal menyimpan jadwal ${item.day_name}: ${error.message}`);
        }
      } else {
        // Check if row already exists for this psychologist and day
        const { data: existing } = await supabase
          .from('Soulaide_psychologist_schedules')
          .select('id')
          .eq('psychologist_id', psychologistId)
          .eq('day_of_week', item.day_of_week)
          .maybeSingle();

        if (existing) {
          const { error } = await supabase
            .from('Soulaide_psychologist_schedules')
            .update({
              is_active: item.is_active,
              start_time: startTime,
              end_time: endTime,
            })
            .eq('id', existing.id);

          if (error) {
            console.error(`Error updating schedule for day ${item.day_of_week}:`, error);
            throw new Error(`Gagal menyimpan jadwal ${item.day_name}: ${error.message}`);
          }
        } else {
          const { error } = await supabase
            .from('Soulaide_psychologist_schedules')
            .insert({
              psychologist_id: psychologistId,
              day_of_week: item.day_of_week,
              start_time: startTime,
              end_time: endTime,
              is_active: item.is_active,
            });

          if (error) {
            console.error(`Error inserting schedule for day ${item.day_of_week}:`, error);
            throw new Error(`Gagal menambahkan jadwal ${item.day_name}: ${error.message}`);
          }
        }
      }
    }
  },

  /**
   * Update schedule item
   */
  async updateSchedule(
    scheduleId: string,
    isActive: boolean,
    startTime?: string,
    endTime?: string
  ): Promise<void> {
    const updateData: { is_active: boolean; start_time?: string; end_time?: string } = {
      is_active: isActive,
    };
    if (startTime) updateData.start_time = startTime;
    if (endTime) updateData.end_time = endTime;

    const { error } = await supabase
      .from('Soulaide_psychologist_schedules')
      .update(updateData)
      .eq('id', scheduleId);

    if (error) {
      console.error('Error updating schedule:', error);
    }
  },

  /**
   * Fetch weekly recurring schedules (Senin - Minggu)
   */
  async fetchWeeklySchedules(psychologistId: string): Promise<ScheduleDayItem[]> {
    const { data, error } = await supabase
      .from('Soulaide_psychologist_schedules')
      .select('*')
      .eq('psychologist_id', psychologistId)
      .order('day_of_week', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((d) => ({
        id: d.id,
        psychologist_id: d.psychologist_id,
        day_of_week: d.day_of_week,
        day_name: DAY_NAMES[d.day_of_week] || `Hari ${d.day_of_week}`,
        start_time: d.start_time.slice(0, 5),
        end_time: d.end_time.slice(0, 5),
        is_active: d.is_active,
      }));
    }

    // Default template (Senin - Jumat aktif, Sabtu - Minggu libur)
    return [1, 2, 3, 4, 5, 6, 0].map((day) => ({
      id: `default-${day}`,
      psychologist_id: psychologistId,
      day_of_week: day,
      day_name: DAY_NAMES[day],
      start_time: '09:00',
      end_time: '17:00',
      is_active: day >= 1 && day <= 5,
    }));
  },

  /**
   * Fetch confidential clinical notes for a booking
   */
  async fetchClinicalNote(bookingId: string): Promise<ClinicalNoteRecord | null> {
    const { data, error } = await supabase
      .from('Soulaide_clinical_notes')
      .select('*')
      .eq('booking_id', bookingId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching clinical note:', error);
      return null;
    }

    return (data as unknown) as ClinicalNoteRecord | null;
  },

  /**
   * Save or update confidential clinical note
   */
  async saveClinicalNote(note: ClinicalNoteRecord): Promise<void> {
    const { error } = await supabase
      .from('Soulaide_clinical_notes')
      .upsert({
        booking_id: note.booking_id,
        psychologist_id: note.psychologist_id,
        customer_id: note.customer_id,
        session_summary: note.session_summary,
        clinical_observations: note.clinical_observations,
        interventions_used: note.interventions_used,
        recommendations: note.recommendations,
        is_confidential: note.is_confidential,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'booking_id' });

    if (error) {
      throw new Error(`Gagal menyimpan catatan klinis: ${error.message}`);
    }
  },

  /**
   * Mark booking status as completed
   */
  async markSessionCompleted(bookingId: string): Promise<void> {
    const { error } = await supabase
      .from('Soulaide_bookings')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (error) {
      throw new Error(`Gagal menyelesaikan sesi: ${error.message}`);
    }
  },
};
