import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Contenedor base con fondo de marca y safe-area.
export function Screen({
  children,
  scroll = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
}) {
  return (
    <SafeAreaView className="flex-1 bg-[#1e1b4b]" edges={['top']}>
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-28 pt-2"
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View className="flex-1 px-4 pt-2">{children}</View>
      )}
    </SafeAreaView>
  );
}
