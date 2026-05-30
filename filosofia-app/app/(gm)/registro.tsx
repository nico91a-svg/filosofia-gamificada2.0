import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Screen } from '../../src/components/ui/Screen';
import { Button } from '../../src/components/ui/Button';
import { PixelPanel } from '../../src/components/pixel/PixelPanel';
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
    if (res.subioNivel) msg += ` ¡Subió a NV ${res.nivelNuevo}! 🎉`;
    if (res.cofreOtorgado) msg += ` Ganó ${COFRES[res.cofreOtorgado].nombre} ${COFRES[res.cofreOtorgado].emoji}`;
    if (res.badgesNuevos.length) msg += ` Nueva insignia 🏅`;
    setResultado(msg);
    setTipo(null);
  };

  return (
    <Screen title="⚡ REGISTRAR HAZAÑA">
      {resultado && (
        <View className="mb-4 border-2 border-emerald bg-dungeon-800 p-3">
          <Text className="font-body text-sm text-emerald">{resultado}</Text>
        </View>
      )}

      <Text className="mb-2 font-pixel text-xs text-gold">1 · HÉROE</Text>
      {students.length === 0 ? (
        <Text className="mb-4 font-body text-sm text-stone-light">Primero inscribe héroes en la pestaña 👥.</Text>
      ) : (
        <View className="mb-4 flex-row flex-wrap gap-2">
          {students.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => setStudentId(s.id)}
              className={`border-2 px-3 py-2 ${studentId === s.id ? 'border-gold bg-gold' : 'border-stone-dark bg-dungeon-800'}`}
            >
              <Text className={`font-body text-xs ${studentId === s.id ? 'text-[#3a2a06]' : 'text-arcane'}`}>
                {s.nombreSocial}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <Text className="mb-2 font-pixel text-xs text-gold">2 · TIPO</Text>
      {CATEGORIAS_ACTIVIDAD.map((cat: any) => (
        <View key={cat.id} className="mb-3">
          <Text className="mb-1 font-body text-[11px] uppercase text-arcane">
            {cat.emoji} {cat.nombre}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {TIPOS_ACTIVIDAD.filter((t) => t.categoria === cat.id).map((t) => (
              <Pressable
                key={t.id}
                onPress={() => setTipo(t.id)}
                className={`border-2 px-2 py-2 ${tipo === t.id ? 'border-gold bg-gold' : 'border-stone-dark bg-dungeon-800'}`}
              >
                <Text className={`font-body text-[11px] ${tipo === t.id ? 'text-[#3a2a06]' : 'text-parchment'}`}>
                  {t.icon} {t.nombre}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      <Text className="mb-2 mt-2 font-pixel text-xs text-gold">3 · DESEMPEÑO</Text>
      <View className="mb-4 flex-row gap-2">
        {NIVELES_DESEMPENO.map((n) => (
          <Pressable
            key={n.id}
            onPress={() => setNivel(n.id)}
            className="flex-1 items-center border-2 border-stone-dark py-3"
            style={nivel === n.id ? { backgroundColor: n.color } : { backgroundColor: '#221a45' }}
          >
            <Text className={`font-body text-[10px] ${nivel === n.id ? 'text-black' : 'text-arcane'}`}>
              {n.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {tipo && (
        <View className="mb-3">
          <PixelPanel tone="gold">
            <Text className="text-center font-body text-sm text-gold-light">
              OTORGARÁ <Text className="font-pixel text-xs text-gold">+{xpPreview} XP</Text>
            </Text>
          </PixelPanel>
        </View>
      )}

      <Button label="Registrar" onPress={confirmar} disabled={!studentId || !tipo} />
    </Screen>
  );
}
