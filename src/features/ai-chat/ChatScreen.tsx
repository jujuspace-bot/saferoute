import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { BigButton } from '../../components/BigButton';
import { ChatMessage, sendChatMessage } from '../../services/ai';
import { speak } from '../../services/voice';
import { useAppStore } from '../../stores/appStore';
import { QuickReplies } from './QuickReplies';
import { VoiceButton } from './VoiceButton';

const STORAGE_KEY = '@saferoute/chat_history';

interface DisplayMessage extends ChatMessage {
  id: string;
}

const INITIAL_MESSAGE: DisplayMessage = {
  id: '0',
  role: 'assistant',
  content: '안녕하세요! 저는 루미예요 🤖 길 찾기 도움이 필요하면 편하게 말해주세요!',
};

export function ChatScreen() {
  const [messages, setMessages] = useState<DisplayMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { destination, routeSteps, currentStepIndex, isDeviated } = useAppStore();

  // ── AsyncStorage에서 대화 내역 불러오기 ──
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: DisplayMessage[] = JSON.parse(stored);
          if (parsed.length > 0) {
            setMessages([INITIAL_MESSAGE, ...parsed]);
          }
        }
      } catch {
        // 불러오기 실패 시 무시
      }
    })();
  }, []);

  // ── 대화 내역 저장 ──
  const saveMessages = useCallback(async (msgs: DisplayMessage[]) => {
    try {
      // 초기 메시지 제외하고 저장
      const toSave = msgs.filter((m) => m.id !== '0');
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave.slice(-50))); // 최근 50개만
    } catch {
      // 저장 실패 무시
    }
  }, []);

  // ── 채팅 내역 삭제 ──
  const handleClearChat = () => {
    Alert.alert(
      '대화 삭제',
      '모든 대화 내역을 삭제할까요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            setMessages([INITIAL_MESSAGE]);
            await AsyncStorage.removeItem(STORAGE_KEY);
          },
        },
      ],
    );
  };

  // ── 메시지 전송 ──
  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const userMsg: DisplayMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: msg,
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const chatHistory: ChatMessage[] = updated
        .slice(-6)
        .map(({ role, content }) => ({ role, content }));

      const reply = await sendChatMessage(chatHistory, {
        destination: destination || undefined,
        currentStep: routeSteps[currentStepIndex]?.instruction,
        isDeviated,
      });

      const aiMsg: DisplayMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
      };

      const withReply = [...updated, aiMsg];
      setMessages(withReply);
      await saveMessages(withReply);
      await speak(reply);
    } catch {
      const errMsg: DisplayMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '미안해요, 잠시 문제가 생겼어요 🙏',
      };
      const withErr = [...updated, errMsg];
      setMessages(withErr);
      await saveMessages(withErr);
    } finally {
      setLoading(false);
    }
  };

  // ── 음성 입력 (placeholder — 실제 STT 연동 필요) ──
  const handleRecordStart = () => setIsRecording(true);
  const handleRecordStop = () => {
    setIsRecording(false);
    // TODO: STT 처리 후 handleSend(transcribedText) 호출
  };

  const renderMessage = ({ item }: { item: DisplayMessage }) => (
    <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
      {item.role === 'assistant' && <Text style={styles.avatar}>🤖</Text>}
      <Text style={[styles.messageText, item.role === 'user' && styles.userText]}>
        {item.content}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🤖 루미와 대화</Text>
        <BigButton
          title="🗑️"
          onPress={handleClearChat}
          style={styles.clearButton}
        />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {/* 빠른 응답 버튼 */}
      <QuickReplies onSelect={(msg) => handleSend(msg)} disabled={loading} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputBar}>
          <VoiceButton
            onRecordStart={handleRecordStart}
            onRecordStop={handleRecordStop}
            isRecording={isRecording}
            isProcessing={isProcessing}
            disabled={loading}
          />
          <TextInput
            style={styles.input}
            placeholder="메시지를 입력하세요..."
            placeholderTextColor={COLORS.textLight}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
            maxLength={200}
            accessibilityLabel="메시지 입력"
          />
          <BigButton
            title="📤"
            onPress={() => handleSend()}
            disabled={!input.trim() || loading}
            style={styles.sendButton}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  title: {
    fontSize: FONTS.large,
    fontWeight: '800',
    color: COLORS.text,
  },
  clearButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 0,
    backgroundColor: COLORS.surface,
  },
  messageList: {
    padding: SPACING.md,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 20,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: COLORS.surface,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  avatar: {
    fontSize: 24,
  },
  messageText: {
    fontSize: FONTS.medium,
    color: COLORS.text,
    flex: 1,
  },
  userText: {
    color: COLORS.white,
  },
  inputBar: {
    flexDirection: 'row',
    padding: SPACING.sm,
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.medium,
    color: COLORS.text,
  },
  sendButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 0,
  },
});
