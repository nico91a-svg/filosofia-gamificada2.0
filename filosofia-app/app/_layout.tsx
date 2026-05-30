import 'react-native-gesture-handler';
import '../global.css';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { useGameStore } from '../src/store/useGameStore';

export default function RootLayout() {
  const init = useGameStore((s) => s.init);

  useEffect(() => {
    init();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#1e1b4b' },
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
