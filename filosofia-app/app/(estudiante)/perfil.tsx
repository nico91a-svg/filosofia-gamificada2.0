import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../src/components/ui/Screen';
import { XPBar } from '../../src/components/game/XPBar';
import { RadarChart } from '../../src/components/game/RadarChart';
import { PixelPanel } from '../../src/components/pixel/PixelPanel';
import { useGameStore } from '../../src/store/useGameStore';
import { getNivel, BADGES } from '../../src/domain';
import { NIVEL_TITULOS_EMOJI } from '../../src/theme/pixel';

function contarCofres(artefactos: (string | { id: string })[] = []) {
  return artefactos.filter((a) => (typeof a === 'string' ? a : a?.id)?.startsWith('cofre_')).length;
}

export default function Perfil() {
  const student = useGameStore((s) => s.currentStudent());
  if (!student) return null;

  const nivel = getNivel(student.xp ?? 0);
  const cofres = contarCofres(student.artefactos);
  const misBadges = BADGES.filter((b) => (student.badges ?? []).includes(b.id));

  return (
    <Screen title="◆ MI HÉROE">
      {/* Cabecera del héroe */}
      <PixelPanel tone="stone" rivets>
        <View className="flex-row items-center">
          <View className="border-2 border-stone-dark bg-dungeon-950 p-1">
            <Text style={{ fontSize: 40 }}>{NIVEL_TITULOS_EMOJI[nivel.nivel - 1] ?? '🗡️'}</Text>
          </View>
          <View className="ml-3 flex-1">
            <Text className="font-pixel text-sm text-parchment">{student.nombreSocial}</Text>
            <Text className="mt-1 font-body text-xs text-arcane">{nivel.titulo}</Text>
          </View>
        </View>
        <View className="mt-3">
          <XPBar xp={student.xp ?? 0} />
        </View>
      </PixelPanel>

      {/* Banner de cofres */}
      {cofres > 0 && (
        <Pressable onPress={() => router.push('/(estudiante)/artefactos')} className="mt-4 active:opacity-80">
          <PixelPanel tone="gold">
            <View className="flex-row items-center">
              <Text style={{ fontSize: 30 }}>🎁</Text>
              <View className="ml-3 flex-1">
                <Text className="font-body text-sm text-gold-light">
                  ¡{cofres} COFRE{cofres !== 1 ? 'S' : ''} SIN ABRIR!
                </Text>
                <Text className="font-body text-[11px] text-parchment">Toca para abrir tu botín</Text>
              </View>
              <Text className="font-pixel text-gold">›</Text>
            </View>
          </PixelPanel>
        </Pressable>
      )}

      {/* Radar */}
      <View className="mt-4">
        <PixelPanel tone="arcane">
          <Text className="mb-2 text-center font-pixel text-xs text-gold">HABILIDADES</Text>
          <RadarChart habilidades={student.habilidades} />
        </PixelPanel>
      </View>

      {/* Insignias */}
      <View className="mt-4">
        <PixelPanel tone="stone">
          <Text className="mb-2 font-pixel text-xs text-gold">INSIGNIAS · {misBadges.length}</Text>
          <View className="flex-row flex-wrap gap-2">
            {misBadges.map((b) => (
              <View key={b.id} className="w-[30%] items-center border-2 border-stone-dark bg-dungeon-950 p-2">
                <Text style={{ fontSize: 20 }}>{b.icon}</Text>
                <Text className="mt-1 text-center font-body text-[10px] text-parchment">{b.nombre}</Text>
              </View>
            ))}
          </View>
        </PixelPanel>
      </View>
    </Screen>
  );
}
