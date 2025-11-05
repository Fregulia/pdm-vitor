import React, {createContext, useContext, useEffect, useMemo, useState,} from "react";
import * as SecureStore from "expo-secure-store";
import { User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as fbSignOut, updateProfile, sendEmailVerification, sendPasswordResetEmail, deleteUser, onAuthStateChanged,} from "firebase/auth";
import {doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp,} from "firebase/firestore";
import { auth, db } from "@/services/firebase";

// DEFINE OS TIPOS DO CONTEXTO AUTH
type AuthContextType = {
  user: User | null;
  initializing: boolean;
  loading: boolean;
  justSignedIn: boolean;
  signIn: (email: string, password: string, remember?: boolean) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resendEmailVerification: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getProfile: () => Promise<any | null>;
  updateProfileDoc: (data: Partial<UserProfile>) => Promise<void>;
  deleteAccountHard: () => Promise<void>;
  ackJustSignedIn: () => void;
};

// DEFINE OS TIPOS DO PERFIL DE USUÁRIO
type UserProfile = {
  uid: string;
  email: string;
  displayName?: string;
  bio?: string;
  createdAt?: any;
  updatedAt?: any;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// DEFINE AS CHAVES USADAS PARA BUSCAR EMAIL E SENHA NO SECURE STORE
const SECURE_EMAIL_KEY = "entrega1_email";
const SECURE_PASS_KEY = "entrega1_password";

// CRIA O PROVIDER DO AUTH CONTEXT
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [justSignedIn, setJustSignedIn] = useState(false);

  // TODA VEZ QUE O ESTADO DE AUTH MUDA, ATUALIZA O USER NO CONTEXTO
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setInitializing(false);
    });
    return unsub;
  }, []);

  // FAZ O LOGIN DO USUÁRIO
  const signIn = async (email: string, password: string, remember = false) => {
    setLoading(true);

    // FAZ LOGIN NO FB AUTH E RETORNA AS CREDENCIAIS
    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      // SE NÃO ESTIVER VERIFICADO, DESLOGA E LANÇA ERRO
      if (!cred.user.emailVerified) {
        await fbSignOut(auth);
        throw new Error("EMAIL_NOT_VERIFIED");
      }
      // SE A REMEMBER = TRUE, SALVA EMAIL E SENHA NO SECURE STORE, SE NÃO EXCLUI
      if (remember) {
        await SecureStore.setItemAsync(SECURE_EMAIL_KEY, email);
        await SecureStore.setItemAsync(SECURE_PASS_KEY, password);
      } else {
        await SecureStore.deleteItemAsync(SECURE_EMAIL_KEY);
        await SecureStore.deleteItemAsync(SECURE_PASS_KEY);
      }
      setJustSignedIn(true);
    } finally {
      setLoading(false);
    }
  };

  // CRIA NOVA CONTA
  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true);

    // CRIA CONTA COM EMAIL E SENHA
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      // INSERE O NOME DE EXIBIÇÃO, SE HOUVER
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      // CRIA UM DOCUMENTO NO FIRESTORE PARA O USUÁRIO CRIADO
      const profile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email || email,
        displayName: displayName || cred.user.displayName || "",
        createdAt: serverTimestamp(),
      };
      // INSERE O DOCUMENTO CRIADO NO FIRESTORE
      await setDoc(doc(db, "users", cred.user.uid), profile);
      // ENVIA EMAIL DE VERIFICAÇÃO
      await sendEmailVerification(cred.user);
    } finally {
      setLoading(false);
    }
  };

  // FAZ LOGOFF
  const signOut = async () => {
    setLoading(true);
    // FAZ LOGOFF NO FB AUTH E LIMPA O SECURE STORE
    try {
      await fbSignOut(auth);
      await SecureStore.deleteItemAsync(SECURE_EMAIL_KEY);
      await SecureStore.deleteItemAsync(SECURE_PASS_KEY);
      setJustSignedIn(false);
    } finally {
      setLoading(false);
    }
  };

  // REENVIA EMAIL DE VERIFICAÇÃO
  const resendEmailVerification = async () => {
    // SE NÃO EXISTIR USUÁRIO AUTENTICADO, LANÇA ERRO
    if (!auth.currentUser) throw new Error("NOT_AUTHENTICATED");
    await sendEmailVerification(auth.currentUser);
  };

  // RESETAR SENHA
  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  // BUSCAR PERFIL NO FIRESTORE
  const getProfile = async () => {
    // SE NÃO EXISTIR USUÁRIO AUTENTICADO, RETORNA NULL
    if (!auth.currentUser) return null;

    // SE EXISTIR, BUSCA O DOCUMENTO DO PERFIL
    const ref = doc(db, "users", auth.currentUser.uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  };

  // ATUALIZAR PERFIL
  const updateProfileDoc = async (data: Partial<UserProfile>) => {
    // SE NÃO EXISTIR USUÁRIO AUTENTICADO, LANÇA ERRO
    if (!auth.currentUser) throw new Error("NOT_AUTHENTICATED");
    const ref = doc(db, "users", auth.currentUser.uid);
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
  };

  // DELETAR CONTA 
  const deleteAccountHard = async () => {
    // SE NÃO EXISTIR USUÁRIO AUTENTICADO, LANÇA ERRO
    if (!auth.currentUser) throw new Error("NOT_AUTHENTICATED");

    // PEGA O ID DO USUÁRIO
    const uid = auth.currentUser.uid;

    // DELETA NO FIRESTORE E NO AUTH
    await deleteDoc(doc(db, "users", uid));
    await deleteUser(auth.currentUser);
  };

  // MONTA O VALOR DO CONTEXTO PARA EVITAR RENDERIZAÇÕES DESNECESSÁRIAS
  const value = useMemo(
    () => ({
      user,
      initializing,
      loading,
      justSignedIn,
      signIn,
      signUp,
      signOut,
      resendEmailVerification,
      resetPassword,
      getProfile,
      updateProfileDoc,
      deleteAccountHard,
      ackJustSignedIn: () => setJustSignedIn(false),
    }),
    [user, initializing, loading, justSignedIn]
  );

  // RENDERIZA O CONTEXTO COM O VALOR, E PASSA PARA OS FILHOS 
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// HOOK PARA USAR O PROVIDER
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// TENTA FAZER LOGIN AUTOMÁTICO COM INFOS DO SECURE STORE
export async function tryAutoSignIn() {
  const email = await SecureStore.getItemAsync(SECURE_EMAIL_KEY);
  const password = await SecureStore.getItemAsync(SECURE_PASS_KEY);
  if (email && password) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (!auth.currentUser?.emailVerified) {
        await fbSignOut(auth);
      }
    } catch {
      // ignore errors, user remains signed out
    }
  }
}
