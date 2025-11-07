import { UserAvatar } from "@/components/UserAvatar";
import { GlobalStyles } from "@/constants/styles";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getAcademyById } from "@/services/academy";
import { db } from "@/services/firebase";
import { getStudentContext } from "@/services/students";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function DashboardStudentScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [academyName, setAcademyName] = useState("");
  const [trainerName, setTrainerName] = useState("");
  const [studentName, setStudentName] = useState("");

  const firstName = React.useMemo(() => {
    const candidate = (
      user?.displayName ||
      user?.email?.split("@")[0] ||
      ""
    ).trim();
    const name = candidate.split(/\s+/)[0];
    return name || "Aluno";
  }, [user?.displayName, user?.email]);

  const greeting = React.useMemo(() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return "Bom Dia";
    if (h >= 12 && h < 19) return "Boa Tarde";
    return "Boa Noite";
  }, []);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    if (!user) return;
    setLoading(true);
    try {
      const ctx = await getStudentContext();
      if (!ctx) {
        setLoading(false);
        return;
      }

      // Carrega academia
      const academy = await getAcademyById(ctx.gymId);
      setAcademyName(academy?.name || "Academia não configurada");

      // Carrega trainer
      const trainerDoc = await getDoc(
        doc(db, "academies", ctx.gymId, "teachers", ctx.trainerId)
      );
      if (trainerDoc.exists()) {
        setTrainerName((trainerDoc.data() as any).name || "Professor");
      }

      // Carrega próprio documento de aluno para pegar o nome
      const studentDoc = await getDoc(
        doc(db, "academies", ctx.gymId, "students", user.uid)
      );
      if (studentDoc.exists()) {
        setStudentName((studentDoc.data() as any).name || firstName);
      } else {
        setStudentName(firstName);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do aluno:", error);
    } finally {
      setLoading(false);
    }
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
      <Text
        style={[
          GlobalStyles.title,
          { color: Colors[colorScheme].text, marginBottom: 8 },
        ]}
      >
        {greeting} {studentName || firstName}!
      </Text>
      <Text
        style={{ color: Colors[colorScheme].secondaryText, marginBottom: 24 }}
      >
        Bem-vindo à plataforma
      </Text>

      {/* Card da Academia */}
      <View
        style={[
          GlobalStyles.card,
          { backgroundColor: Colors[colorScheme].card, marginBottom: 16 },
        ]}
      >
        <Text
          style={{
            color: Colors[colorScheme].secondaryText,
            fontSize: 14,
            marginBottom: 4,
          }}
        >
          Academia
        </Text>
        <Text
          style={{
            color: Colors[colorScheme].text,
            fontSize: 20,
            fontWeight: "700",
          }}
        >
          {academyName}
        </Text>
      </View>

      {/* Card do Professor */}
      <View
        style={[
          GlobalStyles.card,
          {
            backgroundColor: Colors[colorScheme].card,
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
          },
        ]}
      >
        <UserAvatar name={trainerName} size={48} />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: Colors[colorScheme].secondaryText,
              fontSize: 14,
              marginBottom: 4,
            }}
          >
            Professor Responsável
          </Text>
          <Text
            style={{
              color: Colors[colorScheme].text,
              fontSize: 18,
              fontWeight: "600",
            }}
          >
            {trainerName || "Não atribuído"}
          </Text>
        </View>
      </View>
    </View>
  );
}
