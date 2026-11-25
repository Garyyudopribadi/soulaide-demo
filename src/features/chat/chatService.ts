import { supabase } from '@/lib/supabase/client.ts';
import type { ChatMessage, Conversation } from './types.ts';

export const chatService = {
  /**
   * Finds or creates a coordination conversation for a specific booking.
   */
  async getOrCreateBookingConversation(
    bookingId: string,
    clientUserId: string,
    psychologistUserId: string
  ): Promise<Conversation> {
    // 1. Check existing conversation for this booking
    const { data: existingConvs, error: findError } = await supabase
      .from('Soulaide_conversations')
      .select('id, booking_id, created_at, updated_at')
      .eq('booking_id', bookingId)
      .limit(1);

    if (findError) {
      console.warn('Error fetching conversation:', findError);
    }

    if (existingConvs && existingConvs.length > 0) {
      const conv = existingConvs[0];
      return {
        id: conv.id,
        booking_id: conv.booking_id,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
      };
    }

    // 2. Create new conversation
    const { data: newConv, error: createError } = await supabase
      .from('Soulaide_conversations')
      .insert({ booking_id: bookingId })
      .select()
      .single();

    if (createError || !newConv) {
      throw new Error(`Gagal membuka kanal percakapan: ${createError?.message}`);
    }

    // 3. Register participants (Client & Psychologist)
    const participantsToInsert = [
      { conversation_id: newConv.id, user_id: clientUserId, role: 'client' },
      { conversation_id: newConv.id, user_id: psychologistUserId, role: 'psychologist' },
    ];

    const { error: partError } = await supabase
      .from('Soulaide_conversation_participants')
      .insert(participantsToInsert);

    if (partError) {
      console.warn('Warning inserting participants:', partError);
    }

    // 4. Send initial system welcome message
    await supabase.from('Soulaide_messages').insert({
      conversation_id: newConv.id,
      sender_id: clientUserId,
      content:
        '[Sistem Soulaide]: Kanal koordinasi pra-sesi telah aktif. Anda dapat mengonfirmasi kesiapan teknis atau tautan pertemuan sebelum sesi dimulai.',
      is_read: true,
    });

    return {
      id: newConv.id,
      booking_id: newConv.booking_id,
      created_at: newConv.created_at,
      updated_at: newConv.updated_at,
    };
  },

  /**
   * Fetches message history for a conversation.
   */
  async getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('Soulaide_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Gagal mengambil riwayat pesan: ${error.message}`);
    }

    return (data || []).map((msg) => ({
      id: msg.id,
      conversation_id: msg.conversation_id,
      sender_id: msg.sender_id,
      content: msg.content,
      is_read: msg.is_read,
      created_at: msg.created_at,
    }));
  },

  /**
   * Sends a new message to a conversation.
   */
  async sendMessage(conversationId: string, senderId: string, content: string): Promise<ChatMessage> {
    const trimmed = content.trim();
    if (!trimmed) {
      throw new Error('Pesan tidak boleh kosong.');
    }

    const { data, error } = await supabase
      .from('Soulaide_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: trimmed,
        is_read: false,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Gagal mengirim pesan: ${error?.message}`);
    }

    return {
      id: data.id,
      conversation_id: data.conversation_id,
      sender_id: data.sender_id,
      content: data.content,
      is_read: data.is_read,
      created_at: data.created_at,
    };
  },

  /**
   * Marks unread messages in a conversation as read.
   */
  async markMessagesAsRead(conversationId: string, currentUserId: string): Promise<void> {
    const { error } = await supabase
      .from('Soulaide_messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', currentUserId)
      .eq('is_read', false);

    if (error) {
      console.warn('Gagal menandai pesan terbaca:', error.message);
    }
  },

  /**
   * Subscribes to new messages in a conversation via Supabase Realtime channel.
   */
  subscribeToMessages(
    conversationId: string,
    onMessage: (message: ChatMessage) => void
  ): () => void {
    const channel = supabase
      .channel(`chat_room_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Soulaide_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newRow = payload.new as {
            id: string;
            conversation_id: string;
            sender_id: string;
            content: string;
            is_read: boolean;
            created_at: string;
          };
          if (newRow) {
            onMessage({
              id: newRow.id,
              conversation_id: newRow.conversation_id,
              sender_id: newRow.sender_id,
              content: newRow.content,
              is_read: newRow.is_read,
              created_at: newRow.created_at,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
