import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useGameStore } from '../src/store/useGameStore';

export default function Index() {
  const loading = useGameStore((s) => s.loading);
  const sesion = useGameStore((s) => s.sesion);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#1e1b4b]">
        <Text style={{ fontSize: 56 }}>🎓</Text>
        <ActivityIndicator color="#fbbf24" className="mt-4" />
        <Text className="mt-3 text-purple-200">Cargando el sistema…</Text>
      </View>
    );
  }

  if (!sesion) return <Redirect href="/login" />;
  if (sesion.tipo === 'gm') return <Redirect href="/(gm)" />;
  return <Redirect href="/(estudiante)/perfil" />;
}
