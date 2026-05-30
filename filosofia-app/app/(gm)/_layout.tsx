import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function GMLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1838',
          borderTopColor: 'rgba(255,255,255,0.08)',
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#fbbf24',
        tabBarInactiveTintColor: '#a78bfa',
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Panel', tabBarIcon: () => <Text style={{ fontSize: 20 }}>🛡️</Text> }}
      />
      <Tabs.Screen
        name="estudiantes"
        options={{ title: 'Estudiantes', tabBarIcon: () => <Text style={{ fontSize: 20 }}>👥</Text> }}
      />
      <Tabs.Screen
        name="registro"
        options={{ title: 'Registrar', tabBarIcon: () => <Text style={{ fontSize: 20 }}>⚡</Text> }}
      />
    </Tabs>
  );
}
