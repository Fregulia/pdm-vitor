import { auth, db } from "@/services/firebase";
import { updateProfile } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { consumeStudentInvite } from "./studentInvites";

export type Student = {
  uid: string;
  name: string;
  email: string;
  owner_id: string;
  gym_id: string;
  trainer_id: string;
  createdAt?: any;
  updatedAt?: any;
};

/**
 * Cadastra um aluno usando um convite
 * @param inviteCode - Código do convite
 */
export async function joinAsStudentWithInvite(inviteCode: string) {
  console.log("[joinAsStudentWithInvite] Iniciando com código:", inviteCode);

  const user = auth.currentUser;
  if (!user) throw new Error("NOT_AUTHENTICATED");
  console.log("[joinAsStudentWithInvite] Usuário autenticado:", user.uid);

  console.log("[joinAsStudentWithInvite] Consumindo convite...");
  const { ownerUid, gymId, trainerId, studentName } =
    await consumeStudentInvite(inviteCode.trim(), user.uid);
  console.log("[joinAsStudentWithInvite] Convite consumido:", {
    ownerUid,
    gymId,
    trainerId,
    studentName,
  });

  const student: Student = {
    uid: user.uid,
    name: studentName,
    email: user.email || "",
    owner_id: ownerUid,
    gym_id: gymId,
    trainer_id: trainerId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } as any;

  console.log(
    "[joinAsStudentWithInvite] Criando documento em academies:",
    `academies/${gymId}/students/${user.uid}`
  );
  // Salva sob academies/{gymId}/students/{studentUid}
  const ref = doc(db, "academies", gymId, "students", user.uid);
  await setDoc(ref, student, { merge: true });
  console.log(
    "[joinAsStudentWithInvite] Documento em academies criado com sucesso"
  );

  console.log(
    "[joinAsStudentWithInvite] Atualizando displayName do usuário com o nome do convite"
  );
  // Atualiza o displayName do usuário no Firebase Auth
  await updateProfile(user, {
    displayName: studentName,
  });
  console.log(
    "[joinAsStudentWithInvite] displayName atualizado para:",
    studentName
  );

  console.log(
    "[joinAsStudentWithInvite] Atualizando perfil do usuário em /users"
  );
  // Também grava os atributos no perfil do usuário (/users/{uid})
  const uref = doc(db, "users", user.uid);
  await setDoc(
    uref,
    {
      owner_id: ownerUid,
      gym_id: gymId,
      trainer_id: trainerId,
      role: "student",
      updatedAt: serverTimestamp(),
    } as any,
    { merge: true }
  );
}

/**
 * Recupera o contexto do aluno (owner_id, gym_id, trainer_id)
 */
export async function getStudentContext(studentUid?: string): Promise<{
  ownerUid: string;
  gymId: string;
  trainerId: string;
} | null> {
  const uid = studentUid || auth.currentUser?.uid;
  if (!uid) return null;

  // Método 1: Tenta via perfil /users (mais rápido e confiável)
  try {
    const uref = doc(db, "users", uid);
    const usnap = await getDoc(uref);
    if (usnap.exists()) {
      const pdata = usnap.data() as any;
      if (pdata?.owner_id && pdata?.gym_id && pdata?.trainer_id) {
        return {
          ownerUid: pdata.owner_id,
          gymId: pdata.gym_id,
          trainerId: pdata.trainer_id,
        };
      }
    }
  } catch (err) {
    console.error("[getStudentContext] Erro ao buscar via users:", err);
  }

  // Método 2: usa invites usados por este uid
  try {
    const invitesRef = collection(db, "studentInvites");
    const iq = query(invitesRef, where("usedBy", "==", uid));
    const iSnaps = await getDocs(iq);
    if (!iSnaps.empty) {
      const inv = iSnaps.docs[0].data() as any;
      const ownerUid = inv.ownerUid;
      const gymId = inv.gymId;
      const trainerId = inv.trainerId;
      if (ownerUid && gymId && trainerId) {
        // Backfill no perfil para próxima vez
        try {
          await setDoc(
            doc(db, "users", uid),
            { owner_id: ownerUid, gym_id: gymId, trainer_id: trainerId },
            { merge: true }
          );
        } catch (e) {
          console.error("[getStudentContext] Erro ao fazer backfill:", e);
        }
        return { ownerUid, gymId, trainerId };
      }
    }
  } catch (err) {
    console.error("[getStudentContext] Erro ao buscar via invites:", err);
  }

  return null;
}
