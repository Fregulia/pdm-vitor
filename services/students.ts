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

// TIPOS DE DADOS DO ALUNO
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

// TIPO DE DADOS DO CONTEXTO DO ALUNO
export type StudentContext = {
  ownerUid: string;
  gymId: string;
  trainerId: string;
};

// INSERE O ALUNO NA ACADEMIA BASEADO NO CÓDIGO DE CONVITE - SIGNUP
export async function joinAsStudentWithInvite(inviteCode: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("NOT_AUTHENTICATED");

  // CHAMA O SERVICE DE USAR CONVITE
  const { ownerUid, gymId, trainerId, studentName } =
    await consumeStudentInvite(inviteCode.trim(), user.uid);

  // CRIA O DOCUMENTO DO ALUNO E SALVA EM STUDENTS
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
  const ref = doc(db, "academies", gymId, "students", user.uid);
  await setDoc(ref, student, { merge: true });

  // ATUALIZA O PERFIL DO AUTH COM O NOME DO ALUNO
  await updateProfile(user, {
    displayName: studentName,
  });

  // GRAVA OS DADOS EM /USERS PRA FACILITAR ACESSOS POSTERIORES
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

// BUSCA CONTEXTO DO ALUNO (ACADEMIA, PROFESSOR E DONO) - DASHBOARD
export async function getStudentContext(studentUid?: string): Promise<StudentContext | null> {
  const uid = studentUid || auth.currentUser?.uid;
  if (!uid) return null;

  // TRY 1 - BUSCA DIRETO EM /USERS
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

  // TRY 2 (CASO 1 FALHE) - BUSCA PELO CÓDIGO DE CONVITE USADO
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
        // CORRIJE O /USERS PRA FUNCIONAR DEPOIS
        try {
          await setDoc(
            doc(db, "users", uid),
            { owner_id: ownerUid, gym_id: gymId, trainer_id: trainerId },
            { merge: true }
          );
        } catch {
        }
        return { ownerUid, gymId, trainerId };
      }
    }
  } catch {
  }
  return null;
}

// SINCRONIZA OS DOIS ENDPOINTS DO DB (/USERS E /STUDENTS)
export async function syncStudentData(
  gymId: string,
  studentUid: string
): Promise<void> {
  try {
    // BUSCA OS DADOS DO /STUDENTS
    const studentRef = doc(db, "academies", gymId, "students", studentUid);
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) {
      return;
    }

    const studentData = studentSnap.data();
    const updates: any = {};

    // BUSCA OS DADOS DO /USERS
    const userRef = doc(db, "users", studentUid);
    const userSnap = await getDoc(userRef);
    let userData: any = null;

    if (userSnap.exists()) {
      userData = userSnap.data();
    }

    // VERIFICA SE PRECISA ATUALIZAR O NOME
    if (!studentData.name || studentData.name === "") {
      if (userData?.displayName) {
        updates.name = userData.displayName;
      } else {
        // PEGA O NOME DO FIREBASE AUTH COMO FALLBACK
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

    // VERIFICA SE PRECISA ATUALIZAR O EMAIL
    if (!studentData.email || studentData.email === "") {
      if (userData?.email) {
        updates.email = userData.email;
      } else {
        // PEGA O EMAIL DO FIREBASE AUTH COMO FALLBACK
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

    // GARANTE QUE createdAt ESTEJA DEFINIDO
    if (!studentData.createdAt) {
      updates.createdAt = serverTimestamp();
    }

    // GARANTE QUE updatedAt ESTEJA DEFINIDO
    if (Object.keys(updates).length > 0) {
      updates.updatedAt = serverTimestamp();
      await setDoc(studentRef, updates, { merge: true });
    }
  } catch {
  }
}
