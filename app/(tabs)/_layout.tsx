import React from 'react';
import { Tabs } from 'expo-router';
import { COLORS } from '../../src/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.border,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          backgroundColor: COLORS.background,
          paddingBottom: 8,
          paddingTop: 8,
          height: 72,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: () => null,
          tabBarLabel: '🏠 홈',
        }}
      />
      <Tabs.Screen
        name="navigation"
        options={{
          title: '길찾기',
          tabBarIcon: () => null,
          tabBarLabel: '🧭 길찾기',
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'AI 대화',
          tabBarIcon: () => null,
          tabBarLabel: '🤖 대화',
        }}
      />
    </Tabs>
  );
}
