import { auth, db } from "@/services/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

// TIPOS
export interface Class {
  id: string;
  gymId: string;
  ownerId: string;
  trainerId: string | null;
  title: string;
  description: string;
  dayOfWeek: string; // "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
  startTime: string; // formato HH:MM
  endTime: string; // formato HH:MM
  students?: string[]; // array de UIDs dos alunos
  createdAt?: any;
  updatedAt?: any;
}

export interface ClassInput {
  trainerId: string | null;
  title: string;
  description: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  students?: string[];
}

/**
 * Cria uma nova turma
 */
export async function createClass(
  gymId: string,
  classData: ClassInput
): Promise<string> {
  if (!auth.currentUser) throw new Error("NOT_AUTHENTICATED");

  const classRef = collection(db, "academies", gymId, "classes");
  const newClass = {
    gymId,
    ownerId: auth.currentUser.uid,
    trainerId: classData.trainerId,
    title: classData.title,
    description: classData.description,
    dayOfWeek: classData.dayOfWeek,
    startTime: classData.startTime,
    endTime: classData.endTime,
    students: classData.students || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(classRef, newClass);
  return docRef.id;
}

/**
 * Atualiza uma turma existente
 */
export async function updateClass(
  gymId: string,
  classId: string,
  updates: Partial<ClassInput>
): Promise<void> {
  if (!auth.currentUser) throw new Error("NOT_AUTHENTICATED");

  const classRef = doc(db, "academies", gymId, "classes", classId);
  await updateDoc(classRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Deleta uma turma
 */
export async function deleteClass(
  gymId: string,
  classId: string
): Promise<void> {
  if (!auth.currentUser) throw new Error("NOT_AUTHENTICATED");

  const classRef = doc(db, "academies", gymId, "classes", classId);
  await deleteDoc(classRef);
}

/**
 * Busca todas as turmas de uma academia
 */
export async function getClasses(gymId: string): Promise<Class[]> {
  const classesRef = collection(db, "academies", gymId, "classes");
  const q = query(classesRef, orderBy("title", "asc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Class[];
}

/**
 * Busca uma turma específica
 */
export async function getClassById(
  gymId: string,
  classId: string
): Promise<Class | null> {
  const classRef = doc(db, "academies", gymId, "classes", classId);
  const snapshot = await getDoc(classRef);

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as Class;
}

/**
 * Adiciona alunos a uma turma
 */
export async function addStudentsToClass(
  gymId: string,
  classId: string,
  studentIds: string[]
): Promise<void> {
  if (!auth.currentUser) throw new Error("NOT_AUTHENTICATED");

  const classRef = doc(db, "academies", gymId, "classes", classId);
  const classSnap = await getDoc(classRef);

  if (!classSnap.exists()) throw new Error("CLASS_NOT_FOUND");

  const currentStudents = (classSnap.data().students || []) as string[];
  const updatedStudents = [...new Set([...currentStudents, ...studentIds])];

  await updateDoc(classRef, {
    students: updatedStudents,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Remove alunos de uma turma
 */
export async function removeStudentsFromClass(
  gymId: string,
  classId: string,
  studentIds: string[]
): Promise<void> {
  if (!auth.currentUser) throw new Error("NOT_AUTHENTICATED");

  const classRef = doc(db, "academies", gymId, "classes", classId);
  const classSnap = await getDoc(classRef);

  if (!classSnap.exists()) throw new Error("CLASS_NOT_FOUND");

  const currentStudents = (classSnap.data().students || []) as string[];
  const updatedStudents = currentStudents.filter(
    (id) => !studentIds.includes(id)
  );

  await updateDoc(classRef, {
    students: updatedStudents,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Valida se o horário está dentro do funcionamento da academia
 */
export function validateClassTime(
  startTime: string,
  endTime: string,
  academyHours: {
    weekdays: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string };
  }
): { valid: boolean; error?: string } {
  // Converte HH:MM para minutos
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  // Verifica se horário de início é antes do fim
  if (startMinutes >= endMinutes) {
    return { valid: false, error: "Horário de início deve ser antes do fim" };
  }

  // Valida contra horário da semana (mais restritivo)
  const weekdayOpenMinutes = timeToMinutes(academyHours.weekdays.open);
  const weekdayCloseMinutes = timeToMinutes(academyHours.weekdays.close);

  if (startMinutes < weekdayOpenMinutes || endMinutes > weekdayCloseMinutes) {
    return {
      valid: false,
      error: `Horário deve estar entre ${academyHours.weekdays.open} e ${academyHours.weekdays.close}`,
    };
  }

  return { valid: true };
}
