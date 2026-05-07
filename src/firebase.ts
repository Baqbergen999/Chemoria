import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Vite handles JSON imports automatically
// @ts-ignore
import firebaseConfig from "../firebase-applet-config.json";

const isConfigValid = firebaseConfig && Object.keys(firebaseConfig).length > 0;

const app = getApps().length === 0 && isConfigValid ? initializeApp(firebaseConfig) : (getApps()[0] || null);
export const db = app ? getFirestore(app, firebaseConfig?.firestoreDatabaseId) : null;
export const auth = app ? getAuth(app) : null;
