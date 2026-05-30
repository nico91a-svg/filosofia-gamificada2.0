import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../src/store/useGameStore';
import { Button } from '../src/components/ui/Button';

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
      if (loginGM(password)) {
        router.replace('/(gm)');
      } else {
        fallo('Clave de Game Master incorrecta');
      }
    } else {
      if (loginEstudiante(usuario, password)) {
        router.replace('/(estudiante)/perfil');
      } else {
        fallo('Usuario o contraseña incorrectos');
      }
    }
  };

  const fallo = (msg: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setError(msg);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1e1b4b]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-center px-6"
      >
        <View className="items-center">
          <Text style={{ fontSize: 64 }}>🎓</Text>
          <Text className="mt-2 text-2xl font-extrabold text-white">Filósofo en Formación</Text>
          <Text className="text-sm text-purple-300">Sistema gamificado de Filosofía</Text>
        </View>

        {/* Selector de modo */}
        <View className="mt-8 flex-row rounded-2xl bg-white/10 p-1">
          {(['estudiante', 'gm'] as Modo[]).map((m) => (
            <Pressable
              key={m}
              onPress={() => { setModo(m); setError(''); }}
              className={`flex-1 items-center rounded-xl py-3 ${modo === m ? 'bg-amber-400' : ''}`}
            >
              <Text className={`font-bold ${modo === m ? 'text-amber-950' : 'text-purple-200'}`}>
                {m === 'estudiante' ? '👤 Estudiante' : '🛡️ Game Master'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="mt-6 gap-3">
          {modo === 'estudiante' && (
            <TextInput
              placeholder="Tu nombre de usuario"
              placeholderTextColor="#a78bfa"
              autoCapitalize="none"
              value={usuario}
              onChangeText={setUsuario}
              className="rounded-2xl bg-white/10 px-4 py-4 text-white"
            />
          )}
          <TextInput
            placeholder="Contraseña"
            placeholderTextColor="#a78bfa"
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={entrar}
            className="rounded-2xl bg-white/10 px-4 py-4 text-white"
          />
          {error ? <Text className="text-center text-rose-400">{error}</Text> : null}
          <Button label="Entrar" onPress={entrar} />
        </View>

        {modo === 'gm' && (
          <Text className="mt-4 text-center text-xs text-purple-400">
            Solo el docente a cargo (GM) administra estudiantes y XP.
          </Text>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
