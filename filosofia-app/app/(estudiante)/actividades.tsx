import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { Screen } from '../../src/components/ui/Screen';
import { useGameStore } from '../../src/store/useGameStore';
import { TIPOS_ACTIVIDAD } from '../../src/domain';

export default function Actividades() {
  const student = useGameStore((s) => s.currentStudent());
  const activities = useGameStore((s) => s.activities);

  const mias = useMemo(
    () =>
      activities
        .filter((a) => a.studentId === student?.id)
        .sort((a, b) => (a.fecha < b.fecha ? 1 : -1)),
    [activities, student?.id],
  );

  const nombreTipo = (id: string) =>
    TIPOS_ACTIVIDAD.find((t) => t.id === id)?.nombre ?? id;
  const iconoTipo = (id: string) => TIPOS_ACTIVIDAD.find((t) => t.id === id)?.icon ?? '⚡';

  return (
    <Screen>
      <Text className="mb-1 text-2xl font-extrabold text-white">⚡ Mis actividades</Text>
      <Text className="mb-4 text-sm text-purple-300">{mias.length} registradas</Text>

      {mias.length === 0 ? (
        <Text className="text-purple-300">
          Aún no tienes actividades registradas. El Game Master las irá sumando en clase.
        </Text>
      ) : (
        mias.map((a) => (
          <View key={a.id} className="mb-2 flex-row items-center rounded-2xl bg-white/5 p-3">
            <Text style={{ fontSize: 24 }}>{iconoTipo(a.tipo)}</Text>
            <View className="ml-3 flex-1">
              <Text className="font-bold text-white">{nombreTipo(a.tipo)}</Text>
              <Text className="text-xs capitalize text-purple-300">
                {a.nivel} · {new Date(a.fecha).toLocaleDateString('es-CL')}
              </Text>
            </View>
            <Text className="font-extrabold text-amber-300">+{a.xp} XP</Text>
          </View>
        ))
      )}
    </Screen>
  );
}
