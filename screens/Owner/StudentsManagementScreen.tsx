import { MenuButton } from "@/components/MenuButton";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedInput } from "@/components/ThemedInput";
import { UserAvatar } from "@/components/UserAvatar";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getAcademy } from "@/services/academy";
import { db } from "@/services/firebase";
import { createStudentInvite } from "@/services/studentInvites";
import { Student, syncStudentData } from "@/services/students";
import { Trainer } from "@/services/trainers";
import { FontAwesome } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
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
import { SafeAreaView } from "react-native-safe-area-context";

export default function StudentsManagementScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [gymId, setGymId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [selectedTrainerId, setSelectedTrainerId] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    if (!user) return;
    setLoading(true);
    try {
      const academy = await getAcademy(user.uid);
      if (!academy) {
        setGymId(null);
        return;
      }
      const gid = (academy as any).id;
      setGymId(gid);

      // Carrega trainers
      const trainersSnap = await getDocs(
        collection(db, "academies", gid, "teachers")
      );
      const trainersData = trainersSnap.docs.map(
        (d) => ({ ...d.data(), uid: d.id } as Trainer)
      );
      setTrainers(trainersData);

      // Carrega students - filtra apenas os que têm uid (cadastro completo)
      const studentsSnap = await getDocs(
        collection(db, "academies", gid, "students")
      );
      const studentsData = studentsSnap.docs
        .map((d) => ({ ...d.data(), uid: d.id } as Student))
        .filter((student) => student.uid && student.name); // Só mostra alunos com cadastro completo

      // Sincroniza dados que podem estar faltando
      for (const student of studentsData) {
        if (!student.name || !student.email || !student.createdAt) {
          await syncStudentData(gid, student.uid);
        }
      }

      // Recarrega os dados após sincronizar
      const updatedStudentsSnap = await getDocs(
        collection(db, "academies", gid, "students")
      );
      const updatedStudentsData = updatedStudentsSnap.docs
        .map((d) => ({ ...d.data(), uid: d.id } as Student))
        .filter((student) => student.uid && student.name);

      setStudents(updatedStudentsData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateInvite() {
    if (!studentName.trim()) {
      Alert.alert("Erro", "Digite o nome do aluno.");
      return;
    }
    if (!selectedTrainerId) {
      Alert.alert("Erro", "Selecione um professor responsável.");
      return;
    }
    if (!user) return;

    setGenerating(true);
    try {
      const code = await createStudentInvite(
        user.uid,
        selectedTrainerId,
        studentName.trim()
      );
      setGeneratedCode(code);
      // Não copia automaticamente - apenas mostra o código
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Erro ao gerar convite.");
    } finally {
      setGenerating(false);
    }
  }

  function handleCloseModal() {
    setShowInviteModal(false);
    setStudentName("");
    setSelectedTrainerId("");
    setGeneratedCode("");
    loadData(); // Recarrega lista
  }

  async function handleCopyCode() {
    if (generatedCode) {
      await Clipboard.setStringAsync(generatedCode);
      Alert.alert("Copiado!", "Código copiado para a área de transferência.");
    }
  }

  async function handleRemoveStudent(student: Student) {
    if (!gymId) return;
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja remover ${student.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(
                doc(db, "academies", gymId, "students", student.uid)
              );
              Alert.alert("Sucesso", `${student.name} foi removido.`);
              loadData();
            } catch {
              Alert.alert("Erro", "Não foi possível remover o aluno.");
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: Colors[colorScheme].background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
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
      <MenuButton />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: Colors[colorScheme].text }]}>
              Alunos
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: Colors[colorScheme].secondaryText },
              ]}
            >
              Gerencie os alunos da academia
            </Text>
          </View>
          <View
            style={[
              styles.countBadge,
              { backgroundColor: Colors[colorScheme].tint },
            ]}
          >
            <Text style={styles.countText}>{students.length}</Text>
          </View>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: Colors[colorScheme].card },
            ]}
          >
            <FontAwesome
              name="graduation-cap"
              size={24}
              color={Colors[colorScheme].tint}
            />
            <Text
              style={[styles.statNumber, { color: Colors[colorScheme].text }]}
            >
              {students.length}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: Colors[colorScheme].secondaryText },
              ]}
            >
              Total
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: Colors[colorScheme].card },
            ]}
          >
            <FontAwesome
              name="user-plus"
              size={24}
              color={Colors[colorScheme].tint}
            />
            <Text
              style={[styles.statNumber, { color: Colors[colorScheme].text }]}
            >
              {
                students.filter((s) => {
                  const created = s.createdAt?.toDate?.();
                  if (!created) return false;
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return created > weekAgo;
                }).length
              }
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: Colors[colorScheme].secondaryText },
              ]}
            >
              Novos (7d)
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: Colors[colorScheme].card },
            ]}
          >
            <FontAwesome
              name="users"
              size={24}
              color={Colors[colorScheme].tint}
            />
            <Text
              style={[styles.statNumber, { color: Colors[colorScheme].text }]}
            >
              {trainers.length}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: Colors[colorScheme].secondaryText },
              ]}
            >
              Professores
            </Text>
          </View>
        </View>

        {/* Seção de convite */}
        <View
          style={[
            styles.inviteSection,
            { backgroundColor: Colors[colorScheme].card },
          ]}
        >
          <View style={styles.inviteSectionContent}>
            <FontAwesome
              name="ticket"
              size={32}
              color={Colors[colorScheme].tint}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text
                style={[
                  styles.inviteSectionTitle,
                  { color: Colors[colorScheme].text },
                ]}
              >
                Convidar Aluno
              </Text>
              <Text
                style={[
                  styles.inviteSectionDesc,
                  { color: Colors[colorScheme].secondaryText },
                ]}
              >
                Gere um código para novo aluno
              </Text>
            </View>
          </View>
          <ThemedButton
            title="Gerar Convite"
            onPress={() => setShowInviteModal(true)}
            icon={<FontAwesome name="plus" size={16} color="#fff" />}
          />
        </View>

        {/* Lista de alunos */}
        <View style={styles.listHeader}>
          <Text
            style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}
          >
            Alunos Cadastrados
          </Text>
          {students.length > 0 && (
            <Text
              style={{ color: Colors[colorScheme].secondaryText, fontSize: 14 }}
            >
              {students.length} {students.length === 1 ? "aluno" : "alunos"}
            </Text>
          )}
        </View>

        {students.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome
              name="graduation-cap"
              size={48}
              color={Colors[colorScheme].secondaryText}
            />
            <Text
              style={[styles.emptyTitle, { color: Colors[colorScheme].text }]}
            >
              Nenhum aluno cadastrado
            </Text>
            <Text
              style={[
                styles.emptyDesc,
                { color: Colors[colorScheme].secondaryText },
              ]}
            >
              Gere um convite para adicionar o primeiro aluno à academia
            </Text>
          </View>
        ) : (
          students.map((student) => {
            const trainer = trainers.find((t) => t.uid === student.trainer_id);
            return (
              <TouchableOpacity
                key={student.uid}
                style={[
                  styles.studentCard,
                  { backgroundColor: Colors[colorScheme].card },
                ]}
                onPress={() =>
                  router.push({
                    pathname: "/student-profile",
                    params: { studentId: student.uid, gymId: gymId! },
                  })
                }
                activeOpacity={0.7}
              >
                <View style={styles.studentHeader}>
                  <UserAvatar name={student.name} size={50} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text
                      style={[
                        styles.studentName,
                        { color: Colors[colorScheme].text },
                      ]}
                    >
                      {student.name}
                    </Text>
                    <View style={styles.studentInfoRow}>
                      <FontAwesome
                        name="envelope"
                        size={12}
                        color={Colors[colorScheme].secondaryText}
                      />
                      <Text
                        style={[
                          styles.studentInfo,
                          { color: Colors[colorScheme].secondaryText },
                        ]}
                      >
                        {student.email || "Email não disponível"}
                      </Text>
                    </View>
                  </View>
                </View>

                {trainer && (
                  <View style={styles.trainerSection}>
                    <Text
                      style={[
                        styles.trainerLabel,
                        { color: Colors[colorScheme].secondaryText },
                      ]}
                    >
                      Professor Responsável
                    </Text>
                    <View style={styles.trainerInfo}>
                      <UserAvatar name={trainer.name} size={32} />
                      <Text
                        style={[
                          styles.trainerName,
                          { color: Colors[colorScheme].text },
                        ]}
                      >
                        {trainer.name}
                      </Text>
                    </View>
                  </View>
                )}

                <View style={styles.studentFooter}>
                  <View style={{ flex: 1 }}>
                    {student.createdAt && (
                      <View style={styles.dateInfo}>
                        <FontAwesome
                          name="calendar"
                          size={12}
                          color={Colors[colorScheme].secondaryText}
                        />
                        <Text
                          style={[
                            styles.dateText,
                            { color: Colors[colorScheme].secondaryText },
                          ]}
                        >
                          Cadastrado em{" "}
                          {student.createdAt
                            ?.toDate?.()
                            .toLocaleDateString("pt-BR") ||
                            "Data não disponível"}
                        </Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveStudent(student)}
                    style={[
                      styles.removeButton,
                      { borderColor: Colors[colorScheme].destructive },
                    ]}
                  >
                    <FontAwesome
                      name="trash"
                      size={14}
                      color={Colors[colorScheme].destructive}
                    />
                    <Text
                      style={[
                        styles.removeButtonText,
                        { color: Colors[colorScheme].destructive },
                      ]}
                    >
                      Remover
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Modal para gerar convite */}
      <Modal
        visible={showInviteModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View
              style={[
                styles.modalContent,
                { backgroundColor: Colors[colorScheme].card },
              ]}
            >
              {!generatedCode ? (
                <>
                  <Text
                    style={[
                      styles.modalTitle,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    Gerar Convite para Aluno
                  </Text>
                  <ScrollView
                    style={{ width: "100%" }}
                    showsVerticalScrollIndicator={false}
                  >
                    <ThemedInput
                      label="Nome do Aluno"
                      value={studentName}
                      onChangeText={setStudentName}
                      placeholder="Digite o nome completo do aluno"
                      containerStyle={{ marginBottom: 16 }}
                    />

                    <Text
                      style={[
                        styles.label,
                        { color: Colors[colorScheme].text },
                      ]}
                    >
                      Professor Responsável
                    </Text>
                    {trainers.length === 0 ? (
                      <Text
                        style={{
                          color: Colors[colorScheme].secondaryText,
                          fontStyle: "italic",
                        }}
                      >
                        Nenhum professor disponível. Cadastre professores
                        primeiro.
                      </Text>
                    ) : (
                      trainers.map((trainer) => (
                        <TouchableOpacity
                          key={trainer.uid}
                          style={[
                            styles.trainerOption,
                            {
                              backgroundColor:
                                selectedTrainerId === trainer.uid
                                  ? Colors[colorScheme].tint + "20"
                                  : Colors[colorScheme].background,
                              borderColor:
                                selectedTrainerId === trainer.uid
                                  ? Colors[colorScheme].tint
                                  : Colors[colorScheme].secondaryText + "40",
                            },
                          ]}
                          onPress={() =>
                            setSelectedTrainerId(trainer.uid || "")
                          }
                        >
                          <Text
                            style={{
                              color: Colors[colorScheme].text,
                              fontWeight:
                                selectedTrainerId === trainer.uid
                                  ? "600"
                                  : "400",
                            }}
                          >
                            {trainer.name}
                          </Text>
                          {selectedTrainerId === trainer.uid && (
                            <FontAwesome
                              name="check"
                              size={16}
                              color={Colors[colorScheme].tint}
                            />
                          )}
                        </TouchableOpacity>
                      ))
                    )}
                  </ScrollView>
                  <View style={styles.modalButtons}>
                    <ThemedButton
                      title="Cancelar"
                      onPress={handleCloseModal}
                      variant="secondary"
                    />
                    <ThemedButton
                      title="Gerar Código"
                      onPress={handleGenerateInvite}
                      variant="primary"
                      loading={generating}
                      disabled={generating}
                    />
                  </View>
                </>
              ) : (
                <View style={styles.generatedCodeContainer}>
                  <Text
                    style={[
                      styles.modalTitle,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    Convite Gerado!
                  </Text>
                  <Text
                    style={[
                      styles.generatedCodeInstructions,
                      { color: Colors[colorScheme].secondaryText },
                    ]}
                  >
                    Envie o código abaixo para o aluno realizar o cadastro.
                  </Text>
                  <View
                    style={[
                      styles.codeDisplay,
                      {
                        backgroundColor: Colors[colorScheme].background,
                        borderColor: Colors[colorScheme].tint,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.codeText,
                        { color: Colors[colorScheme].tint },
                      ]}
                    >
                      {generatedCode}
                    </Text>
                    <TouchableOpacity onPress={handleCopyCode}>
                      <FontAwesome
                        name="copy"
                        size={22}
                        color={Colors[colorScheme].tint}
                      />
                    </TouchableOpacity>
                  </View>

                  <ThemedButton
                    title="Copiar Código"
                    onPress={handleCopyCode}
                    variant="primary"
                    icon={<FontAwesome name="copy" size={16} color="#fff" />}
                    style={{ marginTop: 16 }}
                  />
                  <ThemedButton
                    title="Fechar"
                    onPress={handleCloseModal}
                    variant="secondary"
                    style={{ marginTop: 8 }}
                  />
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  countBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  inviteSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  inviteSectionContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  inviteSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  inviteSectionDesc: {
    fontSize: 14,
    marginTop: 2,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 32,
  },
  studentCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  studentName: {
    fontSize: 18,
    fontWeight: "700",
  },
  studentInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 6,
  },
  studentInfo: {
    fontSize: 14,
  },
  trainerSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.2)",
  },
  trainerLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  trainerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  trainerName: {
    fontSize: 14,
    fontWeight: "500",
  },
  studentFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.2)",
  },
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 12,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContainer: {
    width: "100%",
    maxHeight: "90%",
  },
  modalContent: {
    width: "100%",
    borderRadius: 16,
    padding: 24,
    maxHeight: "100%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  trainerOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 16,
  },
  generatedCodeContainer: {
    alignItems: "center",
    width: "100%",
  },
  generatedCodeInstructions: {
    textAlign: "center",
    marginBottom: 24,
    fontSize: 16,
  },
  codeDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
  },
  codeText: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 2,
  },
});
