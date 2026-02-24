import { create } from 'zustand';

export type UserRole = 'user' | 'guardian';

export interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface RouteStep {
  instruction: string;
  distance: string;
  duration: string;
  type: 'walk' | 'bus' | 'subway' | 'transfer';
  stopName?: string;
  lineNumber?: string;
}

export interface AppState {
  // 사용자 정보
  userRole: UserRole;
  userId: string | null;
  guardianId: string | null;

  // 현재 위치
  currentLocation: Location | null;
  
  // 경로
  destination: string | null;
  routeSteps: RouteStep[];
  currentStepIndex: number;
  isNavigating: boolean;
  
  // 이탈 상태
  isDeviated: boolean;
  deviationDistance: number;
  
  // AI 대화
  isChatOpen: boolean;
  isListening: boolean;
  
  // 액션
  setUserRole: (role: UserRole) => void;
  setCurrentLocation: (location: Location) => void;
  setDestination: (dest: string) => void;
  setRouteSteps: (steps: RouteStep[]) => void;
  nextStep: () => void;
  setNavigating: (nav: boolean) => void;
  setDeviated: (deviated: boolean, distance?: number) => void;
  toggleChat: () => void;
  setListening: (listening: boolean) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  userRole: 'user',
  userId: null,
  guardianId: null,
  currentLocation: null,
  destination: null,
  routeSteps: [],
  currentStepIndex: 0,
  isNavigating: false,
  isDeviated: false,
  deviationDistance: 0,
  isChatOpen: false,
  isListening: false,

  setUserRole: (role) => set({ userRole: role }),
  setCurrentLocation: (location) => set({ currentLocation: location }),
  setDestination: (dest) => set({ destination: dest }),
  setRouteSteps: (steps) => set({ routeSteps: steps, currentStepIndex: 0 }),
  nextStep: () => set((s) => ({ currentStepIndex: Math.min(s.currentStepIndex + 1, s.routeSteps.length - 1) })),
  setNavigating: (nav) => set({ isNavigating: nav }),
  setDeviated: (deviated, distance = 0) => set({ isDeviated: deviated, deviationDistance: distance }),
  toggleChat: () => set((s) => ({ isChatOpen: !s.isChatOpen })),
  setListening: (listening) => set({ isListening: listening }),
  reset: () => set({
    destination: null,
    routeSteps: [],
    currentStepIndex: 0,
    isNavigating: false,
    isDeviated: false,
    deviationDistance: 0,
    isChatOpen: false,
  }),
}));
