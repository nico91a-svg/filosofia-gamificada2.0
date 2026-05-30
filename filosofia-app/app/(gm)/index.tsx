import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../src/components/ui/Screen';
import { Button } from '../../src/components/ui/Button';
import { useGameStore } from '../../src/store/useGameStore';
import { HAS_FIREBASE } from '../../src/services/firebase';

export default function GMPanel() {
  const students = useGameStore((s) => s.students);
  const activities = useGameStore((s) => s.activities);
  const position = useGameStore((s) => s.position);
  const unidades = useGameStore((s) => s.unidades);
  const setPosition = useGameStore((s) => s.setPosition);
  const logout = useGameStore((s) => s.logout);

  const unidadActual = unidades.find((u: any) => u.id === position.unidad);
  const maxClase = unidadActual?.totalClases ?? 8;
  const totalXP = students.reduce((acc, s) => acc + (s.xp ?? 0), 0);

  const cambiarClase = (delta: number) => {
    const nueva = Math.min(Math.max(1, position.clase + delta), maxClase);
    setPosition({ ...position, clase: nueva });
  };
  const cambiarUnidad = (id: string) => setPosition({ unidad: id, clase: 1 });

  const salir = () => {
    logout();
    router.replace('/login');
  };

  return (
    <Screen>
      <View className="mb-4 flex-row items-center">
        <Text style={{ fontSize: 40 }}>🛡️</Text>
        <View className="ml-3 flex-1">
          <Text className="text-xl font-extrabold text-white">Panel del Game Master</Text>
          <Text className="text-xs text-purple-300">
            {HAS_FIREBASE ? '☁️ Sincronizado (Firebase)' : '📴 Modo local (este dispositivo)'}
          </Text>
        </View>
      </View>

      {/* Estadísticas */}
      <View className="flex-row gap-2">
        <Stat label="Estudiantes" value={students.length} />
        <Stat label="Actividades" value={activities.length} />
        <Stat label="XP total" value={totalXP} />
      </View>

      {/* Control de posición de clase */}
      <View className="mt-4 rounded-2xl bg-white/5 p-4">
        <Text className="mb-2 font-bold text-white">📍 Posición actual</Text>
        <View className="flex-row flex-wrap gap-2">
          {unidades.map((u: any) => (
            <Pressable
              key={u.id}
              onPress={() => cambiarUnidad(u.id)}
              className={`rounded-full px-3 py-2 ${position.unidad === u.id ? 'bg-amber-400' : 'bg-white/10'}`}
            >
              <Text className={position.unidad === u.id ? 'font-bold text-amber-950' : 'text-purple-200'}>
                {u.emoji} {u.id}
              </Text>
            </Pressable>
          ))}
        </View>
        <View className="mt-3 flex-row items-center justify-between rounded-xl bg-white/5 p-2">
          <Pressable onPress={() => cambiarClase(-1)} className="h-10 w-12 items-center justify-center rounded-lg bg-white/10">
            <Text className="text-xl text-white">−</Text>
          </Pressable>
          <Text className="font-bold text-white">Clase {position.clase} / {maxClase}</Text>
          <Pressable onPress={() => cambiarClase(1)} className="h-10 w-12 items-center justify-center rounded-lg bg-white/10">
            <Text className="text-xl text-white">+</Text>
          </Pressable>
        </View>
      </View>

      <View className="mt-4 gap-2">
        <Button label="⚡ Registrar actividad" onPress={() => router.push('/(gm)/registro')} />
        <Button label="👥 Gestionar estudiantes" variant="ghost" onPress={() => router.push('/(gm)/estudiantes')} />
        <Button label="Cerrar sesión" variant="ghost" onPress={salir} />
      </View>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-1 items-center rounded-2xl bg-white/5 p-3">
      <Text className="text-2xl font-extrabold text-amber-300">{value}</Text>
      <Text className="text-xs text-purple-300">{label}</Text>
    </View>
  );
}
