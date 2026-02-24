import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { COLORS, FONTS, SPACING, TOUCH_TARGET } from '../../constants/theme';

interface VoiceButtonProps {
  onRecordStart: () => void;
  onRecordStop: () => void;
  isRecording: boolean;
  isProcessing: boolean;
  disabled?: boolean;
}

export function VoiceButton({
  onRecordStart,
  onRecordStop,
  isRecording,
  isProcessing,
  disabled = false,
}: VoiceButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  const startPulse = useCallback(() => {
    pulseRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    );
    pulseRef.current.start();
  }, [pulseAnim]);

  const stopPulse = useCallback(() => {
    pulseRef.current?.stop();
    pulseAnim.setValue(1);
  }, [pulseAnim]);

  const handlePressIn = () => {
    if (disabled || isProcessing) return;
    Animated.spring(scaleAnim, { toValue: 1.15, useNativeDriver: true }).start();
    startPulse();
    onRecordStart();
  };

  const handlePressOut = () => {
    if (disabled || isProcessing) return;
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    stopPulse();
    onRecordStop();
  };

  const label = isProcessing ? '⏳' : isRecording ? '🎙️' : '🎤';
  const sublabel = isProcessing
    ? '처리 중...'
    : isRecording
      ? '듣고 있어요!'
      : '꾹 눌러서 말하기';

  return (
    <View style={styles.container}>
      {/* Pulse ring */}
      {isRecording && (
        <Animated.View
          style={[
            styles.pulseRing,
            { transform: [{ scale: pulseAnim }], opacity: pulseAnim.interpolate({
              inputRange: [1, 1.3],
              outputRange: [0.6, 0],
            }) },
          ]}
        />
      )}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || isProcessing}
          style={[
            styles.button,
            isRecording && styles.buttonRecording,
            isProcessing && styles.buttonProcessing,
            disabled && styles.buttonDisabled,
          ]}
          accessibilityLabel="음성 입력 버튼"
          accessibilityHint="길게 누르면 음성 녹음이 시작됩니다"
          accessibilityRole="button"
        >
          <Text style={styles.icon}>{label}</Text>
        </Pressable>
      </Animated.View>
      <Text style={styles.sublabel}>{sublabel}</Text>
    </View>
  );
}

const BUTTON_SIZE = 72;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: BUTTON_SIZE + 24,
    height: BUTTON_SIZE + 24,
    borderRadius: (BUTTON_SIZE + 24) / 2,
    backgroundColor: COLORS.danger,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: TOUCH_TARGET,
    minHeight: TOUCH_TARGET,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonRecording: {
    backgroundColor: COLORS.danger,
  },
  buttonProcessing: {
    backgroundColor: COLORS.warning,
  },
  buttonDisabled: {
    backgroundColor: COLORS.border,
    opacity: 0.6,
  },
  icon: {
    fontSize: 32,
  },
  sublabel: {
    marginTop: SPACING.xs,
    fontSize: FONTS.small,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});
