import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Database } from '../types/database.types';

export type NotificationRow = Database['public']['Tables']['notifications']['Row'];

export const notificationService = {
  async getNotifications(userId: string): Promise<{ data: NotificationRow[]; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data: (data as NotificationRow[]) || [], error };
  },

  async markAsRead(notificationId: string, userId: string): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured) {
      return { error: null };
    }

    const { error } = await (supabase
      .from('notifications')
      .update({ is_read: true } as any)
      .eq('id', notificationId)
      .eq('user_id', userId));

    return { error };
  },

  async markAllAsRead(userId: string): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured) {
      return { error: null };
    }

    const { error } = await (supabase
      .from('notifications')
      .update({ is_read: true } as any)
      .eq('user_id', userId)
      .eq('is_read', false));

    return { error };
  },
};
