import { BackButton } from "@/components/BackButton";
import { UserAvatar } from "@/components/UserAvatar";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Class, getClassById } from "@/services/classes";
import { auth, db } from "@/services/firebase";
import { Student } from "@/services/students";
import {
  assignWorkoutToStudent,
  getWorkoutAssignmentsByClass,
  WorkoutAssignment,
} from "@/services/workoutAssignments";
import { getWorkoutsByTrainer } from "@/services/workouts";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Helper para converter dia da semana para português
function getDayLabel(day: string): string {
  const days: Record<string, string> = {
    monday: "Segunda-feira",
    tuesday: "Terça-feira",
    wednesday: "Quarta-feira",
    thursday: "Quinta-feira",
    friday: "Sexta-feira",
    saturday: "Sábado",
    sunday: "Domingo",
  };
  return days[day] || day;
}

export default function TrainerClassDetailScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { classId, gymId } = useLocalSearchParams<{
    classId: string;
    gymId: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<WorkoutAssignment[]>([]);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [showWorkoutPicker, setShowWorkoutPicker] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [trainerId, setTrainerId] = useState<string>("");

  const loadTrainerData = useCallback(async () => {
    try {
      // Buscar o ID do trainer logado
      const user = auth.currentUser;
      if (!user || !gymId) return;

      setTrainerId(user.uid);

      // Carregar treinos do trainer
      const trainerWorkouts = await getWorkoutsByTrainer(gymId, user.uid);
      setWorkouts(trainerWorkouts);
    } catch (error) {
      console.error("Erro ao carregar dados do trainer:", error);
    }
  }, [gymId]);

  const loadData = useCallback(async () => {
    if (!classId || !gymId) return;

    try {
      setLoading(true);

      // Carregar dados da turma
      const classInfo = await getClassById(gymId, classId);
      setClassData(classInfo);

      // Carregar atribuições de treino
      const classAssignments = await getWorkoutAssignmentsByClass(
        gymId,
        classId
      );
      setAssignments(classAssignments);

      // Carregar dados dos alunos
      if (classInfo?.students && classInfo.students.length > 0) {
        const studentPromises = classInfo.students.map(async (studentId) => {
          const studentDoc = await getDoc(
            doc(db, "academies", gymId, "students", studentId)
          );
          if (studentDoc.exists()) {
            return {
              uid: studentDoc.id,
              ...studentDoc.data(),
            } as Student;
          }
          return null;
        });

        const loadedStudents = (await Promise.all(studentPromises)).filter(
          (s) => s !== null
        ) as Student[];
        setStudents(loadedStudents);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Erro ao carregar turma:", error);
    } finally {
      setLoading(false);
    }
  }, [classId, gymId]);

  useEffect(() => {
    loadData();
    loadTrainerData();
  }, [loadData, loadTrainerData]);

  const handleAssignWorkout = (student: Student) => {
    if (workouts.length === 0) {
      Alert.alert(
        "Nenhum treino disponível",
        "Você ainda não criou nenhum plano de treino. Crie um plano antes de atribuir aos alunos."
      );
      return;
    }
    setSelectedStudent(student);
    setShowWorkoutPicker(true);
  };

  const handleSelectWorkout = async (workoutId: string) => {
    if (!selectedStudent || !gymId || !classId || !trainerId) return;

    try {
      await assignWorkoutToStudent(
        gymId,
        trainerId,
        workoutId,
        classId,
        selectedStudent.uid
      );

      Alert.alert("Sucesso", "Plano de treino atribuído com sucesso!");
      setShowWorkoutPicker(false);
      setSelectedStudent(null);

      // Recarregar atribuições
      const classAssignments = await getWorkoutAssignmentsByClass(
        gymId,
        classId
      );
      setAssignments(classAssignments);
    } catch (error) {
      console.error("Erro ao atribuir treino:", error);
      Alert.alert("Erro", "Não foi possível atribuir o plano de treino");
    }
  };

  const getAssignedWorkout = (studentId: string) => {
    return assignments.find((a) => a.studentId === studentId);
  };

  const getWorkoutName = (workoutId: string) => {
    const workout = workouts.find((w) => w.id === workoutId);
    return workout?.name || "Treino não encontrado";
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: Colors[colorScheme].background },
        ]}
      >
        <BackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
        </View>
      </SafeAreaView>
    );
  }

  if (!classData) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: Colors[colorScheme].background },
        ]}
      >
        <BackButton />
        <View style={styles.loadingContainer}>
          <Text style={{ color: Colors[colorScheme].text }}>
            Turma não encontrada
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <BackButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: Colors[colorScheme].tint + "20" },
            ]}
          >
            <Ionicons
              name="calendar"
              size={32}
              color={Colors[colorScheme].tint}
            />
          </View>
          <Text style={[styles.title, { color: Colors[colorScheme].text }]}>
            {classData.title}
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: Colors[colorScheme].secondaryText },
            ]}
          >
            {classData.description}
          </Text>
        </View>

        {/* Informações da Turma */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: Colors[colorScheme].card,
              borderColor: Colors[colorScheme].border,
            },
          ]}
        >
          <Text
            style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}
          >
            Informações
          </Text>

          <View style={styles.infoRow}>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={Colors[colorScheme].tint}
            />
            <View style={styles.infoText}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: Colors[colorScheme].secondaryText },
                ]}
              >
                Dia da Semana
              </Text>
              <Text
                style={[styles.infoValue, { color: Colors[colorScheme].text }]}
              >
                {getDayLabel(classData.dayOfWeek)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name="time-outline"
              size={20}
              color={Colors[colorScheme].tint}
            />
            <View style={styles.infoText}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: Colors[colorScheme].secondaryText },
                ]}
              >
                Horário
              </Text>
              <Text
                style={[styles.infoValue, { color: Colors[colorScheme].text }]}
              >
                {classData.startTime} - {classData.endTime}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name="people-outline"
              size={20}
              color={Colors[colorScheme].tint}
            />
            <View style={styles.infoText}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: Colors[colorScheme].secondaryText },
                ]}
              >
                Total de Alunos
              </Text>
              <Text
                style={[styles.infoValue, { color: Colors[colorScheme].text }]}
              >
                {students.length} aluno(s)
              </Text>
            </View>
          </View>
        </View>

        {/* Lista de Alunos */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: Colors[colorScheme].card,
              borderColor: Colors[colorScheme].border,
            },
          ]}
        >
          <Text
            style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}
          >
            Alunos Matriculados
          </Text>

          {students.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="people-outline"
                size={48}
                color={Colors[colorScheme].secondaryText}
                style={{ opacity: 0.3, marginBottom: 12 }}
              />
              <Text
                style={[
                  styles.emptyText,
                  { color: Colors[colorScheme].secondaryText },
                ]}
              >
                Nenhum aluno matriculado ainda
              </Text>
            </View>
          ) : (
            students.map((student, index) => {
              const assignment = getAssignedWorkout(student.uid);
              return (
                <View key={student.uid}>
                  <View style={styles.studentRow}>
                    <UserAvatar name={student.name} size={48} />
                    <View style={styles.studentInfo}>
                      <Text
                        style={[
                          styles.studentName,
                          { color: Colors[colorScheme].text },
                        ]}
                      >
                        {student.name}
                      </Text>
                      {assignment ? (
                        <Text
                          style={[
                            styles.workoutAssigned,
                            { color: Colors[colorScheme].tint },
                          ]}
                        >
                          <Ionicons name="fitness" size={12} />{" "}
                          {getWorkoutName(assignment.workoutId)}
                        </Text>
                      ) : (
                        <Text
                          style={[
                            styles.studentEmail,
                            { color: Colors[colorScheme].secondaryText },
                          ]}
                        >
                          {student.email}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.assignButton,
                        {
                          backgroundColor: assignment
                            ? Colors[colorScheme].card
                            : Colors[colorScheme].tint,
                          borderColor: Colors[colorScheme].border,
                        },
                      ]}
                      onPress={() => handleAssignWorkout(student)}
                    >
                      <Ionicons
                        name={assignment ? "create-outline" : "add"}
                        size={20}
                        color={
                          assignment ? Colors[colorScheme].tint : "#FFFFFF"
                        }
                      />
                    </TouchableOpacity>
                  </View>
                  {index < students.length - 1 && (
                    <View
                      style={[
                        styles.divider,
                        { backgroundColor: Colors[colorScheme].border },
                      ]}
                    />
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Modal de Seleção de Treino */}
      <Modal
        visible={showWorkoutPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowWorkoutPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: Colors[colorScheme].background },
            ]}
          >
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: Colors[colorScheme].border },
              ]}
            >
              <Text
                style={[styles.modalTitle, { color: Colors[colorScheme].text }]}
              >
                Selecionar Plano de Treino
              </Text>
              <Text
                style={[
                  styles.modalSubtitle,
                  { color: Colors[colorScheme].secondaryText },
                ]}
              >
                {selectedStudent?.name}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowWorkoutPicker(false)}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={Colors[colorScheme].text}
                />
              </TouchableOpacity>
            </View>

            <FlatList
              data={workouts}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.workoutList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.workoutItem,
                    {
                      backgroundColor: Colors[colorScheme].card,
                      borderColor: Colors[colorScheme].border,
                    },
                  ]}
                  onPress={() => handleSelectWorkout(item.id)}
                >
                  <View
                    style={[
                      styles.workoutIcon,
                      { backgroundColor: Colors[colorScheme].tint + "20" },
                    ]}
                  >
                    <Ionicons
                      name="fitness"
                      size={24}
                      color={Colors[colorScheme].tint}
                    />
                  </View>
                  <View style={styles.workoutInfo}>
                    <Text
                      style={[
                        styles.workoutName,
                        { color: Colors[colorScheme].text },
                      ]}
                    >
                      {item.name}
                    </Text>
                    {item.description && (
                      <Text
                        style={[
                          styles.workoutDescription,
                          { color: Colors[colorScheme].secondaryText },
                        ]}
                      >
                        {item.description}
                      </Text>
                    )}
                    <Text
                      style={[
                        styles.workoutExercises,
                        { color: Colors[colorScheme].secondaryText },
                      ]}
                    >
                      {item.exercises.length} exercício(s)
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={Colors[colorScheme].secondaryText}
                  />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons
                    name="fitness-outline"
                    size={48}
                    color={Colors[colorScheme].secondaryText}
                    style={{ opacity: 0.3, marginBottom: 12 }}
                  />
                  <Text
                    style={[
                      styles.emptyText,
                      { color: Colors[colorScheme].secondaryText },
                    ]}
                  >
                    Nenhum plano de treino criado ainda
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 14,
  },
  workoutAssigned: {
    fontSize: 13,
    fontWeight: "500",
  },
  assignButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  divider: {
    height: 1,
    opacity: 0.1,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    position: "relative",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
  },
  closeButton: {
    position: "absolute",
    right: 20,
    top: 20,
  },
  workoutList: {
    padding: 20,
  },
  workoutItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    gap: 12,
  },
  workoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  workoutDescription: {
    fontSize: 13,
    marginBottom: 4,
  },
  workoutExercises: {
    fontSize: 12,
  },
});
