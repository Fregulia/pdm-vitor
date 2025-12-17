import { db } from "@/services/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

export type PlanValidity = "daily" | "monthly" | "quarterly" | "annual";

export type Plan = {
  id: string;
  gymId: string;
  title: string;
  description: string;
  price: number;
  validity: PlanValidity;
  createdAt?: any;
  updatedAt?: any;
};

export type PlanInput = {
  title: string;
  description: string;
  price: number;
  validity: PlanValidity;
};

export async function getPlans(gymId: string): Promise<Plan[]> {
  const plansRef = collection(db, "academies", gymId, "plans");
  const q = query(plansRef, orderBy("createdAt", "asc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Plan[];
}

export async function createPlan(
  gymId: string,
  planData: PlanInput
): Promise<string> {
  const plansRef = collection(db, "academies", gymId, "plans");
  const docRef = await addDoc(plansRef, {
    gymId,
    ...planData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updatePlan(
  gymId: string,
  planId: string,
  planData: Partial<PlanInput>
): Promise<void> {
  const planRef = doc(db, "academies", gymId, "plans", planId);
  await updateDoc(planRef, {
    ...planData,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePlan(gymId: string, planId: string): Promise<void> {
  const planRef = doc(db, "academies", gymId, "plans", planId);
  await deleteDoc(planRef);
}
