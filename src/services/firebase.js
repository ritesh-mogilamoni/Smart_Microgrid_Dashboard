// ─── FEATURE FLAG ─────────────────────────────────────────────────────────────
// Set to true once you have real Firebase credentials in .env.local.
// When false, Firebase is NEVER initialized — zero network traffic, pure simulation.
export const USE_FIREBASE = false;
// ──────────────────────────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  push,
  onValue,
} from 'firebase/database';

// Fill these via .env.local (copy .env.local.example and add your values).
// NEVER hardcode real credentials here — this file is committed to git.
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FB_API_KEY             ?? '',
  authDomain:        import.meta.env.VITE_FB_AUTH_DOMAIN         ?? '',
  databaseURL:       import.meta.env.VITE_FB_DATABASE_URL        ?? '',
  projectId:         import.meta.env.VITE_FB_PROJECT_ID          ?? '',
  storageBucket:     import.meta.env.VITE_FB_STORAGE_BUCKET      ?? '',
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID ?? '',
  appId:             import.meta.env.VITE_FB_APP_ID              ?? '',
};

// Singletons — initialized lazily on first call to getFirebaseDB()
let _app = null;
let _db  = null;

/**
 * Returns the Firebase Database instance.
 * Returns null when USE_FIREBASE is false (safe to call anywhere).
 */
export function getFirebaseDB() {
  if (!USE_FIREBASE) return null;
  if (!_db) {
    _app = initializeApp(firebaseConfig);
    _db  = getDatabase(_app);
  }
  return _db;
}

// ─── Typed Database Refs ───────────────────────────────────────────────────────

/** /latest/ — always-overwritten current reading from ESP32 / simulator */
export function latestRef(db) {
  return ref(db, 'latest');
}

/** /history/ — time-series records pushed every 5 seconds */
export function historyRef(db) {
  return ref(db, 'history');
}

/** /events/ — fault transition audit log records */
export function eventsRef(db) {
  return ref(db, 'events');
}

// Re-export Firebase primitives so other files don't import 'firebase/database' directly.
export { set, push, onValue };
