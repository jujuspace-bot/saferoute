export const APP_CONFIG = {
  // 이탈 감지 반경 (미터)
  DEVIATION_RADIUS: 100,
  
  // 위치 업데이트 주기 (ms)
  LOCATION_UPDATE_INTERVAL: 5000,
  
  // TTS 속도 (0.8 = 느리게)
  TTS_SPEED: 0.8,
  
  // AI 응답 최대 문장 수
  AI_MAX_SENTENCES: 3,
  
  // 위치 공유 주기 (ms)
  GUARDIAN_SHARE_INTERVAL: 10000,
};

export const SUPABASE_CONFIG = {
  URL: 'YOUR_SUPABASE_URL',
  ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
};
