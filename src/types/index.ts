// ===== 사용자 & 인증 =====

export type UserRole = 'user' | 'guardian';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  phone?: string;
  guardianId?: string; // 사용자의 보호자 ID
  linkedUsers?: string[]; // 보호자가 관리하는 사용자 ID 목록
  createdAt: string;
}

// ===== 위치 & 경로 =====

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface RouteStep {
  id: string;
  order: number;
  instruction: string; // "3번 출구로 나가세요"
  type: 'walk' | 'bus' | 'subway' | 'transfer';
  from: LatLng;
  to: LatLng;
  duration: number; // 분
  detail?: string; // 추가 설명
}

export interface Route {
  id: string;
  origin: Place;
  destination: Place;
  steps: RouteStep[];
  totalDuration: number; // 분
  totalDistance: number; // 미터
}

export interface Place {
  name: string;
  address: string;
  location: LatLng;
}

// ===== 경로 이탈 =====

export type AlertLevel = 'warning' | 'danger';

export interface DeviationAlert {
  id: string;
  userId: string;
  routeId: string;
  currentLocation: LatLng;
  expectedLocation: LatLng;
  distanceOff: number; // 미터
  level: AlertLevel;
  timestamp: string;
  resolved: boolean;
}

// ===== AI 대화 =====

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

// ===== 보호자 모니터링 =====

export interface MonitoringData {
  userId: string;
  userName: string;
  currentLocation: LatLng;
  activeRoute?: Route;
  currentStep?: number;
  isOnTrack: boolean;
  lastUpdated: string;
}

// ===== 앱 상태 =====

export interface AppState {
  userRole: UserRole;
  isNavigating: boolean;
  currentRoute: Route | null;
  currentStep: number;
  setUserRole: (role: UserRole) => void;
  setRoute: (route: Route | null) => void;
  setCurrentStep: (step: number) => void;
  setIsNavigating: (v: boolean) => void;
}
