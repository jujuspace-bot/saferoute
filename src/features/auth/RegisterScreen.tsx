import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { BigButton } from '../../components/BigButton';
import { AccessibleInput } from '../../components/AccessibleInput';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loading, error, clearError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('알림', '모든 항목을 입력해주세요.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('알림', '비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
      return;
    }
    await register(email, password, name, role);
    Alert.alert('성공', '회원가입이 완료되었습니다!', [
      { text: '확인', onPress: () => router.back() },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title} accessibilityRole="header">
        📝 회원가입
      </Text>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      <AccessibleInput
        label="이름"
        value={name}
        onChangeText={(t) => { clearError(); setName(t); }}
        placeholder="홍길동"
        icon="👤"
      />

      <AccessibleInput
        label="이메일"
        value={email}
        onChangeText={(t) => { clearError(); setEmail(t); }}
        placeholder="example@email.com"
        icon="📧"
      />

      <AccessibleInput
        label="비밀번호"
        value={password}
        onChangeText={(t) => { clearError(); setPassword(t); }}
        placeholder="6자 이상"
        icon="🔒"
      />

      <AccessibleInput
        label="비밀번호 확인"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="비밀번호 다시 입력"
        icon="🔒"
      />

      <View style={styles.roleSection}>
        <Text style={styles.roleLabel}>역할 선택</Text>
        <View style={styles.roleRow}>
          <BigButton
            title="🚶 사용자"
            onPress={() => setRole('user')}
            color={role === 'user' ? COLORS.primary : COLORS.border}
            style={styles.roleBtn}
          />
          <BigButton
            title="👀 보호자"
            onPress={() => setRole('guardian')}
            color={role === 'guardian' ? COLORS.secondary : COLORS.border}
            style={styles.roleBtn}
          />
        </View>
      </View>

      <BigButton
        title="회원가입"
        onPress={handleRegister}
        disabled={loading}
        color={COLORS.primary}
        style={styles.submitButton}
      />

      <BigButton
        title="← 로그인으로 돌아가기"
        onPress={() => router.back()}
        color={COLORS.textLight}
        style={styles.linkButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingTop: SPACING.xxl,
  },
  title: {
    fontSize: FONTS.title,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  roleSection: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  roleLabel: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  roleRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  roleBtn: {
    flex: 1,
  },
  submitButton: {
    marginTop: SPACING.lg,
  },
  linkButton: {
    marginTop: SPACING.md,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  errorText: {
    fontSize: FONTS.small,
    color: COLORS.danger,
    textAlign: 'center',
  },
});
