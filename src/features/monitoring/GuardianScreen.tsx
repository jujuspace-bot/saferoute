import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { BigButton } from '../../components/BigButton';
import { subscribeToLocation } from '../../services/supabase';

interface UserLocation {
  latitude: number;
  longitude: number;
  is_deviated: boolean;
  updated_at: string;
}

export function GuardianScreen() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // TODO: 실제 userId로 교체
    const channel = subscribeToLocation('user-id', (data: UserLocation) => {
      setUserLocation(data);
      setConnected(true);
    });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>👁️ 보호자 모니터링</Text>

      {/* 연결 상태 */}
      <View style={[styles.statusCard, connected ? styles.connected : styles.disconnected]}>
        <Text style={styles.statusIcon}>{connected ? '🟢' : '🔴'}</Text>
        <Text style={styles.statusText}>
          {connected ? '연결됨 — 위치 수신 중' : '연결 대기 중...'}
        </Text>
      </View>

      {/* 이탈 경고 */}
      {userLocation?.is_deviated && (
        <View style={styles.alertCard}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <Text style={styles.alertText}>경로 이탈 감지!</Text>
          <Text style={styles.alertSub}>
            사용자가 설정된 경로에서 벗어났습니다
          </Text>
        </View>
      )}

      {/* 위치 정보 */}
      {userLocation && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📍 현재 위치</Text>
          <Text style={styles.infoText}>
            위도: {userLocation.latitude.toFixed(6)}
          </Text>
          <Text style={styles.infoText}>
            경도: {userLocation.longitude.toFixed(6)}
          </Text>
          <Text style={styles.infoDetail}>
            마지막 업데이트: {new Date(userLocation.updated_at).toLocaleTimeString('ko-KR')}
          </Text>
        </View>
      )}

      {/* 액션 */}
      <View style={styles.actions}>
        <BigButton
          title="📞 전화하기"
          color={COLORS.secondary}
          onPress={() => {/* TODO: 전화 연결 */}}
        />
        <BigButton
          title="📢 음성 메시지 보내기"
          color="#8B5CF6"
          onPress={() => {/* TODO: 음성 메시지 */}}
          style={{ marginTop: SPACING.sm }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONTS.title,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  connected: {
    backgroundColor: '#ECFDF5',
  },
  disconnected: {
    backgroundColor: '#FEF2F2',
  },
  statusIcon: {
    fontSize: 20,
  },
  statusText: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.text,
  },
  alertCard: {
    backgroundColor: '#FEF2F2',
    borderColor: COLORS.danger,
    borderWidth: 2,
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  alertIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  alertText: {
    fontSize: FONTS.xlarge,
    fontWeight: '800',
    color: COLORS.danger,
  },
  alertSub: {
    fontSize: FONTS.medium,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  infoTitle: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: FONTS.medium,
    color: COLORS.text,
    marginBottom: 2,
  },
  infoDetail: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
  },
  actions: {
    marginTop: 'auto',
  },
});
