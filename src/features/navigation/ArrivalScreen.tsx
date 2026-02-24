import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { BigButton } from '../../components/BigButton';

interface ArrivalScreenProps {
  destinationName?: string;
  onGoHome: () => void;
}

export function ArrivalScreen({ destinationName, onGoHome }: ArrivalScreenProps) {
  return (
    <View
      style={styles.container}
      accessibilityLabel={`도착했습니다! ${destinationName ?? '목적지'}에 도착했어요. 잘했어요!`}
    >
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>잘했어요!</Text>
      <Text style={styles.subtitle}>
        {destinationName
          ? `${destinationName}에 도착했어요!`
          : '목적지에 도착했어요!'}
      </Text>

      <View style={styles.buttonContainer}>
        <BigButton
          title="🏠 홈으로 돌아가기"
          onPress={onGoHome}
          color={COLORS.primary}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emoji: {
    fontSize: 96,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONTS.title + 8,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONTS.large,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: SPACING.lg,
  },
});
