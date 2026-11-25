// Avatar del héroe con marco según nivel + corona en niveles altos.
import React from 'react';
import { View } from 'react-native';
import { PixelSprite } from './PixelSprite';
import { getAvatarSprite } from './avatars';
import { CROWN_SPRITE } from './sprites';

// Color del marco por tramo de nivel (bronce → plata → oro → arcano)
function frameColor(nivel: number): string {
  if (nivel >= 9) return '#f2c33d'; // oro
  if (nivel >= 7) return '#c08fff'; // arcano
  if (nivel >= 5) return '#b8c0cc'; // plata
  if (nivel >= 3) return '#cd7f32'; // bronce
  return '#4a3f7a'; // piedra
}

interface Props {
  avatarId?: string;
  nivel: number;
  size?: number;
}

export function HeroAvatar({ avatarId, nivel, size = 64 }: Props) {
  const showCrown = nivel >= 9;
  const aura = nivel >= 7;

  return (
    <View className="relative" style={{ width: size + 8, height: size + 8 }}>
      <View
        className="bg-dungeon-950"
        style={{ borderWidth: aura ? 3 : 2, borderColor: frameColor(nivel), padding: 1 }}
      >
        <PixelSprite sprite={getAvatarSprite(avatarId)} size={size} />
      </View>
      {showCrown && (
        <View className="absolute left-0 right-0 items-center" style={{ top: -size * 0.16 }}>
          <PixelSprite sprite={CROWN_SPRITE} size={size * 0.5} />
        </View>
      )}
    </View>
  );
}
