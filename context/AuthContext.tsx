import { auth, db } from "@/services/firebase";
import * as SecureStore from "expo-secure-store";
import {
  User,
  createUserWithEmailAndPassword,
  deleteUser,
  signOut as fbSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// DEFINE OS TIPOS DO CONTEXTO AUTH
type AuthContextType = {
  user: User | null;
  initializing: boolean;
  loading: boolean;
  justSignedIn: boolean;
  signIn: (
    email: string,
    password: string,
    remember?: boolean
  ) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName?: string,
    role?: UserProfile["role"]
  ) => Promise<void>;
  signOut: () => Promise<void>;
  resendEmailVerification: () => Promise<void>; // no-op durante testes
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
  role?: "owner" | "trainer";
  bio?: string;
  createdAt?: any;
  updatedAt?: any;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// DEFINE AS CHAVES USADAS PARA BUSCAR EMAIL E SENHA NO SECURE STORE
const SECURE_EMAIL_KEY = "entrega1_email";
const SECURE_PASS_KEY = "entrega1_password";

// NORMALIZA NOME: remove espaços duplicados e capitaliza cada palavra
function normalizeName(name: string): string {
  if (!name) return "";
  // remove espaços extras, deixa em minúsculas e capitaliza a primeira letra de cada palavra
  const cleaned = name.replace(/\s+/g, " ").trim().toLowerCase();
  return cleaned
    .split(" ")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ""))
    .join(" ");
}

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
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // Desativado: verificação de e-mail obrigatória para testes
      // SE A REMEMBER = TRUE, SALVA EMAIL E SENHA NO SECURE STORE, SE NÃO EXCLUI
      if (remember) {
        // iOS: define acessibilidade do Keychain para garantir acesso após desbloqueio
        const opts: SecureStore.SecureStoreOptions = {
          keychainAccessible:
            (SecureStore as any).AFTER_FIRST_UNLOCK ||
            SecureStore.WHEN_UNLOCKED,
        } as any;
        await SecureStore.setItemAsync(SECURE_EMAIL_KEY, email, opts);
        await SecureStore.setItemAsync(SECURE_PASS_KEY, password, opts);
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
  const signUp = async (
    email: string,
    password: string,
    displayName?: string,
    role?: UserProfile["role"]
  ) => {
    setLoading(true);

    // CRIA CONTA COM EMAIL E SENHA
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      // Normaliza nome e atualiza displayName no Auth, se informado
      const normalizedDisplay = displayName
        ? normalizeName(displayName)
        : cred.user.displayName
        ? normalizeName(cred.user.displayName)
        : "";
      if (normalizedDisplay) {
        try {
          await updateProfile(cred.user, { displayName: normalizedDisplay });
        } catch {
          // não bloquear fluxo se falhar
        }
      }
      // CRIA UM DOCUMENTO NO FIRESTORE PARA O USUÁRIO CRIADO
      const profile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email || email,
        displayName: normalizedDisplay,
        role: role,
        createdAt: serverTimestamp(),
      };
      // INSERE O DOCUMENTO CRIADO NO FIRESTORE
      try {
        await setDoc(doc(db, "users", cred.user.uid), profile);
      } catch (err) {
        // Não falhar o signup se o Firestore estiver com regras desatualizadas
        console.warn("Falha ao salvar perfil no Firestore:", err);
      }
      // TEMPORARIAMENTE DESABILITADO: Envia e-mail de verificação para o novo usuário
      // try {
      //   await sendEmailVerification(cred.user);
      // } catch (err) {
      //   console.warn("Falha ao enviar e-mail de verificação:", err);
      // }
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
  const available = await SecureStore.isAvailableAsync();
  if (!available) return;
  const email = await SecureStore.getItemAsync(SECURE_EMAIL_KEY);
  const password = await SecureStore.getItemAsync(SECURE_PASS_KEY);
  if (email && password) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Desativado: verificação de e-mail obrigatória
    } catch {
      // ignore errors, user remains signed out
    }
  }
}
