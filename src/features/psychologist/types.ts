export type PresenceStatus = 'offline' | 'online' | 'available' | 'busy' | 'away';
export type PsychologistTab = 'overview' | 'sessions' | 'calendar' | 'clinical' | 'profile';

export interface PsychologistProfileData {
  id: string;
  user_id?: string | null;
  full_name: string;
  slug: string;
  credentials: string;
  bio: string | null;
  experience_years: string;
  initial_schedule?: string | null;
  practice_areas: string[];
  approaches: string[];
  is_active: boolean;
  card_image_url: string | null;
  profile_image_url: string | null;
}

export interface AssignedBookingClient {
  id: string;
  full_name: string;
  phone_number: string | null;
  email: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_relation?: string | null;
}

export interface AssignedBookingItem {
  id: string;
  booking_code: string;
  customer_id: string;
  service_id: string;
  psychologist_id: string;
  session_date: string;
  session_start_time: string;
  session_end_time: string;
  delivery_method: 'online' | 'offline';
  status: string;
  notes: string | null;
  meeting_link: string | null;
  location_address: string | null;
  created_at: string;
  service_name: string;
  service_duration: number;
  client: AssignedBookingClient;
  has_clinical_notes?: boolean;
}

export interface ClinicalNoteRecord {
  id?: string;
  booking_id: string;
  psychologist_id: string;
  customer_id: string;
  session_summary: string;
  clinical_observations: string;
  interventions_used: string;
  recommendations: string;
  is_confidential: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ScheduleDayItem {
  id: string;
  psychologist_id: string;
  day_of_week: number;
  day_name: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}
