import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../constants/config';

export const supabase = createClient(
  SUPABASE_CONFIG.URL,
  SUPABASE_CONFIG.ANON_KEY
);

// ===== 보호자 모니터링 =====

// 위치 업데이트 전송 (사용자 → 보호자)
export async function shareLocation(
  userId: string,
  latitude: number,
  longitude: number,
  isDeviated: boolean
) {
  const { error } = await supabase.from('location_updates').upsert({
    user_id: userId,
    latitude,
    longitude,
    is_deviated: isDeviated,
    updated_at: new Date().toISOString(),
  });
  if (error) console.error('위치 공유 실패:', error);
}

// 보호자가 사용자 위치 구독 (실시간)
export function subscribeToLocation(
  userId: string,
  callback: (data: any) => void
) {
  return supabase
    .channel(`location:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'location_updates',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => callback(payload.new)
    )
    .subscribe();
}

// 이탈 알림 보내기
export async function sendDeviationAlert(
  userId: string,
  guardianId: string,
  latitude: number,
  longitude: number,
  distance: number
) {
  const { error } = await supabase.from('alerts').insert({
    user_id: userId,
    guardian_id: guardianId,
    type: 'deviation',
    latitude,
    longitude,
    distance,
    message: `경로에서 ${Math.round(distance)}m 벗어났습니다`,
    created_at: new Date().toISOString(),
  });
  if (error) console.error('이탈 알림 전송 실패:', error);
}

// 사용자-보호자 연결
export async function linkGuardian(userId: string, guardianCode: string) {
  const { data, error } = await supabase
    .from('guardian_links')
    .insert({ user_id: userId, guardian_code: guardianCode })
    .select()
    .single();

  return { data, error };
}
