import { getAcademy } from "@/services/academy";
import { db } from "@/services/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
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

// GERA UM CÓDIGO PRO CONVITE - FUNÇÃO AUXILIAR
function randomCode(len = 6) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem 0/O/1/I
  let out = "";
  for (let i = 0; i < len; i++)
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

// CRIA CONVITE PRA ACADEMIA - TRAINER/STUDENT
export async function createInvite(ownerUid: string, _gymId?: string) {
  // BUSCA ACADEMIA DO OWNER
  const academy = await getAcademy(ownerUid);
  if (!academy?.name) {
    throw new Error("ACADEMY_NOT_FOUND");
  }
  const gymId = (academy as any).id || academy.ownerUid;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const code = randomCode(8);
  const ref = doc(db, "academies", gymId, "invites", code);
  // CRIA O CONVITE COM VALIDADE DE 24H
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

// MARCAR CONVITE COMO USADO - CRIAÇÃO DE CONTA TRAINER
export async function consumeInvite(code: string, usedByUid: string) {
  // RECEBE O CÓDIGO DO SIGNUP E BUSCA O CONVITE POR ELE
  const academiesSnap = await getDocs(collection(db, "academies"));
  let inviteDoc = null;
  for (const academyDoc of academiesSnap.docs) {
    const ref = doc(db, "academies", academyDoc.id, "invites", code);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      inviteDoc = snap;
      break;
    }
  }
  
  // SE NÃO ACHAR LANÇA ERRO
  if (!inviteDoc) throw new Error("CODE_NOT_FOUND");

  const data = inviteDoc.data() as Invite;

  const expVal: any = (data as any).expiresAt;
  const expDate: Date | null = expVal?.toDate
    ? expVal.toDate()
    : expVal
    ? new Date(expVal)
    : null;
  // VERIFICA A VALIDADE DO CONVITE
  if (expDate && expDate.getTime() < Date.now()) {
    throw new Error("CODE_EXPIRED");
  }
  // VERIFICA SE JÁ FOI USADO
  if (data.usedBy) throw new Error("CODE_ALREADY_USED");
  
  // MARCA O CONVITE COMO USADO, SALVANDO O ID NO DOCUMENTO
  await setDoc(
    inviteDoc.ref,
    { usedBy: usedByUid, usedAt: serverTimestamp() },
    { merge: true }
  );
  // RETORNA OS DADOS DO DONO DO CONVITE PRA USAR NO SIGNUP/DASHBOARD
  return { ownerUid: data.ownerUid, gymId: data.gymId };
}

// REMOVE CONVITES EXPIRADOS
export async function cleanupExpiredInvites(ownerUid: string) {
  // BUSCA A ACADEMIA DO OWNER
  const academy = await getAcademy(ownerUid);
  if (!academy) return;

  const gymId = (academy as any).id || ownerUid;
  const invitesRef = collection(db, "academies", gymId, "invites");
  const snaps = await getDocs(invitesRef);
  const now = Date.now();
  
  // COMPARA A DATA DO CODIGO COM HOJE E DELETA SE TIVER EXPIRADO E NÃO TIVER SIDO USADO
  await Promise.all(
    snaps.docs.map(async (d) => {
      const data = d.data() as any;
      const exp = data.expiresAt?.toDate?.() ?? data.expiresAt;
      if (exp && new Date(exp).getTime() < now && !data.usedBy) {
        try {
          await deleteDoc(doc(db, "academies", gymId, "invites", d.id));
        } catch {}
      }
    })
  );
}
