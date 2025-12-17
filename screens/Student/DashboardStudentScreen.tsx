import { UserAvatar } from "@/components/UserAvatar";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getAcademyById } from "@/services/academy";
import { db } from "@/services/firebase";
import { getStudentContext } from "@/services/students";
import { getWorkoutAssignmentsByStudent } from "@/services/workoutAssignments";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardStudentScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [academyName, setAcademyName] = useState("");
  const [trainerName, setTrainerName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [workoutCount, setWorkoutCount] = useState(0);

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

      // Carrega planos de treino atribuídos
      const assignments = await getWorkoutAssignmentsByStudent(
        ctx.gymId,
        user.uid
      );
      setWorkoutCount(assignments.length);
    } catch {
      // Error loading data
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: Colors[colorScheme].background },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header com Avatar Centralizado */}
        <View style={styles.header}>
          <UserAvatar name={studentName || firstName} size={80} />
          <Text style={[styles.greeting, { color: Colors[colorScheme].text }]}>
            {greeting}, {studentName || firstName}!
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: Colors[colorScheme].secondaryText },
            ]}
          >
            Bem-vindo à sua plataforma de treinos
          </Text>
        </View>

        {/* Cards de Estatísticas */}
        <View style={styles.statsContainer}>
          {/* Card Planos de Treino */}
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: Colors[colorScheme].card,
                borderColor: Colors[colorScheme].border,
              },
            ]}
          >
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: Colors[colorScheme].tint + "20" },
              ]}
            >
              <Ionicons
                name="fitness"
                size={24}
                color={Colors[colorScheme].tint}
              />
            </View>
            <Text
              style={[styles.statValue, { color: Colors[colorScheme].text }]}
            >
              {workoutCount}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: Colors[colorScheme].secondaryText },
              ]}
            >
              Planos de Treino
            </Text>
          </View>

          {/* Card Academia */}
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: Colors[colorScheme].card,
                borderColor: Colors[colorScheme].border,
              },
            ]}
          >
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: Colors[colorScheme].tint + "20" },
              ]}
            >
              <Ionicons
                name="business"
                size={24}
                color={Colors[colorScheme].tint}
              />
            </View>
            <Text
              style={[
                styles.statLabel,
                { color: Colors[colorScheme].secondaryText, marginTop: 8 },
              ]}
            >
              {academyName}
            </Text>
          </View>
        </View>

        {/* Card do Professor */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: Colors[colorScheme].card,
              borderColor: Colors[colorScheme].border,
            },
          ]}
        >
          <View
            style={[
              styles.cardHeader,
              { borderBottomColor: Colors[colorScheme].border },
            ]}
          >
            <Ionicons
              name="person"
              size={20}
              color={Colors[colorScheme].tint}
            />
            <Text
              style={[styles.cardTitle, { color: Colors[colorScheme].text }]}
            >
              Professor Responsável
            </Text>
          </View>
          <View style={styles.trainerInfo}>
            <UserAvatar name={trainerName} size={64} />
            <View style={styles.trainerDetails}>
              <Text
                style={[
                  styles.trainerName,
                  { color: Colors[colorScheme].text },
                ]}
              >
                {trainerName || "Não atribuído"}
              </Text>
              <Text
                style={[
                  styles.trainerRole,
                  { color: Colors[colorScheme].secondaryText },
                ]}
              >
                Personal Trainer
              </Text>
            </View>
          </View>
        </View>

        {/* Ações Rápidas */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: Colors[colorScheme].card,
              borderColor: Colors[colorScheme].border,
            },
          ]}
        >
          <View
            style={[
              styles.cardHeader,
              { borderBottomColor: Colors[colorScheme].border },
            ]}
          >
            <Ionicons name="flash" size={20} color={Colors[colorScheme].tint} />
            <Text
              style={[styles.cardTitle, { color: Colors[colorScheme].text }]}
            >
              Ações Rápidas
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: Colors[colorScheme].background,
                borderColor: Colors[colorScheme].border,
              },
            ]}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: Colors[colorScheme].tint + "20" },
              ]}
            >
              <Ionicons
                name="barbell"
                size={24}
                color={Colors[colorScheme].tint}
              />
            </View>
            <View style={styles.actionText}>
              <Text
                style={[
                  styles.actionTitle,
                  { color: Colors[colorScheme].text },
                ]}
              >
                Meus Treinos
              </Text>
              <Text
                style={[
                  styles.actionSubtitle,
                  { color: Colors[colorScheme].secondaryText },
                ]}
              >
                Ver planos de treino atribuídos
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors[colorScheme].secondaryText}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: Colors[colorScheme].background,
                borderColor: Colors[colorScheme].border,
              },
            ]}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: Colors[colorScheme].tint + "20" },
              ]}
            >
              <Ionicons
                name="calendar"
                size={24}
                color={Colors[colorScheme].tint}
              />
            </View>
            <View style={styles.actionText}>
              <Text
                style={[
                  styles.actionTitle,
                  { color: Colors[colorScheme].text },
                ]}
              >
                Minhas Turmas
              </Text>
              <Text
                style={[
                  styles.actionSubtitle,
                  { color: Colors[colorScheme].secondaryText },
                ]}
              >
                Ver horários e turmas matriculadas
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors[colorScheme].secondaryText}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    paddingTop: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    textAlign: "center",
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  trainerInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  trainerDetails: {
    flex: 1,
  },
  trainerName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  trainerRole: {
    fontSize: 14,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    gap: 12,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
  },
});
