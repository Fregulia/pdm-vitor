import { db } from "@/services/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

export type Hours = {
  weekdays: { open: string; close: string };
  saturday: { open: string; close: string };
  sunday: { open: string; close: string };
};

// TIPO DE DADOS - DOC DA ACADEMIA
export type AcademyInfo = {
  name: string;
  address: string;
  contact: string;
  hours: Hours;
  ownerUid: string;
  createdAt?: any;
  updatedAt?: any;
  latitude?: number;
  longitude?: number;
};

// BUSCA ACADEMIA PELO ID DO OWNER LOGADO - PRELOAD
export async function getAcademy(
  ownerUid: string
): Promise<AcademyInfo | null> {
  // BUSCA
  const q = query(
    collection(db, "academies"),
    where("ownerUid", "==", ownerUid),
    limit(1)
  );
  const snaps = await getDocs(q);
  // RETORNA NULL SE NÃO ACHAR
  if (snaps.empty) return null;
  const first = snaps.docs[0];
  const data = first.data() as any;
  const id = data.id || first.id;
  // CORREÇÃO DA V1: GARANTE QUE A ACADEMIA E O OWNER TENHAM ID DIFERENTES
  if (!data.id) {
    try {
      const ref = doc(db, "academies", first.id);
      await setDoc(ref, { id }, { merge: true });
    } catch {
    }
  }
  return { ...data, id } as AcademyInfo;
}

// BUSCA ACADEMIA PELO ID DA ACADEMIA - USADO PRA USO DOS CONVITES
export async function getAcademyById(
  gymId: string
): Promise<AcademyInfo | null> {
  const ref = doc(db, "academies", gymId);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as AcademyInfo) : null;
}

// VERIFICA SE A ACADEMIA FOI CADASTRADA COMPLETAMENTE - LOGIN/PRELOAD
export function isAcademyComplete(a?: Partial<AcademyInfo> | null): boolean {
  if (!a) return false;
  const h = (a as any)?.hours as Hours | string | undefined;
  if (!a.name || !a.address || !a.contact || !h) return false;
  if (typeof h === "string") return false; // antigo formato não é válido
  const ok =
    !!h.weekdays?.open &&
    !!h.weekdays?.close &&
    !!h.saturday?.open &&
    !!h.saturday?.close &&
    !!h.sunday?.open &&
    !!h.sunday?.close;
  return ok;
}

// GERA UM ID PRA ACADEMIA != DO OWNER - CRIAÇÃO DA ACADEMIA
function generateGymId(ownerUid: string): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const make = () =>
    Array.from(
      { length: 10 },
      () => alphabet[Math.floor(Math.random() * alphabet.length)]
    ).join("");
  let id = make();
  while (id === ownerUid) id = make();
  return id;
}

// SALVA/ATUALIZA ACADEMIA DO OWNER LOGADO - FORM DE EDIÇÃO
export async function saveAcademy(
  ownerUid: string,
  data: Partial<AcademyInfo>
): Promise<string> {
  // BUSCA
  const q = query(
    collection(db, "academies"),
    where("ownerUid", "==", ownerUid),
    limit(1)
  );
  const snaps = await getDocs(q);
  let targetId: string;
  // SE NÃO ACHAR, CRIA ID NOVO
  if (snaps.empty) {
    targetId = generateGymId(ownerUid);
  } else { // SE ACHAR SALVA O ID EXISTENTE
    const existingId = snaps.docs[0].id;
    targetId = existingId === ownerUid ? generateGymId(ownerUid) : existingId;
  }
  // BUSCA O DOC DA ACADEMIA, E SETA OS DADOS
  const ref = doc(db, "academies", targetId);
  await setDoc(
    ref,
    {
      ownerUid,
      ...data,
      id: targetId,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  return targetId;
}

// FUNÇÃO NÃO USADA MAIS - FORÇA ID_ACADEMIA != ID_OWNER
export async function ensureAcademyHasDifferentId(ownerUid: string) {
  const q = query(
    collection(db, "academies"),
    where("ownerUid", "==", ownerUid),
    limit(1)
  );
  const snaps = await getDocs(q);
  if (snaps.empty) return;
  const docSnap = snaps.docs[0];
  const currentId = docSnap.id;
  const data = docSnap.data() as any;
  if (currentId !== ownerUid) {
    // já diferente -> garante campo id
    const ref = doc(db, "academies", currentId);
    await setDoc(
      ref,
      { id: currentId, updatedAt: serverTimestamp() },
      { merge: true }
    );
    return;
  }
  const newId = generateGymId(ownerUid);
  const newRef = doc(db, "academies", newId);
  const base = { ...data, id: newId, updatedAt: serverTimestamp() };
  await setDoc(newRef, base, { merge: true });
}
