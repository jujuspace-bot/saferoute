import * as Speech from 'expo-speech';
import { APP_CONFIG } from '../constants/config';

// TTS — 텍스트를 음성으로
export async function speak(text: string, options?: { urgent?: boolean }) {
  // 현재 말하고 있으면 중단 후 새로 시작
  const isSpeaking = await Speech.isSpeakingAsync();
  if (isSpeaking) {
    await Speech.stop();
  }

  return Speech.speak(text, {
    language: 'ko-KR',
    rate: options?.urgent ? 1.0 : APP_CONFIG.TTS_SPEED,
    pitch: 1.0,
    onDone: () => console.log('TTS 완료'),
    onError: (error) => console.error('TTS 에러:', error),
  });
}

// 음성 중단
export async function stopSpeaking() {
  return Speech.stop();
}

// 경로 안내 음성
export async function speakNavigation(instruction: string) {
  await speak(instruction);
}

// 이탈 경고 음성 (긴급 — 빠른 속도)
export async function speakDeviationAlert(distance: number) {
  await speak(
    `주의하세요! 경로에서 ${Math.round(distance)}미터 벗어났어요. 걱정 마세요, 다시 안내해 드릴게요.`,
    { urgent: true }
  );
}

// 환승 안내 (반복)
export async function speakTransferGuide(instruction: string) {
  await speak(instruction);
  // 10초 후 한번 더 반복
  setTimeout(() => speak(instruction), 10000);
}

// 하차 안내 (반복)
export async function speakAlightGuide(stopName: string) {
  const message = `${stopName}에서 내리세요! 준비하세요!`;
  await speak(message, { urgent: true });
  setTimeout(() => speak(message, { urgent: true }), 8000);
}

// 도착 안내
export async function speakArrival(destination: string) {
  await speak(`🎉 ${destination}에 도착했어요! 정말 잘했어요!`);
}
