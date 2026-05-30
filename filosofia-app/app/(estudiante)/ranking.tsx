import React, { useMemo } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../../src/store/useGameStore';
import { getNivel } from '../../src/domain';
import { NIVEL_TITULOS_EMOJI } from '../../src/theme/pixel';

export default function Ranking() {
  const students = useGameStore((s) => s.students);
  const current = useGameStore((s) => s.currentStudent());

  const ordenados = useMemo(
    () => [...students].sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0)),
    [students],
  );

  const medalla = (i: number) => (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`);

  return (
    <SafeAreaView className="flex-1 bg-dungeon-950" edges={['top']}>
      <View className="border-b-2 border-stone-dark px-4 pb-2 pt-3">
        <Text className="font-pixel text-base text-gold">◆ SALÓN DE HÉROES</Text>
      </View>
      <FlatList
        data={ordenados}
        keyExtractor={(s) => s.id}
        contentContainerClassName="px-4 pb-28 pt-3"
        renderItem={({ item, index }) => {
          const nivel = getNivel(item.xp ?? 0);
          const yo = current?.id === item.id;
          return (
            <View
              className={`mb-2 flex-row items-center border-2 p-3 ${yo ? 'border-gold bg-dungeon-700' : 'border-stone-dark bg-dungeon-800'}`}
            >
              <Text className="w-8 text-center font-pixel text-xs text-gold-light">{medalla(index)}</Text>
              <Text style={{ fontSize: 24 }}>{NIVEL_TITULOS_EMOJI[nivel.nivel - 1] ?? '🗡️'}</Text>
              <View className="ml-2 flex-1">
                <Text className="font-body text-sm text-parchment">{item.nombreSocial}</Text>
                <Text className="font-body text-[11px] text-arcane">NV {nivel.nivel} · {nivel.titulo}</Text>
              </View>
              <Text className="font-pixel text-[11px] text-gold">{item.xp ?? 0}</Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text className="mt-10 text-center font-body text-sm text-stone-light">
            Aún no hay héroes inscritos.
          </Text>
        }
      />
    </SafeAreaView>
  );
}
