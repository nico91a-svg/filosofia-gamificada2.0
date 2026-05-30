import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../src/components/ui/Screen';
import { Button } from '../../src/components/ui/Button';
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
    { emoji: '🏺', label: 'Artefactos y cofres', onPress: () => router.push('/(estudiante)/artefactos') },
    { emoji: '📚', label: 'Vocabulario filosófico', onPress: () => setVocabUnidad(unidades[0]?.id ?? null) },
  ];

  return (
    <Screen>
      <Text className="mb-4 text-2xl font-extrabold text-white">⋯ Más</Text>

      {opciones.map((o) => (
        <Pressable
          key={o.label}
          onPress={o.onPress}
          className="mb-2 flex-row items-center rounded-2xl bg-white/5 p-4 active:opacity-80"
        >
          <Text style={{ fontSize: 24 }}>{o.emoji}</Text>
          <Text className="ml-3 flex-1 font-bold text-white">{o.label}</Text>
          <Text className="text-purple-300">›</Text>
        </Pressable>
      ))}

      <View className="mt-6">
        <Button label="Cerrar sesión" variant="ghost" onPress={salir} />
      </View>

      {/* Vocabulario */}
      <Modal visible={!!vocabUnidad} animationType="slide" onRequestClose={() => setVocabUnidad(null)}>
        <View className="flex-1 bg-[#1e1b4b] pt-14">
          <View className="flex-row items-center px-4 pb-3">
            <Text className="flex-1 text-xl font-extrabold text-white">📚 Vocabulario</Text>
            <Pressable onPress={() => setVocabUnidad(null)} hitSlop={16}>
              <Text className="text-2xl text-purple-200">✕</Text>
            </Pressable>
          </View>
          {/* selector de unidad */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="max-h-12 px-4">
            {unidades.map((u: any) => (
              <Pressable
                key={u.id}
                onPress={() => setVocabUnidad(u.id)}
                className={`mr-2 h-9 justify-center rounded-full px-4 ${vocabUnidad === u.id ? 'bg-amber-400' : 'bg-white/10'}`}
              >
                <Text className={vocabUnidad === u.id ? 'font-bold text-amber-950' : 'text-purple-200'}>
                  {u.emoji} {u.id}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <ScrollView className="flex-1 px-4 pt-3" contentContainerClassName="pb-10">
            {(unidad?.vocabulario ?? []).map((v: any, i: number) => {
              const found = descubierto.includes(v.termino);
              return (
                <View key={i} className="mb-2 rounded-2xl bg-white/5 p-4">
                  <Text className="font-bold text-amber-300">
                    {found ? '🔓' : '🔒'} {v.termino}
                  </Text>
                  <Text className="mt-1 text-sm text-purple-200">
                    {found ? v.definicion : 'Término por descubrir en clase.'}
                  </Text>
                </View>
              );
            })}
            {(unidad?.vocabulario ?? []).length === 0 && (
              <Text className="text-purple-300">Sin vocabulario en esta unidad.</Text>
            )}
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  );
}
