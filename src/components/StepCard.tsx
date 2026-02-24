import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { RouteStep } from '../stores/appStore';

const STEP_ICONS: Record<string, string> = {
  walk: '🚶',
  bus: '🚌',
  subway: '🚇',
  transfer: '🔄',
};

interface StepCardProps {
  step: RouteStep;
  isActive: boolean;
  stepNumber: number;
}

export function StepCard({ step, isActive, stepNumber }: StepCardProps) {
  return (
    <View
      style={[styles.card, isActive && styles.activeCard]}
      accessibilityLabel={`${stepNumber}단계: ${step.instruction}`}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{STEP_ICONS[step.type] || '📍'}</Text>
        <Text style={styles.stepNum}>{stepNumber}</Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.instruction, isActive && styles.activeText]}>
          {step.instruction}
        </Text>
        {step.lineNumber && (
          <Text style={styles.detail}>🚏 {step.lineNumber}번 {step.stopName}</Text>
        )}
        <Text style={styles.detail}>
          {step.distance} · {step.duration}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeCard: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  iconContainer: {
    alignItems: 'center',
    marginRight: SPACING.md,
    width: 48,
  },
  icon: {
    fontSize: 32,
  },
  stepNum: {
    fontSize: FONTS.small,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  instruction: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  activeText: {
    color: COLORS.primary,
  },
  detail: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    marginTop: 2,
  },
});
