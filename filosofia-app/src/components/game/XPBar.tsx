// Barra de XP pixel: marco de piedra + relleno dorado segmentado.
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { getProgresoNivel } from '../../domain';

export function XPBar({ xp }: { xp: number }) {
  const { nivel, progreso, faltante } = getProgresoNivel(xp);
  const w = useSharedValue(0);

  useEffect(() => {
    w.value = withTiming(progreso, { duration: 700 });
  }, [progreso]);

  const barStyle = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));

  return (
    <View className="w-full">
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="font-pixel text-[10px] text-gold-light">NV {nivel.nivel}</Text>
        <Text className="font-body text-xs text-parchment">{xp} XP</Text>
      </View>
      {/* marco de piedra */}
      <View className="border-2 border-stone-dark bg-dungeon-950 p-[2px]">
        <View className="h-3 w-full bg-dungeon-800">
          <Animated.View style={barStyle} className="h-full bg-gold" />
        </View>
      </View>
      <Text className="mt-1 font-body text-[11px] text-arcane">{nivel.titulo}</Text>
      {faltante > 0 && (
        <Text className="font-body text-[10px] text-stone-light">{faltante} XP al siguiente nivel</Text>
      )}
    </View>
  );
}
