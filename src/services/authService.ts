import { supabase } from '../lib/supabase';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

export interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
  mobileNumber?: string;
  username?: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export const authService = {
  /**
   * Real Supabase User Registration
   */
  async signUp({ email, password, fullName, mobileNumber, username }: SignUpParams) {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          mobile_number: mobileNumber ? mobileNumber.trim() : null,
          username: username ? username.trim() : email.split('@')[0],
        },
      },
    });

    return { data, error };
  },

  /**
   * Real Supabase User Login
   */
  async signIn({ email, password }: SignInParams) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    return { data, error };
  },

  /**
   * Sign out current session
   */
  async signOut() {
    return await supabase.auth.signOut();
  },

  /**
   * Get active authenticated session
   */
  async getSession() {
    return await supabase.auth.getSession();
  },

  /**
   * Get authenticated user
   */
  async getUser() {
    return await supabase.auth.getUser();
  },

  /**
   * Request password reset email
   */
  async resetPasswordForEmail(email: string) {
    const redirectUrl = `${window.location.origin}/forgot-password?reset=true`;

    return await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectUrl,
    });
  },

  /**
   * Update password for authenticated user
   */
  async updatePassword(password: string) {
    return await supabase.auth.updateUser({ password });
  },

  /**
   * Listen for real authentication state changes
   */
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
