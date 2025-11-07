import { getAcademy } from "@/services/academy";
import { db } from "@/services/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

export type Invite = {
  code: string;
  ownerUid: string;
  gymId: string; // geralmente o mesmo que ownerUid
  createdAt: any;
  usedBy?: string | null;
  usedAt?: any;
  expiresAt?: any;
};

function randomCode(len = 6) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem 0/O/1/I
  let out = "";
  for (let i = 0; i < len; i++)
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export async function createInvite(ownerUid: string, _gymId?: string) {
  // Busca o gymId atual pelo ownerUid (independente do ID do documento)
  const academy = await getAcademy(ownerUid);
  if (!academy?.name) {
    throw new Error("ACADEMY_NOT_FOUND");
  }
  const gymId = (academy as any).id || academy.ownerUid; // id deve existir; fallback seguro
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  // gera código e cria doc em /invites/{code}
  const code = randomCode(8);
  const ref = doc(db, "invites", code);
  const inv: Invite = {
    code,
    expiresAt: expiresAt as any,
    ownerUid,
    gymId,
    createdAt: serverTimestamp(),
    usedBy: null,
  } as any;
  await setDoc(ref, inv);
  return code;
}

export async function consumeInvite(code: string, usedByUid: string) {
  const ref = doc(db, "invites", code);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("CODE_NOT_FOUND");
  const data = snap.data() as Invite;
  // verifica expiração
  const expVal: any = (data as any).expiresAt;
  const expDate: Date | null = expVal?.toDate
    ? expVal.toDate()
    : expVal
    ? new Date(expVal)
    : null;
  if (expDate && expDate.getTime() < Date.now()) {
    // mantém convites expirados para auditoria, se desejar limpar use cleanupExpiredInvites
    throw new Error("CODE_EXPIRED");
  }
  if (data.usedBy) throw new Error("CODE_ALREADY_USED");
  // marca como usado
  await setDoc(
    ref,
    { usedBy: usedByUid, usedAt: serverTimestamp() },
    { merge: true }
  );
  // Retorna exatamente os valores vinculados ao convite
  return { ownerUid: data.ownerUid, gymId: data.gymId };
}

// Limpa convites expirados para um owner
export async function cleanupExpiredInvites(ownerUid: string) {
  const invitesRef = collection(db, "invites");
  const q = query(invitesRef, where("ownerUid", "==", ownerUid));
  const snaps = await getDocs(q);
  const now = Date.now();
  await Promise.all(
    snaps.docs.map(async (d) => {
      const data = d.data() as any;
      const exp = data.expiresAt?.toDate?.() ?? data.expiresAt;
      if (exp && new Date(exp).getTime() < now && !data.usedBy) {
        try {
          await deleteDoc(doc(db, "invites", d.id));
        } catch {}
      }
    })
  );
}
