import { UserAvatar } from "@/components/UserAvatar";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AcademyInfo, getAcademyById } from "@/services/academy";
import { Class, getClasses } from "@/services/classes";
import { db } from "@/services/firebase";
import { getTrainerContext } from "@/services/trainers";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  query,
} from "firebase/firestore";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Helper para converter dia da semana para português
function getDayLabel(day: string): string {
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
}

// Helper para obter o número do dia da semana (0 = domingo, 1 = segunda, etc)
function getDayNumber(day: string): number {
  const days: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };
  return days[day] ?? -1;
}

// Função para encontrar a próxima aula
function getNextClass(classes: Class[]): Class | null {
  if (classes.length === 0) return null;

  const now = new Date();
  const currentDay = now.getDay(); // 0 = domingo, 1 = segunda, etc
  const currentTime = now.getHours() * 60 + now.getMinutes(); // tempo em minutos

  // Converte classes para array com informações de proximidade
  const classesWithDistance = classes.map((cls) => {
    const classDayNumber = getDayNumber(cls.dayOfWeek);
    const [hours, minutes] = cls.startTime.split(":").map(Number);
    const classTime = hours * 60 + minutes;

    // Calcula quantos dias até a próxima ocorrência
    let daysUntil = classDayNumber - currentDay;

    // Se a aula é hoje mas já passou, considera a próxima semana
    if (daysUntil === 0 && classTime <= currentTime) {
      daysUntil = 7;
    }

    // Se a aula é em dia passado da semana, adiciona 7 dias
    if (daysUntil < 0) {
      daysUntil += 7;
    }

    // Calcula a distância total em minutos
    const totalMinutes = daysUntil * 24 * 60 + (classTime - currentTime);

    return { class: cls, distance: totalMinutes };
  });

  // Ordena por distância e pega a primeira
  classesWithDistance.sort((a, b) => a.distance - b.distance);
  return classesWithDistance[0]?.class || null;
}

