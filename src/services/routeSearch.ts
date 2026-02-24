import { LatLng, Route, RouteStep } from '../types';

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ?? '';
const DIRECTIONS_URL = 'https://maps.googleapis.com/maps/api/directions/json';

/**
 * Google Maps Directions API를 사용해 대중교통 경로를 검색합니다.
 */
export async function searchRoute(
  origin: LatLng,
  destination: LatLng,
  destinationName = '목적지',
): Promise<Route> {
  const params = new URLSearchParams({
    origin: `${origin.latitude},${origin.longitude}`,
    destination: `${destination.latitude},${destination.longitude}`,
    mode: 'transit',
    language: 'ko',
    alternatives: 'false',
    key: API_KEY,
  });

  const res = await fetch(`${DIRECTIONS_URL}?${params}`);
  if (!res.ok) throw new Error(`Directions API 오류: ${res.status}`);

  const data = await res.json();
  if (data.status !== 'OK' || !data.routes?.length) {
    throw new Error(`경로를 찾을 수 없습니다 (${data.status})`);
  }

  return parseRoute(data.routes[0], origin, destination, destinationName);
}

// ── 내부 파서 ──────────────────────────────────

type TravelMode = 'WALKING' | 'TRANSIT';
type TransitVehicle = 'BUS' | 'SUBWAY' | 'HEAVY_RAIL' | 'LIGHT_RAIL' | 'TRAM' | string;

function toStepType(mode: TravelMode, vehicle?: TransitVehicle): RouteStep['type'] {
  if (mode === 'WALKING') return 'walk';
  switch (vehicle) {
    case 'BUS':
      return 'bus';
    case 'SUBWAY':
    case 'HEAVY_RAIL':
    case 'LIGHT_RAIL':
    case 'TRAM':
      return 'subway';
    default:
      return 'bus'; // 기타 대중교통은 버스로 분류
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

interface GoogleStep {
  html_instructions: string;
  travel_mode: TravelMode;
  start_location: { lat: number; lng: number };
  end_location: { lat: number; lng: number };
  duration: { value: number };
  transit_details?: {
    line?: { vehicle?: { type?: TransitVehicle }; short_name?: string; name?: string };
    departure_stop?: { name?: string };
    arrival_stop?: { name?: string };
    num_stops?: number;
  };
}

interface GoogleRoute {
  legs: Array<{
    steps: GoogleStep[];
    duration: { value: number };
    distance: { value: number };
    start_address: string;
    end_address: string;
    start_location: { lat: number; lng: number };
    end_location: { lat: number; lng: number };
  }>;
}

function parseRoute(
  raw: GoogleRoute,
  origin: LatLng,
  destination: LatLng,
  destinationName: string,
): Route {
  const leg = raw.legs[0];

  const steps: RouteStep[] = leg.steps.map((s, i) => {
    const vehicle = s.transit_details?.line?.vehicle?.type;
    const type = toStepType(s.travel_mode, vehicle);

    let detail: string | undefined;
    if (s.transit_details) {
      const td = s.transit_details;
      const lineName = td.line?.short_name ?? td.line?.name ?? '';
      detail = `${lineName} (${td.departure_stop?.name ?? ''} → ${td.arrival_stop?.name ?? ''}, ${td.num_stops ?? '?'}정거장)`;
    }

    return {
      id: `step-${i}`,
      order: i,
      instruction: stripHtml(s.html_instructions),
      type,
      from: { latitude: s.start_location.lat, longitude: s.start_location.lng },
      to: { latitude: s.end_location.lat, longitude: s.end_location.lng },
      duration: Math.round(s.duration.value / 60),
      detail,
    };
  });

  return {
    id: `route-${Date.now()}`,
    origin: {
      name: '현재 위치',
      address: leg.start_address,
      location: origin,
    },
    destination: {
      name: destinationName,
      address: leg.end_address,
      location: destination,
    },
    steps,
    totalDuration: Math.round(leg.duration.value / 60),
    totalDistance: leg.distance.value,
  };
}
