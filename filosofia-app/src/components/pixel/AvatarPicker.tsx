// Selector de avatar: cuadrícula con los 4 personajes pixel.
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { PixelSprite } from './PixelSprite';
import { AVATARS, getAvatarSprite } from './avatars';

interface Props {
  value?: string;
  onSelect: (id: string) => void;
  size?: number;
}

export function AvatarPicker({ value, onSelect, size = 72 }: Props) {
  return (
    <View className="flex-row flex-wrap justify-center gap-3">
      {AVATARS.map((av) => {
        const sel = value === av.id;
        return (
          <Pressable key={av.id} onPress={() => onSelect(av.id)} className="active:opacity-80">
            <View
              className={`items-center border-2 bg-dungeon-950 p-1 ${sel ? 'border-gold' : 'border-stone-dark'}`}
            >
              <PixelSprite sprite={getAvatarSprite(av.id)} size={size} />
              <Text className={`font-body text-[10px] ${sel ? 'text-gold' : 'text-arcane'}`}>
                {av.nombre.toUpperCase()}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
