import { auth, db } from "@/services/firebase";
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  orderBy,
  limit as qLimit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { consumeInvite } from "./invites";
// reuse existing firestore import; helpers below use the same setDoc/doc

export type Trainer = {
  owner_id: string;
  gym_id: string;
  name: string;
  bio: string;
  cref: string;
  uid?: string;
  createdAt?: any;
  updatedAt?: any;
};

export async function joinAsTrainerWithInvite(params: {
  inviteCode: string;
  name: string;
  bio: string;
  cref: string;
}) {
  const user = auth.currentUser;
  if (!user) throw new Error("NOT_AUTHENTICATED");
  const { ownerUid, gymId } = await consumeInvite(
    params.inviteCode.trim(),
    user.uid
  );
  const trainer: Trainer = {
    owner_id: ownerUid,
    gym_id: gymId,
    name: params.name,
    bio: params.bio,
    cref: params.cref,
    uid: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } as any;
  // salva sob academies/{gymId}/teachers/{trainerUid}
  const ref = doc(db, "academies", gymId, "teachers", user.uid);
  await setDoc(ref, trainer, { merge: true });

  // também grava os atributos no perfil do usuário (/users/{uid})
  const uref = doc(db, "users", user.uid);
  await setDoc(
    uref,
    {
      owner_id: ownerUid,
      gym_id: gymId,
      role: "trainer",
      updatedAt: serverTimestamp(),
    } as any,
    { merge: true }
  );
}

// Recupera o vínculo do trainer (owner_id e gym_id) procurando em todas academias
export async function getTrainerContext(trainerUid?: string): Promise<{
  ownerUid: string;
  gymId: string;
} | null> {
  const uid = trainerUid || auth.currentUser?.uid;
  if (!uid) return null;

  // Método 1: Tenta via perfil /users (mais rápido e confiável)
  try {
    const uref = doc(db, "users", uid);
    const usnap = await getDoc(uref);
    if (usnap.exists()) {
      const pdata = usnap.data() as any;
      if (pdata?.owner_id && pdata?.gym_id) {
        return { ownerUid: pdata.owner_id, gymId: pdata.gym_id };
      }
    }
  } catch {
    // Silently fail and try next method
  }

  // Método 2: usa invites usados por este uid para descobrir o contexto
  try {
    const invitesRef = collection(db, "invites");
    const iq = query(
      invitesRef,
      where("usedBy", "==", uid),
      orderBy("usedAt", "desc"),
      qLimit(1)
    );
    const iSnaps = await getDocs(iq);
    if (!iSnaps.empty) {
      const inv = iSnaps.docs[0].data() as any;
      const ownerUid = inv.ownerUid;
      const gymId = inv.gymId;
      if (ownerUid && gymId) {
        // Backfill no perfil para próxima vez
        try {
          await setDoc(
            doc(db, "users", uid),
            { owner_id: ownerUid, gym_id: gymId },
            { merge: true }
          );
        } catch {
          // Silently fail backfill
        }
        return { ownerUid, gymId };
      }
    }
  } catch {
    // Silently fail and try next method
  }

  // Método 3: collectionGroup como último recurso (pode ter problemas de permissão)
  try {
    const cg = collectionGroup(db, "teachers");
    const q = query(cg, where("uid", "==", uid));
    const snaps = await getDocs(q);
    if (!snaps.empty) {
      const docSnap = snaps.docs[0];
      const data = docSnap.data() as any;
      if (data?.owner_id && data?.gym_id) {
        return { ownerUid: data.owner_id, gymId: data.gym_id };
      }
    }
  } catch {
    // CollectionGroup can fail due to permissions, that's expected
  }

  return null;
}

/**
 * Busca todos os professores de uma academia
 */
export async function getTrainers(gymId: string): Promise<Trainer[]> {
  const trainersRef = collection(db, "academies", gymId, "teachers");
  const snapshot = await getDocs(trainersRef);

  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    uid: doc.id,
  })) as Trainer[];
}
