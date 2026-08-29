import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Database } from '../types/database.types';

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export const profileService = {
  async getProfile(userId: string): Promise<{ data: ProfileRow | null; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return {
        data: {
          id: userId,
          full_name: 'Rajveer Sharma',
          email: 'demo@creatlifafa.com',
          mobile_number: '+91 98765 43210',
          username: 'rajveer07',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          is_trusted: true,
          role: 'user',
          referral_code: 'RAJ789',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    return { data, error };
  },

  async updateProfile(
    userId: string,
    updates: ProfileUpdate
  ): Promise<{ data: ProfileRow | null; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return {
        data: {
          id: userId,
          full_name: updates.full_name || 'Rajveer Sharma',
          email: 'demo@creatlifafa.com',
          mobile_number: updates.mobile_number || '+91 98765 43210',
          username: updates.username || 'rajveer07',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          is_trusted: true,
          role: 'user',
          referral_code: 'RAJ789',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    return { data, error };
  },
};
