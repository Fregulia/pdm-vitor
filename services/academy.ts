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

export type AcademyInfo = {
  name: string;
  address: string;
  contact: string;
  hours: Hours;
  ownerUid: string;
  createdAt?: any;
  updatedAt?: any;
};

// Busca a academia do owner por campo ownerUid (independe do ID do documento)
export async function getAcademy(
  ownerUid: string
): Promise<AcademyInfo | null> {
  const q = query(
    collection(db, "academies"),
    where("ownerUid", "==", ownerUid),
    limit(1)
  );
  const snaps = await getDocs(q);
  if (snaps.empty) return null;
  return snaps.docs[0].data() as AcademyInfo;
}

// Recupera uma academia pelo seu ID de documento (gym_id)
export async function getAcademyById(
  gymId: string
): Promise<AcademyInfo | null> {
  const ref = doc(db, "academies", gymId);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as AcademyInfo) : null;
}

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

// Gera um ID de academia (gym_id) que não conflita com o ownerUid
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

export async function saveAcademy(
  ownerUid: string,
  data: Partial<AcademyInfo>
) {
  // Descobre se já existe academia para este owner
  const q = query(
    collection(db, "academies"),
    where("ownerUid", "==", ownerUid),
    limit(1)
  );
  const snaps = await getDocs(q);
  let targetId: string;
  if (snaps.empty) {
    // cria com gym_id diferente do ownerUid
    targetId = generateGymId(ownerUid);
  } else {
    const existingId = snaps.docs[0].id;
    // se por acaso o id atual iguala o ownerUid, gera um novo para escrita futura
    targetId = existingId === ownerUid ? generateGymId(ownerUid) : existingId;
  }
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
}

// Garante que o documento da academia possua um campo "id" igual ao seu doc.id
// Garante que a academia do owner tenha um id (gym_id) diferente do ownerUid
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
  // Se ainda é igual, cria um novo doc com ID novo e mantém o antigo (para compatibilidade de convites antigos)
  const newId = generateGymId(ownerUid);
  const newRef = doc(db, "academies", newId);
  const base = { ...data, id: newId, updatedAt: serverTimestamp() };
  await setDoc(newRef, base, { merge: true });
  // Não removemos o antigo para não quebrar convites legados
}
