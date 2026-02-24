import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/features/navigation/HomeScreen';
import { NavigationScreen } from './src/features/navigation/NavigationScreen';
import { ChatScreen } from './src/features/ai-chat/ChatScreen';
import { GuardianScreen } from './src/features/monitoring/GuardianScreen';
import { useAppStore } from './src/stores/appStore';
import { View, StyleSheet } from 'react-native';
import { BigButton } from './src/components/BigButton';
import { COLORS, SPACING } from './src/constants/theme';

type Screen = 'home' | 'navigation' | 'chat' | 'guardian';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const { userRole } = useAppStore();

  const renderScreen = () => {
    // 보호자 모드
    if (userRole === 'guardian') return <GuardianScreen />;

    switch (screen) {
      case 'navigation':
        return <NavigationScreen />;
      case 'chat':
        return <ChatScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {renderScreen()}

      {/* 하단 네비게이션 (사용자 모드만) */}
      {userRole === 'user' && (
        <View style={styles.tabBar}>
          <BigButton
            title="🏠"
            color={screen === 'home' ? COLORS.primary : COLORS.border}
            onPress={() => setScreen('home')}
            style={styles.tab}
          />
          <BigButton
            title="🧭"
            color={screen === 'navigation' ? COLORS.primary : COLORS.border}
            onPress={() => setScreen('navigation')}
            style={styles.tab}
          />
          <BigButton
            title="🤖"
            color={screen === 'chat' ? '#8B5CF6' : COLORS.border}
            onPress={() => setScreen('chat')}
            style={styles.tab}
          />
        </View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tab: {
    flex: 1,
    minHeight: 56,
    borderRadius: 16,
  },
});
