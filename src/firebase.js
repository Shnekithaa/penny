import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const cleanEnv = (value) => {
  if (typeof value !== "string") return value;
  // Remove wrapping quotes, encoded CR/LF fragments, control chars, and all whitespace.
  return value
    .trim()
    .replace(/^['\"]|['\"]$/g, "")
    .replace(/%0d|%0a/gi, "")
    .replace(/[\x00-\x1F\x7F]/g, "")
    .replace(/\s+/g, "");
};

const cleanAuthDomain = (value) =>
  cleanEnv(value)
    ?.replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");

const firebaseConfig = {
  apiKey: cleanEnv(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: cleanAuthDomain(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnv(import.meta.env.VITE_FIREBASE_APP_ID),
};

const isConfigured = Object.values(firebaseConfig).every(Boolean);

let app = null;
let auth = null;
let googleProvider = null;
let db = null;

if (isConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  db = getFirestore(app);
}

export { auth, googleProvider, db, isConfigured };
