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
import { getAcademy } from "./academy";

// TIPOS DE DADOS DO CONVITE DE ALUNO
export type StudentInvite = {
  code: string;
  ownerUid: string;
  gymId: string;
  trainerId: string;
  studentName: string;
  expiresAt: any;
  usedBy?: string;
  usedAt?: any;
  createdAt: any;
};

// GERA UM CÓDIGO PRO CONVITE - FUNÇÃO AUXILIAR
function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// CRIA UM CONVITE PARA ALUNO - GERADO PELO OWNER
export async function createStudentInvite(
  ownerUid: string,
  trainerId: string,
  studentName: string
): Promise<string> {
  // BUSCA ACADEMIA DO OWNER 
  const academy = await getAcademy(ownerUid);
  if (!academy) throw new Error("ACADEMY_NOT_FOUND");

  const gymId = (academy as any).id;
  if (!gymId) throw new Error("GYM_ID_NOT_FOUND");

  // MONTA OS DADOS DO CONVITE E SALVA NO FIRESTORE
  const code = generateInviteCode();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // Expira em 24h

  const inviteData: StudentInvite = {
    code,
    ownerUid,
    gymId,
    trainerId,
    studentName,
    expiresAt,
    createdAt: serverTimestamp(),
  };

  const ref = doc(db, "academies", gymId, "studentInvites", code);
  await setDoc(ref, inviteData);
  return code;
}

// CONSOME O CONVITE - SIGNUP DE ALUNO
export async function consumeStudentInvite(
  code: string,
  usedByUid: string
): Promise<{
  ownerUid: string;
  gymId: string;
  trainerId: string;
  studentName: string;
}> {
  // BUSCA O CONVITE PELO CÓDIGO DENTRO DE TODAS AS ACADEMIAS
  const academiesSnap = await getDocs(collection(db, "academies"));

  let inviteDoc = null;

  for (const academyDoc of academiesSnap.docs) {
    const ref = doc(
      db,
      "academies",
      academyDoc.id,
      "studentInvites",
      code.trim().toUpperCase()
    );

    const snap = await getDoc(ref);
    if (snap.exists()) {
      inviteDoc = snap;
      break;
    }
  }

  if (!inviteDoc) {
    throw new Error("INVITE_NOT_FOUND");
  }

  const data = inviteDoc.data() as StudentInvite;

  // VERIFICA EXPIRAÇÃO E USO ANTERIOR
  if (data.usedBy) {
    throw new Error("INVITE_ALREADY_USED");
  }
  const now = new Date();
  const expiresAt = data.expiresAt?.toDate?.() || new Date(data.expiresAt);
  if (now > expiresAt) {
    throw new Error("INVITE_EXPIRED");
  }

  // MARCA COMO USADO
  await setDoc(
    inviteDoc.ref,
    {
      usedBy: usedByUid,
      usedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return {
    ownerUid: data.ownerUid,
    gymId: data.gymId,
    trainerId: data.trainerId,
    studentName: data.studentName,
  };
}

// LIMPA CONVITES EXPIRADOS E NÃO USADOS - NÃO AGENDADO AINDA
export async function cleanupExpiredStudentInvites(
  ownerUid: string
): Promise<void> {
  // BUSCA ACADEMIA PELO OWNER
  const academy = await getAcademy(ownerUid);
  if (!academy) return;

  // CORRIGIR: USAR SÓ O ID DA ACADEMIA, NÃO O OWNERUID (MODELO ANTIGO)
  const gymId = (academy as any).id || ownerUid;
  const invitesRef = collection(db, "academies", gymId, "studentInvites");
  const snaps = await getDocs(invitesRef);
  const now = new Date();
  const toDelete: Promise<void>[] = [];
  // VERIFICA UM A UM 
  snaps.forEach((docSnap) => {
    const data = docSnap.data() as StudentInvite;
    const expiresAt = data.expiresAt?.toDate?.() || new Date(data.expiresAt);
    // SE FOR INVALIDO, ADICIONA NA PROMISE DE DELETE
    if (now > expiresAt && !data.usedBy) {
      toDelete.push(
        deleteDoc(doc(db, "academies", gymId, "studentInvites", docSnap.id))
      );
    }
  });

  await Promise.all(toDelete);
}
