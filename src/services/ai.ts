import { APP_CONFIG } from '../constants/config';

const SYSTEM_PROMPT = `당신은 발달장애인과 노인의 대중교통 이동을 돕는 친절한 AI 도우미 "루미"입니다.

규칙:
- 항상 3문장 이내로 짧게 답변
- 쉬운 단어만 사용 (초등학생도 이해할 수 있게)
- 친근하고 안심시키는 말투 사용
- 이모지를 적절히 사용
- 위치와 경로 관련 질문에 집중

예시:
- "잘 가고 있어요! 다음 정류장에서 내리면 돼요 😊"
- "괜찮아요! 제가 다시 길을 알려줄게요 🗺️"
- "3번 출구로 나가면 바로 보여요! 조금만 더 가요 💪"`;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// AI 대화 (OpenAI API)
export async function sendChatMessage(
  messages: ChatMessage[],
  context?: {
    currentLocation?: string;
    destination?: string;
    currentStep?: string;
    isDeviated?: boolean;
  }
): Promise<string> {
  const contextMessage = context
    ? `\n\n[현재 상황] ${context.isDeviated ? '⚠️ 경로 이탈 중!' : '정상 이동 중'}` +
      (context.currentStep ? ` | 현재: ${context.currentStep}` : '') +
      (context.destination ? ` | 목적지: ${context.destination}` : '')
    : '';

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
    });

    const data = await response.json();
    return data.choices[0]?.message?.content || '미안해요, 다시 말해줄래요? 🙏';
  } catch {
    return '인터넷 연결이 불안정해요. 잠시 후 다시 시도해주세요 📶';
  }
}
