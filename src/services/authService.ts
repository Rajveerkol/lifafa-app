import { supabase, isSupabaseConfigured } from '../lib/supabase';
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
  async signUp({ email, password, fullName, mobileNumber, username }: SignUpParams) {
    if (!isSupabaseConfigured) {
      // Mock signup for offline/dev fallback
      return {
        data: {
          user: {
            id: 'usr_local_demo',
            email,
            user_metadata: { full_name: fullName, mobile_number: mobileNumber, username },
          } as unknown as User,
          session: null,
        },
        error: null,
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          mobile_number: mobileNumber,
          username: username || email.split('@')[0],
        },
      },
    });

    return { data, error };
  },

  async signIn({ email, password }: SignInParams) {
    if (!isSupabaseConfigured) {
      // Mock signin for offline/dev fallback
      return {
        data: {
          user: {
            id: 'usr_local_demo',
            email,
            user_metadata: { full_name: 'Demo Account', username: 'DemoAccount' },
          } as unknown as User,
          session: {} as unknown as Session,
        },
        error: null,
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  },

  async signOut() {
    if (!isSupabaseConfigured) {
      return { error: null };
    }
    return await supabase.auth.signOut();
  },

  async getSession() {
    if (!isSupabaseConfigured) {
      return { data: { session: null }, error: null };
    }
    return await supabase.auth.getSession();
  },

  async getUser() {
    if (!isSupabaseConfigured) {
      return { data: { user: null }, error: null };
    }
    return await supabase.auth.getUser();
  },

  async resetPasswordForEmail(email: string) {
    if (!isSupabaseConfigured) {
      return { data: {}, error: null };
    }

    const redirectUrl = `${window.location.origin}/forgot-password?reset=true`;

    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
  },

  async updatePassword(password: string) {
    if (!isSupabaseConfigured) {
      return { data: {}, error: null };
    }
    return await supabase.auth.updateUser({ password });
  },

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
