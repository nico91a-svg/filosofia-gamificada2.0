import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../src/components/ui/Screen';
import { XPBar } from '../../src/components/game/XPBar';
import { RadarChart } from '../../src/components/game/RadarChart';
import { useGameStore } from '../../src/store/useGameStore';
import { getNivel, BADGES } from '../../src/domain';
import { avatarPorNivel } from '../../src/theme/colors';

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
    <Screen>
      {/* Cabecera */}
      <View className="mb-4 flex-row items-center">
        <Text style={{ fontSize: 48 }}>{avatarPorNivel(nivel.nivel)}</Text>
        <View className="ml-3 flex-1">
          <Text className="text-xl font-extrabold text-white">{student.nombreSocial}</Text>
          <Text className="text-sm text-purple-300">{nivel.titulo}</Text>
        </View>
      </View>

      <View className="rounded-2xl bg-white/5 p-4">
        <XPBar xp={student.xp ?? 0} />
      </View>

      {/* Banner de cofres pendientes */}
      {cofres > 0 && (
        <Pressable
          onPress={() => router.push('/(estudiante)/artefactos')}
          className="mt-4 flex-row items-center rounded-2xl bg-amber-400/20 p-4 active:opacity-80"
        >
          <Text style={{ fontSize: 32 }}>🎁</Text>
          <View className="ml-3 flex-1">
            <Text className="font-bold text-amber-200">
              ¡Tienes {cofres} cofre{cofres !== 1 ? 's' : ''} sin abrir!
            </Text>
            <Text className="text-xs text-amber-100/70">Toca para abrir</Text>
          </View>
          <Text className="text-amber-200">›</Text>
        </Pressable>
      )}

      {/* Radar de habilidades */}
      <View className="mt-4 rounded-2xl bg-white/5 p-4">
        <Text className="mb-2 text-center font-bold text-white">Habilidades filosóficas</Text>
        <RadarChart habilidades={student.habilidades} />
      </View>

      {/* Badges */}
      <View className="mt-4 rounded-2xl bg-white/5 p-4">
        <Text className="mb-2 font-bold text-white">Insignias ({misBadges.length})</Text>
        <View className="flex-row flex-wrap gap-2">
          {misBadges.map((b) => (
            <View key={b.id} className="items-center rounded-xl bg-white/10 px-3 py-2">
              <Text style={{ fontSize: 22 }}>{b.icon}</Text>
              <Text className="mt-1 text-[10px] text-purple-200">{b.nombre}</Text>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}
