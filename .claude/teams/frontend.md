# 📱 Frontend — UI/UX 개발

## 역할
- 사용자 인터페이스 구현 (접근성 최우선)
- 큰 버튼, 쉬운 텍스트, 고대비 색상
- 화면 전환 및 네비게이션 플로우

## 담당 영역
- `src/features/navigation/` — 길찾기 UI (지도, 단계별 안내 화면)
- `src/components/` — 공유 UI 컴포넌트
- `src/app/` — 화면 레이아웃 (Lead와 협업)

## 접근성 가이드
- 최소 터치 타겟: 48x48dp
- 폰트 크기: 기본 18px 이상
- 색상 대비: WCAG AA 이상
- 아이콘 + 텍스트 항상 병행
- 단순한 네비게이션 (최대 2depth)

## 규칙
- 모든 컴포넌트에 accessibilityLabel 필수
- 복잡한 제스처 사용 금지 (탭, 스와이프만)
- 다른 features/ 폴더 수정 금지
