import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAppStore } from '../../stores/appStore';
import { linkGuardian, supabase } from '../../services/supabase';
import { COLORS } from '../../constants/theme';

/**
 * 보호자 연결 화면
 * - 6자리 코드 입력으로 보호자 연결
 * - QR코드 옵션 (향후 확장)
 */
export default function LinkGuardian() {
  const userId = useAppStore((s) => s.userId);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [linked, setLinked] = useState(false);
  const [myCode, setMyCode] = useState<string | null>(null);

  // 내 연결 코드 생성 (보호자가 입력할 코드)
  const generateMyCode = useCallback(async () => {
    if (!userId) {
      Alert.alert('오류', '로그인이 필요합니다');
      return;
    }

    const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { error } = await supabase.from('guardian_links').upsert({
      user_id: userId,
      guardian_code: generatedCode,
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    if (error) {
      Alert.alert('오류', '코드 생성에 실패했습니다');
      return;
    }

    setMyCode(generatedCode);
  }, [userId]);

  // 코드로 보호자 연결
  const handleLink = useCallback(async () => {
    if (code.length !== 6) {
      Alert.alert('안내', '6자리 코드를 입력해 주세요');
      return;
    }

    if (!userId) {
      Alert.alert('오류', '로그인이 필요합니다');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await linkGuardian(userId, code.toUpperCase());

      if (error) {
        Alert.alert('연결 실패', '올바른 코드인지 확인해 주세요');
      } else {
        setLinked(true);
        Alert.alert('연결 완료! 🎉', '보호자와 연결되었습니다');
      }
    } finally {
      setLoading(false);
    }
  }, [code, userId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👨‍👩‍👧 보호자 연결</Text>
      <Text style={styles.subtitle}>
        보호자와 연결하면 내 위치와 이탈 알림을 공유할 수 있어요
      </Text>

      {/* 내 코드 생성 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 내 연결 코드</Text>
        <Text style={styles.sectionDesc}>
          보호자에게 이 코드를 알려주세요
        </Text>

        {myCode ? (
          <View style={styles.codeDisplay}>
            <Text style={styles.codeText}>{myCode}</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.generateBtn} onPress={generateMyCode}>
            <Text style={styles.generateBtnText}>코드 생성하기</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 구분선 */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>또는</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* 코드 입력 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔗 보호자 코드 입력</Text>
        <Text style={styles.sectionDesc}>
          보호자가 알려준 6자리 코드를 입력하세요
        </Text>

        <TextInput
          style={styles.input}
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase())}
          placeholder="코드 6자리 입력"
          placeholderTextColor="#999"
          maxLength={6}
          autoCapitalize="characters"
          editable={!linked}
        />

        <TouchableOpacity
          style={[styles.linkBtn, (loading || linked) && styles.linkBtnDisabled]}
          onPress={handleLink}
          disabled={loading || linked}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.linkBtnText}>
              {linked ? '✅ 연결됨' : '연결하기'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* QR코드 옵션 (향후) */}
      <TouchableOpacity
        style={styles.qrBtn}
        onPress={() => Alert.alert('준비 중', 'QR코드 연결은 곧 지원됩니다!')}
      >
        <Text style={styles.qrBtnText}>📷 QR코드로 연결하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    lineHeight: 24,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  codeDisplay: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  codeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    letterSpacing: 8,
  },
  generateBtn: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  generateBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDD',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#999',
    fontSize: 14,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  linkBtn: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  linkBtnDisabled: {
    backgroundColor: '#B0BEC5',
  },
  linkBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  qrBtn: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  qrBtnText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
});
