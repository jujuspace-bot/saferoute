import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { COLORS, FONTS, SPACING, TOUCH_TARGET } from '../../constants/theme';
import { BigButton } from '../../components/BigButton';
import { ProgressBar } from '../../components/ProgressBar';
import { RouteStep } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - SPACING.lg * 2;

const STEP_ICONS: Record<string, string> = {
  walk: '🚶',
  bus: '🚌',
  subway: '🚇',
  transfer: '🔄',
};

interface StepByStepViewProps {
  steps: RouteStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onArrive: () => void;
  remainingDistance?: string; // e.g. "1.2km"
  remainingTime?: string;    // e.g. "15분"
}

export function StepByStepView({
  steps,
  currentStep,
  onStepChange,
  onArrive,
  remainingDistance,
  remainingTime,
}: StepByStepViewProps) {
  const scrollRef = useRef<ScrollView>(null);

  const isTransferOrAlight = (type: string) =>
    type === 'transfer' || type === 'subway' || type === 'bus';

  const goTo = (index: number) => {
    if (index < 0 || index >= steps.length) return;
    onStepChange(index);
    scrollRef.current?.scrollTo({ x: index * CARD_WIDTH, animated: true });
  };

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    if (page !== currentStep && page >= 0 && page < steps.length) {
      onStepChange(page);
    }
  };

  const isLast = currentStep >= steps.length - 1;

  return (
    <View style={styles.container}>
      {/* 진행률 바 */}
      <ProgressBar currentStep={currentStep + 1} totalSteps={steps.length} />

      {/* 남은 거리/시간 */}
      {(remainingDistance || remainingTime) && (
        <View
          style={styles.remainingRow}
          accessibilityLabel={`남은 거리 ${remainingDistance ?? '알 수 없음'}, 남은 시간 ${remainingTime ?? '알 수 없음'}`}
        >
          {remainingDistance && (
            <Text style={styles.remainingText}>📏 {remainingDistance}</Text>
          )}
          {remainingTime && (
            <Text style={styles.remainingText}>⏱ {remainingTime}</Text>
          )}
        </View>
      )}

      {/* 스와이프 카드 */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH}
        snapToAlignment="center"
      >
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isHighlight = isTransferOrAlight(step.type) && isActive;

          return (
            <View
              key={step.id}
              style={[
                styles.card,
                isActive && styles.activeCard,
                isHighlight && styles.highlightCard,
              ]}
              accessibilityLabel={`${index + 1}단계: ${step.instruction}${
                isHighlight ? ' — 환승 또는 하차 구간입니다. 주의하세요.' : ''
              }`}
            >
              <Text style={styles.cardIcon}>
                {STEP_ICONS[step.type] || '📍'}
              </Text>
              <Text
                style={[
                  styles.cardStep,
                  isHighlight && styles.highlightText,
                ]}
              >
                {index + 1}단계
              </Text>
              <Text
                style={[
                  styles.cardInstruction,
                  isHighlight && styles.highlightText,
                ]}
              >
                {step.instruction}
              </Text>
              {step.detail && (
                <Text
                  style={[
                    styles.cardDetail,
                    isHighlight && styles.highlightDetailText,
                  ]}
                >
                  {step.detail}
                </Text>
              )}
              <Text
                style={[
                  styles.cardDuration,
                  isHighlight && styles.highlightDetailText,
                ]}
              >
                약 {step.duration}분
              </Text>
              {isHighlight && (
                <Text style={styles.alertBadge}>⚠️ 환승/하차 주의!</Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* 이전/다음 버튼 */}
      <View style={styles.buttonRow}>
        <BigButton
          title="◀ 이전"
          icon="👈"
          onPress={() => goTo(currentStep - 1)}
          disabled={currentStep <= 0}
          color={COLORS.textLight}
          style={styles.halfButton}
        />
        {isLast ? (
          <BigButton
            title="도착! 🎉"
            onPress={onArrive}
            color={COLORS.secondary}
            style={styles.halfButton}
          />
        ) : (
          <BigButton
            title="다음 ▶"
            icon="👉"
            onPress={() => goTo(currentStep + 1)}
            color={COLORS.primary}
            style={styles.halfButton}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  remainingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  remainingText: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.text,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
    minHeight: 280,
  },
  activeCard: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  highlightCard: {
    backgroundColor: '#FEE2E2',
    borderColor: COLORS.danger,
  },
  cardIcon: {
    fontSize: 56,
    marginBottom: SPACING.md,
  },
  cardStep: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  cardInstruction: {
    fontSize: FONTS.xlarge,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  cardDetail: {
    fontSize: FONTS.medium,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  cardDuration: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
  },
  highlightText: {
    color: COLORS.danger,
  },
  highlightDetailText: {
    color: '#991B1B',
  },
  alertBadge: {
    marginTop: SPACING.md,
    fontSize: FONTS.medium,
    fontWeight: '800',
    color: COLORS.danger,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  halfButton: {
    flex: 1,
  },
});
