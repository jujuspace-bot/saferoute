import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { BigButton } from '../../components/BigButton';
import { ChatMessage, sendChatMessage } from '../../services/ai';
import { speak } from '../../services/voice';
import { useAppStore } from '../../stores/appStore';

interface DisplayMessage extends ChatMessage {
  id: string;
}

export function ChatScreen() {
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: '안녕하세요! 저는 루미예요 🤖 길 찾기 도움이 필요하면 편하게 말해주세요!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { destination, routeSteps, currentStepIndex, isDeviated } = useAppStore();

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: DisplayMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const chatHistory: ChatMessage[] = messages
        .slice(-6) // 최근 6개만
        .map(({ role, content }) => ({ role, content }));
      chatHistory.push({ role: 'user', content: userMsg.content });

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

      setMessages((prev) => [...prev, aiMsg]);
      // AI 답변 읽어주기
      await speak(reply);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: '미안해요, 잠시 문제가 생겼어요 🙏' },
      ]);
    } finally {
      setLoading(false);
    }
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
      <Text style={styles.title}>🤖 루미와 대화</Text>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="메시지를 입력하세요..."
            placeholderTextColor={COLORS.textLight}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            accessibilityLabel="메시지 입력"
          />
          <BigButton
            title="📤"
            onPress={handleSend}
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
  title: {
    fontSize: FONTS.large,
    fontWeight: '800',
    color: COLORS.text,
    padding: SPACING.md,
    textAlign: 'center',
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
