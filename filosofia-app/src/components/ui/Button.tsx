// Botón pixel-art con bisel 3D y "hundido" al presionar.
import React, { useState } from 'react';
import { Pressable, Text, ActivityIndicator, View } from 'react-native';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
}

const FACE = {
  primary: 'bg-gold',
  ghost: 'bg-dungeon-600',
  danger: 'bg-ruby',
} as const;

const BEVEL = {
  primary: { t: 'border-t-gold-light border-l-gold-light', b: 'border-b-gold-dark border-r-gold-dark' },
  ghost: { t: 'border-t-stone-light border-l-stone-light', b: 'border-b-stone-dark border-r-stone-dark' },
  danger: { t: 'border-t-[#f08a9c] border-l-[#f08a9c]', b: 'border-b-[#a83246] border-r-[#a83246]' },
} as const;

const TEXT = {
  primary: 'text-[#3a2a06]',
  ghost: 'text-parchment',
  danger: 'text-white',
} as const;

export function Button({ label, onPress, variant = 'primary', loading, disabled }: Props) {
  const [pressed, setPressed] = useState(false);
  const off = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={off}
      className={`relative ${off ? 'opacity-50' : ''}`}
    >
      {/* sombra dura inferior */}
      {!pressed && <View className="absolute inset-0 translate-y-1 bg-stone-dark" />}
      <View
        className={`min-h-[52px] items-center justify-center border-[3px] border-stone-dark ${pressed ? 'translate-y-1' : ''}`}
      >
        <View
          className={`w-full items-center justify-center border-2 px-6 py-3 ${FACE[variant]} ${BEVEL[variant].t} ${BEVEL[variant].b}`}
        >
          {loading ? (
            <ActivityIndicator color="#3a2a06" />
          ) : (
            <Text className={`font-body text-base ${TEXT[variant]}`}>{label.toUpperCase()}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}
