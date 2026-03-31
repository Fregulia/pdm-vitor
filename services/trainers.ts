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

// TIPOS DE TRAINER
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

// INSERE O TRAINER NA ACADEMIA BASEADO NO CÓDIGO DE CONVITE - SIGNUP
export async function joinAsTrainerWithInvite(params: {
  inviteCode: string;
  name: string;
  bio: string;
  cref: string;
}) {
  const user = auth.currentUser;
  if (!user) throw new Error("NOT_AUTHENTICATED");
  // CHAMA O SERVICE DE USAR CONVITE
  const { ownerUid, gymId } = await consumeInvite(
    params.inviteCode.trim(),
    user.uid
  );
  // MONTA E SALVA O DOCUMENTO DO TRAINER EM TEACHERS
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

  // SALVA EM /USERS E /TEACHERS PRA FACILITAR CONSULTAS FUTURAS
  const ref = doc(db, "academies", gymId, "teachers", user.uid);
  await setDoc(ref, trainer, { merge: true });
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

// BUSCA O CONTEXTO DO TRAINER (OWNER E ACADEMIA) - DASHBOARD
export async function getTrainerContext(trainerUid?: string): Promise<{
  ownerUid: string;
  gymId: string;
} | null> {
  const uid = trainerUid || auth.currentUser?.uid;
  if (!uid) return null;

  // 1 - TENTA EM /USERS
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
  }

  // 2 - VAI EM /TEACHERS
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
        // USA O METODO 2 PRA CORRIGIR O /USERS PRA FUNCIONAR DEPOIS
        try {
          await setDoc(
            doc(db, "users", uid),
            { owner_id: ownerUid, gym_id: gymId },
            { merge: true }
          );
        } catch {
        }
        return { ownerUid, gymId };
      }
    }
  } catch {
  }

  return null;
}

// LISTA TRAINERS - OWNER
export async function getTrainers(gymId: string): Promise<Trainer[]> {
  const trainersRef = collection(db, "academies", gymId, "teachers");
  const snapshot = await getDocs(trainersRef);

  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    uid: doc.id,
  })) as Trainer[];
}
