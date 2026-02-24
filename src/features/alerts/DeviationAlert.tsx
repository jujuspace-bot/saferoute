import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, TOUCH_TARGET } from '../../constants/theme';
import { BigButton } from '../../components/BigButton';

interface DeviationAlertProps {
  deviationDistance: number;
  onRecalculate: () => void;
  onCallGuardian?: () => void;
}

export function DeviationAlert({
  deviationDistance,
  onRecalculate,
  onCallGuardian,
}: DeviationAlertProps) {
  return (
    <View style={styles.container} accessibilityRole="alert" accessible>
      {/* 큰 경고 아이콘 */}
      <Text style={styles.icon} accessibilityLabel="경고">
        ⚠️
      </Text>

      {/* 큰 텍스트 메시지 */}
      <Text
        style={styles.title}
        accessibilityLabel={`경로에서 ${Math.round(deviationDistance)}미터 벗어났습니다`}
      >
        경로에서 벗어났어요
      </Text>

      <Text style={styles.distance}>
        {Math.round(deviationDistance)}m 벗어남
      </Text>

      {/* 안심 메시지 */}
      <View style={styles.reassurance}>
        <Text style={styles.reassuranceIcon}>💙</Text>
        <Text style={styles.reassuranceText}>
          괜찮아요!{'\n'}다시 안내해 드릴게요
        </Text>
      </View>

      {/* 액션 버튼 */}
      <View style={styles.actions}>
        <BigButton
          title="경로 다시 찾기 🔄"
          onPress={onRecalculate}
          color={COLORS.primary}
          style={styles.mainButton}
        />

        {onCallGuardian && (
          <BigButton
            title="보호자에게 연락 📞"
            onPress={onCallGuardian}
            color={COLORS.secondary}
            style={styles.secondaryButton}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  icon: {
    fontSize: 96,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONTS.title,
    fontWeight: '900',
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  distance: {
    fontSize: FONTS.xlarge,
    fontWeight: '700',
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  reassurance: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 2,
    borderColor: COLORS.primary,
    width: '100%',
  },
  reassuranceIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  reassuranceText: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    lineHeight: FONTS.large * 1.5,
  },
  actions: {
    width: '100%',
    gap: SPACING.md,
  },
  mainButton: {
    minHeight: TOUCH_TARGET * 1.5,
  },
  secondaryButton: {
    minHeight: TOUCH_TARGET * 1.5,
  },
});
