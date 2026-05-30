// Componente estrella: apertura de cofre con animación fluida (Reanimated)
// + haptics. Reutiliza abrirCofre() / RAREZA_GLOW del dominio.
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSequence,
  withSpring, withRepeat, runOnJS, Easing,
} from 'react-native-reanimated';
import { COFRES, RAREZA_GLOW, RAREZA_LABEL } from '../../domain';
import type { Artefacto, TipoCofre } from '../../domain/types';

type Fase = 'idle' | 'shake' | 'burst' | 'reveal';

interface Props {
  tipoCofre: TipoCofre;
  // Decide el premio fuera (idempotente) y lo revela aquí:
  premioDecidido: Artefacto;
  onClaim: (art: Artefacto) => void;
}

export function ChestOpening({ tipoCofre, premioDecidido, onClaim }: Props) {
  const [fase, setFase] = useState<Fase>('idle');
  const cofre = COFRES[tipoCofre];

  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.4);
  const burst = useSharedValue(0);
  const revealY = useSharedValue(40);
  const revealOpacity = useSharedValue(0);

  useEffect(() => {
    if (fase === 'idle') {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      );
      glow.value = withRepeat(withTiming(0.7, { duration: 900 }), -1, true);
    }
  }, [fase]);

  const triggerBurst = useCallback(() => {
    setFase('burst');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    burst.value = withSequence(
      withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 420 }),
    );
    scale.value = withSequence(withTiming(1.25, { duration: 150 }), withSpring(1, { damping: 6 }));
    setTimeout(() => {
      setFase('reveal');
      revealOpacity.value = withTiming(1, { duration: 300 });
      revealY.value = withSpring(0, { damping: 10, stiffness: 120 });
    }, 260);
  }, []);

  const abrir = useCallback(() => {
    if (fase !== 'idle') return;
    setFase('shake');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    rotation.value = withSequence(
      withRepeat(withTiming(0.05, { duration: 60 }), 6, true),
      withRepeat(withTiming(0.12, { duration: 45 }), 8, true),
      withTiming(0, { duration: 80 }, (finished) => {
        if (finished) runOnJS(triggerBurst)();
      }),
    );
  }, [fase, triggerBurst]);

  const cofreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotateZ: `${rotation.value}rad` }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 1 + glow.value * 0.6 }],
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: burst.value,
    transform: [{ scale: 0.5 + burst.value * 2 }],
  }));
  const revealStyle = useAnimatedStyle(() => ({
    opacity: revealOpacity.value,
    transform: [{ translateY: revealY.value }],
  }));

  const rarezaColor = RAREZA_GLOW[premioDecidido.rareza];

  return (
    <View className="flex-1 items-center justify-center px-6">
      <Animated.View
        pointerEvents="none"
        style={[glowStyle, { backgroundColor: rarezaColor }]}
        className="absolute h-64 w-64 rounded-full opacity-60"
      />
      {fase === 'burst' && (
        <Animated.View
          pointerEvents="none"
          style={[burstStyle, { backgroundColor: rarezaColor }]}
          className="absolute h-72 w-72 rounded-full"
        />
      )}

      {fase !== 'reveal' && (
        <Pressable onPress={abrir} disabled={fase !== 'idle'} hitSlop={20}>
          <Animated.View style={cofreStyle} className="items-center">
            <Text style={{ fontSize: 120 }}>{cofre.emoji}</Text>
            {fase === 'idle' && (
              <Text className="mt-4 text-base font-bold text-amber-200">
                Toca para abrir · {cofre.nombre}
              </Text>
            )}
          </Animated.View>
        </Pressable>
      )}

      {fase === 'reveal' && (
        <Animated.View style={revealStyle} className="items-center">
          <Text style={{ fontSize: 96 }}>{premioDecidido.emoji}</Text>
          <Text className="mt-3 text-2xl font-extrabold" style={{ color: rarezaColor }}>
            {premioDecidido.nombre}
          </Text>
          <Text className="mt-1 text-sm uppercase tracking-widest text-white/70">
            {RAREZA_LABEL[premioDecidido.rareza]}
          </Text>
          <Text className="mt-2 text-center text-base text-purple-200">
            {premioDecidido.efecto}
          </Text>
          <Pressable
            onPress={() => onClaim(premioDecidido)}
            className="mt-8 rounded-2xl bg-amber-400 px-10 py-4 active:opacity-80"
          >
            <Text className="text-lg font-bold text-amber-950">¡Reclamar!</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}
