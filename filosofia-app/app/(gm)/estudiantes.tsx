import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/ui/Button';
import { AvatarPicker } from '../../src/components/pixel/AvatarPicker';
import { PixelSprite } from '../../src/components/pixel/PixelSprite';
import { DEFAULT_AVATAR, getAvatarSprite } from '../../src/components/pixel/avatars';
import { useGameStore } from '../../src/store/useGameStore';
import { getNivel } from '../../src/domain';
import type { Genero } from '../../src/domain/types';

const GENEROS: { id: Genero; label: string }[] = [
  { id: 'femenino', label: 'F' },
  { id: 'masculino', label: 'M' },
  { id: 'no-binario', label: 'N-B' },
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
  const [avatar, setAvatar] = useState<string>(DEFAULT_AVATAR);

  const guardar = () => {
    if (!nombreSocial.trim() || !password.trim()) {
      Alert.alert('Faltan datos', 'Nombre y contraseña son obligatorios.');
      return;
    }
    crear({ nombreSocial: nombreSocial.trim(), nombreLegal: nombreLegal.trim(), genero, password: password.trim(), avatar });
    setNombreSocial(''); setNombreLegal(''); setPassword(''); setGenero('no-binario'); setAvatar(DEFAULT_AVATAR);
    setOpen(false);
  };

  const confirmarEliminar = (id: string, nombre: string) => {
    Alert.alert('Eliminar héroe', `¿Eliminar a ${nombre}? Se perderá su progreso.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(id) },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-dungeon-950" edges={['top']}>
      <View className="flex-row items-center border-b-2 border-stone-dark px-4 pb-2 pt-3">
        <Text className="flex-1 font-pixel text-base text-gold">👥 HÉROES</Text>
        <Text className="font-body text-sm text-arcane">{students.length}</Text>
      </View>

      <FlatList
        data={students}
        keyExtractor={(s) => s.id}
        contentContainerClassName="px-4 pt-3 pb-28"
        renderItem={({ item }) => {
          const nivel = getNivel(item.xp ?? 0);
          return (
            <View className="mb-2 flex-row items-center border-2 border-stone-dark bg-dungeon-800 p-3">
              <View className="mr-2 border border-stone-dark bg-dungeon-950">
                <PixelSprite sprite={getAvatarSprite(item.avatar)} size={34} />
              </View>
              <View className="flex-1">
                <Text className="font-body text-sm text-parchment">{item.nombreSocial}</Text>
                <Text className="font-body text-[11px] text-arcane">
                  NV {nivel.nivel} · {item.xp ?? 0} XP · clave: {item.password}
                </Text>
              </View>
              <Pressable
                onPress={() => confirmarEliminar(item.id, item.nombreSocial)}
                hitSlop={12}
                className="h-10 w-10 items-center justify-center border-2 border-stone-dark bg-ruby/30"
              >
                <Text>🗑️</Text>
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text className="mt-10 text-center font-body text-sm text-stone-light">
            No hay héroes. Toca + para inscribir al primero.
          </Text>
        }
      />

      {/* FAB */}
      <Pressable
        onPress={() => setOpen(true)}
        className="absolute bottom-6 right-6 h-16 w-16 items-center justify-center border-[3px] border-stone-dark bg-gold active:opacity-80"
      >
        <Text className="font-pixel text-2xl text-[#3a2a06]">+</Text>
      </Pressable>

      {/* Formulario */}
      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View className="flex-1 justify-end bg-black/70">
          <View className="border-t-[3px] border-stone-dark bg-dungeon-800 p-5 pb-10">
            <Text className="mb-4 font-pixel text-sm text-gold">NUEVO HÉROE</Text>
            <View className="gap-3">
              <TextInput
                placeholder="NOMBRE DE USUARIO (LOGIN)"
                placeholderTextColor="#6b5fa3"
                autoCapitalize="none"
                value={nombreSocial}
                onChangeText={setNombreSocial}
                className="border-2 border-stone-dark bg-dungeon-950 px-3 py-3 font-body text-parchment"
              />
              <TextInput
                placeholder="NOMBRE COMPLETO (OPCIONAL)"
                placeholderTextColor="#6b5fa3"
                value={nombreLegal}
                onChangeText={setNombreLegal}
                className="border-2 border-stone-dark bg-dungeon-950 px-3 py-3 font-body text-parchment"
              />
              <View className="flex-row gap-2">
                {GENEROS.map((g) => (
                  <Pressable
                    key={g.id}
                    onPress={() => setGenero(g.id)}
                    className={`flex-1 items-center border-2 py-3 ${genero === g.id ? 'border-gold bg-gold' : 'border-stone-dark bg-dungeon-950'}`}
                  >
                    <Text className={`font-body text-xs ${genero === g.id ? 'text-[#3a2a06]' : 'text-arcane'}`}>
                      {g.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <TextInput
                placeholder="CONTRASEÑA"
                placeholderTextColor="#6b5fa3"
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
                className="border-2 border-stone-dark bg-dungeon-950 px-3 py-3 font-body text-parchment"
              />
              <Text className="font-body text-[11px] text-arcane">AVATAR</Text>
              <AvatarPicker value={avatar} onSelect={setAvatar} size={56} />
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
