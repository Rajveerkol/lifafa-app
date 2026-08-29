import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { authService, SignUpParams, SignInParams } from '../services/authService';
import { profileService, ProfileRow } from '../services/profileService';
import { walletService, WalletRow } from '../services/walletService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ProfileRow | null;
  wallet: WalletRow | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  refreshWallet: () => Promise<void>;
  signUp: (params: SignUpParams) => Promise<{ data: any; error: any }>;
  signIn: (params: SignInParams) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [wallet, setWallet] = useState<WalletRow | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const [profileRes, walletRes] = await Promise.all([
        profileService.getProfile(userId),
        walletService.getWallet(userId),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (walletRes.data) setWallet(walletRes.data);
    } catch (err) {
      console.error('Error fetching user profile/wallet:', err);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      const res = await profileService.getProfile(user.id);
      if (res.data) setProfile(res.data);
    }
  }, [user]);

  const refreshWallet = useCallback(async () => {
    if (user?.id) {
      const res = await walletService.getWallet(user.id);
      if (res.data) setWallet(res.data);
    }
  }, [user]);

  useEffect(() => {
    let mounted = true;

    // Check initial active session
    authService.getSession().then(({ data: { session: initialSession }, error }) => {
      if (!mounted) return;
      if (error) {
        console.warn('Supabase getSession error:', error);
      }
      setSession(initialSession);
      setUser(initialSession?.user ?? null);

      if (initialSession?.user?.id) {
        fetchUserData(initialSession.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user?.id) {
        await fetchUserData(newSession.user.id);
      } else {
        setProfile(null);
        setWallet(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchUserData]);

  const signUp = async (params: SignUpParams) => {
    setLoading(true);
    try {
      const res = await authService.signUp(params);
      if (res.data?.user) {
        setUser(res.data.user);
        setSession(res.data.session);
        await fetchUserData(res.data.user.id);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (params: SignInParams) => {
    setLoading(true);
    try {
      const res = await authService.signIn(params);
      if (res.data?.user) {
        setUser(res.data.user);
        setSession(res.data.session);
        await fetchUserData(res.data.user.id);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const res = await authService.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setWallet(null);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    return await authService.resetPasswordForEmail(email);
  };

  const updatePassword = async (password: string) => {
    return await authService.updatePassword(password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        wallet,
        loading,
        refreshProfile,
        refreshWallet,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
