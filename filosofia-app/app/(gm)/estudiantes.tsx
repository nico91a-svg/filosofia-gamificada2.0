import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/ui/Button';
import { useGameStore } from '../../src/store/useGameStore';
import { getNivel } from '../../src/domain';
import type { Genero } from '../../src/domain/types';

const GENEROS: { id: Genero; label: string }[] = [
  { id: 'femenino', label: 'Femenino' },
  { id: 'masculino', label: 'Masculino' },
  { id: 'no-binario', label: 'No binario' },
];

export default function Estudiantes() {
  const students = useGameStore((s) => s.students);
  const crear = useGameStore((s) => s.crearEstudiante);
  const eliminar = useGameStore((s) => s.eliminarEstudiante);

  const [open, setOpen] = useState(false);
  const [nombreSocial, setNombreSocial] = useState('');
  const [nombreLegal, setNombreLegal] = useState('');
  const [genero, setGenero] = useState<Genero>('no-binario');
  const [password, setPassword] = useState('');

  const guardar = () => {
    if (!nombreSocial.trim() || !password.trim()) {
      Alert.alert('Faltan datos', 'Nombre y contraseña son obligatorios.');
      return;
    }
    crear({ nombreSocial: nombreSocial.trim(), nombreLegal: nombreLegal.trim(), genero, password: password.trim() });
    setNombreSocial(''); setNombreLegal(''); setPassword(''); setGenero('no-binario');
    setOpen(false);
  };

  const confirmarEliminar = (id: string, nombre: string) => {
    Alert.alert('Eliminar estudiante', `¿Eliminar a ${nombre}? Se perderá su progreso.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(id) },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1e1b4b]" edges={['top']}>
      <View className="flex-row items-center px-4 pt-2">
        <Text className="flex-1 text-2xl font-extrabold text-white">👥 Estudiantes</Text>
        <Text className="text-sm text-purple-300">{students.length}</Text>
      </View>

      <FlatList
        data={students}
        keyExtractor={(s) => s.id}
        contentContainerClassName="px-4 pt-3 pb-28"
        renderItem={({ item }) => {
          const nivel = getNivel(item.xp ?? 0);
          return (
            <View className="mb-2 flex-row items-center rounded-2xl bg-white/5 p-3">
              <View className="flex-1">
                <Text className="font-bold text-white">{item.nombreSocial}</Text>
                <Text className="text-xs text-purple-300">
                  Nivel {nivel.nivel} · {item.xp ?? 0} XP · clave: {item.password}
                </Text>
              </View>
              <Pressable
                onPress={() => confirmarEliminar(item.id, item.nombreSocial)}
                hitSlop={12}
                className="h-10 w-10 items-center justify-center rounded-lg bg-rose-500/20"
              >
                <Text className="text-rose-300">🗑️</Text>
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text className="mt-10 text-center text-purple-300">
            No hay estudiantes. Toca + para inscribir al primero.
          </Text>
        }
      />

      {/* FAB */}
      <Pressable
        onPress={() => setOpen(true)}
        className="absolute bottom-6 right-6 h-16 w-16 items-center justify-center rounded-full bg-amber-400 active:opacity-80"
      >
        <Text className="text-3xl text-amber-950">+</Text>
      </Pressable>

      {/* Formulario */}
      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View className="flex-1 justify-end bg-black/60">
          <View className="rounded-t-3xl bg-[#26224d] p-5 pb-10">
            <Text className="mb-4 text-xl font-extrabold text-white">Nuevo estudiante</Text>
            <View className="gap-3">
              <TextInput
                placeholder="Nombre de usuario (para login)"
                placeholderTextColor="#a78bfa"
                autoCapitalize="none"
                value={nombreSocial}
                onChangeText={setNombreSocial}
                className="rounded-2xl bg-white/10 px-4 py-4 text-white"
              />
              <TextInput
                placeholder="Nombre completo (opcional)"
                placeholderTextColor="#a78bfa"
                value={nombreLegal}
                onChangeText={setNombreLegal}
                className="rounded-2xl bg-white/10 px-4 py-4 text-white"
              />
              <View className="flex-row gap-2">
                {GENEROS.map((g) => (
                  <Pressable
                    key={g.id}
                    onPress={() => setGenero(g.id)}
                    className={`flex-1 items-center rounded-xl py-3 ${genero === g.id ? 'bg-amber-400' : 'bg-white/10'}`}
                  >
                    <Text className={genero === g.id ? 'font-bold text-amber-950' : 'text-purple-200'}>
                      {g.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <TextInput
                placeholder="Contraseña"
                placeholderTextColor="#a78bfa"
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
                className="rounded-2xl bg-white/10 px-4 py-4 text-white"
              />
              <View className="mt-2 flex-row gap-2">
                <View className="flex-1">
                  <Button label="Cancelar" variant="ghost" onPress={() => setOpen(false)} />
                </View>
                <View className="flex-1">
                  <Button label="Inscribir" onPress={guardar} />
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
