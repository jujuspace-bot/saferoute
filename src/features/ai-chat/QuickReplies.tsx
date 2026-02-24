import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { COLORS, FONTS, SPACING, TOUCH_TARGET } from '../../constants/theme';

interface QuickReply {
  label: string;
  message: string;
}

const QUICK_REPLIES: QuickReply[] = [
  { label: '📍 지금 어디야?', message: '지금 내가 어디에 있어?' },
  { label: '➡️ 다음에 뭐해?', message: '다음에 뭘 해야 해?' },
  { label: '⏰ 도착 언제야?', message: '목적지에 언제 도착해?' },
  { label: '🆘 도와줘!', message: '도와주세요! 길을 모르겠어요.' },
];

interface QuickRepliesProps {
  onSelect: (message: string) => void;
  disabled?: boolean;
}

export function QuickReplies({ onSelect, disabled = false }: QuickRepliesProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {QUICK_REPLIES.map((item) => (
        <Pressable
          key={item.label}
          onPress={() => onSelect(item.message)}
          disabled={disabled}
          style={({ pressed }) => [
            styles.chip,
            pressed && styles.chipPressed,
            disabled && styles.chipDisabled,
          ]}
          accessibilityLabel={item.label}
          accessibilityRole="button"
        >
          <Text style={[styles.chipText, disabled && styles.chipTextDisabled]}>
            {item.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  chip: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    minHeight: TOUCH_TARGET,
    justifyContent: 'center',
  },
  chipPressed: {
    backgroundColor: COLORS.primary,
  },
  chipDisabled: {
    borderColor: COLORS.border,
    opacity: 0.5,
  },
  chipText: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.primary,
  },
  chipTextDisabled: {
    color: COLORS.textLight,
  },
});
