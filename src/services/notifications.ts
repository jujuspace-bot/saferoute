import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// 알림 채널 설정 (Android)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

// 푸시 토큰 가져오기
export async function registerForPushNotifications(): Promise<string | null> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('푸시 알림 권한이 거부되었습니다');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('deviation', {
      name: '경로 이탈 경고',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 200, 500],
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('transfer', {
      name: '환승 안내',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }

  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
}

// ===== 이탈 경고 푸시 =====
export async function sendDeviationPush(distance: number) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⚠️ 경로 이탈 감지!',
      body: `경로에서 약 ${Math.round(distance)}m 벗어났어요. 앱을 확인해 주세요.`,
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.MAX,
      data: { type: 'deviation', distance },
    },
    trigger: null, // 즉시 발송
  });
}

// ===== 환승 안내 푸시 =====
export async function sendTransferPush(
  lineNumber: string,
  stopName: string,
  instruction: string
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `🚉 환승 안내 — ${lineNumber}`,
      body: `${stopName}에서 환승하세요. ${instruction}`,
      sound: 'default',
      data: { type: 'transfer', lineNumber, stopName },
    },
    trigger: null,
  });
}

// ===== 하차 안내 푸시 =====
export async function sendAlightPush(stopName: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🚏 하차 준비!',
      body: `${stopName}에서 내리세요. 준비하세요!`,
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.MAX,
      data: { type: 'alight', stopName },
    },
    trigger: null,
  });
}

// ===== 보호자에게 이탈 알림 푸시 (서버 경유) =====
export async function notifyGuardianDeviation(
  guardianPushToken: string,
  userName: string,
  distance: number,
  latitude: number,
  longitude: number
) {
  // Expo Push API를 통해 보호자에게 직접 푸시
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: guardianPushToken,
      title: '🚨 이탈 경고',
      body: `${userName}님이 경로에서 ${Math.round(distance)}m 벗어났습니다.`,
      data: { type: 'guardian_deviation', latitude, longitude, distance },
      sound: 'default',
      priority: 'high',
    }),
  });
}

// 알림 리스너 등록
export function addNotificationListener(
  handler: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(handler);
}

export function addNotificationResponseListener(
  handler: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(handler);
}
