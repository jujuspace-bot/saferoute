import { useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { UserRole } from '../types';
import * as auth from '../services/auth';

interface AuthState {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    loading: true,
    error: null,
  });

  // 초기 세션 로드
  useEffect(() => {
    (async () => {
      const { session } = await auth.getSession();
      if (session?.user) {
        const { profile } = await auth.getProfile(session.user.id);
        setState({
          user: session.user,
          session,
          role: profile?.role ?? (session.user.user_metadata?.role as UserRole) ?? null,
          loading: false,
          error: null,
        });
      } else {
        setState((s) => ({ ...s, loading: false }));
      }
    })();
  }, []);

  // 인증 상태 변화 구독
  useEffect(() => {
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { profile } = await auth.getProfile(session.user.id);
        setState({
          user: session.user,
          session,
          role: profile?.role ?? (session.user.user_metadata?.role as UserRole) ?? null,
          loading: false,
          error: null,
        });
      } else {
        setState({ user: null, session: null, role: null, loading: false, error: null });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    const { error } = await auth.signIn(email, password);
    if (error) {
      setState((s) => ({ ...s, loading: false, error: error.message }));
    }
    // 성공 시 onAuthStateChange가 상태 업데이트
  }, []);

  const register = useCallback(async (email: string, password: string, name: string, role: UserRole) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    const { error } = await auth.signUp(email, password, name, role);
    if (error) {
      setState((s) => ({ ...s, loading: false, error: error.message }));
    }
  }, []);

  const logout = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    await auth.signOut();
  }, []);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  return {
    ...state,
    isAuthenticated: !!state.session,
    login,
    register,
    logout,
    clearError,
  };
}
