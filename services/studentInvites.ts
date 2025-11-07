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
import { getAcademy } from "./academy";

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

// Gera um código alfanumérico de 8 caracteres
function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Cria um convite para aluno
 * @param ownerUid - UID do dono da academia
 * @param trainerId - UID do trainer responsável
 * @param studentName - Nome do aluno
 * @returns O código do convite gerado
 */
export async function createStudentInvite(
  ownerUid: string,
  trainerId: string,
  studentName: string
): Promise<string> {
  // Busca o gymId da academia do owner
  const academy = await getAcademy(ownerUid);
  if (!academy) throw new Error("ACADEMY_NOT_FOUND");

  const gymId = (academy as any).id;
  if (!gymId) throw new Error("GYM_ID_NOT_FOUND");

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

  const ref = doc(db, "studentInvites", code);
  await setDoc(ref, inviteData);
  return code;
}

/**
 * Consome um convite de aluno (marca como usado)
 * @param code - Código do convite
 * @param usedByUid - UID do usuário que está usando o convite
 * @returns Dados do convite (ownerUid, gymId, trainerId, studentName)
 */
export async function consumeStudentInvite(
  code: string,
  usedByUid: string
): Promise<{
  ownerUid: string;
  gymId: string;
  trainerId: string;
  studentName: string;
}> {
  console.log("[consumeStudentInvite] Iniciando com código:", code);

  const ref = doc(db, "studentInvites", code.trim().toUpperCase());
  console.log("[consumeStudentInvite] Buscando documento:", ref.path);

  const snap = await getDoc(ref);
  console.log("[consumeStudentInvite] Documento existe?", snap.exists());

  if (!snap.exists()) {
    throw new Error("INVITE_NOT_FOUND");
  }

  const data = snap.data() as StudentInvite;
  console.log("[consumeStudentInvite] Dados do convite:", {
    usedBy: data.usedBy,
    expiresAt: data.expiresAt,
    ownerUid: data.ownerUid,
    gymId: data.gymId,
  });

  // Verifica se já foi usado
  if (data.usedBy) {
    throw new Error("INVITE_ALREADY_USED");
  }

  // Verifica se expirou
  const now = new Date();
  const expiresAt = data.expiresAt?.toDate?.() || new Date(data.expiresAt);
  if (now > expiresAt) {
    throw new Error("INVITE_EXPIRED");
  }

  console.log("[consumeStudentInvite] Marcando convite como usado...");
  // Marca como usado (não deleta para auditoria)
  await setDoc(
    ref,
    {
      usedBy: usedByUid,
      usedAt: serverTimestamp(),
    },
    { merge: true }
  );
  console.log("[consumeStudentInvite] Convite marcado como usado com sucesso");

  return {
    ownerUid: data.ownerUid,
    gymId: data.gymId,
    trainerId: data.trainerId,
    studentName: data.studentName,
  };
}

/**
 * Remove convites expirados e não usados de um owner
 */
export async function cleanupExpiredStudentInvites(
  ownerUid: string
): Promise<void> {
  const now = new Date();
  const q = query(
    collection(db, "studentInvites"),
    where("ownerUid", "==", ownerUid)
  );
  const snaps = await getDocs(q);

  const toDelete: Promise<void>[] = [];
  snaps.forEach((docSnap) => {
    const data = docSnap.data() as StudentInvite;
    const expiresAt = data.expiresAt?.toDate?.() || new Date(data.expiresAt);
    // Só remove se expirou E não foi usado
    if (now > expiresAt && !data.usedBy) {
      toDelete.push(deleteDoc(docSnap.ref));
    }
  });

  await Promise.all(toDelete);
}
