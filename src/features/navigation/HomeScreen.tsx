import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { BigButton } from '../../components/BigButton';
import { useAppStore } from '../../stores/appStore';

// 자주 가는 곳 (추후 DB 연동)
const FAVORITES = [
  { name: '집', icon: '🏠', address: '서울시 강남구...' },
  { name: '학교', icon: '🏫', address: '서울시 서초구...' },
  { name: '직장', icon: '🏢', address: '서울시 종로구...' },
];

export function HomeScreen() {
  const { setDestination, destination } = useAppStore();

  const handleSearch = () => {
    if (destination) {
      // TODO: 경로 검색 → NavigationScreen으로 이동
      console.log('경로 검색:', destination);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* 인사 */}
        <Text style={styles.greeting}>안녕하세요! 👋</Text>
        <Text style={styles.subtitle}>어디로 가시나요?</Text>

        {/* 검색 */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="목적지를 입력하세요"
            placeholderTextColor={COLORS.textLight}
            value={destination || ''}
            onChangeText={setDestination}
            accessibilityLabel="목적지 입력"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
        </View>

        <BigButton
          title="길 찾기"
          icon="🧭"
          onPress={handleSearch}
          disabled={!destination}
        />

        {/* 자주 가는 곳 */}
        <Text style={styles.sectionTitle}>⭐ 자주 가는 곳</Text>
        {FAVORITES.map((fav) => (
          <BigButton
            key={fav.name}
            title={`${fav.icon} ${fav.name}`}
            color={COLORS.secondary}
            onPress={() => {
              setDestination(fav.address);
            }}
            style={styles.favButton}
          />
        ))}

        {/* AI 대화 버튼 */}
        <BigButton
          title="AI에게 물어보기 🤖"
          color="#8B5CF6"
          onPress={() => {
            // TODO: AI 채팅 열기
          }}
          style={styles.chatButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: SPACING.lg,
  },
  greeting: {
    fontSize: FONTS.title,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.large,
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.medium,
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  favButton: {
    marginBottom: SPACING.sm,
  },
  chatButton: {
    marginTop: SPACING.xl,
  },
});
