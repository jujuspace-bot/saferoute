import { LatLng, Route } from '../types';
import { searchRouteKakao } from './kakaoRoute';
import { searchRouteGoogle } from './googleRoute';

/**
 * 좌표가 한국 범위인지 판별합니다.
 * 위도 33~39, 경도 124~132
 */
function isInKorea(point: LatLng): boolean {
  return (
    point.latitude >= 33 &&
    point.latitude <= 39 &&
    point.longitude >= 124 &&
    point.longitude <= 132
  );
}

/**
 * 통합 경로 검색 — 국내(ODsay) / 해외(Google) 자동 분기
 */
export async function searchRoute(
  origin: LatLng,
  destination: LatLng,
  destinationName = '목적지',
): Promise<Route> {
  if (isInKorea(origin) && isInKorea(destination)) {
    return searchRouteKakao(origin, destination, destinationName);
  }
  return searchRouteGoogle(origin, destination, destinationName);
}
