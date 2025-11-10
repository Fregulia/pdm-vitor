import { db } from "@/services/firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

export type ExerciseCategory =
  | "peito"
  | "costas"
  | "biceps"
  | "triceps"
  | "quadriceps"
  | "panturrilha"
  | "ombros"
  | "posterior"
  | "gluteos";

export interface Exercise {
  id: string;
  gymId: string;
  name: string;
  description: string;
  category: ExerciseCategory;
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Busca todos os exercícios de uma academia
 */
export async function getExercises(gymId: string): Promise<Exercise[]> {
  const exercisesRef = collection(db, "academies", gymId, "exercises");
  const snapshot = await getDocs(exercisesRef);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Exercise[];
}

/**
 * Cria um novo exercício personalizado
 */
export async function createExercise(
  gymId: string,
  exerciseData: {
    name: string;
    description: string;
    category: ExerciseCategory;
  }
): Promise<string> {
  const exercisesRef = collection(db, "academies", gymId, "exercises");

  const docRef = await addDoc(exercisesRef, {
    gymId,
    name: exerciseData.name,
    description: exerciseData.description,
    category: exerciseData.category,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Popula a tabela de exercícios com exercícios padrão
 */
export async function populateDefaultExercises(gymId: string): Promise<void> {
  const defaultExercises = [
    // PEITO
    {
      name: "Supino Reto",
      description: "Exercício básico para desenvolvimento do peitoral maior",
      category: "peito" as ExerciseCategory,
    },
    {
      name: "Supino Inclinado",
      description: "Foca na porção superior do peitoral",
      category: "peito" as ExerciseCategory,
    },
    {
      name: "Crucifixo",
      description: "Exercício de isolamento para o peitoral",
      category: "peito" as ExerciseCategory,
    },
    {
      name: "Flexão de Braço",
      description: "Exercício funcional para peito, tríceps e core",
      category: "peito" as ExerciseCategory,
    },

    // COSTAS
    {
      name: "Remada Curvada",
      description: "Exercício composto para desenvolvimento das costas",
      category: "costas" as ExerciseCategory,
    },
    {
      name: "Pulldown",
      description: "Exercício para desenvolvimento do grande dorsal",
      category: "costas" as ExerciseCategory,
    },
    {
      name: "Remada Sentada",
      description: "Fortalece a região central das costas",
      category: "costas" as ExerciseCategory,
    },
    {
      name: "Barra Fixa",
      description: "Exercício funcional para costas e bíceps",
      category: "costas" as ExerciseCategory,
    },

    // BÍCEPS
    {
      name: "Rosca Direta",
      description: "Exercício básico para bíceps",
      category: "biceps" as ExerciseCategory,
    },
    {
      name: "Rosca Alternada",
      description: "Trabalha os bíceps de forma alternada",
      category: "biceps" as ExerciseCategory,
    },
    {
      name: "Rosca Martelo",
      description: "Foca no braquial e braquiorradial",
      category: "biceps" as ExerciseCategory,
    },
    {
      name: "Rosca Scott",
      description: "Exercício de isolamento para bíceps",
      category: "biceps" as ExerciseCategory,
    },

    // TRÍCEPS
    {
      name: "Tríceps Pulley",
      description: "Exercício básico para tríceps",
      category: "triceps" as ExerciseCategory,
    },
    {
      name: "Tríceps Testa",
      description: "Exercício de isolamento para tríceps",
      category: "triceps" as ExerciseCategory,
    },
    {
      name: "Mergulho em Paralelas",
      description: "Exercício funcional para tríceps e peito",
      category: "triceps" as ExerciseCategory,
    },
    {
      name: "Tríceps Coice",
      description: "Isolamento da porção longa do tríceps",
      category: "triceps" as ExerciseCategory,
    },

    // QUADRÍCEPS
    {
      name: "Agachamento Livre",
      description: "Exercício fundamental para pernas",
      category: "quadriceps" as ExerciseCategory,
    },
    {
      name: "Leg Press",
      description: "Exercício para quadríceps e glúteos",
      category: "quadriceps" as ExerciseCategory,
    },
    {
      name: "Cadeira Extensora",
      description: "Isolamento do quadríceps",
      category: "quadriceps" as ExerciseCategory,
    },
    {
      name: "Afundo",
      description: "Exercício unilateral para pernas",
      category: "quadriceps" as ExerciseCategory,
    },

    // PANTURRILHA
    {
      name: "Panturrilha em Pé",
      description: "Exercício básico para panturrilha",
      category: "panturrilha" as ExerciseCategory,
    },
    {
      name: "Panturrilha Sentado",
      description: "Foca no músculo sóleo",
      category: "panturrilha" as ExerciseCategory,
    },
    {
      name: "Panturrilha no Leg Press",
      description: "Variação no leg press",
      category: "panturrilha" as ExerciseCategory,
    },
    {
      name: "Elevação de Panturrilha Livre",
      description: "Exercício funcional para panturrilha",
      category: "panturrilha" as ExerciseCategory,
    },

    // OMBROS
    {
      name: "Desenvolvimento com Barra",
      description: "Exercício composto para ombros",
      category: "ombros" as ExerciseCategory,
    },
    {
      name: "Elevação Lateral",
      description: "Isolamento do deltoide lateral",
      category: "ombros" as ExerciseCategory,
    },
    {
      name: "Elevação Frontal",
      description: "Trabalha o deltoide anterior",
      category: "ombros" as ExerciseCategory,
    },
    {
      name: "Remada Alta",
      description: "Exercício para ombros e trapézio",
      category: "ombros" as ExerciseCategory,
    },

    // POSTERIOR
    {
      name: "Stiff",
      description: "Exercício para posterior de coxa e lombar",
      category: "posterior" as ExerciseCategory,
    },
    {
      name: "Mesa Flexora",
      description: "Isolamento do posterior de coxa",
      category: "posterior" as ExerciseCategory,
    },
    {
      name: "Levantamento Terra",
      description: "Exercício composto para posterior e lombar",
      category: "posterior" as ExerciseCategory,
    },
    {
      name: "Good Morning",
      description: "Fortalece posterior e lombar",
      category: "posterior" as ExerciseCategory,
    },

    // GLÚTEOS
    {
      name: "Agachamento Sumô",
      description: "Variação de agachamento para glúteos",
      category: "gluteos" as ExerciseCategory,
    },
    {
      name: "Elevação Pélvica",
      description: "Exercício de isolamento para glúteos",
      category: "gluteos" as ExerciseCategory,
    },
    {
      name: "Abdução de Quadril",
      description: "Trabalha glúteo médio",
      category: "gluteos" as ExerciseCategory,
    },
    {
      name: "Coice na Polia",
      description: "Isolamento do glúteo máximo",
      category: "gluteos" as ExerciseCategory,
    },
  ];

  const exercisesRef = collection(db, "academies", gymId, "exercises");

  for (const exercise of defaultExercises) {
    const exerciseId = exercise.name.toLowerCase().replace(/\s+/g, "-");
    const exerciseDoc = {
      gymId,
      ...exercise,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(exercisesRef, exerciseId), exerciseDoc);
  }
}
