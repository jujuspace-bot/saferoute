# SafeRoute — 발달장애인 및 노인을 위한 길찾기 앱

## 프로젝트 개요
발달장애인과 노인이 대중교통을 이용해 안전하게 목적지까지 이동할 수 있도록 돕는 앱.

### 핵심 기능
1. **쉬운 길찾기** — 단순하고 직관적인 UI, 단계별 안내
2. **AI 대화** — 이동 중 AI와 음성 대화 (안내, 질문, 안심)
3. **보호자 모니터링** — 실시간 위치 공유, 대시보드
4. **이탈 경고** — 경로 이탈 시 사용자 + 보호자 알림
5. **음성 안내** — TTS 기반 상세 안내 (몇 번 출구, 어디서 내리기 등)

### 기술 스택
- **프레임워크:** Expo (React Native)
- **언어:** TypeScript
- **상태관리:** Zustand
- **지도:** react-native-maps + Google Maps API
- **AI:** OpenAI API (대화) + TTS/STT
- **백엔드:** Supabase (Auth, DB, Realtime)
- **알림:** Expo Notifications + FCM

### 디렉토리 구조
```
src/
├── app/           # Expo Router 페이지
├── components/    # 공유 컴포넌트
├── features/      # 기능별 모듈
│   ├── navigation/   # 길찾기 핵심
│   ├── ai-chat/      # AI 대화
│   ├── monitoring/   # 보호자 모니터링
│   └── alerts/       # 이탈 경고
├── services/      # API, 위치, 음성 서비스
├── stores/        # Zustand 상태
├── hooks/         # 커스텀 훅
├── utils/         # 유틸리티
└── constants/     # 상수, 설정
```

## 팀 규칙
- 커밋 메시지: `[역할] 설명` (예: `[frontend] 홈 화면 UI 구현`)
- 각 팀원은 자기 담당 `features/` 폴더에서 작업
- 공유 코드 수정 시 Lead에게 먼저 알리기
- TypeScript strict 모드, ESLint/Prettier 적용
