import React, { useMemo } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../../src/store/useGameStore';
import { getNivel } from '../../src/domain';
import { avatarPorNivel } from '../../src/theme/colors';

export default function Ranking() {
  const students = useGameStore((s) => s.students);
  const current = useGameStore((s) => s.currentStudent());

  const ordenados = useMemo(
    () => [...students].sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0)),
    [students],
  );

  const medalla = (i: number) => (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`);

  return (
    <SafeAreaView className="flex-1 bg-[#1e1b4b]" edges={['top']}>
      <View className="px-4 pt-2">
        <Text className="mb-3 text-2xl font-extrabold text-white">🏆 Ranking</Text>
      </View>
      <FlatList
        data={ordenados}
        keyExtractor={(s) => s.id}
        contentContainerClassName="px-4 pb-28"
        renderItem={({ item, index }) => {
          const nivel = getNivel(item.xp ?? 0);
          const yo = current?.id === item.id;
          return (
            <View
              className={`mb-2 flex-row items-center rounded-2xl p-3 ${yo ? 'bg-amber-400/20' : 'bg-white/5'}`}
            >
              <Text className="w-8 text-center text-base font-bold text-purple-200">
                {medalla(index)}
              </Text>
              <Text style={{ fontSize: 26 }}>{avatarPorNivel(nivel.nivel)}</Text>
              <View className="ml-2 flex-1">
                <Text className="font-bold text-white">{item.nombreSocial}</Text>
                <Text className="text-xs text-purple-300">Nivel {nivel.nivel}</Text>
              </View>
              <Text className="font-extrabold text-amber-300">{item.xp ?? 0} XP</Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text className="mt-10 text-center text-purple-300">
            Aún no hay estudiantes inscritos.
          </Text>
        }
      />
    </SafeAreaView>
  );
}
