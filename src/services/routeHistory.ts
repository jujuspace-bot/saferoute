import { supabase } from './supabase';
import { LatLng } from '../types';

// ===== 타입 =====

export interface RouteHistoryEntry {
  id?: string;
  user_id: string;
  origin_name: string;
  origin_address: string;
  origin_lat: number;
  origin_lng: number;
  destination_name: string;
  destination_address: string;
  destination_lat: number;
  destination_lng: number;
  duration_min: number;
  distance_m: number;
  is_favorite: boolean;
  used_count: number;
  created_at?: string;
  last_used_at?: string;
}

// ===== 경로 히스토리 저장 =====

export async function saveRouteHistory(entry: Omit<RouteHistoryEntry, 'id' | 'created_at' | 'used_count'>) {
  // 동일 출발/도착이 이미 있으면 사용 횟수 증가
  const { data: existing } = await supabase
    .from('route_history')
    .select('id, used_count')
    .eq('user_id', entry.user_id)
    .eq('origin_name', entry.origin_name)
    .eq('destination_name', entry.destination_name)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('route_history')
      .update({
        used_count: existing.used_count + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
    return { error };
  }

  const { error } = await supabase.from('route_history').insert({
    ...entry,
    used_count: 1,
    last_used_at: new Date().toISOString(),
  });
  return { error };
}

// ===== 최근 경로 조회 =====

export async function getRecentRoutes(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('route_history')
    .select('*')
    .eq('user_id', userId)
    .order('last_used_at', { ascending: false })
    .limit(limit);

  return { routes: data as RouteHistoryEntry[] | null, error };
}

// ===== 자주 가는 곳 조회 =====

export async function getFrequentRoutes(userId: string, limit = 5) {
  const { data, error } = await supabase
    .from('route_history')
    .select('*')
    .eq('user_id', userId)
    .order('used_count', { ascending: false })
    .limit(limit);

  return { routes: data as RouteHistoryEntry[] | null, error };
}

// ===== 즐겨찾기 토글 =====

export async function toggleFavorite(routeId: string, isFavorite: boolean) {
  const { error } = await supabase
    .from('route_history')
    .update({ is_favorite: isFavorite })
    .eq('id', routeId);

  return { error };
}

// ===== 즐겨찾기 목록 =====

export async function getFavoriteRoutes(userId: string) {
  const { data, error } = await supabase
    .from('route_history')
    .select('*')
    .eq('user_id', userId)
    .eq('is_favorite', true)
    .order('last_used_at', { ascending: false });

  return { routes: data as RouteHistoryEntry[] | null, error };
}

// ===== 경로 삭제 =====

export async function deleteRouteHistory(routeId: string) {
  const { error } = await supabase
    .from('route_history')
    .delete()
    .eq('id', routeId);

  return { error };
}
