// Barra de XP con nivel y progreso animado
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { getProgresoNivel } from '../../domain';

export function XPBar({ xp }: { xp: number }) {
  const { nivel, progreso, faltante } = getProgresoNivel(xp);
  const w = useSharedValue(0);

  useEffect(() => {
    w.value = withTiming(progreso, { duration: 600 });
  }, [progreso]);

  const barStyle = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));

  return (
    <View className="w-full">
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="text-xs font-bold text-amber-300">
          Nivel {nivel.nivel} · {nivel.titulo}
        </Text>
        <Text className="text-xs text-purple-200">{xp} XP</Text>
      </View>
      <View className="h-3 w-full overflow-hidden rounded-full bg-white/10">
        <Animated.View style={barStyle} className="h-full rounded-full bg-amber-400" />
      </View>
      {faltante > 0 && (
        <Text className="mt-1 text-[10px] text-purple-300">
          Faltan {faltante} XP para el siguiente nivel
        </Text>
      )}
    </View>
  );
}
