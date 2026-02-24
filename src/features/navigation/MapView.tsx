import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MapViewRN, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as ExpoLocation from 'expo-location';
import { LatLng, Route } from '../../types';
import { COLORS } from '../../constants/theme';

interface Props {
  route: Route | null;
}

const STEP_COLORS: Record<string, string> = {
  walk: COLORS.primary,
  bus: '#4CAF50',
  subway: '#2196F3',
  transfer: '#FF9800',
};

export default function MapView({ route }: Props) {
  const mapRef = useRef<MapViewRN>(null);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 현재 위치 가져오기
  useEffect(() => {
    (async () => {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('위치 권한이 필요합니다');
        return;
      }
      const loc = await ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.High });
      setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    })();
  }, []);

  // 경로가 설정되면 지도 범위 조정
  useEffect(() => {
    if (!route || !mapRef.current) return;
    const points = route.steps.flatMap((s) => [s.from, s.to]);
    if (userLocation) points.push(userLocation);
    if (points.length > 0) {
      mapRef.current.fitToCoordinates(points, {
        edgePadding: { top: 80, right: 60, bottom: 80, left: 60 },
        animated: true,
      });
    }
  }, [route, userLocation]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!userLocation) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loading}>위치를 가져오는 중...</Text>
      </View>
    );
  }

  // 경로 폴리라인 세그먼트
  const polylines = route?.steps.map((step) => ({
    key: step.id,
    coordinates: [step.from, step.to],
    color: STEP_COLORS[step.type] ?? COLORS.primary,
  })) ?? [];

  return (
    <MapViewRN
      ref={mapRef}
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      showsUserLocation
      showsMyLocationButton
      initialRegion={{
        ...userLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      {/* 현재 위치 마커 */}
      <Marker coordinate={userLocation} title="현재 위치" pinColor={COLORS.primary} />

      {/* 목적지 마커 */}
      {route && (
        <Marker
          coordinate={route.destination.location}
          title={route.destination.name}
          description={route.destination.address}
          pinColor="#E53935"
        />
      )}

      {/* 경로 폴리라인 */}
      {polylines.map((pl) => (
        <Polyline
          key={pl.key}
          coordinates={pl.coordinates}
          strokeColor={pl.color}
          strokeWidth={5}
          lineDashPattern={pl.color === COLORS.primary ? [6, 4] : undefined}
        />
      ))}
    </MapViewRN>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { fontSize: 16, color: '#E53935', textAlign: 'center', padding: 20 },
  loading: { marginTop: 12, fontSize: 14, color: '#666' },
});
