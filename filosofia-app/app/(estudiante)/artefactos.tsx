import React, { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { Screen } from '../../src/components/ui/Screen';
import { PixelPanel } from '../../src/components/pixel/PixelPanel';
import { PixelSprite } from '../../src/components/pixel/PixelSprite';
import { chestSprite, GEM_SPRITE, gemColor } from '../../src/components/pixel/sprites';
import { ChestOpening } from '../../src/components/game/ChestOpening';
import { useGameStore } from '../../src/store/useGameStore';
import { ARTEFACTOS, COFRES } from '../../src/domain';
import { RAREZA_PIXEL } from '../../src/theme/pixel';
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
      return { idx, esCofre: true, tipoCofre: tipo, emoji: '🎁', nombre: def?.nombre ?? 'Cofre' };
    }
    const def = ARTEFACTOS.find((x) => x.id === id);
    return { idx, esCofre: false, artefacto: def, emoji: def?.emoji ?? '🏺', nombre: def?.nombre ?? 'Artefacto' };
  });

  const cofres = items.filter((i) => i.esCofre);
  const artefactos = items.filter((i) => !i.esCofre);

  const onAbrir = (item: ItemView) => {
    const premio = abrirCofreEstudiante(student.id, item.idx);
    if (premio && item.tipoCofre) setAbriendo({ tipo: item.tipoCofre, premio });
  };

  return (
    <Screen title="◆ BOTÍN">
      <Text className="mb-3 font-body text-xs text-arcane">
        {artefactos.length} ARTEFACTOS · {cofres.length} COFRES
      </Text>

      {cofres.length > 0 && (
        <View className="mb-5">
          <Text className="mb-2 font-pixel text-xs text-gold">COFRES SIN ABRIR</Text>
          {cofres.map((c) => (
            <View key={c.idx} className="mb-2">
              <PixelPanel tone="gold">
                <View className="flex-row items-center">
                  <PixelSprite sprite={chestSprite(c.tipoCofre!)} size={48} />
                  <Text className="ml-3 flex-1 font-body text-sm text-gold-light">
                    {c.nombre.toUpperCase()}
                  </Text>
                  <Pressable
                    onPress={() => onAbrir(c)}
                    className="border-2 border-stone-dark bg-gold active:opacity-80"
                  >
                    <Text className="px-3 py-2 font-body text-xs text-[#3a2a06]">🔓 ABRIR</Text>
                  </Pressable>
                </View>
              </PixelPanel>
            </View>
          ))}
        </View>
      )}

      <Text className="mb-2 font-pixel text-xs text-gold">ARTEFACTOS</Text>
      {artefactos.length === 0 ? (
        <Text className="font-body text-sm text-stone-light">
          Aún no tienes artefactos. ¡Abre cofres para conseguirlos!
        </Text>
      ) : (
        <View className="flex-row flex-wrap gap-2">
          {artefactos.map((a) => {
            const rar = a.artefacto ? RAREZA_PIXEL[a.artefacto.rareza] : null;
            return (
              <View
                key={a.idx}
                className="w-[31%] items-center border-2 bg-dungeon-800 p-2"
                style={{ borderColor: rar?.color ?? '#4a3f7a' }}
              >
                {a.artefacto ? (
                  <PixelSprite sprite={GEM_SPRITE} size={44} tint={gemColor(a.artefacto.rareza)} tintKey="c" />
                ) : (
                  <Text style={{ fontSize: 28 }}>{a.emoji}</Text>
                )}
                <Text className="mt-1 text-center font-body text-[10px] text-parchment" numberOfLines={2}>
                  {a.nombre}
                </Text>
                {rar && (
                  <Text className="font-body text-[8px]" style={{ color: rar.color, letterSpacing: 1 }}>
                    {rar.label}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      )}

      <Modal visible={!!abriendo} transparent animationType="fade">
        <View className="flex-1 bg-dungeon-950/95">
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
