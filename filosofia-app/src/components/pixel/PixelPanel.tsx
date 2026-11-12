// Panel enmarcado estilo mazmorra: marco de piedra biselado + sombra dura.
import React from 'react';
import { View } from 'react-native';

interface Props {
  children: React.ReactNode;
  tone?: 'stone' | 'gold' | 'arcane';
  className?: string;
  rivets?: boolean; // remaches dorados en las esquinas
}

const FRAME: Record<NonNullable<Props['tone']>, string> = {
  stone: 'bg-dungeon-700',
  gold: 'bg-dungeon-800',
  arcane: 'bg-dungeon-800',
};

export function PixelPanel({ children, tone = 'stone', className = '', rivets = false }: Props) {
  return (
    <View className={`relative ${className}`}>
      {/* sombra dura (sin blur) */}
      <View className="absolute inset-0 translate-x-1 translate-y-1 bg-dungeon-950" />
      {/* marco exterior */}
      <View className="border-[3px] border-stone-dark">
        {/* bisel: luz arriba/izq, sombra abajo/der */}
        <View
          className={`border-2 border-t-stone-light border-l-stone-light border-b-stone-dark border-r-stone-dark p-3 ${FRAME[tone]}`}
        >
          {children}
        </View>
      </View>
      {rivets && (
        <>
          <View className="absolute left-1 top-1 h-1.5 w-1.5 bg-gold" />
          <View className="absolute right-1 top-1 h-1.5 w-1.5 bg-gold" />
          <View className="absolute bottom-1 left-1 h-1.5 w-1.5 bg-gold" />
          <View className="absolute bottom-1 right-1 h-1.5 w-1.5 bg-gold" />
        </>
      )}
    </View>
  );
}
