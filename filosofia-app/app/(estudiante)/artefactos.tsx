import React, { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { Screen } from '../../src/components/ui/Screen';
import { ChestOpening } from '../../src/components/game/ChestOpening';
import { useGameStore } from '../../src/store/useGameStore';
import { ARTEFACTOS, COFRES, getRarezaColor, RAREZA_LABEL } from '../../src/domain';
import type { Artefacto, TipoCofre } from '../../src/domain/types';

interface ItemView {
  idx: number;
  esCofre: boolean;
  tipoCofre?: TipoCofre;
  artefacto?: Artefacto;
  emoji: string;
  nombre: string;
}

export default function Artefactos() {
  const student = useGameStore((s) => s.currentStudent());
  const abrirCofreEstudiante = useGameStore((s) => s.abrirCofreEstudiante);

  const [abriendo, setAbriendo] = useState<{ tipo: TipoCofre; premio: Artefacto } | null>(null);

  if (!student) return null;

  const items: ItemView[] = (student.artefactos ?? []).map((a, idx) => {
    const id = typeof a === 'string' ? a : a.id;
    if (id.startsWith('cofre_')) {
      const tipo = id.replace('cofre_', '') as TipoCofre;
      const def = COFRES[tipo];
      return { idx, esCofre: true, tipoCofre: tipo, emoji: def?.emoji ?? '🎁', nombre: def?.nombre ?? 'Cofre' };
    }
    const def = ARTEFACTOS.find((x) => x.id === id);
    return {
      idx,
      esCofre: false,
      artefacto: def,
      emoji: def?.emoji ?? '🏺',
      nombre: def?.nombre ?? 'Artefacto',
    };
  });

  const cofres = items.filter((i) => i.esCofre);
  const artefactos = items.filter((i) => !i.esCofre);

  const onAbrir = (item: ItemView) => {
    // Decide el premio AHORA (persiste/idempotente) y luego anima.
    const premio = abrirCofreEstudiante(student.id, item.idx);
    if (premio && item.tipoCofre) setAbriendo({ tipo: item.tipoCofre, premio });
  };

  return (
    <Screen>
      <Text className="mb-1 text-2xl font-extrabold text-white">Mi inventario</Text>
      <Text className="mb-4 text-sm text-purple-300">
        {artefactos.length} artefacto{artefactos.length !== 1 ? 's' : ''} · {cofres.length} cofre
        {cofres.length !== 1 ? 's' : ''}
      </Text>

      {cofres.length > 0 && (
        <View className="mb-5">
          <Text className="mb-2 font-bold text-amber-300">🎁 Cofres sin abrir ({cofres.length})</Text>
          {cofres.map((c) => (
            <View
              key={c.idx}
              className="mb-2 flex-row items-center rounded-2xl bg-amber-400/10 p-3"
            >
              <Text style={{ fontSize: 36 }}>{c.emoji}</Text>
              <Text className="ml-3 flex-1 font-bold text-white">{c.nombre}</Text>
              <Pressable
                onPress={() => onAbrir(c)}
                className="rounded-xl bg-amber-400 px-4 py-2 active:opacity-80"
              >
                <Text className="font-bold text-amber-950">🔓 Abrir</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <Text className="mb-2 font-bold text-white">Artefactos</Text>
      {artefactos.length === 0 ? (
        <Text className="text-purple-300">Aún no tienes artefactos. ¡Abre cofres para conseguirlos!</Text>
      ) : (
        <View className="flex-row flex-wrap gap-2">
          {artefactos.map((a) => (
            <View
              key={a.idx}
              className={`w-[31%] items-center rounded-2xl border-2 bg-white/5 p-3 ${a.artefacto ? getRarezaColor(a.artefacto.rareza) : 'border-gray-500'}`}
            >
              <Text style={{ fontSize: 30 }}>{a.emoji}</Text>
              <Text className="mt-1 text-center text-xs font-bold text-white">{a.nombre}</Text>
              {a.artefacto && (
                <Text className="text-[9px] uppercase text-purple-300">
                  {RAREZA_LABEL[a.artefacto.rareza]}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Modal de apertura de cofre */}
      <Modal visible={!!abriendo} transparent animationType="fade">
        <View className="flex-1 bg-black/85">
          {abriendo && (
            <ChestOpening
              tipoCofre={abriendo.tipo}
              premioDecidido={abriendo.premio}
              onClaim={() => setAbriendo(null)}
            />
          )}
        </View>
      </Modal>
    </Screen>
  );
}
