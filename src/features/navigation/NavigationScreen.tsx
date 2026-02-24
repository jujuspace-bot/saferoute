import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { BigButton } from '../../components/BigButton';
import { StepCard } from '../../components/StepCard';
import { useAppStore } from '../../stores/appStore';

export function NavigationScreen() {
  const {
    destination,
    routeSteps,
    currentStepIndex,
    isNavigating,
    isDeviated,
    deviationDistance,
    nextStep,
    setNavigating,
    toggleChat,
  } = useAppStore();

  const currentStep = routeSteps[currentStepIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단: 현재 안내 */}
      <View style={[styles.header, isDeviated && styles.headerDeviated]}>
        {isDeviated ? (
          <>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>
              경로에서 벗어났어요! ({Math.round(deviationDistance)}m)
            </Text>
            <Text style={styles.warningSub}>걱정 마세요, 다시 안내해드릴게요</Text>
          </>
        ) : currentStep ? (
          <>
            <Text style={styles.currentIcon}>
              {currentStep.type === 'walk' ? '🚶' : 
               currentStep.type === 'bus' ? '🚌' : 
               currentStep.type === 'subway' ? '🚇' : '📍'}
            </Text>
            <Text style={styles.currentInstruction}>{currentStep.instruction}</Text>
            <Text style={styles.currentDetail}>
              {currentStep.distance} · {currentStep.duration}
            </Text>
          </>
        ) : (
          <Text style={styles.currentInstruction}>🎉 도착했어요!</Text>
        )}
      </View>

      {/* 목적지 */}
      <View style={styles.destBar}>
        <Text style={styles.destLabel}>📍 목적지</Text>
        <Text style={styles.destText}>{destination}</Text>
      </View>

      {/* 단계 목록 */}
      <FlatList
        data={routeSteps}
        renderItem={({ item, index }) => (
          <StepCard
            step={item}
            isActive={index === currentStepIndex}
            stepNumber={index + 1}
          />
        )}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={styles.stepList}
      />

      {/* 하단 버튼 */}
      <View style={styles.bottomBar}>
        <BigButton
          title="다음 단계 ➡️"
          onPress={nextStep}
          disabled={currentStepIndex >= routeSteps.length - 1}
          style={styles.nextButton}
        />
        <BigButton
          title="🤖 도움"
          color="#8B5CF6"
          onPress={toggleChat}
          style={styles.helpButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerDeviated: {
    backgroundColor: COLORS.danger,
  },
  currentIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  currentInstruction: {
    fontSize: FONTS.xlarge,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
  },
  currentDetail: {
    fontSize: FONTS.medium,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  warningIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  warningText: {
    fontSize: FONTS.large,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
  },
  warningSub: {
    fontSize: FONTS.medium,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  destBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  destLabel: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
  },
  destText: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  stepList: {
    padding: SPACING.md,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  nextButton: {
    flex: 3,
  },
  helpButton: {
    flex: 1,
  },
});
