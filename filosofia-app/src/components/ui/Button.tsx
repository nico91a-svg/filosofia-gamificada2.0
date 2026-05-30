import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
}

const styles = {
  primary: 'bg-amber-400',
  ghost: 'bg-white/10',
  danger: 'bg-rose-500',
} as const;

const textStyles = {
  primary: 'text-amber-950',
  ghost: 'text-white',
  danger: 'text-white',
} as const;

export function Button({ label, onPress, variant = 'primary', loading, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`min-h-[48px] items-center justify-center rounded-2xl px-6 py-3 active:opacity-80 ${styles[variant]} ${disabled ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color="#000" />
      ) : (
        <Text className={`text-base font-bold ${textStyles[variant]}`}>{label}</Text>
      )}
    </Pressable>
  );
}
