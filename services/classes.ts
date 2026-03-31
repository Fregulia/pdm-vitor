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

// TIPOS DA TURMA - OWNER
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

// TIPOS DA TURMA - TRAINER
export interface ClassInput {
  trainerId: string | null;
  title: string;
  description: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  students?: string[];
}

// CRIA TURMA NOVA - FORM DE CRIAÇÃO 
export async function createClass(
  gymId: string,
  // PEGA DADOS DO FORMULÁRIO
  classData: ClassInput
): Promise<string> {
  if (!auth.currentUser) throw new Error("NOT_AUTHENTICATED");

  const classRef = collection(db, "academies", gymId, "classes");
  // DOCUMENTA A TURMA COM OS DADOS DO FORM + DADOS DO OWNER LOGADO
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

// ATUALIZA TURMA - PÁGINA DA TURMA
export async function updateClass(
  gymId: string,
  classId: string,
  updates: Partial<ClassInput>
): Promise<void> {
  if (!auth.currentUser) throw new Error("NOT_AUTHENTICATED");
  // BUSCA O DOC DA TURMA E ATUALIZA COM OS DADOS DO FORM
  const classRef = doc(db, "academies", gymId, "classes", classId);
  await updateDoc(classRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// APAGA TURMA - PÁGINA DA TURMA
export async function deleteClass(
  gymId: string,
  classId: string
): Promise<void> {
  if (!auth.currentUser) throw new Error("NOT_AUTHENTICATED");

  const classRef = doc(db, "academies", gymId, "classes", classId);
  await deleteDoc(classRef);
}

// BUSCA TODAS AS TURMAS - PÁGINA DE TURMAS/MATRICULAS
export async function getClasses(gymId: string): Promise<Class[]> {
  // BUSCA A SUBCOL DE TURMAS PELO ID DE ACADEMIA
  const classesRef = collection(db, "academies", gymId, "classes");
  const q = query(classesRef, orderBy("title", "asc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Class[];
}

// BUSCA TURMA PELO ID - PÁGINA DE DETALHES
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

// ADICIONA ALUNO EM UMA TURMA - PÁGINA DO ALUNO
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

// REMOVE ALUNOS DA TURMA - PÁGINA DE DETALHES DA TURMA
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
  // SÓ FICA OS IDS QUE NÃO SÃO REMOVIDOS
  const updatedStudents = currentStudents.filter(
    (id) => !studentIds.includes(id)
  );

  await updateDoc(classRef, {
    students: updatedStudents,
    updatedAt: serverTimestamp(),
  });
}

// VALIDA HORÁRIO DA TURMA - CRIAÇÃO/ATUALIZAÇÃO DA TURMA
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

  // VERIFICA SE HORÁRIO DE INÍCIO < HORÁRIO DE FIM
  if (startMinutes >= endMinutes) {
    return { valid: false, error: "Horário de início deve ser antes do fim" };
  }

  // VALIDA COM HORÁRIOS DA ACADEMIA
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
