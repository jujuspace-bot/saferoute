import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { BigButton } from '../../components/BigButton';
import { AccessibleInput } from '../../components/AccessibleInput';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loading, error, clearError } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('알림', '이메일과 비밀번호를 입력해주세요.');
      return;
    }
    await login(email, password);
  };

  // 역할 선택 화면
  if (!selectedRole) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title} accessibilityRole="header">
          🛡️ SafeRoute
        </Text>
        <Text style={styles.subtitle}>안전한 길 안내</Text>

        <View style={styles.roleSection}>
          <Text style={styles.sectionTitle}>모드를 선택하세요</Text>

          <BigButton
            title="🚶 사용자 모드"
            onPress={() => setSelectedRole('user')}
            color={COLORS.primary}
            style={styles.roleButton}
          />

          <BigButton
            title="👀 보호자 모드"
            onPress={() => setSelectedRole('guardian')}
            color={COLORS.secondary}
            style={styles.roleButton}
          />
        </View>

        <BigButton
          title="계정이 없으신가요? 회원가입"
          onPress={() => router.push('/register' as any)}
          color={COLORS.textLight}
          style={styles.linkButton}
        />
      </ScrollView>
    );
  }

  // 로그인 폼
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title} accessibilityRole="header">
        {selectedRole === 'user' ? '🚶 사용자 로그인' : '👀 보호자 로그인'}
      </Text>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

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
        placeholder="비밀번호 입력"
        icon="🔒"
      />

      <BigButton
        title="로그인"
        onPress={handleLogin}
        disabled={loading}
        color={selectedRole === 'user' ? COLORS.primary : COLORS.secondary}
        style={styles.submitButton}
      />

      <BigButton
        title="← 모드 다시 선택"
        onPress={() => setSelectedRole(null)}
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
    paddingTop: SPACING.xxl * 2,
  },
  title: {
    fontSize: FONTS.title,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.medium,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  roleSection: {
    marginBottom: SPACING.xl,
  },
  roleButton: {
    marginBottom: SPACING.md,
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
