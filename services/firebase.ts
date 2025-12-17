import { firebaseConfig } from "@/constants/firebase";
import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, setLogLevel } from "firebase/firestore";

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!;

export const auth = getAuth(app);

export const db = getFirestore(app);

// Ativa logs detalhados para ajudar a identificar path/método nas falhas de permissão
setLogLevel("debug");
