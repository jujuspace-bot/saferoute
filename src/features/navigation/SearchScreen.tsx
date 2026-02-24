import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, TOUCH_TARGET } from '../../constants/theme';
import { AccessibleInput } from '../../components/AccessibleInput';
import { BigButton } from '../../components/BigButton';

// 자주 가는 곳 (추후 DB 연동)
const FAVORITES = [
  { id: '1', name: '집', icon: '🏠', address: '서울시 강남구 역삼동' },
  { id: '2', name: '학교', icon: '🏫', address: '서울시 서초구 서초동' },
  { id: '3', name: '직장', icon: '🏢', address: '서울시 종로구 종로' },
];

// 최근 검색 (추후 로컬 스토리지 연동)
const RECENT_SEARCHES = [
  { id: '1', name: '강남역', address: '서울시 강남구 강남대로' },
  { id: '2', name: '서울역', address: '서울시 용산구 한강대로' },
];

interface SearchScreenProps {
  onSelectDestination?: (address: string, name: string) => void;
  onVoiceSearch?: () => void;
}

export function SearchScreen({ onSelectDestination, onVoiceSearch }: SearchScreenProps) {
  const [query, setQuery] = useState('');

  const handleSelect = (address: string, name: string) => {
    onSelectDestination?.(address, name);
  };

  const handleSearch = () => {
    if (query.trim()) {
      onSelectDestination?.(query, query);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* 헤더 */}
        <Text style={styles.title} accessibilityRole="header">
          어디로 갈까요? 🗺️
        </Text>

        {/* 검색 입력 + 음성 */}
        <AccessibleInput
          label="목적지 검색"
          value={query}
          onChangeText={setQuery}
          placeholder="장소 이름이나 주소를 입력하세요"
          icon="🔍"
          rightIcon="🎤"
          onRightIconPress={onVoiceSearch}
          rightIconLabel="음성으로 검색하기"
          onSubmitEditing={handleSearch}
          autoFocus
        />

        {/* 검색 버튼 */}
        <BigButton
          title="검색하기"
          icon="🔍"
          onPress={handleSearch}
          disabled={!query.trim()}
        />

        {/* 자주 가는 곳 */}
        <Text style={styles.sectionTitle} accessibilityRole="header">
          ⭐ 자주 가는 곳
        </Text>
        {FAVORITES.map((fav) => (
          <TouchableOpacity
            key={fav.id}
            style={styles.placeCard}
            onPress={() => handleSelect(fav.address, fav.name)}
            accessibilityLabel={`${fav.name}, ${fav.address}`}
            accessibilityRole="button"
            accessibilityHint="선택하면 이 장소로 길찾기를 시작합니다"
          >
            <Text style={styles.placeIcon}>{fav.icon}</Text>
            <View style={styles.placeInfo}>
              <Text style={styles.placeName}>{fav.name}</Text>
              <Text style={styles.placeAddress}>{fav.address}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}

        {/* 최근 검색 */}
        {RECENT_SEARCHES.length > 0 && (
          <>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              🕐 최근 검색
            </Text>
            {RECENT_SEARCHES.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.placeCard}
                onPress={() => handleSelect(item.address, item.name)}
                accessibilityLabel={`최근 검색: ${item.name}, ${item.address}`}
                accessibilityRole="button"
                accessibilityHint="선택하면 이 장소로 길찾기를 시작합니다"
              >
                <Text style={styles.placeIcon}>🕐</Text>
                <View style={styles.placeInfo}>
                  <Text style={styles.placeName}>{item.name}</Text>
                  <Text style={styles.placeAddress}>{item.address}</Text>
                </View>
                <Text style={styles.arrow}>→</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
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
  title: {
    fontSize: FONTS.title,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    minHeight: TOUCH_TARGET * 1.3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  placeIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: FONTS.medium,
    fontWeight: '700',
    color: COLORS.text,
  },
  placeAddress: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  arrow: {
    fontSize: FONTS.large,
    color: COLORS.textLight,
    marginLeft: SPACING.sm,
  },
});
