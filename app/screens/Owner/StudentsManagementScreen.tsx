import { ThemedButton } from "@/components/ThemedButton";
import { ThemedInput } from "@/components/ThemedInput";
import { UserAvatar } from "@/components/UserAvatar";
import { GlobalStyles } from "@/constants/styles";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getAcademy } from "@/services/academy";
import { db } from "@/services/firebase";
import { createStudentInvite } from "@/services/studentInvites";
import { Student } from "@/services/students";
import { Trainer } from "@/services/trainers";
import { FontAwesome } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
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

export default function StudentsManagementScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { user } = useAuth();

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
      setStudents(studentsData);
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
      <View
        style={[
          GlobalStyles.container,
          {
            backgroundColor: Colors[colorScheme].background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      </View>
    );
  }

  return (
    <View
      style={[
        GlobalStyles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <Text style={[GlobalStyles.title, { color: Colors[colorScheme].text }]}>
        Gerenciar Alunos
      </Text>
      <Text
        style={[
          GlobalStyles.subtitle,
          { color: Colors[colorScheme].secondaryText, marginBottom: 16 },
        ]}
      >
        Gere convites e gerencie seus alunos
      </Text>

      <TouchableOpacity
        style={[
          styles.generateButton,
          { backgroundColor: Colors[colorScheme].tint },
        ]}
        onPress={() => setShowInviteModal(true)}
      >
        <FontAwesome name="plus" size={16} color="#fff" />
        <Text style={styles.generateButtonText}>Gerar Convite para Aluno</Text>
      </TouchableOpacity>

      {students.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ color: Colors[colorScheme].secondaryText }}>
            Nenhum aluno cadastrado ainda.
          </Text>
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => {
            const trainer = trainers.find((t) => t.uid === item.trainer_id);
            return (
              <View
                style={[
                  styles.studentCard,
                  { backgroundColor: Colors[colorScheme].card },
                ]}
              >
                <UserAvatar name={item.name} size={40} />
                <View style={styles.studentInfo}>
                  <Text
                    style={{
                      color: Colors[colorScheme].text,
                      fontWeight: "600",
                      fontSize: 16,
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      color: Colors[colorScheme].secondaryText,
                      fontSize: 14,
                    }}
                  >
                    Professor: {trainer?.name || "N/A"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveStudent(item)}
                  style={styles.removeButton}
                >
                  <FontAwesome
                    name="trash"
                    size={18}
                    color={Colors[colorScheme].secondaryText}
                  />
                </TouchableOpacity>
              </View>
            );
          }}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

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
    </View>
  );
}

const styles = StyleSheet.create({
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  generateButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  studentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  studentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  removeButton: {
    padding: 8,
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
