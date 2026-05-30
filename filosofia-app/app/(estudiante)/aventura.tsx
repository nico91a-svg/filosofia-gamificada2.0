import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Screen } from '../../src/components/ui/Screen';
import { useGameStore } from '../../src/store/useGameStore';

export default function Aventura() {
  const unidades = useGameStore((s) => s.unidades);
  const position = useGameStore((s) => s.position);
  const [abierta, setAbierta] = useState<string | null>(position.unidad);

  return (
    <Screen>
      <Text className="mb-1 text-2xl font-extrabold text-white">🗺️ Tu aventura</Text>
      <Text className="mb-4 text-sm text-purple-300">
        Unidad actual: {position.unidad} · Clase {position.clase}
      </Text>

      {unidades.map((u: any) => {
        const expandida = abierta === u.id;
        return (
          <View key={u.id} className="mb-3 overflow-hidden rounded-2xl bg-white/5">
            <Pressable
              onPress={() => setAbierta(expandida ? null : u.id)}
              className="flex-row items-center p-4 active:opacity-80"
            >
              <Text style={{ fontSize: 28 }}>{u.emoji}</Text>
              <View className="ml-3 flex-1">
                <Text className="font-bold text-white">{u.nombre}</Text>
                <Text className="text-xs text-purple-300">
                  {u.periodo} · {u.totalClases} clases
                </Text>
              </View>
              <Text className="text-purple-300">{expandida ? '▾' : '▸'}</Text>
            </Pressable>

            {expandida && (
              <View className="px-4 pb-4">
                {(u.clases ?? []).map((c: any) => {
                  const esActual = u.id === position.unidad && c.num === position.clase;
                  const completada =
                    u.id === position.unidad
                      ? c.num < position.clase
                      : unidades.findIndex((x: any) => x.id === u.id) <
                        unidades.findIndex((x: any) => x.id === position.unidad);
                  return (
                    <View
                      key={c.num}
                      className={`mb-2 flex-row items-center rounded-xl p-3 ${esActual ? 'bg-amber-400/20' : 'bg-white/5'}`}
                    >
                      <Text style={{ fontSize: 20 }}>
                        {completada ? '✅' : esActual ? '📍' : c.emoji ?? '○'}
                      </Text>
                      <View className="ml-2 flex-1">
                        <Text className="text-sm font-bold text-white">
                          Clase {c.num}: {c.titulo}
                        </Text>
                        <Text className="text-[11px] text-purple-300" numberOfLines={2}>
                          {c.descripcion}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </Screen>
  );
}
