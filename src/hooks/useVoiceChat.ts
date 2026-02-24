import { useState, useCallback, useRef } from 'react';
import { ChatMessage, sendChatMessage, NavigationContext } from '../services/ai';
import { speak, stopSpeaking } from '../services/voice';
import { useAppStore } from '../stores/appStore';

/**
 * 음성 대화 훅: STT → AI → TTS 파이프라인
 *
 * 참고: expo-speech는 TTS만 지원. STT는 별도 라이브러리 필요.
 * 현재는 STT placeholder로 구현. 실제 적용 시 @react-native-voice/voice 등 사용.
 */

interface UseVoiceChatOptions {
  onTranscript?: (text: string) => void;
  onAiReply?: (text: string) => void;
  onError?: (error: string) => void;
}

interface UseVoiceChatReturn {
  isRecording: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  startRecording: () => void;
  stopRecording: () => Promise<string | null>;
  sendVoiceMessage: (transcript: string, chatHistory: ChatMessage[]) => Promise<string | null>;
  cancelSpeaking: () => Promise<void>;
}

export function useVoiceChat(options?: UseVoiceChatOptions): UseVoiceChatReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recordingStartTime = useRef<number>(0);

  const {
    currentLocation,
    destination,
    routeSteps,
    currentStepIndex,
    isDeviated,
    deviationDistance,
    isNavigating,
  } = useAppStore();

  const buildContext = useCallback((): NavigationContext => ({
    currentLocation: currentLocation
      ? { latitude: currentLocation.latitude, longitude: currentLocation.longitude }
      : null,
    destination: destination ?? undefined,
    currentStep: routeSteps[currentStepIndex]?.instruction,
    currentStepIndex,
    totalSteps: routeSteps.length,
    isDeviated,
    deviationDistance,
    isNavigating,
    routeSteps: routeSteps.map((s) => ({
      instruction: s.instruction,
      type: s.type,
      stopName: s.stopName,
      lineNumber: s.lineNumber,
    })),
  }), [currentLocation, destination, routeSteps, currentStepIndex, isDeviated, deviationDistance, isNavigating]);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    recordingStartTime.current = Date.now();
    // TODO: 실제 STT 녹음 시작
    // Voice.start('ko-KR');
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    setIsRecording(false);
    const duration = Date.now() - recordingStartTime.current;

    // 너무 짧은 녹음은 무시 (500ms 미만)
    if (duration < 500) {
      return null;
    }

    // TODO: 실제 STT 결과 반환
    // const result = await Voice.stop();
    // return result;
    
    // Placeholder: 실제 STT 라이브러리 연동 시 교체
    return null;
  }, []);

  const sendVoiceMessage = useCallback(
    async (transcript: string, chatHistory: ChatMessage[]): Promise<string | null> => {
      if (!transcript.trim()) return null;

      setIsProcessing(true);
      options?.onTranscript?.(transcript);

      try {
        const context = buildContext();
        const history: ChatMessage[] = [
          ...chatHistory.slice(-6).map(({ role, content }) => ({ role, content })),
          { role: 'user' as const, content: transcript },
        ];

        const reply = await sendChatMessage(history, context);
        options?.onAiReply?.(reply);

        // TTS로 읽어주기
        setIsSpeaking(true);
        await speak(reply);
        setIsSpeaking(false);

        return reply;
      } catch {
        const errorMsg = '음성 처리 중 문제가 생겼어요 🙏';
        options?.onError?.(errorMsg);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [buildContext, options],
  );

  const cancelSpeaking = useCallback(async () => {
    await stopSpeaking();
    setIsSpeaking(false);
  }, []);

  return {
    isRecording,
    isProcessing,
    isSpeaking,
    startRecording,
    stopRecording,
    sendVoiceMessage,
    cancelSpeaking,
  };
}
