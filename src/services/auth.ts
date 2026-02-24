import { supabase } from './supabase';
import { UserRole } from '../types';

// ===== 회원가입 =====
export async function signUp(email: string, password: string, name: string, role: UserRole) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role },
    },
  });

  if (error) return { user: null, error };

  // 프로필 테이블에 역할 저장
  if (data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      name,
      role,
      created_at: new Date().toISOString(),
    });
  }

  return { user: data.user, error: null };
}

// ===== 로그인 =====
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { user: data?.user ?? null, session: data?.session ?? null, error };
}

// ===== 로그아웃 =====
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// ===== 현재 세션 =====
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data?.session ?? null, error };
}

// ===== 현재 사용자 =====
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  return { user: data?.user ?? null, error };
}

// ===== 프로필 조회 =====
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return { profile: data, error };
}

// ===== 역할 업데이트 =====
export async function updateRole(userId: string, role: UserRole) {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  return { error };
}

// ===== 인증 상태 변화 구독 =====
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}
