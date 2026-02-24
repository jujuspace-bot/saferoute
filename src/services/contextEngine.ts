import { NavigationContext } from './ai';

// ── 긴급도 레벨 ──
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ContextSummary {
  urgency: UrgencyLevel;
  summary: string;
  timeOfDay: 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night';
  isLateNight: boolean;
  weatherNote?: string;
}

// ── 시간대 판별 ──
function getTimeOfDay(date: Date): ContextSummary['timeOfDay'] {
  const h = date.getHours();
  if (h >= 5 && h < 7) return 'dawn';
  if (h >= 7 && h < 12) return 'morning';
  if (h >= 12 && h < 18) return 'afternoon';
  if (h >= 18 && h < 22) return 'evening';
  return 'night';
}

// ── 긴급도 계산 ──
function computeUrgency(ctx: NavigationContext, now: Date): UrgencyLevel {
  const hour = now.getHours();
  const isLate = hour >= 22 || hour < 6;

  // 경로 이탈 + 야간 → critical
  if (ctx.isDeviated && isLate) return 'critical';

  // 경로 이탈 (150m 이상) → high
  if (ctx.isDeviated && (ctx.deviationDistance ?? 0) >= 150) return 'high';

  // 경로 이탈 → medium
  if (ctx.isDeviated) return 'medium';

  // 야간 이동 → medium
  if (isLate && ctx.isNavigating) return 'medium';

  return 'low';
}

// ── 상황 요약 생성 ──
export function buildContextSummary(
  navContext: NavigationContext,
  weather?: { condition?: string; temp?: number } | null,
): ContextSummary {
  const now = new Date();
  const timeOfDay = getTimeOfDay(now);
  const isLateNight = now.getHours() >= 22 || now.getHours() < 6;
  const urgency = computeUrgency(navContext, now);

  const parts: string[] = [];

  // 시간 정보
  const timeLabel: Record<ContextSummary['timeOfDay'], string> = {
    dawn: '이른 아침',
    morning: '오전',
    afternoon: '오후',
    evening: '저녁',
    night: '밤',
  };
  parts.push(`현재 시각: ${timeLabel[timeOfDay]} ${now.getHours()}시 ${now.getMinutes()}분`);

  // 날씨
  let weatherNote: string | undefined;
  if (weather?.condition) {
    weatherNote = `날씨: ${weather.condition}${weather.temp != null ? ` (${weather.temp}°C)` : ''}`;
    parts.push(weatherNote);
  }

  // 위치
  if (navContext.currentLocation) {
    parts.push(`위치: (${navContext.currentLocation.latitude.toFixed(4)}, ${navContext.currentLocation.longitude.toFixed(4)})`);
  }

  // 이동 상태
  if (navContext.isNavigating) {
    parts.push(`이동 중 → ${navContext.destination ?? '목적지 미정'}`);
    if (navContext.currentStep) {
      parts.push(`현재: ${navContext.currentStep}`);
    }
  } else {
    parts.push('이동 안내 없음 (대기 중)');
  }

  // 이탈
  if (navContext.isDeviated) {
    parts.push(`⚠️ 경로 이탈 ${Math.round(navContext.deviationDistance ?? 0)}m`);
  }

  // 긴급도
  const urgencyLabel: Record<UrgencyLevel, string> = {
    low: '🟢 낮음',
    medium: '🟡 보통',
    high: '🟠 높음',
    critical: '🔴 긴급',
  };
  parts.push(`긴급도: ${urgencyLabel[urgency]}`);

  if (isLateNight) {
    parts.push('⚠️ 야간 이동 중 — 보호자 알림 권장');
  }

  return {
    urgency,
    summary: parts.join('\n'),
    timeOfDay,
    isLateNight,
    weatherNote,
  };
}

// ── AI 시스템 프롬프트용 상황 문맥 ──
export function getAIContextPrefix(ctxSummary: ContextSummary): string {
  const lines = [`\n[상황 인식 정보]`, ctxSummary.summary];

  if (ctxSummary.urgency === 'critical') {
    lines.push('🚨 긴급 상황! 사용자를 안심시키고, 보호자 연락 또는 119 신고를 안내하세요.');
  } else if (ctxSummary.urgency === 'high') {
    lines.push('⚠️ 주의! 사용자가 많이 이탈했어요. 원래 경로 복귀를 도와주세요.');
  }

  return lines.join('\n');
}
