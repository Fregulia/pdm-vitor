import { MenuButton } from "@/components/MenuButton";
import { UserAvatar } from "@/components/UserAvatar";
import { GlobalStyles } from "@/constants/styles";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getAcademy } from "@/services/academy";
import { getExercises, populateDefaultExercises } from "@/services/exercises";
import { db } from "@/services/firebase";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  query,
} from "firebase/firestore";
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

export default function OwnerDashboardPage() {
  const colorScheme = useColorScheme() ?? "light";
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<
    { id: string; name: string; bio?: string }[]
  >([]);
  const [students, setStudents] = useState<
    { id: string; name: string; email?: string }[]
  >([]);
  const [counts, setCounts] = useState({
    teachers: 0,
    students: 0,
    classes: 0,
  });
  const [exercisesMigrated, setExercisesMigrated] = useState(false);

  useEffect(() => {
    (async () => {
      if (!user?.uid) return;
      setLoading(true);
      try {
        // Busca o gymId da academia do owner
        const academy = await getAcademy(user.uid);
        const gymId = (academy as any)?.id as string | undefined;

        if (!gymId) {

          setLoading(false);
          return;
        }

        // Migração automática: verifica se a academia tem exercícios
        const exercises = await getExercises(gymId);
        if (exercises.length === 0) {
          console.log(
            "[DashboardOwner] Migração: populando exercícios para academia existente..."
          );
          try {
            await populateDefaultExercises(gymId);
            console.log(
              "[DashboardOwner] ✅ Exercícios populados com sucesso (migração)"
            );
            setExercisesMigrated(true);
          } catch (error) {
            console.error(
              "[DashboardOwner] Erro ao popular exercícios na migração:",
              error
            );
          }
        }

        const teachersRef = collection(db, "academies", gymId, "teachers");
        const studentsRef = collection(db, "academies", gymId, "students");
        const classesRef = collection(db, "academies", gymId, "classes");

        const [tCountSnap, sCountSnap, cCountSnap] = await Promise.all([
          getCountFromServer(teachersRef),
          getCountFromServer(studentsRef),
          getCountFromServer(classesRef),
        ]);
        setCounts({
          teachers: tCountSnap.data().count,
          students: sCountSnap.data().count,
          classes: cCountSnap.data().count,
        });

        // Busca os últimos 5 professores e alunos
        const [tDocs, sDocs] = await Promise.all([
          getDocs(query(teachersRef, limit(5))),
          getDocs(query(studentsRef, limit(5))),
        ]);

        setTeachers(
          tDocs.docs.map((d) => ({
            id: d.id,
            name: d.data().name || "Sem nome",
            bio: d.data().bio,
          }))
        );

        setStudents(
          sDocs.docs.map((d) => ({
            id: d.id,
            name: d.data().name || "Sem nome",
            email: d.data().email,
          }))
        );
      } catch (error) {
        console.error("[DashboardOwner] Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid]);

  const firstName = React.useMemo(() => {
    const candidate = (
      user?.displayName ||
      user?.email?.split("@")[0] ||
      ""
    ).trim();
    const name = candidate.split(/\s+/)[0];
    return name || "Usuário";
  }, [user?.displayName, user?.email]);

  const greeting = React.useMemo(() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return "Bom Dia";
    if (h >= 12 && h < 19) return "Boa Tarde";
    return "Boa Noite";
  }, []);

  if (loading) {
    return (
      <SafeAreaView
        style={[
          GlobalStyles.container,
          {
            backgroundColor: Colors[colorScheme].background,
            alignItems: "center",
            justifyContent: "center",
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
        {/* Notificação de migração de exercícios */}
        {exercisesMigrated && (
          <View
            style={[
              styles.migrationNotice,
              {
                backgroundColor: Colors[colorScheme].tint + "15",
                borderColor: Colors[colorScheme].tint,
              },
            ]}
          >
            <FontAwesome
              name="check-circle"
              size={20}
              color={Colors[colorScheme].tint}
            />
            <Text
              style={[
                styles.migrationText,
                { color: Colors[colorScheme].tint },
              ]}
            >
              36 exercícios foram adicionados à sua academia! 🎉
            </Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text
              style={[styles.greeting, { color: Colors[colorScheme].text }]}
            >
              {greeting}, {firstName}!
            </Text>
            <Text
              style={{ color: Colors[colorScheme].secondaryText, fontSize: 16 }}
            >
              Visão geral da sua academia
            </Text>
          </View>
          <UserAvatar name={user?.displayName || user?.email || ""} size={50} />
        </View>

        {/* Cards de estatísticas */}
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: Colors[colorScheme].card },
            ]}
            onPress={() => router.push("/(owner)/(drawer)/teachers")}
          >
            <View
              style={[
                styles.statIcon,
                { backgroundColor: Colors[colorScheme].tint + "20" },
              ]}
            >
              <FontAwesome
                name="user-md"
                size={24}
                color={Colors[colorScheme].tint}
              />
            </View>
            <Text
              style={[styles.statNumber, { color: Colors[colorScheme].text }]}
            >
              {counts.teachers}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: Colors[colorScheme].secondaryText },
              ]}
            >
              Professores
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: Colors[colorScheme].card },
            ]}
            onPress={() => router.push("/(owner)/(drawer)/students")}
          >
            <View
              style={[
                styles.statIcon,
                { backgroundColor: Colors[colorScheme].tint + "20" },
              ]}
            >
              <FontAwesome
                name="users"
                size={24}
                color={Colors[colorScheme].tint}
              />
            </View>
            <Text
              style={[styles.statNumber, { color: Colors[colorScheme].text }]}
            >
              {counts.students}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: Colors[colorScheme].secondaryText },
              ]}
            >
              Alunos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: Colors[colorScheme].card },
            ]}
            onPress={() => router.push("/(owner)/(drawer)/classes")}
          >
            <View
              style={[
                styles.statIcon,
                { backgroundColor: Colors[colorScheme].tint + "20" },
              ]}
            >
              <FontAwesome
                name="calendar"
                size={24}
                color={Colors[colorScheme].tint}
              />
            </View>
            <Text
              style={[styles.statNumber, { color: Colors[colorScheme].text }]}
            >
              {counts.classes}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: Colors[colorScheme].secondaryText },
              ]}
            >
              Turmas
            </Text>
          </TouchableOpacity>
        </View>

        {/* Professores recentes */}
        <View
          style={[
            styles.section,
            { backgroundColor: Colors[colorScheme].card },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text
              style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}
            >
              Professores Recentes
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(owner)/(drawer)/teachers")}
            >
              <Text
                style={{ color: Colors[colorScheme].tint, fontWeight: "600" }}
              >
                Ver todos
              </Text>
            </TouchableOpacity>
          </View>
          {teachers.length === 0 ? (
            <View style={styles.emptyState}>
              <FontAwesome
                name="user-plus"
                size={32}
                color={Colors[colorScheme].secondaryText}
              />
              <Text
                style={{
                  color: Colors[colorScheme].secondaryText,
                  marginTop: 8,
                }}
              >
                Nenhum professor cadastrado
              </Text>
              <Text
                style={{
                  color: Colors[colorScheme].secondaryText,
                  fontSize: 12,
                }}
              >
                Gere convites na aba Professores
              </Text>
            </View>
          ) : (
            teachers.map((teacher) => (
              <View key={teacher.id} style={styles.listItem}>
                <UserAvatar name={teacher.name} size={40} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.listItemText,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    {teacher.name}
                  </Text>
                  {teacher.bio && (
                    <Text
                      style={{
                        color: Colors[colorScheme].secondaryText,
                        fontSize: 12,
                      }}
                      numberOfLines={1}
                    >
                      {teacher.bio}
                    </Text>
                  )}
                </View>
                <FontAwesome
                  name="chevron-right"
                  size={16}
                  color={Colors[colorScheme].secondaryText}
                />
              </View>
            ))
          )}
        </View>

        {/* Alunos recentes */}
        <View
          style={[
            styles.section,
            { backgroundColor: Colors[colorScheme].card },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text
              style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}
            >
              Alunos Recentes
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(owner)/(drawer)/students")}
            >
              <Text
                style={{ color: Colors[colorScheme].tint, fontWeight: "600" }}
              >
                Ver todos
              </Text>
            </TouchableOpacity>
          </View>
          {students.length === 0 ? (
            <View style={styles.emptyState}>
              <FontAwesome
                name="user-plus"
                size={32}
                color={Colors[colorScheme].secondaryText}
              />
              <Text
                style={{
                  color: Colors[colorScheme].secondaryText,
                  marginTop: 8,
                }}
              >
                Nenhum aluno cadastrado
              </Text>
              <Text
                style={{
                  color: Colors[colorScheme].secondaryText,
                  fontSize: 12,
                }}
              >
                Gere convites na aba Alunos
              </Text>
            </View>
          ) : (
            students.map((student) => (
              <View key={student.id} style={styles.listItem}>
                <UserAvatar name={student.name} size={40} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.listItemText,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    {student.name}
                  </Text>
                  {student.email && (
                    <Text
                      style={{
                        color: Colors[colorScheme].secondaryText,
                        fontSize: 12,
                      }}
                      numberOfLines={1}
                    >
                      {student.email}
                    </Text>
                  )}
                </View>
                <FontAwesome
                  name="chevron-right"
                  size={16}
                  color={Colors[colorScheme].secondaryText}
                />
              </View>
            ))
          )}
        </View>

        {/* Ações rápidas */}
        <View
          style={[
            styles.section,
            { backgroundColor: Colors[colorScheme].card },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: Colors[colorScheme].text, marginBottom: 12 },
            ]}
          >
            Ações Rápidas
          </Text>
          <TouchableOpacity
            style={[
              styles.quickAction,
              { borderBottomColor: Colors[colorScheme].border },
            ]}
            onPress={() => router.push("/(owner)/(drawer)/teachers")}
          >
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: Colors[colorScheme].tint + "20" },
              ]}
            >
              <FontAwesome
                name="user-plus"
                size={20}
                color={Colors[colorScheme].tint}
              />
            </View>
            <Text
              style={[
                styles.quickActionText,
                { color: Colors[colorScheme].text },
              ]}
            >
              Convidar Professor
            </Text>
            <FontAwesome
              name="chevron-right"
              size={16}
              color={Colors[colorScheme].secondaryText}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickAction,
              { borderBottomColor: Colors[colorScheme].border },
            ]}
            onPress={() => router.push("/(owner)/(drawer)/students")}
          >
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: Colors[colorScheme].tint + "20" },
              ]}
            >
              <FontAwesome
                name="user-plus"
                size={20}
                color={Colors[colorScheme].tint}
              />
            </View>
            <Text
              style={[
                styles.quickActionText,
                { color: Colors[colorScheme].text },
              ]}
            >
              Convidar Aluno
            </Text>
            <FontAwesome
              name="chevron-right"
              size={16}
              color={Colors[colorScheme].secondaryText}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAction, { borderBottomWidth: 0 }]}
            onPress={() => router.push("/(owner)/(drawer)/academy")}
          >
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: Colors[colorScheme].tint + "20" },
              ]}
            >
              <FontAwesome
                name="building"
                size={20}
                color={Colors[colorScheme].tint}
              />
            </View>
            <Text
              style={[
                styles.quickActionText,
                { color: Colors[colorScheme].text },
              ]}
            >
              Configurar Academia
            </Text>
            <FontAwesome
              name="chevron-right"
              size={16}
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
  migrationNotice: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  migrationText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: "row",
    marginBottom: 24,
    marginHorizontal: -4,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    textAlign: "center",
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  listItemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  quickAction: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
});
