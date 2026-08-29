import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export const profileService = {
  /**
   * Fetch real profile from Supabase profiles table
   */
  async getProfile(userId: string): Promise<{ data: ProfileRow | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      return { data, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  /**
   * Update real profile in Supabase profiles table
   */
  async updateProfile(
    userId: string,
    updates: ProfileUpdate
  ): Promise<{ data: ProfileRow | null; error: Error | null }> {
    try {
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
    } catch (err: any) {
      return { data: null, error: err };
    }
  },
};