export default function DashboardTrainerScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [loading, setLoading] = React.useState(true);
  const [academy, setAcademy] = React.useState<AcademyInfo | null>(null);
  const [gymId, setGymId] = React.useState<string | null>(null);
  const [counts, setCounts] = React.useState({ students: 0, classes: 0 });
  const [studentNames, setStudentNames] = React.useState<string[]>([]);
  const [myClasses, setMyClasses] = React.useState<Class[]>([]);
  const [nextClass, setNextClass] = React.useState<Class | null>(null);

  const firstName = React.useMemo(() => {
    const candidate = (
      user?.displayName ||
      user?.email?.split("@")[0] ||
      ""
    ).trim();
    const name = candidate.split(/\s+/)[0];
    return name || "Treinador";
  }, [user?.displayName, user?.email]);

  const greeting = React.useMemo(() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return "Bom Dia";
    if (h >= 12 && h < 19) return "Boa Tarde";
    return "Boa Noite";
  }, []);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {

        const ctx = await getTrainerContext();

        if (!ctx?.gymId) {

          setGymId(null);
          setAcademy(null);
          setCounts({ students: 0, classes: 0 });
          setStudentNames([]);
          return;
        }
        setGymId(ctx.gymId);
        console.log(
          "[DashboardTrainer] Carregando dados para gymId:",
          ctx.gymId
        );

        try {
          const academyInfo = await getAcademyById(ctx.gymId);
          console.log(
            "[DashboardTrainer] Academia carregada:",
            academyInfo?.name
          );
          setAcademy(academyInfo);
        } catch (err) {
          console.error("[DashboardTrainer] Erro ao carregar academia:", err);
        }

        try {
          const sCountSnap = await getCountFromServer(
            collection(db, "academies", ctx.gymId, "students")
          );
          console.log(
            "[DashboardTrainer] Contagem de alunos:",
            sCountSnap.data().count
          );
          setCounts((prev) => ({ ...prev, students: sCountSnap.data().count }));
        } catch (err) {
          console.error("[DashboardTrainer] Erro ao contar alunos:", err);
        }

        try {
          const cCountSnap = await getCountFromServer(
            collection(db, "academies", ctx.gymId, "classes")
          );
          console.log(
            "[DashboardTrainer] Contagem de turmas:",
            cCountSnap.data().count
          );
          setCounts((prev) => ({ ...prev, classes: cCountSnap.data().count }));
        } catch (err) {
          console.error("[DashboardTrainer] Erro ao contar turmas:", err);
        }

        try {
          const sDocs = await getDocs(
            query(collection(db, "academies", ctx.gymId, "students"), limit(5))
          );
          console.log(
            "[DashboardTrainer] Documentos de alunos:",
            sDocs.docs.length
          );
          setStudentNames(
            sDocs.docs.map((d) => (d.data() as any).name || d.id)
          );
        } catch (err) {
          console.error("[DashboardTrainer] Erro ao listar alunos:", err);
        }

        // Carregar turmas do professor
        try {
          const allClasses = await getClasses(ctx.gymId);
          const trainerClasses = allClasses.filter(
            (c) => c.trainerId === user?.uid
          );
          console.log(
            "[DashboardTrainer] Turmas do professor:",
            trainerClasses.length
          );
          setMyClasses(trainerClasses);

          // Calcula a próxima aula
          const next = getNextClass(trainerClasses);
          setNextClass(next);

        } catch (err) {
          console.error("[DashboardTrainer] Erro ao carregar turmas:", err);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 20 }}
    >
      {/* Header com saudação */}
      <View style={{ marginBottom: 32 }}>
        <Text
          style={{
            fontSize: 32,
            fontWeight: "700",
            color: Colors[colorScheme].text,
            marginBottom: 4,
          }}
        >
          {greeting}, {firstName}! 👋
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: Colors[colorScheme].secondaryText,
          }}
        >
          {academy
            ? academy.name
            : gymId
            ? "Academia não configurada"
            : "Você ainda não está vinculado a uma academia"}
        </Text>
      </View>

      {/* Próxima Aula */}
      {nextClass && (
        <TouchableOpacity
          style={{
            backgroundColor: Colors[colorScheme].tint,
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
          }}
          onPress={() => {
            router.push({
              pathname: "/trainer-class-detail",
              params: { classId: nextClass.id, gymId: gymId || "" },
            } as any);
          }}
          activeOpacity={0.8}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Ionicons name="time" size={20} color="#FFF" />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#FFF",
                marginLeft: 8,
                opacity: 0.9,
              }}
            >
              PRÓXIMA AULA
            </Text>
          </View>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: "#FFF",
              marginBottom: 8,
            }}
          >
            {nextClass.title}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="calendar-outline" size={16} color="#FFF" />
              <Text
                style={{
                  fontSize: 14,
                  color: "#FFF",
                  marginLeft: 6,
                  opacity: 0.9,
                }}
              >
                {getDayLabel(nextClass.dayOfWeek)}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="time-outline" size={16} color="#FFF" />
              <Text
                style={{
                  fontSize: 14,
                  color: "#FFF",
                  marginLeft: 6,
                  opacity: 0.9,
                }}
              >
                {nextClass.startTime} - {nextClass.endTime}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="people-outline" size={16} color="#FFF" />
              <Text
                style={{
                  fontSize: 14,
                  color: "#FFF",
                  marginLeft: 6,
                  opacity: 0.9,
                }}
              >
                {nextClass.students?.length || 0} alunos
              </Text>
            </View>
          </View>
          <View
            style={{
              position: "absolute",
              right: 20,
              top: 20,
            }}
          >
            <Ionicons name="chevron-forward" size={24} color="#FFF" />
          </View>
        </TouchableOpacity>
      )}

      {/* Cards de estatísticas */}
      <View
        style={{
          flexDirection: "row",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {/* Card Alunos */}
        <View
          style={{
            flex: 1,
            backgroundColor: Colors[colorScheme].card,
            borderRadius: 16,
            padding: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: Colors[colorScheme].tint + "20",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <Ionicons
              name="people"
              size={24}
              color={Colors[colorScheme].tint}
            />
          </View>
          <Text
            style={{
              fontSize: 14,
              color: Colors[colorScheme].secondaryText,
              marginBottom: 4,
            }}
          >
            Meus Alunos
          </Text>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "700",
              color: Colors[colorScheme].text,
            }}
          >
            {counts.students}
          </Text>
        </View>

        {/* Card Turmas */}
        <View
          style={{
            flex: 1,
            backgroundColor: Colors[colorScheme].card,
            borderRadius: 16,
            padding: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: Colors[colorScheme].tint + "20",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <Ionicons
              name="calendar"
              size={24}
              color={Colors[colorScheme].tint}
            />
          </View>
          <Text
            style={{
              fontSize: 14,
              color: Colors[colorScheme].secondaryText,
              marginBottom: 4,
            }}
          >
            Turmas
          </Text>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "700",
              color: Colors[colorScheme].text,
            }}
          >
            {counts.classes}
          </Text>
        </View>
      </View>

      {/* Card de alunos recentes */}
      <View
        style={{
          backgroundColor: Colors[colorScheme].card,
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
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
          Alunos Recentes
        </Text>

        {studentNames.length === 0 ? (
          <View
            style={{
              paddingVertical: 20,
              alignItems: "center",
            }}
          >
            <Ionicons
              name="people-outline"
              size={48}
              color={Colors[colorScheme].secondaryText}
              style={{ opacity: 0.3, marginBottom: 12 }}
            />
            <Text
              style={{
                color: Colors[colorScheme].secondaryText,
                textAlign: "center",
              }}
            >
              Nenhum aluno cadastrado ainda
            </Text>
          </View>
        ) : (
          studentNames.map((name, index) => (
            <View key={name + index}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingVertical: 12,
                }}
              >
                <UserAvatar name={name} size={40} />
                <Text
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: Colors[colorScheme].text,
                  }}
                >
                  {name}
                </Text>
              </View>
              {index < studentNames.length - 1 && (
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

      {/* Card de Minhas Turmas */}
      <View
        style={{
          backgroundColor: Colors[colorScheme].card,
          borderRadius: 16,
          padding: 20,
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
          Minhas Turmas
        </Text>

        {myClasses.length === 0 ? (
          <View
            style={{
              paddingVertical: 20,
              alignItems: "center",
            }}
          >
            <Ionicons
              name="calendar-outline"
              size={48}
              color={Colors[colorScheme].secondaryText}
              style={{ opacity: 0.3, marginBottom: 12 }}
            />
            <Text
              style={{
                color: Colors[colorScheme].secondaryText,
                textAlign: "center",
              }}
            >
              Você ainda não está responsável por nenhuma turma
            </Text>
          </View>
        ) : (
          myClasses.map((classItem, index) => (
            <View key={classItem.id}>
              <TouchableOpacity
                style={{
                  paddingVertical: 16,
                }}
                onPress={() => {
                  router.push({
                    pathname: "/trainer-class-detail",
                    params: { classId: classItem.id, gymId: gymId || "" },
                  } as any);
                }}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: Colors[colorScheme].tint + "20",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons
                      name="calendar"
                      size={24}
                      color={Colors[colorScheme].tint}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: Colors[colorScheme].text,
                        marginBottom: 4,
                      }}
                    >
                      {classItem.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: Colors[colorScheme].secondaryText,
                      }}
                    >
                      {getDayLabel(classItem.dayOfWeek)} • {classItem.startTime}{" "}
                      - {classItem.endTime}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={Colors[colorScheme].secondaryText}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 14,
                    color: Colors[colorScheme].secondaryText,
                    marginLeft: 60,
                  }}
                >
                  {classItem.students?.length || 0} aluno(s)
                </Text>
              </TouchableOpacity>
              {index < myClasses.length - 1 && (
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
    </ScrollView>
  );
}
