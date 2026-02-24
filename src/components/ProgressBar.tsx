import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, TOUCH_TARGET } from '../constants/theme';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = totalSteps > 0 ? Math.min(currentStep / totalSteps, 1) : 0;

  return (
    <View
      style={styles.container}
      accessibilityLabel={`진행률: ${totalSteps}단계 중 ${currentStep}단계 완료`}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: totalSteps,
        now: currentStep,
      }}
    >
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
        {Array.from({ length: totalSteps }, (_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { left: `${((i + 1) / totalSteps) * 100}%` },
              i < currentStep && styles.dotCompleted,
            ]}
          />
        ))}
      </View>
      <Text style={styles.label}>
        {currentStep} / {totalSteps} 단계
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: TOUCH_TARGET,
    justifyContent: 'center',
  },
  barBackground: {
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    overflow: 'visible',
    position: 'relative',
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  dot: {
    position: 'absolute',
    top: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginLeft: -8,
  },
  dotCompleted: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  label: {
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.text,
  },
});
