import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Screen } from '../../src/components/ui/Screen';
import { Button } from '../../src/components/ui/Button';
import { useGameStore } from '../../src/store/useGameStore';
import {
  TIPOS_ACTIVIDAD, CATEGORIAS_ACTIVIDAD, COFRES, NIVELES_DESEMPENO, RUBRICS_XP,
} from '../../src/domain';
import type { NivelDesempeno } from '../../src/domain/types';

export default function Registro() {
  const students = useGameStore((s) => s.students);
  const registrar = useGameStore((s) => s.registrar);

  const [studentId, setStudentId] = useState<string | null>(null);
  const [tipo, setTipo] = useState<string | null>(null);
  const [nivel, setNivel] = useState<NivelDesempeno>('competente');
  const [resultado, setResultado] = useState<string | null>(null);

  const xpPreview = tipo ? RUBRICS_XP[tipo]?.[nivel] ?? 0 : 0;

  const confirmar = () => {
    if (!studentId || !tipo) return;
    const res = registrar({ studentId, tipo, nivel });
    if (!res) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    let msg = `+${res.xpGanado} XP a ${res.estudiante.nombreSocial}.`;
    if (res.subioNivel) msg += ` ¡Subió a nivel ${res.nivelNuevo}! 🎉`;
    if (res.cofreOtorgado) msg += ` Ganó un ${COFRES[res.cofreOtorgado].nombre} ${COFRES[res.cofreOtorgado].emoji}`;
    if (res.badgesNuevos.length) msg += ` Nueva insignia 🏅`;
    setResultado(msg);
    setTipo(null);
  };

  return (
    <Screen>
      <Text className="mb-4 text-2xl font-extrabold text-white">⚡ Registrar actividad</Text>

      {resultado && (
        <View className="mb-4 rounded-2xl bg-emerald-500/20 p-4">
          <Text className="text-emerald-200">{resultado}</Text>
        </View>
      )}

      {/* 1. Estudiante */}
      <Text className="mb-2 font-bold text-white">1 · Estudiante</Text>
      {students.length === 0 ? (
        <Text className="mb-4 text-purple-300">Primero inscribe estudiantes en la pestaña 👥.</Text>
      ) : (
        <View className="mb-4 flex-row flex-wrap gap-2">
          {students.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => setStudentId(s.id)}
              className={`rounded-full px-3 py-2 ${studentId === s.id ? 'bg-amber-400' : 'bg-white/10'}`}
            >
              <Text className={studentId === s.id ? 'font-bold text-amber-950' : 'text-purple-200'}>
                {s.nombreSocial}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* 2. Tipo de actividad agrupado por categoría */}
      <Text className="mb-2 font-bold text-white">2 · Tipo de actividad</Text>
      {CATEGORIAS_ACTIVIDAD.map((cat: any) => (
        <View key={cat.id} className="mb-3">
          <Text className="mb-1 text-xs uppercase text-purple-400">
            {cat.emoji} {cat.nombre}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {TIPOS_ACTIVIDAD.filter((t) => t.categoria === cat.id).map((t) => (
              <Pressable
                key={t.id}
                onPress={() => setTipo(t.id)}
                className={`rounded-xl px-3 py-2 ${tipo === t.id ? 'bg-amber-400' : 'bg-white/10'}`}
              >
                <Text className={tipo === t.id ? 'font-bold text-amber-950' : 'text-purple-200'}>
                  {t.icon} {t.nombre}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      {/* 3. Nivel de desempeño */}
      <Text className="mb-2 mt-2 font-bold text-white">3 · Nivel de desempeño</Text>
      <View className="mb-4 flex-row gap-2">
        {NIVELES_DESEMPENO.map((n) => (
          <Pressable
            key={n.id}
            onPress={() => setNivel(n.id)}
            className={`flex-1 items-center rounded-xl py-3 ${nivel === n.id ? '' : 'bg-white/10'}`}
            style={nivel === n.id ? { backgroundColor: n.color } : undefined}
          >
            <Text className={`text-xs font-bold ${nivel === n.id ? 'text-black' : 'text-purple-200'}`}>
              {n.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {tipo && (
        <Text className="mb-3 text-center text-purple-200">
          Otorgará <Text className="font-extrabold text-amber-300">+{xpPreview} XP</Text>
        </Text>
      )}

      <Button label="Registrar" onPress={confirmar} disabled={!studentId || !tipo} />
    </Screen>
  );
}
