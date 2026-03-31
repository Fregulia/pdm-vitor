import { db } from "@/services/firebase";
import { doc, getDoc } from "firebase/firestore";

// BUSCA A FOTO DE PERFIL DE UM USUÁRIO PELO UID - MONTAGEM DE CHAT
export async function getUserPhotoUrl(uid: string): Promise<string | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? userDoc.data()?.photoUrl || null : null;
  } catch {
    return null;
  }
}

// BUSCA AS FOTOS DE PERFIL DE VÁRIOS USUÁRIOS DE UMA SÓ VEZ - CHAT
export async function getUsersPhotoUrls(
  uids: string[]
): Promise<Record<string, string | null>> {
  const result: Record<string, string | null> = {};
  await Promise.all(
    uids.map(async (uid) => {
      result[uid] = await getUserPhotoUrl(uid);
    })
  );
  return result;
}
