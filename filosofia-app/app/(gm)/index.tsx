import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../src/components/ui/Screen';
import { Button } from '../../src/components/ui/Button';
import { PixelPanel } from '../../src/components/pixel/PixelPanel';
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
    <Screen title="🛡 GAME MASTER">
      <Text className="mb-4 font-body text-xs text-arcane">
        {HAS_FIREBASE ? '☁ SINCRONIZADO (FIREBASE)' : '📴 MODO LOCAL (ESTE DISPOSITIVO)'}
      </Text>

      <View className="flex-row gap-2">
        <Stat label="HÉROES" value={students.length} />
        <Stat label="HAZAÑAS" value={activities.length} />
        <Stat label="XP TOTAL" value={totalXP} />
      </View>

      <View className="mt-4">
        <PixelPanel tone="stone" rivets>
          <Text className="mb-2 font-pixel text-xs text-gold">POSICIÓN DE CAMPAÑA</Text>
          <View className="flex-row flex-wrap gap-2">
            {unidades.map((u: any) => (
              <Pressable
                key={u.id}
                onPress={() => cambiarUnidad(u.id)}
                className={`border-2 px-3 py-2 ${position.unidad === u.id ? 'border-gold bg-gold' : 'border-stone-dark bg-dungeon-950'}`}
              >
                <Text className={`font-body text-xs ${position.unidad === u.id ? 'text-[#3a2a06]' : 'text-arcane'}`}>
                  {u.emoji} {u.id}
                </Text>
              </Pressable>
            ))}
          </View>
          <View className="mt-3 flex-row items-center justify-between border-2 border-stone-dark bg-dungeon-950 p-2">
            <Pressable onPress={() => cambiarClase(-1)} className="h-10 w-12 items-center justify-center bg-dungeon-700">
              <Text className="font-pixel text-base text-parchment">-</Text>
            </Pressable>
            <Text className="font-body text-sm text-parchment">CLASE {position.clase} / {maxClase}</Text>
            <Pressable onPress={() => cambiarClase(1)} className="h-10 w-12 items-center justify-center bg-dungeon-700">
              <Text className="font-pixel text-base text-parchment">+</Text>
            </Pressable>
          </View>
        </PixelPanel>
      </View>

      <View className="mt-4 gap-2">
        <Button label="Registrar hazaña" onPress={() => router.push('/(gm)/registro')} />
        <Button label="Gestionar héroes" variant="ghost" onPress={() => router.push('/(gm)/estudiantes')} />
        <Button label="Cerrar sesión" variant="ghost" onPress={salir} />
      </View>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-1 items-center border-2 border-stone-dark bg-dungeon-800 p-3">
      <Text className="font-pixel text-base text-gold">{value}</Text>
      <Text className="mt-1 font-body text-[10px] text-arcane">{label}</Text>
    </View>
  );
}
