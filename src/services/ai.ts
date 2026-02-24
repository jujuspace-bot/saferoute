import { APP_CONFIG } from '../constants/config';

const SYSTEM_PROMPT = `당신은 발달장애인과 노인의 대중교통 이동을 돕는 친절한 AI 도우미 "루미"입니다.

규칙:
- 항상 3문장 이내로 짧게 답변
- 쉬운 단어만 사용 (초등학생도 이해할 수 있게)
- 친근하고 안심시키는 말투 사용
- 이모지를 적절히 사용
- 위치와 경로 관련 질문에 집중
- 위험한 상황이면 즉시 안전 조치를 안내

예시:
- "잘 가고 있어요! 다음 정류장에서 내리면 돼요 😊"
- "괜찮아요! 제가 다시 길을 알려줄게요 🗺️"
- "3번 출구로 나가면 바로 보여요! 조금만 더 가요 💪"`;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface NavigationContext {
  currentLocation?: { latitude: number; longitude: number } | null;
  destination?: string;
  currentStep?: string;
  currentStepIndex?: number;
  totalSteps?: number;
  isDeviated?: boolean;
  deviationDistance?: number;
  isNavigating?: boolean;
  routeSteps?: { instruction: string; type: string; stopName?: string; lineNumber?: string }[];
}

function buildContextPrompt(context?: NavigationContext): string {
  if (!context) return '';

  const parts: string[] = ['\n\n[현재 이동 상황]'];

  // 네비게이션 상태
  if (context.isNavigating) {
    parts.push('📍 상태: 경로 안내 중');
  } else {
    parts.push('📍 상태: 대기 중 (경로 안내 없음)');
  }

  // 위치 정보
  if (context.currentLocation) {
    parts.push(`위치: 위도 ${context.currentLocation.latitude.toFixed(5)}, 경도 ${context.currentLocation.longitude.toFixed(5)}`);
  }

  // 목적지
  if (context.destination) {
    parts.push(`목적지: ${context.destination}`);
  }

  // 현재 단계
  if (context.currentStep) {
    const stepProgress = context.totalSteps
      ? ` (${(context.currentStepIndex ?? 0) + 1}/${context.totalSteps}단계)`
      : '';
    parts.push(`현재 안내${stepProgress}: ${context.currentStep}`);
  }

  // 경로 이탈
  if (context.isDeviated) {
    parts.push(`⚠️ 경로 이탈! (${Math.round(context.deviationDistance ?? 0)}m 벗어남)`);
  }

  // 남은 경로 요약 (다음 2단계만)
  if (context.routeSteps && context.currentStepIndex != null) {
    const upcoming = context.routeSteps.slice(context.currentStepIndex + 1, context.currentStepIndex + 3);
    if (upcoming.length > 0) {
      const summary = upcoming.map((s) => {
        const label = s.lineNumber ? `${s.lineNumber}번` : s.type;
        return `${label}: ${s.instruction}`;
      }).join(' → ');
      parts.push(`다음 안내: ${summary}`);
    }
  }

  return parts.join('\n');
}

// AI 대화 (OpenAI API)
export async function sendChatMessage(
  messages: ChatMessage[],
  context?: NavigationContext,
): Promise<string> {
  const contextMessage = buildContextPrompt(context);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer YOUR_OPENAI_API_KEY`, // TODO: 환경변수로 교체
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + contextMessage },
          ...messages,
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return '지금 요청이 많아요. 잠시만 기다려 주세요 ⏳';
      }
      if (status >= 500) {
        return '서버에 문제가 생겼어요. 조금 후에 다시 말해주세요 🔧';
      }
      return '미안해요, 다시 말해줄래요? 🙏';
    }

    const data = await response.json();

    if (!data.choices?.[0]?.message?.content) {
      return '미안해요, 답변을 못 받았어요. 다시 물어봐 주세요 🙏';
    }

    return data.choices[0].message.content;
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      return '응답이 너무 오래 걸려요. 다시 시도해 주세요 ⏰';
    }

    return '인터넷 연결이 불안정해요. 잠시 후 다시 시도해주세요 📶';
  }
}
