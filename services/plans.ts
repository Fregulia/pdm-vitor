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

// TIPO DE VALIDADE DO PLANO
export type PlanValidity = "daily" | "monthly" | "quarterly" | "annual";

// TIPO DO PLANO
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

// TIPO DE DADOS P FORM
export type PlanInput = {
  title: string;
  description: string;
  price: number;
  validity: PlanValidity;
};

// BUSCA PLANOS DA ACADEMIA - PÁGINA DE PLANOS
export async function getPlans(gymId: string): Promise<Plan[]> {
  const plansRef = collection(db, "academies", gymId, "plans");
  const q = query(plansRef, orderBy("createdAt", "asc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Plan[];
}

// CRIA PLANO - FORM DE CRIAÇÃO
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

// ATUALIZA PLANO - PÁGINA DE DETALHES
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

// DELETA PLANO - PÁGINA DE DETALHES
export async function deletePlan(gymId: string, planId: string): Promise<void> {
  const planRef = doc(db, "academies", gymId, "plans", planId);
  await deleteDoc(planRef);
}
