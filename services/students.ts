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
  const user = auth.currentUser;
  if (!user) throw new Error("NOT_AUTHENTICATED");

  const { ownerUid, gymId, trainerId, studentName } =
    await consumeStudentInvite(inviteCode.trim(), user.uid);

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

  // Salva sob academies/{gymId}/students/{studentUid}
  const ref = doc(db, "academies", gymId, "students", user.uid);
  await setDoc(ref, student, { merge: true });

  // Atualiza o displayName do usuário no Firebase Auth
  await updateProfile(user, {
    displayName: studentName,
  });

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
        } catch {
          // Silently fail backfill
        }
        return { ownerUid, gymId, trainerId };
      }
    }
  } catch {
    // Silently fail
  }

  return null;
}

/**
 * Sincroniza dados do aluno que podem estar faltando
 * Atualiza nome, email e createdAt se estiverem vazios
 */
export async function syncStudentData(
  gymId: string,
  studentUid: string
): Promise<void> {
  try {
    const studentRef = doc(db, "academies", gymId, "students", studentUid);
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) {
      return;
    }

    const studentData = studentSnap.data();
    const updates: any = {};

    // Busca dados do usuário no /users
    const userRef = doc(db, "users", studentUid);
    const userSnap = await getDoc(userRef);
    let userData: any = null;

    if (userSnap.exists()) {
      userData = userSnap.data();
    }

    // Verifica se precisa atualizar o nome
    if (!studentData.name || studentData.name === "") {
      if (userData?.displayName) {
        updates.name = userData.displayName;
      } else {
        // Tenta pegar do Firebase Auth como fallback
        const currentUser = auth.currentUser;
        if (
          currentUser &&
          currentUser.uid === studentUid &&
          currentUser.displayName
        ) {
          updates.name = currentUser.displayName;
        } else {
          updates.name = "Nome não disponível";
        }
      }
    }

    // Verifica se precisa atualizar o email
    if (!studentData.email || studentData.email === "") {
      if (userData?.email) {
        updates.email = userData.email;
      } else {
        // Tenta pegar do Firebase Auth como fallback
        const currentUser = auth.currentUser;
        if (
          currentUser &&
          currentUser.uid === studentUid &&
          currentUser.email
        ) {
          updates.email = currentUser.email;
        } else {
          updates.email = "email@nao-disponivel.com";
        }
      }
    }

    // Verifica se precisa adicionar createdAt
    if (!studentData.createdAt) {
      updates.createdAt = serverTimestamp();
    }

    // Atualiza apenas se houver mudanças
    if (Object.keys(updates).length > 0) {
      updates.updatedAt = serverTimestamp();
      await setDoc(studentRef, updates, { merge: true });
    }
  } catch {
    // Silently fail
  }
}
