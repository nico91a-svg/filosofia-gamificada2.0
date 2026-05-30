// Servicio de datos: Firebase Realtime DB con fallback a AsyncStorage.
// API equivalente a la del proyecto web (save / load / loadOnce).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, set, onValue, get } from 'firebase/database';
import { database, HAS_FIREBASE } from './firebase';

const localKey = (path: string) => `filosofo_${path.replace(/\//g, '_')}`;

export const DatabaseService = {
  isFirebaseConnected(): boolean {
    return HAS_FIREBASE && database !== null;
  },

  async save(path: string, data: unknown): Promise<void> {
    // Respaldo local siempre (offline-first)
    try {
      await AsyncStorage.setItem(localKey(path), JSON.stringify(data));
    } catch {
      /* almacenamiento lleno: no crítico */
    }
    if (database) {
      try {
        await set(ref(database, path), data);
      } catch (e) {
        console.error(`Firebase rechazó escritura en '${path}':`, e);
      }
    }
  },

  // Listener en tiempo real. Devuelve función para cancelar la suscripción.
  load(path: string, callback: (data: unknown) => void): () => void {
    if (database) {
      const r = ref(database, path);
      const unsub = onValue(r, (snap) => callback(snap.val()));
      return unsub;
    }
    // Modo local: una sola lectura
    AsyncStorage.getItem(localKey(path)).then((v) =>
      callback(v ? JSON.parse(v) : null),
    );
    return () => {};
  },

  async loadOnce(path: string): Promise<unknown> {
    if (database) {
      try {
        const snap = await get(ref(database, path));
        return snap.val();
      } catch {
        /* cae a local */
      }
    }
    const v = await AsyncStorage.getItem(localKey(path));
    return v ? JSON.parse(v) : null;
  },
};
