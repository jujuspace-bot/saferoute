import React from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, TOUCH_TARGET } from '../constants/theme';

interface AccessibleInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label: string;
  icon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  rightIconLabel?: string;
  onSubmitEditing?: () => void;
  autoFocus?: boolean;
}

export function AccessibleInput({
  value,
  onChangeText,
  placeholder,
  label,
  icon,
  rightIcon,
  onRightIconPress,
  rightIconLabel,
  onSubmitEditing,
  autoFocus,
}: AccessibleInputProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label} accessibilityRole="text">
        {label}
      </Text>
      <View style={styles.container}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          accessibilityLabel={label}
          accessibilityHint={placeholder}
          returnKeyType="search"
          onSubmitEditing={onSubmitEditing}
          autoFocus={autoFocus}
          autoCorrect={false}
          fontSize={FONTS.medium}
        />
        {rightIcon && onRightIconPress && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightButton}
            accessibilityLabel={rightIconLabel || '버튼'}
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.rightIcon}>{rightIcon}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    minHeight: TOUCH_TARGET * 1.3,
  },
  icon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONTS.medium,
    color: COLORS.text,
    paddingVertical: SPACING.md,
    minHeight: TOUCH_TARGET,
  },
  rightButton: {
    minWidth: TOUCH_TARGET,
    minHeight: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightIcon: {
    fontSize: 28,
  },
});
