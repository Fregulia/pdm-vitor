import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export interface WorkoutAssignment {
  id: string;
  gymId: string;
  trainerId: string;
  workoutId: string;
  classId: string;
  studentId: string;
  createdAt: Timestamp;
}

/**
 * Atribui um plano de treino a um aluno de uma turma
 */
export async function assignWorkoutToStudent(
  gymId: string,
  trainerId: string,
  workoutId: string,
  classId: string,
  studentId: string
): Promise<string> {
  try {
    // Verificar se já existe uma atribuição para esse aluno nessa turma
    const existingQuery = query(
      collection(db, "academies", gymId, "workout_assignments"),
      where("classId", "==", classId),
      where("studentId", "==", studentId)
    );

    const existingDocs = await getDocs(existingQuery);

    // Se já existe, deletar a antiga antes de criar a nova
    for (const doc of existingDocs.docs) {
      await deleteDoc(doc.ref);
    }

    // Criar nova atribuição
    const docRef = await addDoc(
      collection(db, "academies", gymId, "workout_assignments"),
      {
        gymId,
        trainerId,
        workoutId,
        classId,
        studentId,
        createdAt: serverTimestamp(),
      }
    );

    return docRef.id;
  } catch (error) {
    throw error;
  }
}

/**
 * Remove a atribuição de um plano de treino
 */
export async function removeWorkoutAssignment(
  gymId: string,
  assignmentId: string
): Promise<void> {
  try {
    await deleteDoc(
      doc(db, "academies", gymId, "workout_assignments", assignmentId)
    );
  } catch (error) {
    throw error;
  }
}

/**
 * Busca a atribuição de treino para um aluno em uma turma específica
 */
export async function getWorkoutAssignmentForStudent(
  gymId: string,
  classId: string,
  studentId: string
): Promise<WorkoutAssignment | null> {
  try {
    const q = query(
      collection(db, "academies", gymId, "workout_assignments"),
      where("classId", "==", classId),
      where("studentId", "==", studentId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as WorkoutAssignment;
  } catch {
    return null;
  }
}

/**
 * Busca todas as atribuições de treino de uma turma
 */
export async function getWorkoutAssignmentsByClass(
  gymId: string,
  classId: string
): Promise<WorkoutAssignment[]> {
  try {
    const q = query(
      collection(db, "academies", gymId, "workout_assignments"),
      where("classId", "==", classId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as WorkoutAssignment[];
  } catch {
    return [];
  }
}

/**
 * Busca todas as atribuições de treino de um aluno (em todas as turmas)
 */
export async function getWorkoutAssignmentsByStudent(
  gymId: string,
  studentId: string
): Promise<WorkoutAssignment[]> {
  try {
    const q = query(
      collection(db, "academies", gymId, "workout_assignments"),
      where("studentId", "==", studentId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as WorkoutAssignment[];
  } catch {
    return [];
  }
}

/**
 * Busca o plano de treino completo a partir de um assignment
 */
export async function getWorkoutFromAssignment(
  gymId: string,
  workoutId: string
) {
  try {
    const workoutDoc = await getDoc(
      doc(db, "academies", gymId, "workouts", workoutId)
    );

    if (!workoutDoc.exists()) {
      return null;
    }

    return {
      id: workoutDoc.id,
      ...workoutDoc.data(),
    };
  } catch {
    return null;
  }
}
