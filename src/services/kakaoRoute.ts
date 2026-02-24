import { LatLng, Route, RouteStep } from '../types';

const ODSAY_KEY = process.env.EXPO_PUBLIC_ODSAY_KEY ?? '';
const ODSAY_URL = 'https://api.odsay.com/v1/api/searchPubTransPathT';

/**
 * ODsay 대중교통 API를 사용해 국내 대중교통 경로를 검색합니다.
 */
export async function searchRouteKakao(
  origin: LatLng,
  destination: LatLng,
  destinationName = '목적지',
): Promise<Route> {
  const params = new URLSearchParams({
    SX: String(origin.longitude),
    SY: String(origin.latitude),
    EX: String(destination.longitude),
    EY: String(destination.latitude),
    apiKey: ODSAY_KEY,
  });

  const res = await fetch(`${ODSAY_URL}?${params}`);
  if (!res.ok) throw new Error(`ODsay API 오류: ${res.status}`);

  const data = await res.json();

  if (data.error || !data.result?.path?.length) {
    throw new Error(
      `경로를 찾을 수 없습니다 (${data.error?.msg ?? 'no path'})`,
    );
  }

  // 첫 번째 경로 사용
  const path = data.result.path[0];
  return parsePath(path, origin, destination, destinationName);
}

// ── ODsay subPathType 매핑 ─────────────────────

function toStepType(subPathType: number): RouteStep['type'] {
  switch (subPathType) {
    case 1:
      return 'subway';
    case 2:
      return 'bus';
    case 3:
      return 'walk';
    default:
      return 'walk';
  }
}

// ── ODsay 응답 인터페이스 ──────────────────────

interface OdsayLane {
  name?: string;
  busNo?: string;
  subwayCode?: number;
}

interface OdsayStation {
  stationName?: string;
  x?: number;
  y?: number;
}

interface OdsaySubPath {
  trafficType: number; // 1=지하철, 2=버스, 3=도보
  sectionTime: number; // 분
  distance: number; // 미터
  stationCount?: number;
  startName?: string;
  startX?: number;
  startY?: number;
  endName?: string;
  endX?: number;
  endY?: number;
  lane?: OdsayLane[];
  passStopList?: { stations?: OdsayStation[] };
}

interface OdsayPath {
  info: {
    totalTime: number; // 분
    totalDistance: number; // 미터
    payment: number;
  };
  subPath: OdsaySubPath[];
}

function parsePath(
  path: OdsayPath,
  origin: LatLng,
  destination: LatLng,
  destinationName: string,
): Route {
  const steps: RouteStep[] = path.subPath
    .filter((sp) => sp.sectionTime > 0 || sp.trafficType !== 3)
    .map((sp, i) => {
      const type = toStepType(sp.trafficType);

      let instruction: string;
      let detail: string | undefined;

      if (type === 'walk') {
        instruction = `도보 이동 ${sp.distance}m`;
      } else {
        const laneName =
          sp.lane?.[0]?.busNo ?? sp.lane?.[0]?.name ?? '';
        instruction = `${laneName} 탑승`;
        detail = `${sp.startName ?? ''} → ${sp.endName ?? ''} (${sp.stationCount ?? '?'}정거장)`;
      }

      return {
        id: `step-${i}`,
        order: i,
        instruction,
        type,
        from: {
          latitude: sp.startY ?? origin.latitude,
          longitude: sp.startX ?? origin.longitude,
        },
        to: {
          latitude: sp.endY ?? destination.latitude,
          longitude: sp.endX ?? destination.longitude,
        },
        duration: sp.sectionTime,
        detail,
      };
    });

  return {
    id: `route-${Date.now()}`,
    origin: {
      name: '현재 위치',
      address: '',
      location: origin,
    },
    destination: {
      name: destinationName,
      address: '',
      location: destination,
    },
    steps,
    totalDuration: path.info.totalTime,
    totalDistance: path.info.totalDistance,
  };
}
