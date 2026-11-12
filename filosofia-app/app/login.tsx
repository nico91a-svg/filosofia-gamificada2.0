import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../src/store/useGameStore';
import { Button } from '../src/components/ui/Button';
import { PixelPanel } from '../src/components/pixel/PixelPanel';
import { PixelSprite } from '../src/components/pixel/PixelSprite';
import { chestSprite } from '../src/components/pixel/sprites';

type Modo = 'estudiante' | 'gm';

export default function Login() {
  const [modo, setModo] = useState<Modo>('estudiante');
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loginGM = useGameStore((s) => s.loginGM);
  const loginEstudiante = useGameStore((s) => s.loginEstudiante);

  const entrar = () => {
    setError('');
    if (modo === 'gm') {
      if (loginGM(password)) router.replace('/(gm)');
      else fallo('CLAVE DE GAME MASTER INCORRECTA');
    } else {
      if (loginEstudiante(usuario, password)) router.replace('/(estudiante)/perfil');
      else fallo('USUARIO O CONTRASEÑA INCORRECTOS');
    }
  };

  const fallo = (msg: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setError(msg);
  };

  return (
    <SafeAreaView className="flex-1 bg-dungeon-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-center px-6"
      >
        <View className="mb-6 items-center">
          <PixelSprite sprite={chestSprite('oro')} size={104} />
          <Text className="mt-4 text-center font-pixel text-lg text-gold" style={{ lineHeight: 26 }}>
            EL LICEO DE{'\n'}LOS FILÓSOFOS
          </Text>
          <Text className="mt-2 font-body text-sm text-arcane">Aventura gamificada de Filosofía</Text>
        </View>

        <PixelPanel tone="stone" rivets>
          {/* Selector de modo */}
          <View className="flex-row border-2 border-stone-dark">
            {(['estudiante', 'gm'] as Modo[]).map((m) => (
              <Pressable
                key={m}
                onPress={() => { setModo(m); setError(''); }}
                className={`flex-1 items-center py-3 ${modo === m ? 'bg-gold' : 'bg-dungeon-800'}`}
              >
                <Text className={`font-body text-xs ${modo === m ? 'text-[#3a2a06]' : 'text-arcane'}`}>
                  {m === 'estudiante' ? '⚔ ESTUDIANTE' : '🛡 GAME MASTER'}
                </Text>
              </Pressable>
            ))}
          </View>

          <View className="mt-4 gap-3">
            {modo === 'estudiante' && (
              <TextInput
                placeholder="NOMBRE DE HÉROE"
                placeholderTextColor="#6b5fa3"
                autoCapitalize="none"
                value={usuario}
                onChangeText={setUsuario}
                className="border-2 border-stone-dark bg-dungeon-950 px-3 py-3 font-body text-parchment"
              />
            )}
            <TextInput
              placeholder="CONTRASEÑA"
              placeholderTextColor="#6b5fa3"
              secureTextEntry
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={entrar}
              className="border-2 border-stone-dark bg-dungeon-950 px-3 py-3 font-body text-parchment"
            />
            {error ? <Text className="text-center font-body text-xs text-ruby">{error}</Text> : null}
            <Button label="Entrar" onPress={entrar} />
          </View>
        </PixelPanel>

        {modo === 'gm' && (
          <Text className="mt-4 text-center font-body text-xs text-stone-light">
            Solo el docente (GM) administra héroes y misiones.
          </Text>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
