import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../stores/appStore';
import { checkDeviation } from '../services/location';
import { speakDeviationAlert } from '../services/voice';
import { sendDeviationPush } from '../services/notifications';
import { sendDeviationAlert, shareLocation } from '../services/supabase';

interface UseDeviationOptions {
  /** 경로 좌표 배열 */
  routePoints: { latitude: number; longitude: number }[];
  /** 보호자 ID (연결된 경우) */
  guardianId?: string | null;
  /** 활성화 여부 */
  enabled?: boolean;
  /** 이탈 재알림 쿨다운 (ms), 기본 30초 */
  cooldownMs?: number;
}

/**
 * 이탈 감지 전용 훅
 * - 위치 업데이트마다 경로 대비 체크
 * - 이탈 시: 음성 경고 + 푸시 알림 + 보호자 알림 동시 발동
 */
export function useDeviation({
  routePoints,
  guardianId,
  enabled = true,
  cooldownMs = 30_000,
}: UseDeviationOptions) {
  const currentLocation = useAppStore((s) => s.currentLocation);
  const userId = useAppStore((s) => s.userId);
  const setDeviated = useAppStore((s) => s.setDeviated);

  const lastAlertTime = useRef<number>(0);
  const wasDeviated = useRef(false);

  const handleDeviation = useCallback(
    async (lat: number, lon: number, distance: number) => {
      const now = Date.now();

      // 쿨다운 체크 — 이미 이탈 상태이고 최근에 알림을 보냈으면 스킵
      if (wasDeviated.current && now - lastAlertTime.current < cooldownMs) {
        return;
      }

      lastAlertTime.current = now;
      wasDeviated.current = true;
      setDeviated(true, distance);

      // 음성 + 푸시 + 보호자 알림 동시 발동
      const promises: Promise<void>[] = [
        speakDeviationAlert(distance),
        sendDeviationPush(distance),
      ];

      // 보호자가 연결되어 있으면 서버에 이탈 알림 전송
      if (userId && guardianId) {
        promises.push(
          sendDeviationAlert(userId, guardianId, lat, lon, distance)
        );
      }

      // 위치 공유 (이탈 상태 포함)
      if (userId) {
        promises.push(shareLocation(userId, lat, lon, true));
      }

      await Promise.allSettled(promises);
    },
    [guardianId, userId, cooldownMs, setDeviated]
  );

  useEffect(() => {
    if (!enabled || !currentLocation || routePoints.length === 0) return;

    const { latitude, longitude } = currentLocation;
    const { isDeviated, minDistance } = checkDeviation(
      latitude,
      longitude,
      routePoints
    );

    if (isDeviated) {
      handleDeviation(latitude, longitude, minDistance);
    } else {
      // 경로 복귀
      if (wasDeviated.current) {
        wasDeviated.current = false;
        setDeviated(false, 0);

        // 위치 공유 (정상 상태)
        if (userId) {
          shareLocation(userId, latitude, longitude, false);
        }
      }
    }
  }, [currentLocation, routePoints, enabled, handleDeviation, userId, setDeviated]);

  return {
    isDeviated: useAppStore((s) => s.isDeviated),
    deviationDistance: useAppStore((s) => s.deviationDistance),
  };
}
