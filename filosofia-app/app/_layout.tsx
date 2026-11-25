import 'react-native-gesture-handler';
import '../global.css';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { Silkscreen_400Regular, Silkscreen_700Bold } from '@expo-google-fonts/silkscreen';
import { useGameStore } from '../src/store/useGameStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const init = useGameStore((s) => s.init);
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
    Silkscreen_400Regular,
    Silkscreen_700Bold,
  });

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0e0b1e' },
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
