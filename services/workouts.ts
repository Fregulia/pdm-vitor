import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: string; // Ex: "12", "10-12", "até a falha"
  rest: string; // Ex: "60s", "1-2min"
  notes?: string;
}

export interface Workout {
  id: string;
  gymId: string;
  trainerId: string;
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutInput {
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
}

/**
 * Busca todos os treinos de uma academia
 */
export async function getWorkouts(gymId: string): Promise<Workout[]> {
  const workoutsRef = collection(db, "academies", gymId, "workouts");
  const q = query(workoutsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      gymId,
      trainerId: data.trainerId,
      name: data.name,
      description: data.description,
      exercises: data.exercises || [],
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  });
}

/**
 * Busca um treino específico pelo ID
 */
export async function getWorkoutById(
  gymId: string,
  workoutId: string
): Promise<Workout | null> {
  const workoutRef = doc(db, "academies", gymId, "workouts", workoutId);
  const snapshot = await getDoc(workoutRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  return {
    id: snapshot.id,
    gymId,
    trainerId: data.trainerId,
    name: data.name,
    description: data.description,
    exercises: data.exercises || [],
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}

/**
 * Busca todos os treinos de um trainer específico
 */
export async function getWorkoutsByTrainer(
  gymId: string,
  trainerId: string
): Promise<Workout[]> {
  const workoutsRef = collection(db, "academies", gymId, "workouts");
  const q = query(
    workoutsRef,
    where("trainerId", "==", trainerId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      gymId,
      trainerId: data.trainerId,
      name: data.name,
      description: data.description,
      exercises: data.exercises || [],
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  });
}

/**
 * Cria um novo treino
 */
export async function createWorkout(
  gymId: string,
  trainerId: string,
  workoutData: WorkoutInput
): Promise<string> {
  const workoutsRef = collection(db, "academies", gymId, "workouts");

  const now = Timestamp.now();
  const docRef = await addDoc(workoutsRef, {
    trainerId,
    name: workoutData.name,
    description: workoutData.description || "",
    exercises: workoutData.exercises,
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}

/**
 * Atualiza um treino existente
 */
export async function updateWorkout(
  gymId: string,
  workoutId: string,
  workoutData: WorkoutInput
): Promise<void> {
  const workoutRef = doc(db, "academies", gymId, "workouts", workoutId);

  await updateDoc(workoutRef, {
    name: workoutData.name,
    description: workoutData.description || "",
    exercises: workoutData.exercises,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Deleta um treino
 */
export async function deleteWorkout(
  gymId: string,
  workoutId: string
): Promise<void> {
  const workoutRef = doc(db, "academies", gymId, "workouts", workoutId);
  await deleteDoc(workoutRef);
}
