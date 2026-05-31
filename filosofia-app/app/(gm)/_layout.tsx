import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function GMLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#221a45',
          borderTopWidth: 3,
          borderTopColor: '#1c1538',
          height: 66,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#f2c33d',
        tabBarInactiveTintColor: '#6b5fa3',
        tabBarLabelStyle: { fontFamily: 'Silkscreen_400Regular', fontSize: 9 },
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
