import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useGameStore } from '../src/store/useGameStore';

export default function Index() {
  const loading = useGameStore((s) => s.loading);
  const sesion = useGameStore((s) => s.sesion);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-dungeon-950">
        <Text style={{ fontSize: 56 }}>🏛️</Text>
        <ActivityIndicator color="#f2c33d" className="mt-4" />
        <Text className="mt-3 font-body text-sm text-arcane">Cargando la mazmorra…</Text>
      </View>
    );
  }

  if (!sesion) return <Redirect href="/login" />;
  if (sesion.tipo === 'gm') return <Redirect href="/(gm)" />;
  return <Redirect href="/(estudiante)/perfil" />;
}
