export type PresenceStatus = 'offline' | 'online' | 'available' | 'busy' | 'away';

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  senderName?: string;
  senderRole?: 'client' | 'psychologist' | 'admin' | 'system';
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  role: string;
  created_at: string;
  fullName?: string;
}

export interface Conversation {
  id: string;
  booking_id: string | null;
  created_at: string;
  updated_at: string;
  participants?: ConversationParticipant[];
  lastMessage?: ChatMessage;
  unreadCount?: number;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export interface WhatsAppTemplate {
  id: string;
  label: string;
  text: string;
  category: 'general' | 'booking' | 'reschedule' | 'technical';
}

export interface CrisisHotline {
  name: string;
  phone: string;
  telUri: string;
  description: string;
  is24Hours: boolean;
  category: 'mental_health' | 'emergency_medical' | 'suicide_prevention';
}
