import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../src/components/ui/Screen';
import { Button } from '../../src/components/ui/Button';
import { PixelPanel } from '../../src/components/pixel/PixelPanel';
import { useGameStore } from '../../src/store/useGameStore';

export default function Mas() {
  const student = useGameStore((s) => s.currentStudent());
  const unidades = useGameStore((s) => s.unidades);
  const logout = useGameStore((s) => s.logout);
  const [vocabUnidad, setVocabUnidad] = useState<string | null>(null);

  const descubierto = student?.vocabularioDescubierto ?? [];
  const unidad = unidades.find((u: any) => u.id === vocabUnidad);

  const salir = () => {
    logout();
    router.replace('/login');
  };

  const opciones = [
    { emoji: '🏺', label: 'ARTEFACTOS Y COFRES', onPress: () => router.push('/(estudiante)/artefactos') },
    { emoji: '📜', label: 'GRIMORIO (VOCABULARIO)', onPress: () => setVocabUnidad(unidades[0]?.id ?? null) },
  ];

  return (
    <Screen title="◆ MOCHILA">
      {opciones.map((o) => (
        <Pressable key={o.label} onPress={o.onPress} className="mb-2 active:opacity-80">
          <PixelPanel tone="stone">
            <View className="flex-row items-center">
              <Text style={{ fontSize: 22 }}>{o.emoji}</Text>
              <Text className="ml-3 flex-1 font-body text-sm text-parchment">{o.label}</Text>
              <Text className="font-pixel text-gold">›</Text>
            </View>
          </PixelPanel>
        </Pressable>
      ))}

      <View className="mt-6">
        <Button label="Cerrar sesión" variant="ghost" onPress={salir} />
      </View>

      {/* Grimorio de vocabulario */}
      <Modal visible={!!vocabUnidad} animationType="slide" onRequestClose={() => setVocabUnidad(null)}>
        <View className="flex-1 bg-dungeon-950 pt-14">
          <View className="flex-row items-center border-b-2 border-stone-dark px-4 pb-3">
            <Text className="flex-1 font-pixel text-base text-gold">📜 GRIMORIO</Text>
            <Pressable onPress={() => setVocabUnidad(null)} hitSlop={16}>
              <Text className="font-pixel text-lg text-parchment">✕</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="max-h-14 px-4 py-2">
            {unidades.map((u: any) => (
              <Pressable
                key={u.id}
                onPress={() => setVocabUnidad(u.id)}
                className={`mr-2 h-9 justify-center border-2 px-3 ${vocabUnidad === u.id ? 'border-gold bg-gold' : 'border-stone-dark bg-dungeon-800'}`}
              >
                <Text className={`font-body text-xs ${vocabUnidad === u.id ? 'text-[#3a2a06]' : 'text-arcane'}`}>
                  {u.emoji} {u.id}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <ScrollView className="flex-1 px-4 pt-2" contentContainerClassName="pb-10">
            {(unidad?.vocabulario ?? []).map((v: any, i: number) => {
              const found = descubierto.includes(v.termino);
              return (
                <View key={i} className="mb-2 border-2 border-stone-dark bg-dungeon-800 p-3">
                  <Text className="font-body text-sm text-gold-light">
                    {found ? '🔓' : '🔒'} {v.termino}
                  </Text>
                  <Text className="mt-1 font-body text-xs text-parchment">
                    {found ? v.definicion : 'Término por descubrir en clase.'}
                  </Text>
                </View>
              );
            })}
            {(unidad?.vocabulario ?? []).length === 0 && (
              <Text className="font-body text-sm text-stone-light">Sin vocabulario en esta unidad.</Text>
            )}
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  );
}
