// COMPONENTES
import { BackButton } from "@/components/BackButton";
import { UserAvatar } from "@/components/UserAvatar";

// CONSTANTES
import { Colors } from "@/constants/theme";

// CONTEXTOS E HOOKS
import { useColorScheme } from "@/hooks/use-color-scheme";

// SERVIÇOS
import { Class, addStudentsToClass } from "@/services/classes";
import { db } from "@/services/firebase";
import { Student } from "@/services/students";
import { Trainer } from "@/services/trainers";

// BIBLIOTECAS EXTERNAS
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function StudentProfileScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const params = useLocalSearchParams();
  const { studentId, gymId } = params as { studentId: string; gymId: string };
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [studentClasses, setStudentClasses] = useState<Class[]>([]);
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  useEffect(() => {
    loadStudentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, gymId]);

  async function loadStudentData() {
    if (!studentId || !gymId) return;
    setLoading(true);
    try {
      // Carrega dados do aluno
      const studentDoc = await getDoc(
        doc(db, "academies", gymId, "students", studentId)
      );
      if (studentDoc.exists()) {
        const studentData = {
          ...studentDoc.data(),
          uid: studentDoc.id,
        } as Student;
        setStudent(studentData);

        // Carrega dados do trainer responsável
        if (studentData.trainer_id) {
          const trainerDoc = await getDoc(
            doc(db, "academies", gymId, "teachers", studentData.trainer_id)
          );
          if (trainerDoc.exists()) {
            setTrainer({ ...trainerDoc.data(), uid: trainerDoc.id } as Trainer);
          }
        }
      }

      // Carrega lista de trainers para o modal
      const trainersSnap = await getDocs(
        collection(db, "academies", gymId, "teachers")
      );
      const trainersData = trainersSnap.docs.map(
        (d) => ({ ...d.data(), uid: d.id } as Trainer)
      );
      setTrainers(trainersData);

      // Carrega turmas do aluno
      const classesSnap = await getDocs(
        collection(db, "academies", gymId, "classes")
      );
      const allClasses = classesSnap.docs.map(
        (d) => ({ ...d.data(), id: d.id } as Class)
      );

      // Filtra turmas em que o aluno está matriculado
      const enrolled = allClasses.filter(
        (c) => c.students && c.students.includes(studentId)
      );
      setStudentClasses(enrolled);

      // Turmas disponíveis (que o aluno NÃO está matriculado)
      const available = allClasses.filter(
        (c) => !c.students || !c.students.includes(studentId)
      );
      setAvailableClasses(available);
    } catch (error) {
      console.error("Erro ao carregar dados do aluno:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados do aluno.");
    } finally {
      setLoading(false);
    }
  }

  async function handleChangeTrainer(newTrainerId: string) {
    if (!studentId || !gymId) return;
    try {
      await updateDoc(doc(db, "academies", gymId, "students", studentId), {
        trainer_id: newTrainerId,
      });
      Alert.alert("Sucesso", "Professor responsável atualizado!");
      setShowTrainerModal(false);
      loadStudentData(); // Recarrega os dados
    } catch (error) {
      console.error("Erro ao atualizar professor:", error);
      Alert.alert("Erro", "Não foi possível atualizar o professor.");
    }
  }

  async function handleEnrollInClass(classId: string) {
    if (!studentId || !gymId) return;
    try {
      await addStudentsToClass(gymId, classId, [studentId]);
      Alert.alert("Sucesso", "Aluno matriculado na turma!");
      setShowEnrollModal(false);
      loadStudentData(); // Recarrega os dados
    } catch (error) {
      console.error("Erro ao matricular aluno:", error);
      Alert.alert("Erro", "Não foi possível matricular o aluno.");
    }
  }

  const getDayLabel = (day: string) => {
    const days: Record<string, string> = {
      monday: "Segunda",
      tuesday: "Terça",
      wednesday: "Quarta",
      thursday: "Quinta",
      friday: "Sexta",
      saturday: "Sábado",
      sunday: "Domingo",
    };
    return days[day] || day;
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors[colorScheme].background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      </View>
    );
  }

  if (!student) {
    return (
      <View
        style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}
      >
        <BackButton />
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{ color: Colors[colorScheme].text, textAlign: "center" }}
          >
            Aluno não encontrado
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <BackButton />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 10,
          paddingBottom: 40,
          paddingHorizontal: 16,
        }}
      >
        {/* HEADER COM AVATAR */}
        <View style={styles.headerSection}>
          <View
            style={[
              styles.avatarContainer,
              { backgroundColor: Colors[colorScheme].card },
            ]}
          >
            <UserAvatar name={student.name} size={100} />
          </View>
          <Text
            style={[styles.studentName, { color: Colors[colorScheme].text }]}
          >
            {student.name}
          </Text>
          {student.email && (
            <View style={styles.emailContainer}>
              <Ionicons
                name="mail-outline"
                size={16}
                color={Colors[colorScheme].secondaryText}
              />
              <Text
                style={[
                  styles.studentEmail,
                  { color: Colors[colorScheme].secondaryText },
                ]}
              >
                {student.email}
              </Text>
            </View>
          )}
        </View>

        {/* INFORMAÇÕES PRINCIPAIS */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionLabel,
              { color: Colors[colorScheme].secondaryText },
            ]}
          >
            INFORMAÇÕES DO ALUNO
          </Text>

          <View
            style={[
              styles.infoCard,
              { backgroundColor: Colors[colorScheme].card },
            ]}
          >
            {/* Professor Responsável */}
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <View
                  style={[
                    styles.infoIconContainer,
                    { backgroundColor: Colors[colorScheme].tint + "20" },
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={Colors[colorScheme].tint}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.infoLabel,
                      { color: Colors[colorScheme].secondaryText },
                    ]}
                  >
                    Professor Responsável
                  </Text>
                  <Text
                    style={[
                      styles.infoValue,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    {trainer?.name || "Não atribuído"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowTrainerModal(true)}>
                <Ionicons
                  name="pencil"
                  size={20}
                  color={Colors[colorScheme].tint}
                />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.divider,
                { backgroundColor: Colors[colorScheme].border },
              ]}
            />

            {/* Data de Cadastro */}
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <View
                  style={[
                    styles.infoIconContainer,
                    { backgroundColor: Colors[colorScheme].tint + "20" },
                  ]}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={Colors[colorScheme].tint}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.infoLabel,
                      { color: Colors[colorScheme].secondaryText },
                    ]}
                  >
                    Membro desde
                  </Text>
                  <Text
                    style={[
                      styles.infoValue,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    {student.createdAt
                      ? new Date(student.createdAt).toLocaleDateString("pt-BR")
                      : "Data não disponível"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* TURMAS DO ALUNO */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionLabel,
              { color: Colors[colorScheme].secondaryText },
            ]}
          >
            TURMAS MATRICULADAS
          </Text>

          {studentClasses.length === 0 ? (
            <View
              style={[
                styles.infoCard,
                { backgroundColor: Colors[colorScheme].card },
              ]}
            >
              <View style={{ alignItems: "center", paddingVertical: 16 }}>
                <Ionicons
                  name="school-outline"
                  size={48}
                  color={Colors[colorScheme].secondaryText}
                  style={{ marginBottom: 12 }}
                />
                <Text
                  style={{
                    fontSize: 16,
                    color: Colors[colorScheme].secondaryText,
                    textAlign: "center",
                  }}
                >
                  Aluno não está matriculado em nenhuma turma
                </Text>
              </View>
            </View>
          ) : (
            <View
              style={[
                styles.optionsCard,
                { backgroundColor: Colors[colorScheme].card },
              ]}
            >
              {studentClasses.map((classItem, index) => (
                <View
                  key={classItem.id}
                  style={[
                    styles.classItem,
                    {
                      borderBottomWidth:
                        index < studentClasses.length - 1 ? 1 : 0,
                      borderBottomColor: Colors[colorScheme].border,
                    },
                  ]}
                >
                  <View style={styles.classLeft}>
                    <View
                      style={[
                        styles.classIconContainer,
                        { backgroundColor: Colors[colorScheme].tint + "20" },
                      ]}
                    >
                      <Ionicons
                        name="school"
                        size={24}
                        color={Colors[colorScheme].tint}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.classTitle,
                          { color: Colors[colorScheme].text },
                        ]}
                      >
                        {classItem.title}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                          marginTop: 4,
                        }}
                      >
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Ionicons
                            name="calendar-outline"
                            size={14}
                            color={Colors[colorScheme].secondaryText}
                          />
                          <Text
                            style={[
                              styles.classInfo,
                              { color: Colors[colorScheme].secondaryText },
                            ]}
                          >
                            {" "}
                            {getDayLabel(classItem.dayOfWeek)}
                          </Text>
                        </View>
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Ionicons
                            name="time-outline"
                            size={14}
                            color={Colors[colorScheme].secondaryText}
                          />
                          <Text
                            style={[
                              styles.classInfo,
                              { color: Colors[colorScheme].secondaryText },
                            ]}
                          >
                            {" "}
                            {classItem.startTime} - {classItem.endTime}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* AÇÕES RÁPIDAS */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionLabel,
              { color: Colors[colorScheme].secondaryText },
            ]}
          >
            AÇÕES RÁPIDAS
          </Text>

          <View
            style={[
              styles.optionsCard,
              { backgroundColor: Colors[colorScheme].card },
            ]}
          >
            {/* Matricular em Turma */}
            <TouchableOpacity
              style={[
                styles.optionItem,
                { borderBottomColor: Colors[colorScheme].border },
              ]}
              onPress={() => setShowEnrollModal(true)}
            >
              <View style={styles.optionLeft}>
                <View
                  style={[
                    styles.optionIconContainer,
                    { backgroundColor: Colors[colorScheme].tint + "20" },
                  ]}
                >
                  <Ionicons
                    name="school-outline"
                    size={24}
                    color={Colors[colorScheme].tint}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.optionTitle,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    Matricular em Turma
                  </Text>
                  <Text
                    style={[
                      styles.optionDescription,
                      { color: Colors[colorScheme].secondaryText },
                    ]}
                  >
                    Adicione o aluno a uma turma
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors[colorScheme].secondaryText}
              />
            </TouchableOpacity>

            {/* Registrar Pagamento */}
            <TouchableOpacity
              style={[
                styles.optionItem,
                { borderBottomColor: Colors[colorScheme].border },
              ]}
              onPress={() => {
                Alert.alert(
                  "Em desenvolvimento",
                  "Funcionalidade de registro de pagamentos será implementada em breve."
                );
              }}
            >
              <View style={styles.optionLeft}>
                <View
                  style={[
                    styles.optionIconContainer,
                    { backgroundColor: "#34C75920" },
                  ]}
                >
                  <Ionicons name="cash-outline" size={24} color="#34C759" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.optionTitle,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    Registrar Pagamento
                  </Text>
                  <Text
                    style={[
                      styles.optionDescription,
                      { color: Colors[colorScheme].secondaryText },
                    ]}
                  >
                    Lance um novo pagamento
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors[colorScheme].secondaryText}
              />
            </TouchableOpacity>

            {/* Histórico de Presença */}
            <TouchableOpacity
              style={[
                styles.optionItem,
                { borderBottomColor: Colors[colorScheme].border },
              ]}
              onPress={() => {
                Alert.alert(
                  "Em desenvolvimento",
                  "Funcionalidade de histórico de presença será implementada em breve."
                );
              }}
            >
              <View style={styles.optionLeft}>
                <View
                  style={[
                    styles.optionIconContainer,
                    { backgroundColor: "#5856D620" },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={24}
                    color="#5856D6"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.optionTitle,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    Histórico de Presença
                  </Text>
                  <Text
                    style={[
                      styles.optionDescription,
                      { color: Colors[colorScheme].secondaryText },
                    ]}
                  >
                    Veja o registro de presenças
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors[colorScheme].secondaryText}
              />
            </TouchableOpacity>

            {/* Histórico de Pagamentos */}
            <TouchableOpacity
              style={[styles.optionItem, { borderBottomWidth: 0 }]}
              onPress={() => {
                Alert.alert(
                  "Em desenvolvimento",
                  "Funcionalidade de histórico de pagamentos será implementada em breve."
                );
              }}
            >
              <View style={styles.optionLeft}>
                <View
                  style={[
                    styles.optionIconContainer,
                    { backgroundColor: "#FF9F0A20" },
                  ]}
                >
                  <Ionicons name="wallet-outline" size={24} color="#FF9F0A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.optionTitle,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    Histórico de Pagamentos
                  </Text>
                  <Text
                    style={[
                      styles.optionDescription,
                      { color: Colors[colorScheme].secondaryText },
                    ]}
                  >
                    Consulte pagamentos realizados
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors[colorScheme].secondaryText}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* MODAL DE MATRÍCULA EM TURMA */}
      <Modal
        visible={showEnrollModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEnrollModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: Colors[colorScheme].card },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[styles.modalTitle, { color: Colors[colorScheme].text }]}
              >
                Matricular em Turma
              </Text>
              <TouchableOpacity onPress={() => setShowEnrollModal(false)}>
                <Ionicons
                  name="close"
                  size={28}
                  color={Colors[colorScheme].text}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.trainerList}>
              {availableClasses.length === 0 ? (
                <View style={{ padding: 20, alignItems: "center" }}>
                  <Ionicons
                    name="school-outline"
                    size={48}
                    color={Colors[colorScheme].secondaryText}
                    style={{ marginBottom: 12 }}
                  />
                  <Text
                    style={{
                      fontSize: 16,
                      color: Colors[colorScheme].secondaryText,
                      textAlign: "center",
                    }}
                  >
                    Não há turmas disponíveis para matrícula
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: Colors[colorScheme].secondaryText,
                      textAlign: "center",
                      marginTop: 8,
                    }}
                  >
                    O aluno já está matriculado em todas as turmas
                  </Text>
                </View>
              ) : (
                availableClasses.map((classItem) => (
                  <TouchableOpacity
                    key={classItem.id}
                    style={[
                      styles.trainerItem,
                      { borderBottomColor: Colors[colorScheme].border },
                    ]}
                    onPress={() => handleEnrollInClass(classItem.id)}
                  >
                    <View
                      style={[
                        styles.classIconContainer,
                        { backgroundColor: Colors[colorScheme].tint + "20" },
                      ]}
                    >
                      <Ionicons
                        name="school"
                        size={24}
                        color={Colors[colorScheme].tint}
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text
                        style={[
                          styles.trainerName,
                          { color: Colors[colorScheme].text },
                        ]}
                      >
                        {classItem.title}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                          marginTop: 4,
                        }}
                      >
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Ionicons
                            name="calendar-outline"
                            size={12}
                            color={Colors[colorScheme].secondaryText}
                          />
                          <Text
                            style={[
                              styles.trainerBio,
                              { color: Colors[colorScheme].secondaryText },
                            ]}
                          >
                            {" "}
                            {getDayLabel(classItem.dayOfWeek)}
                          </Text>
                        </View>
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Ionicons
                            name="time-outline"
                            size={12}
                            color={Colors[colorScheme].secondaryText}
                          />
                          <Text
                            style={[
                              styles.trainerBio,
                              { color: Colors[colorScheme].secondaryText },
                            ]}
                          >
                            {" "}
                            {classItem.startTime} - {classItem.endTime}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Ionicons
                      name="add-circle"
                      size={24}
                      color={Colors[colorScheme].tint}
                    />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL DE SELEÇÃO DE PROFESSOR */}
      <Modal
        visible={showTrainerModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTrainerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: Colors[colorScheme].card },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[styles.modalTitle, { color: Colors[colorScheme].text }]}
              >
                Selecionar Professor
              </Text>
              <TouchableOpacity onPress={() => setShowTrainerModal(false)}>
                <Ionicons
                  name="close"
                  size={28}
                  color={Colors[colorScheme].text}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.trainerList}>
              {trainers.map((t) => (
                <TouchableOpacity
                  key={t.uid}
                  style={[
                    styles.trainerItem,
                    { borderBottomColor: Colors[colorScheme].border },
                  ]}
                  onPress={() => t.uid && handleChangeTrainer(t.uid)}
                >
                  <UserAvatar name={t.name} size={40} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text
                      style={[
                        styles.trainerName,
                        { color: Colors[colorScheme].text },
                      ]}
                    >
                      {t.name}
                    </Text>
                    {t.bio && (
                      <Text
                        style={[
                          styles.trainerBio,
                          { color: Colors[colorScheme].secondaryText },
                        ]}
                        numberOfLines={1}
                      >
                        {t.bio}
                      </Text>
                    )}
                  </View>
                  {student.trainer_id === t.uid && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={Colors[colorScheme].tint}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  avatarContainer: {
    padding: 4,
    borderRadius: 60,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  studentName: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  studentEmail: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  optionsCard: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  trainerList: {
    padding: 16,
  },
  trainerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  trainerName: {
    fontSize: 16,
    fontWeight: "600",
  },
  trainerBio: {
    fontSize: 13,
    marginTop: 2,
  },
  classItem: {
    padding: 16,
  },
  classLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  classIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  classTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  classInfo: {
    fontSize: 13,
  },
});
