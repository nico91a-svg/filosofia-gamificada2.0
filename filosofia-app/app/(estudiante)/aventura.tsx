import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Screen } from '../../src/components/ui/Screen';
import { PixelPanel } from '../../src/components/pixel/PixelPanel';
import { useGameStore } from '../../src/store/useGameStore';

export default function Aventura() {
  const unidades = useGameStore((s) => s.unidades);
  const position = useGameStore((s) => s.position);
  const [abierta, setAbierta] = useState<string | null>(position.unidad);

  return (
    <Screen title="◆ EL MAPA">
      <Text className="mb-4 font-body text-xs text-arcane">
        UNIDAD {position.unidad} · CLASE {position.clase}
      </Text>

      {unidades.map((u: any) => {
        const expandida = abierta === u.id;
        return (
          <View key={u.id} className="mb-3">
            <PixelPanel tone="stone">
              <Pressable
                onPress={() => setAbierta(expandida ? null : u.id)}
                className="flex-row items-center active:opacity-80"
              >
                <Text style={{ fontSize: 26 }}>{u.emoji}</Text>
                <View className="ml-3 flex-1">
                  <Text className="font-body text-sm text-parchment">{u.nombre}</Text>
                  <Text className="font-body text-[11px] text-arcane">
                    {u.periodo} · {u.totalClases} CLASES
                  </Text>
                </View>
                <Text className="font-pixel text-gold">{expandida ? '▾' : '▸'}</Text>
              </Pressable>

              {expandida && (
                <View className="mt-3">
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
                        className={`mb-2 flex-row items-center border-2 p-2 ${esActual ? 'border-gold bg-dungeon-700' : 'border-stone-dark bg-dungeon-950'}`}
                      >
                        <Text style={{ fontSize: 18 }}>
                          {completada ? '✅' : esActual ? '📍' : c.emoji ?? '🔒'}
                        </Text>
                        <View className="ml-2 flex-1">
                          <Text className="font-body text-xs text-parchment">
                            CLASE {c.num}: {c.titulo}
                          </Text>
                          <Text className="font-body text-[10px] text-stone-light" numberOfLines={2}>
                            {c.descripcion}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </PixelPanel>
          </View>
        );
      })}
    </Screen>
  );
}
