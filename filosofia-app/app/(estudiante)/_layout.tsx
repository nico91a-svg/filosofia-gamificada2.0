import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useGameStore } from '../../src/store/useGameStore';

function contarCofres(artefactos: (string | { id: string })[] = []) {
  return artefactos.filter((a) => {
    const id = typeof a === 'string' ? a : a?.id;
    return id?.startsWith('cofre_');
  }).length;
}

export default function EstudianteLayout() {
  const student = useGameStore((s) => s.currentStudent());
  const cofres = contarCofres(student?.artefactos ?? []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#221a45',
          borderTopWidth: 3,
          borderTopColor: '#1c1538',
          height: 66,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#f2c33d',
        tabBarInactiveTintColor: '#6b5fa3',
        tabBarLabelStyle: { fontFamily: 'Silkscreen_400Regular', fontSize: 9 },
      }}
    >
      <Tabs.Screen
        name="perfil"
        options={{ title: 'Perfil', tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text> }}
      />
      <Tabs.Screen
        name="aventura"
        options={{ title: 'Aventura', tabBarIcon: () => <Text style={{ fontSize: 20 }}>🗺️</Text> }}
      />
      <Tabs.Screen
        name="actividades"
        options={{ title: 'Actividades', tabBarIcon: () => <Text style={{ fontSize: 20 }}>⚡</Text> }}
      />
      <Tabs.Screen
        name="ranking"
        options={{ title: 'Ranking', tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏆</Text> }}
      />
      <Tabs.Screen
        name="mas"
        options={{
          title: 'Más',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>{cofres > 0 ? '🎁' : '⋯'}</Text>,
          tabBarBadge: cofres > 0 ? cofres : undefined,
        }}
      />
      {/* Ruta accesible pero fuera de la barra */}
      <Tabs.Screen name="artefactos" options={{ href: null }} />
    </Tabs>
  );
}
