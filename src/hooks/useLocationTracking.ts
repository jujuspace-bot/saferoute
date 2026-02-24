import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { useAppStore } from '../stores/appStore';
import { requestLocationPermission, startLocationTracking, checkDeviation } from '../services/location';
import { shareLocation, sendDeviationAlert } from '../services/supabase';
import { speakDeviationAlert, speakNavigation } from '../services/voice';
import { APP_CONFIG } from '../constants/config';

export function useLocationTracking() {
  const {
    isNavigating,
    routeSteps,
    currentStepIndex,
    setCurrentLocation,
    setDeviated,
    isDeviated,
    userId,
    guardianId,
  } = useAppStore();

  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const lastShareRef = useRef<number>(0);

  useEffect(() => {
    if (!isNavigating) return;

    let mounted = true;

    const start = async () => {
      const granted = await requestLocationPermission();
      if (!granted || !mounted) return;

      subscriptionRef.current = await startLocationTracking(async (loc) => {
        if (!mounted) return;

        const { latitude, longitude } = loc.coords;
        setCurrentLocation({ latitude, longitude, timestamp: loc.timestamp });

        // 경로 이탈 감지
        // TODO: 실제 경로 포인트로 교체
        const routePoints = routeSteps.map((_, i) => ({
          latitude: 37.5665 + i * 0.001, // 더미
          longitude: 126.9780 + i * 0.001,
        }));

        const { isDeviated: deviated, minDistance } = checkDeviation(
          latitude, longitude, routePoints
        );

        setDeviated(deviated, minDistance);

        // 이탈 시 음성 경고
        if (deviated && !isDeviated) {
          await speakDeviationAlert(minDistance);
          // 보호자에게 알림
          if (userId && guardianId) {
            await sendDeviationAlert(userId, guardianId, latitude, longitude, minDistance);
          }
        }

        // 보호자에게 위치 공유 (주기적)
        const now = Date.now();
        if (userId && now - lastShareRef.current > APP_CONFIG.GUARDIAN_SHARE_INTERVAL) {
          lastShareRef.current = now;
          await shareLocation(userId, latitude, longitude, deviated);
        }
      });
    };

    start();

    return () => {
      mounted = false;
      subscriptionRef.current?.remove();
    };
  }, [isNavigating]);
}
