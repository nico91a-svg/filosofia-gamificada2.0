// Apertura de cofre pixel-art con animación fluida (Reanimated) + haptics.
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSequence,
  withSpring, withRepeat, runOnJS, Easing,
} from 'react-native-reanimated';
import { COFRES } from '../../domain';
import type { Artefacto, TipoCofre } from '../../domain/types';
import { PixelSprite } from '../pixel/PixelSprite';
import { chestSprite, chestOpenSprite, GEM_SPRITE, gemColor } from '../pixel/sprites';
import { RAREZA_PIXEL } from '../../theme/pixel';

type Fase = 'idle' | 'shake' | 'burst' | 'reveal';

interface Props {
  tipoCofre: TipoCofre;
  premioDecidido: Artefacto; // decidido fuera (idempotente)
  onClaim: (art: Artefacto) => void;
}

export function ChestOpening({ tipoCofre, premioDecidido, onClaim }: Props) {
  const [fase, setFase] = useState<Fase>('idle');
  const cofre = COFRES[tipoCofre];
  const rar = RAREZA_PIXEL[premioDecidido.rareza];

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
          withTiming(1.05, { duration: 900, easing: Easing.inOut(Easing.ease) }),
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
    scale.value = withSequence(withTiming(1.3, { duration: 150 }), withSpring(1, { damping: 6 }));
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

  const chestStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotateZ: `${rotation.value}rad` }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 1 + glow.value * 0.7 }],
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: burst.value,
    transform: [{ scale: 0.5 + burst.value * 2.2 }],
  }));
  const revealStyle = useAnimatedStyle(() => ({
    opacity: revealOpacity.value,
    transform: [{ translateY: revealY.value }],
  }));

  return (
    <View className="flex-1 items-center justify-center px-6">
      {/* halo */}
      <Animated.View
        pointerEvents="none"
        style={[glowStyle, { backgroundColor: rar.glow }]}
        className="absolute h-56 w-56 rounded-full opacity-50"
      />
      {fase === 'burst' && (
        <Animated.View
          pointerEvents="none"
          style={[burstStyle, { backgroundColor: rar.glow }]}
          className="absolute h-64 w-64 rounded-full"
        />
      )}

      {fase !== 'reveal' && (
        <Pressable onPress={abrir} disabled={fase !== 'idle'} hitSlop={24}>
          <Animated.View style={chestStyle} className="items-center">
            <PixelSprite
              sprite={fase === 'burst' ? chestOpenSprite(tipoCofre) : chestSprite(tipoCofre)}
              size={180}
            />
            {fase === 'idle' && (
              <Text className="mt-4 font-body text-base text-gold-light">
                TOCA PARA ABRIR · {cofre.nombre.toUpperCase()}
              </Text>
            )}
          </Animated.View>
        </Pressable>
      )}

      {fase === 'reveal' && (
        <Animated.View style={revealStyle} className="items-center">
          <PixelSprite
            sprite={GEM_SPRITE}
            size={150}
            tint={gemColor(premioDecidido.rareza)}
            tintKey="c"
          />
          <View className="-mt-2 opacity-90">
            <PixelSprite sprite={chestOpenSprite(tipoCofre)} size={84} />
          </View>
          <Text className="mt-2 text-3xl">{premioDecidido.emoji}</Text>
          <Text className="mt-2 font-pixel text-lg" style={{ color: rar.color }}>
            {premioDecidido.nombre}
          </Text>
          <Text className="mt-2 font-body text-xs" style={{ color: rar.glow, letterSpacing: 2 }}>
            ★ {rar.label} ★
          </Text>
          <Text className="mt-2 max-w-[260px] text-center font-body text-sm text-parchment">
            {premioDecidido.efecto}
          </Text>
          <Pressable
            onPress={() => onClaim(premioDecidido)}
            className="mt-8 border-[3px] border-stone-dark bg-gold active:opacity-80"
          >
            <View className="border-2 border-t-gold-light border-l-gold-light border-b-gold-dark border-r-gold-dark px-10 py-3">
              <Text className="font-body text-base text-[#3a2a06]">¡RECLAMAR!</Text>
            </View>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}
