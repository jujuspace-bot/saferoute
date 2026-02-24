import * as Location from 'expo-location';
import { APP_CONFIG } from '../constants/config';
import { useAppStore } from '../stores/appStore';

// 두 좌표 사이 거리 (미터) — Haversine 공식
export function getDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// 위치 권한 요청
export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return false;
  
  // 백그라운드 위치도 요청 (보호자 모니터링용)
  const bg = await Location.requestBackgroundPermissionsAsync();
  return true;
}

// 현재 위치 가져오기
export async function getCurrentLocation(): Promise<Location.LocationObject | null> {
  try {
    return await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
  } catch {
    return null;
  }
}

// 위치 추적 시작
export async function startLocationTracking(
  onUpdate: (location: Location.LocationObject) => void
): Promise<Location.LocationSubscription | null> {
  try {
    return await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: APP_CONFIG.LOCATION_UPDATE_INTERVAL,
        distanceInterval: 10, // 10m마다
      },
      onUpdate
    );
  } catch {
    return null;
  }
}

// 경로 이탈 감지
export function checkDeviation(
  currentLat: number,
  currentLon: number,
  routePoints: { latitude: number; longitude: number }[]
): { isDeviated: boolean; minDistance: number } {
  if (routePoints.length === 0) return { isDeviated: false, minDistance: 0 };

  let minDistance = Infinity;
  for (const point of routePoints) {
    const dist = getDistance(currentLat, currentLon, point.latitude, point.longitude);
    if (dist < minDistance) minDistance = dist;
  }

  return {
    isDeviated: minDistance > APP_CONFIG.DEVIATION_RADIUS,
    minDistance,
  };
}
