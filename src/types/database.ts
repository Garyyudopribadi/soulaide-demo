/**
 * Strict database type mappings for Soulaide Psychology Platform.
 * MANDATORY RULE: Every custom table MUST use the exact `Soulaide_` prefix.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      Soulaide_profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          phone_number: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          phone_number?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          phone_number?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      Soulaide_user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'customer' | 'psychologist' | 'admin' | 'super_admin'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'customer' | 'psychologist' | 'admin' | 'super_admin'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'customer' | 'psychologist' | 'admin' | 'super_admin'
          created_at?: string
        }
        Relationships: []
      }
      Soulaide_staff_members: {
        Row: {
          id: string
          user_id: string
          department: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          department: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          department?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      Soulaide_psychologists: {
        Row: {
          id: string
          user_id: string | null
          slug: string
          full_name: string
          credentials: string
          bio: string | null
          experience_years: string
          initial_schedule: string | null
          practice_areas: string[]
          approaches: string[]
          card_image_url: string | null
          profile_image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          slug: string
          full_name: string
          credentials: string
          bio?: string | null
          experience_years: string
          initial_schedule?: string | null
          practice_areas?: string[]
          approaches?: string[]
          card_image_url?: string | null
          profile_image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          slug?: string
          full_name?: string
          credentials?: string
          bio?: string | null
          experience_years?: string
          initial_schedule?: string | null
          practice_areas?: string[]
          approaches?: string[]
          card_image_url?: string | null
          profile_image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      Soulaide_service_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          created_at?: string
        }
        Relationships: []
      }
      Soulaide_services: {
        Row: {
          id: string
          category_id: string
          name: string
          slug: string
          description: string | null
          duration_minutes: number
          delivery_methods: string[]
          price_online: number | null
          price_offline: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          slug: string
          description?: string | null
          duration_minutes: number
          delivery_methods?: string[]
          price_online?: number | null
          price_offline?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          slug?: string
          description?: string | null
          duration_minutes?: number
          delivery_methods?: string[]
          price_online?: number | null
          price_offline?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      Soulaide_service_psychologists: {
        Row: {
          id: string
          service_id: string
          psychologist_id: string
          created_at: string
        }
        Insert: {
          id?: string
          service_id: string
          psychologist_id: string
          created_at?: string
        }
        Update: {
          id?: string
          service_id?: string
          psychologist_id?: string
          created_at?: string
        }
        Relationships: []
      }
      Soulaide_psychologist_schedules: {
        Row: {
          id: string
          psychologist_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          psychologist_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          psychologist_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      Soulaide_availability_overrides: {
        Row: {
          id: string
          psychologist_id: string
          override_date: string
          start_time: string | null
          end_time: string | null
          is_available: boolean
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          psychologist_id: string
          override_date: string
          start_time?: string | null
          end_time?: string | null
          is_available?: boolean
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          psychologist_id?: string
          override_date?: string
          start_time?: string | null
          end_time?: string | null
          is_available?: boolean
          reason?: string | null
          created_at?: string
        }
        Relationships: []
      }
      Soulaide_bookings: {
        Row: {
          id: string
          booking_code: string
          customer_id: string
          psychologist_id: string
          service_id: string
          session_date: string
          session_start_time: string
          session_end_time: string
          delivery_method: 'online' | 'offline'
          status: 'pending_payment' | 'confirmed' | 'reschedule_requested' | 'rescheduled' | 'completed' | 'cancelled' | 'no_show'
          notes: string | null
          meeting_link: string | null
          location_address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_code: string
          customer_id: string
          psychologist_id: string
          service_id: string
          session_date: string
          session_start_time: string
          session_end_time: string
          delivery_method: 'online' | 'offline'
          status?: 'pending_payment' | 'confirmed' | 'reschedule_requested' | 'rescheduled' | 'completed' | 'cancelled' | 'no_show'
          notes?: string | null
          meeting_link?: string | null
          location_address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_code?: string
          customer_id?: string
          psychologist_id?: string
          service_id?: string
          session_date?: string
          session_start_time?: string
          session_end_time?: string
          delivery_method?: 'online' | 'offline'
          status?: 'pending_payment' | 'confirmed' | 'reschedule_requested' | 'rescheduled' | 'completed' | 'cancelled' | 'no_show'
          notes?: string | null
          meeting_link?: string | null
          location_address?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      Soulaide_booking_status_history: {
        Row: {
          id: string
          booking_id: string
          from_status: string | null
          to_status: string
          changed_by: string | null
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          from_status?: string | null
          to_status: string
          changed_by?: string | null
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          from_status?: string | null
          to_status?: string
          changed_by?: string | null
          reason?: string | null
          created_at?: string
        }
        Relationships: []
      }
      Soulaide_reschedule_requests: {
        Row: {
          id: string
          booking_id: string
          requested_by: string
          proposed_date: string
          proposed_start_time: string
          proposed_end_time: string
          reason: string | null
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          booking_id: string
          requested_by: string
          proposed_date: string
          proposed_start_time: string
          proposed_end_time: string
          reason?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          booking_id?: string
          requested_by?: string
          proposed_date?: string
          proposed_start_time?: string
          proposed_end_time?: string
          reason?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          resolved_at?: string | null
        }
        Relationships: []
      }
      Soulaide_client_profiles: {
        Row: {
          id: string
          customer_id: string
          date_of_birth: string | null
          gender: string | null
          occupation: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          date_of_birth?: string | null
          gender?: string | null
          occupation?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          date_of_birth?: string | null
          gender?: string | null
          occupation?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      Soulaide_assessments: {
        Row: {
          id: string
          customer_id: string
          booking_id: string | null
          assessment_type: string
          answers: Json
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          booking_id?: string | null
          assessment_type: string
          answers?: Json
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          booking_id?: string | null
          assessment_type?: string
          answers?: Json
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      Soulaide_consent_records: {
        Row: {
          id: string
          customer_id: string
          consent_type: string
          version: string
          agreed_at: string
          ip_address: string | null
        }
        Insert: {
          id?: string
          customer_id: string
          consent_type: string
          version: string
          agreed_at?: string
          ip_address?: string | null
        }
        Update: {
          id?: string
          customer_id?: string
          consent_type?: string
          version?: string
          agreed_at?: string
          ip_address?: string | null
        }
        Relationships: []
      }
      Soulaide_clinical_notes: {
        Row: {
          id: string
          booking_id: string
          psychologist_id: string
          customer_id: string
          session_summary: string | null
          clinical_observations: string | null
          interventions_used: string | null
          recommendations: string | null
          is_confidential: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          psychologist_id: string
          customer_id: string
          session_summary?: string | null
          clinical_observations?: string | null
          interventions_used?: string | null
          recommendations?: string | null
          is_confidential?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          psychologist_id?: string
          customer_id?: string
          session_summary?: string | null
          clinical_observations?: string | null
          interventions_used?: string | null
          recommendations?: string | null
          is_confidential?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      Soulaide_clinical_reports: {
        Row: {
          id: string
          booking_id: string
          psychologist_id: string
          customer_id: string
          report_type: string
          file_path: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          psychologist_id: string
          customer_id: string
          report_type: string
          file_path: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          psychologist_id?: string
          customer_id?: string
          report_type?: string
          file_path?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      Soulaide_payments: {
        Row: {
          id: string
          booking_id: string
          amount: number
          status: 'pending' | 'paid' | 'failed' | 'expired' | 'refunded' | 'partially_refunded'
          midtrans_order_id: string
          midtrans_transaction_id: string | null
          payment_type: string | null
          payment_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          amount: number
          status?: 'pending' | 'paid' | 'failed' | 'expired' | 'refunded' | 'partially_refunded'
          midtrans_order_id: string
          midtrans_transaction_id?: string | null
          payment_type?: string | null
          payment_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          amount?: number
          status?: 'pending' | 'paid' | 'failed' | 'expired' | 'refunded' | 'partially_refunded'
          midtrans_order_id?: string
          midtrans_transaction_id?: string | null
          payment_type?: string | null
          payment_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      Soulaide_payment_webhook_events: {
        Row: {
          id: string
          event_id: string
          order_id: string
          raw_payload: Json
          processed_at: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          order_id: string
          raw_payload: Json
          processed_at?: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          order_id?: string
          raw_payload?: Json
          processed_at?: string
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      Soulaide_refunds: {
        Row: {
          id: string
          payment_id: string
          amount: number
          reason: string
          status: 'pending' | 'completed' | 'failed'
          created_at: string
        }
        Insert: {
          id?: string
          payment_id: string
          amount: number
          reason: string
          status?: 'pending' | 'completed' | 'failed'
          created_at?: string
        }
        Update: {
          id?: string
          payment_id?: string
          amount?: number
          reason?: string
          status?: 'pending' | 'completed' | 'failed'
          created_at?: string
        }
        Relationships: []
      }
      Soulaide_conversations: {
        Row: {
          id: string
          booking_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      Soulaide_conversation_participants: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
        Relationships: []
      }
      Soulaide_messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      Soulaide_psychologist_presence: {
        Row: {
          id: string
          psychologist_id: string
          status: 'offline' | 'online' | 'available' | 'busy' | 'away'
          last_active_at: string
        }
        Insert: {
          id?: string
          psychologist_id: string
          status?: 'offline' | 'online' | 'available' | 'busy' | 'away'
          last_active_at?: string
        }
        Update: {
          id?: string
          psychologist_id?: string
          status?: 'offline' | 'online' | 'available' | 'busy' | 'away'
          last_active_at?: string
        }
        Relationships: []
      }
      Soulaide_notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean
          link: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: string
          is_read?: boolean
          link?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          is_read?: boolean
          link?: string | null
          created_at?: string
        }
        Relationships: []
      }
      Soulaide_cms_pages: {
        Row: {
          id: string
          slug: string
          title: string
          content: Json
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          content?: Json
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          content?: Json
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      Soulaide_faqs: {
        Row: {
          id: string
          question: string
          answer: string
          category: string
          display_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          question: string
          answer: string
          category?: string
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          question?: string
          answer?: string
          category?: string
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      Soulaide_site_settings: {
        Row: {
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      Soulaide_audit_logs: {
        Row: {
          id: string
          actor_id: string | null
          action: string
          entity_name: string
          entity_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          actor_id?: string | null
          action: string
          entity_name: string
          entity_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          actor_id?: string | null
          action?: string
          entity_name?: string
          entity_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      Soulaide_get_user_role: {
        Args: { p_user_id: string }
        Returns: string | null
      }
      Soulaide_is_admin: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      Soulaide_is_psychologist: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      Soulaide_get_psychologist_id: {
        Args: { p_user_id: string }
        Returns: string | null
      }
      Soulaide_reserve_slot_atomic: {
        Args: {
          p_customer_id: string
          p_psychologist_id: string
          p_service_id: string
          p_session_date: string
          p_session_start_time: string
          p_delivery_method: string
          p_notes?: string | null
        }
        Returns: Json
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
