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

  const nombreTipo = (id: string) => TIPOS_ACTIVIDAD.find((t) => t.id === id)?.nombre ?? id;
  const iconoTipo = (id: string) => TIPOS_ACTIVIDAD.find((t) => t.id === id)?.icon ?? '⚡';

  return (
    <Screen title="◆ BITÁCORA">
      <Text className="mb-4 font-body text-xs text-arcane">{mias.length} HAZAÑAS REGISTRADAS</Text>

      {mias.length === 0 ? (
        <Text className="font-body text-sm text-stone-light">
          Aún no tienes hazañas. El Game Master las irá sumando en clase.
        </Text>
      ) : (
        mias.map((a) => (
          <View key={a.id} className="mb-2 flex-row items-center border-2 border-stone-dark bg-dungeon-800 p-3">
            <Text style={{ fontSize: 22 }}>{iconoTipo(a.tipo)}</Text>
            <View className="ml-3 flex-1">
              <Text className="font-body text-sm text-parchment">{nombreTipo(a.tipo)}</Text>
              <Text className="font-body text-[11px] uppercase text-arcane">
                {a.nivel} · {new Date(a.fecha).toLocaleDateString('es-CL')}
              </Text>
            </View>
            <Text className="font-pixel text-[11px] text-gold">+{a.xp}</Text>
          </View>
        ))
      )}
    </Screen>
  );
}
