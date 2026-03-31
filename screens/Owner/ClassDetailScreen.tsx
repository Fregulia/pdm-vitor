// COMPONENTES
import { BackButton } from "@/components/BackButton";
import { ThemedButton } from "@/components/ThemedButton";
import { UserAvatar } from "@/components/UserAvatar";

// CONSTANTES
import { Colors } from "@/constants/theme";

// CONTEXTOS E HOOKS
import { useColorScheme } from "@/hooks/use-color-scheme";

// SERVIÇOS
import {
  Class,
  deleteClass,
  getClassById,
  removeStudentsFromClass,
} from "@/services/classes";
import { db } from "@/services/firebase";

// BIBLIOTECAS EXTERNAS
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Student {
  uid: string;
  name: string;
}

export default function ClassDetailScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const classId = params.classId as string;
  const gymId = params.gymId as string;

  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [trainerName, setTrainerName] = useState<string>("Professor");

  const getDayLabel = (day: string) => {
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
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getClassById(gymId, classId);
      if (data) {
        setClassData(data);

        // Carrega informações dos alunos
        if (data.students && data.students.length > 0) {
          const studentsRef = collection(db, "academies", gymId, "students");
          const studentsSnapshot = await getDocs(studentsRef);
          const studentsData = studentsSnapshot.docs
            .filter((doc) => data.students?.includes(doc.id))
            .map((doc) => ({
              uid: doc.id,
              name: doc.data().name || "Aluno",
            }));
          setStudents(studentsData);
        }

        // Carrega nome do professor
        if (data.trainerId) {
          try {
            const teachersRef = collection(db, "academies", gymId, "teachers");
            const teachersSnapshot = await getDocs(teachersRef);
            const teacher = teachersSnapshot.docs.find(
              (doc) => doc.id === data.trainerId
            );
            if (teacher) {
              setTrainerName(teacher.data().name || "Professor");
            }
          } catch (err) {
            console.error("Erro ao carregar professor:", err);
          }
        } else {
          setTrainerName("Não atribuído");
        }
      }
    } catch (error) {
      console.error("Erro ao carregar turma:", error);
      Alert.alert("Erro", "Não foi possível carregar a turma");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Excluir Turma",
      `Tem certeza que deseja excluir a turma "${classData?.title}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteClass(gymId, classId);
              Alert.alert("Sucesso", "Turma excluída com sucesso");
              router.back();
            } catch (error) {
              Alert.alert("Erro", "Não foi possível excluir a turma");
            }
          },
        },
      ]
    );
  };

  const handleRemoveStudent = (studentUid: string, studentName: string) => {
    Alert.alert("Remover Aluno", `Remover ${studentName} da turma?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            await removeStudentsFromClass(gymId, classId, [studentUid]);
            await loadData();
            Alert.alert("Sucesso", "Aluno removido da turma");
          } catch (error) {
            Alert.alert("Erro", "Não foi possível remover o aluno");
          }
        },
      },
    ]);
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

  if (!classData) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors[colorScheme].background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: Colors[colorScheme].text }}>
          Turma não encontrada
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <BackButton />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingTop: insets.top + 60 }}
      >
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "700",
              color: Colors[colorScheme].text,
              marginBottom: 8,
            }}
          >
            {classData.title}
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: Colors[colorScheme].secondaryText,
              lineHeight: 24,
            }}
          >
            {classData.description}
          </Text>
        </View>

        {/* Info Cards */}
        <View
          style={{
            backgroundColor: Colors[colorScheme].card,
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
            gap: 16,
          }}
        >
          {/* Dia da Semana */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: Colors[colorScheme].tint + "20",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Ionicons
                name="calendar"
                size={20}
                color={Colors[colorScheme].tint}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: Colors[colorScheme].secondaryText,
                  marginBottom: 2,
                }}
              >
                Dia da Semana
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: Colors[colorScheme].text,
                }}
              >
                {getDayLabel(classData.dayOfWeek)}
              </Text>
            </View>
          </View>

          {/* Horário */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: Colors[colorScheme].tint + "20",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Ionicons
                name="time"
                size={20}
                color={Colors[colorScheme].tint}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: Colors[colorScheme].secondaryText,
                  marginBottom: 2,
                }}
              >
                Horário
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: Colors[colorScheme].text,
                }}
              >
                {classData.startTime} - {classData.endTime}
              </Text>
            </View>
          </View>

          {/* Professor */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: Colors[colorScheme].tint + "20",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Ionicons
                name="person"
                size={20}
                color={Colors[colorScheme].tint}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: Colors[colorScheme].secondaryText,
                  marginBottom: 2,
                }}
              >
                Professor
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: Colors[colorScheme].text,
                }}
              >
                {trainerName}
              </Text>
            </View>
          </View>
        </View>

        {/* Lista de Alunos */}
        <View
          style={{
            backgroundColor: Colors[colorScheme].card,
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: Colors[colorScheme].text,
              marginBottom: 16,
            }}
          >
            Alunos ({students.length})
          </Text>

          {students.length === 0 ? (
            <Text style={{ color: Colors[colorScheme].secondaryText }}>
              Nenhum aluno inscrito
            </Text>
          ) : (
            students.map((student, index) => (
              <View key={student.uid}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                  }}
                >
                  <UserAvatar name={student.name} size={40} />
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: Colors[colorScheme].text,
                      marginLeft: 12,
                    }}
                  >
                    {student.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      handleRemoveStudent(student.uid, student.name)
                    }
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: "#ff4444" + "20",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="close" size={18} color="#ff4444" />
                  </TouchableOpacity>
                </View>
                {index < students.length - 1 && (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: Colors[colorScheme].border,
                      opacity: 0.1,
                    }}
                  />
                )}
              </View>
            ))
          )}
        </View>

        {/* Botões de Ação */}
        <View style={{ gap: 12, marginBottom: 20 }}>
          <ThemedButton
            title="Editar Turma"
            onPress={() =>
              router.push({
                pathname: "/class-form",
                params: { classId, gymId },
              })
            }
            icon={
              <Ionicons
                name="create"
                size={20}
                color="#FFF"
                style={{ marginRight: 8 }}
              />
            }
          />
          <TouchableOpacity
            onPress={handleDelete}
            style={{
              backgroundColor: "#ff4444",
              borderRadius: 12,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name="trash"
              size={20}
              color="#FFF"
              style={{ marginRight: 8 }}
            />
            <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}>
              Excluir Turma
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
