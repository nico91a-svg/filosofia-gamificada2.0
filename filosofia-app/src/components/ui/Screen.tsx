import React from 'react';
import { View, ScrollView, Text, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TILE = require('../../../assets/tile-dungeon.png');

// Contenedor base con fondo de mazmorra (textura repetida) y cabecera pixel opcional.
export function Screen({
  children,
  scroll = true,
  title,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  title?: string;
}) {
  const Header = title ? (
    <View className="mb-4 border-b-2 border-stone-dark pb-2">
      <Text className="font-pixel text-base text-gold" style={{ letterSpacing: 1 }}>
        {title}
      </Text>
    </View>
  ) : null;

  return (
    <ImageBackground source={TILE} resizeMode="repeat" className="flex-1 bg-dungeon-950">
      <SafeAreaView className="flex-1" edges={['top']}>
        {scroll ? (
          <ScrollView
            className="flex-1"
            contentContainerClassName="px-4 pb-28 pt-3"
            keyboardShouldPersistTaps="handled"
          >
            {Header}
            {children}
          </ScrollView>
        ) : (
          <View className="flex-1 px-4 pt-3">
            {Header}
            {children}
          </View>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}
