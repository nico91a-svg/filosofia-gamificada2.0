// Inicialización de Firebase (modular). Si faltan credenciales → modo local.
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getDatabase, type Database } from 'firebase/database';

const cfg = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Hay Firebase si al menos apiKey y databaseURL están definidos
export const HAS_FIREBASE = Boolean(cfg.apiKey && cfg.databaseURL);

let app: FirebaseApp | null = null;
let database: Database | null = null;

if (HAS_FIREBASE) {
  try {
    app = initializeApp(cfg as Record<string, string>);
    database = getDatabase(app);
  } catch (e) {
    console.warn('Firebase no se pudo inicializar; usando modo local.', e);
  }
}

export { app, database };
