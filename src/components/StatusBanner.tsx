import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';

type BannerStatus = 'normal' | 'warning' | 'danger';

interface StatusBannerProps {
  status: BannerStatus;
  title: string;
  subtitle?: string;
  icon?: string;
}

const STATUS_CONFIG: Record<BannerStatus, { bg: string; border: string }> = {
  normal: { bg: '#ECFDF5', border: COLORS.secondary },
  warning: { bg: '#FFFBEB', border: COLORS.warning },
  danger: { bg: '#FEF2F2', border: COLORS.danger },
};

export function StatusBanner({ status, title, subtitle, icon }: StatusBannerProps) {
  const config = STATUS_CONFIG[status];
  const defaultIcons: Record<BannerStatus, string> = {
    normal: '✅',
    warning: '⚠️',
    danger: '🚨',
  };

  return (
    <View
      style={[styles.banner, { backgroundColor: config.bg, borderColor: config.border }]}
      accessibilityLabel={`${title}${subtitle ? `, ${subtitle}` : ''}`}
      accessibilityRole="alert"
      accessible
    >
      <Text style={styles.icon}>{icon || defaultIcons[status]}</Text>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: config.border }]}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: SPACING.md,
  },
  icon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONTS.medium,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
});
