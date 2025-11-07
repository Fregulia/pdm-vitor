import { UserAvatar } from "@/components/UserAvatar";
import { GlobalStyles } from "@/constants/styles";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AcademyInfo, getAcademyById } from "@/services/academy";
import { db } from "@/services/firebase";
import { getTrainerContext } from "@/services/trainers";
import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  query,
} from "firebase/firestore";
import React from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

export default function DashboardTrainerScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { user } = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [academy, setAcademy] = React.useState<AcademyInfo | null>(null);
  const [gymId, setGymId] = React.useState<string | null>(null);
  const [counts, setCounts] = React.useState({ students: 0, classes: 0 });
  const [studentNames, setStudentNames] = React.useState<string[]>([]);

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
        console.log("[DashboardTrainer] Iniciando carregamento...");
        const ctx = await getTrainerContext();
        console.log("[DashboardTrainer] Contexto do trainer:", ctx);
        if (!ctx?.gymId) {
          console.log("[DashboardTrainer] Nenhum gymId encontrado");
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
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View
        style={[
          GlobalStyles.container,
          {
            backgroundColor: Colors[colorScheme].background,
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
      <Text
        style={[
          GlobalStyles.title,
          { color: Colors[colorScheme].text, marginBottom: 8 },
        ]}
      >
        {greeting} {firstName}!
      </Text>
      <Text
        style={{ color: Colors[colorScheme].secondaryText, marginBottom: 16 }}
      >
        {academy
          ? `Academia: ${academy.name}`
          : gymId
          ? "Academia não configurada"
          : "Você ainda não está vinculado a uma academia"}
      </Text>

      {/* Cards de contagem (foco do treinador) */}
      <View
        style={{
          flexDirection: "row",
          gap: 12,
          width: "100%",
          marginBottom: 16,
        }}
      >
        <View
          style={[
            GlobalStyles.card,
            { flex: 1, backgroundColor: Colors[colorScheme].card },
          ]}
        >
          <Text style={{ color: Colors[colorScheme].secondaryText }}>
            Alunos
          </Text>
          <Text
            style={{
              color: Colors[colorScheme].text,
              fontSize: 28,
              fontWeight: "700",
            }}
          >
            {counts.students}
          </Text>
        </View>
        <View
          style={[
            GlobalStyles.card,
            { flex: 1, backgroundColor: Colors[colorScheme].card },
          ]}
        >
          <Text style={{ color: Colors[colorScheme].secondaryText }}>
            Turmas
          </Text>
          <Text
            style={{
              color: Colors[colorScheme].text,
              fontSize: 28,
              fontWeight: "700",
            }}
          >
            {counts.classes}
          </Text>
        </View>
      </View>

      {/* Lista rápida de alunos */}
      <View
        style={[
          GlobalStyles.card,
          { backgroundColor: Colors[colorScheme].card, width: "100%" },
        ]}
      >
        <Text
          style={{
            color: Colors[colorScheme].text,
            fontWeight: "600",
            marginBottom: 8,
          }}
        >
          Alunos recentes
        </Text>
        {studentNames.length === 0 ? (
          <Text style={{ color: Colors[colorScheme].secondaryText }}>
            Nenhum aluno cadastrado.
          </Text>
        ) : (
          <FlatList
            data={studentNames}
            keyExtractor={(n, i) => n + i}
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <UserAvatar name={item} size={28} />
                <Text style={{ color: Colors[colorScheme].text }}>{item}</Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}
