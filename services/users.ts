import { db } from "@/services/firebase";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";

export async function getUserPhotoUrl(uid: string): Promise<string | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? userDoc.data()?.photoUrl || null : null;
  } catch {
    return null;
  }
}

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
