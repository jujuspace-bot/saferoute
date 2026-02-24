import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, FONTS, SPACING, TOUCH_TARGET } from '../constants/theme';

interface BigButtonProps {
  title: string;
  onPress: () => void;
  icon?: string;
  color?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export function BigButton({ title, onPress, icon, color = COLORS.primary, disabled, style }: BigButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, { backgroundColor: disabled ? COLORS.border : color }, style]}
      accessibilityLabel={title}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      activeOpacity={0.7}
    >
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: TOUCH_TARGET * 1.5,
    borderRadius: 16,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  icon: {
    fontSize: FONTS.xlarge,
  },
  text: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.white,
  },
});
