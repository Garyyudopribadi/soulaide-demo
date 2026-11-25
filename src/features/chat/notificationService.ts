import { supabase } from '@/lib/supabase/client.ts';
import type { NotificationItem } from './types.ts';

export const notificationService = {
  /**
   * Fetches user's notification list.
   */
  async getUserNotifications(userId: string): Promise<NotificationItem[]> {
    const { data, error } = await supabase
      .from('Soulaide_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Gagal memuat notifikasi pengguna:', error.message);
      return [];
    }

    return (data || []).map((n) => ({
      id: n.id,
      user_id: n.user_id,
      title: n.title,
      message: n.message,
      type: n.type,
      is_read: n.is_read,
      link: n.link,
      created_at: n.created_at,
    }));
  },

  /**
   * Marks a single notification as read.
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('Soulaide_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      throw new Error(`Gagal memperbarui notifikasi: ${error.message}`);
    }
  },

  /**
   * Marks all notifications of a user as read.
   */
  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('Soulaide_notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      throw new Error(`Gagal menandai seluruh notifikasi: ${error.message}`);
    }
  },

  /**
   * Subscribes to real-time notifications for a user.
   */
  subscribeToNotifications(
    userId: string,
    onNotification: (item: NotificationItem) => void
  ): () => void {
    const channel = supabase
      .channel(`notifications_user_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Soulaide_notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            user_id: string;
            title: string;
            message: string;
            type: string;
            is_read: boolean;
            link: string | null;
            created_at: string;
          };
          if (row) {
            onNotification({
              id: row.id,
              user_id: row.user_id,
              title: row.title,
              message: row.message,
              type: row.type,
              is_read: row.is_read,
              link: row.link,
              created_at: row.created_at,
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
