import { ThemedButton } from "@/components/ThemedButton";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AcademyInfo, getAcademy, isAcademyComplete } from "@/services/academy";
import { db } from "@/services/firebase";
import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { collection, getCountFromServer } from "firebase/firestore";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AcademyViewScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [academy, setAcademy] = useState<AcademyInfo | null>(null);
  const [stats, setStats] = useState({
    teachers: 0,
    students: 0,
    classes: 0,
  });

  const load = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const data = await getAcademy(user.uid);
      setAcademy(data);

      // Carrega estatísticas
      if (data) {
        const gymId = (data as any).id;
        if (gymId) {
          const [teachersSnap, studentsSnap, classesSnap] = await Promise.all([
            getCountFromServer(collection(db, "academies", gymId, "teachers")),
            getCountFromServer(collection(db, "academies", gymId, "students")),
            getCountFromServer(collection(db, "academies", gymId, "classes")),
          ]);
          setStats({
            teachers: teachersSnap.data().count,
            students: studentsSnap.data().count,
            classes: classesSnap.data().count,
          });
        }
      }
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
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

  if (!academy || !isAcademyComplete(academy)) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: Colors[colorScheme].background,
          },
        ]}
      >
        <View style={styles.emptyStateContainer}>
          <FontAwesome
            name="building-o"
            size={64}
            color={Colors[colorScheme].secondaryText}
          />
          <Text
            style={[styles.emptyTitle, { color: Colors[colorScheme].text }]}
          >
            Academia não configurada
          </Text>
          <Text
            style={[
              styles.emptyDesc,
              { color: Colors[colorScheme].secondaryText },
            ]}
          >
            Complete as informações da sua academia para começar a gerenciar
            professores e alunos
          </Text>
          <ThemedButton
            title="Configurar Academia"
            onPress={() => router.push("/setup" as any)}
            icon={<FontAwesome name="cog" size={16} color="#fff" />}
            style={{ marginTop: 16 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const createdDate = academy.createdAt?.toDate?.();
  const isOpen = checkIfOpen(academy.hours);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header com nome da academia */}
        <View style={styles.header}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: Colors[colorScheme].tint + "20" },
            ]}
          >
            <FontAwesome
              name="building"
              size={32}
              color={Colors[colorScheme].tint}
            />
          </View>
          <Text
            style={[styles.academyName, { color: Colors[colorScheme].text }]}
          >
            {academy.name}
          </Text>
          {isOpen !== null && (
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isOpen ? "#28a745" : "#dc3545" },
              ]}
            >
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>
                {isOpen ? "Aberto" : "Fechado"}
              </Text>
            </View>
          )}
        </View>

        {/* Estatísticas rápidas */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: Colors[colorScheme].card },
            ]}
          >
            <FontAwesome
              name="users"
              size={20}
              color={Colors[colorScheme].tint}
            />
            <Text
              style={[styles.statNumber, { color: Colors[colorScheme].text }]}
            >
              {stats.teachers}
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

          <View
            style={[
              styles.statCard,
              { backgroundColor: Colors[colorScheme].card },
            ]}
          >
            <FontAwesome
              name="graduation-cap"
              size={20}
              color={Colors[colorScheme].tint}
            />
            <Text
              style={[styles.statNumber, { color: Colors[colorScheme].text }]}
            >
              {stats.students}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: Colors[colorScheme].secondaryText },
              ]}
            >
              Alunos
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: Colors[colorScheme].card },
            ]}
          >
            <FontAwesome
              name="calendar"
              size={20}
              color={Colors[colorScheme].tint}
            />
            <Text
              style={[styles.statNumber, { color: Colors[colorScheme].text }]}
            >
              {stats.classes}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: Colors[colorScheme].secondaryText },
              ]}
            >
              Turmas
            </Text>
          </View>
        </View>

        {/* Informações de contato */}
        <View
          style={[
            styles.section,
            { backgroundColor: Colors[colorScheme].card },
          ]}
        >
          <Text
            style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}
          >
            Informações de Contato
          </Text>

          <View style={styles.infoRow}>
            <View
              style={[
                styles.infoIcon,
                { backgroundColor: Colors[colorScheme].tint + "20" },
              ]}
            >
              <FontAwesome
                name="map-marker"
                size={18}
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
                Endereço
              </Text>
              <Text
                style={[styles.infoValue, { color: Colors[colorScheme].text }]}
              >
                {academy.address}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View
              style={[
                styles.infoIcon,
                { backgroundColor: Colors[colorScheme].tint + "20" },
              ]}
            >
              <FontAwesome
                name="phone"
                size={18}
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
                Telefone
              </Text>
              <Text
                style={[styles.infoValue, { color: Colors[colorScheme].text }]}
              >
                {academy.contact}
              </Text>
            </View>
          </View>
        </View>

        {/* Horários de funcionamento */}
        <View
          style={[
            styles.section,
            { backgroundColor: Colors[colorScheme].card },
          ]}
        >
          <View style={styles.sectionHeader}>
            <FontAwesome
              name="clock-o"
              size={20}
              color={Colors[colorScheme].tint}
            />
            <Text
              style={[
                styles.sectionTitle,
                { color: Colors[colorScheme].text, marginLeft: 8 },
              ]}
            >
              Horários de Funcionamento
            </Text>
          </View>

          <HourRow
            icon="calendar"
            label="Segunda a Sexta"
            hours={`${academy.hours.weekdays.open} - ${academy.hours.weekdays.close}`}
            colorScheme={colorScheme}
          />
          <HourRow
            icon="calendar"
            label="Sábado"
            hours={`${academy.hours.saturday.open} - ${academy.hours.saturday.close}`}
            colorScheme={colorScheme}
          />
          <HourRow
            icon="calendar"
            label="Domingo"
            hours={`${academy.hours.sunday.open} - ${academy.hours.sunday.close}`}
            colorScheme={colorScheme}
          />
        </View>

        {/* Informações adicionais */}
        <View
          style={[
            styles.section,
            { backgroundColor: Colors[colorScheme].card },
          ]}
        >
          <Text
            style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}
          >
            Informações Gerais
          </Text>

          <View style={styles.infoRow}>
            <View
              style={[
                styles.infoIcon,
                { backgroundColor: Colors[colorScheme].tint + "20" },
              ]}
            >
              <FontAwesome
                name="user"
                size={18}
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
                Proprietário
              </Text>
              <Text
                style={[styles.infoValue, { color: Colors[colorScheme].text }]}
              >
                {user?.displayName || user?.email || "Não informado"}
              </Text>
            </View>
          </View>

          {createdDate && (
            <View style={styles.infoRow}>
              <View
                style={[
                  styles.infoIcon,
                  { backgroundColor: Colors[colorScheme].tint + "20" },
                ]}
              >
                <FontAwesome
                  name="calendar-plus-o"
                  size={18}
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
                  Cadastrada em
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  {createdDate.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </View>
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
              styles.actionButton,
              { borderBottomColor: Colors[colorScheme].border },
            ]}
            onPress={() => router.push({ pathname: "/academy-edit" } as any)}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: Colors[colorScheme].tint + "20" },
              ]}
            >
              <FontAwesome
                name="edit"
                size={18}
                color={Colors[colorScheme].tint}
              />
            </View>
            <Text
              style={[styles.actionText, { color: Colors[colorScheme].text }]}
            >
              Editar Informações
            </Text>
            <FontAwesome
              name="chevron-right"
              size={16}
              color={Colors[colorScheme].secondaryText}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { borderBottomColor: Colors[colorScheme].border },
            ]}
            onPress={() => router.push("/(owner)/(drawer)/teachers")}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: Colors[colorScheme].tint + "20" },
              ]}
            >
              <FontAwesome
                name="users"
                size={18}
                color={Colors[colorScheme].tint}
              />
            </View>
            <Text
              style={[styles.actionText, { color: Colors[colorScheme].text }]}
            >
              Gerenciar Professores
            </Text>
            <FontAwesome
              name="chevron-right"
              size={16}
              color={Colors[colorScheme].secondaryText}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { borderBottomWidth: 0 }]}
            onPress={() => router.push("/(owner)/(drawer)/students")}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: Colors[colorScheme].tint + "20" },
              ]}
            >
              <FontAwesome
                name="graduation-cap"
                size={18}
                color={Colors[colorScheme].tint}
              />
            </View>
            <Text
              style={[styles.actionText, { color: Colors[colorScheme].text }]}
            >
              Gerenciar Alunos
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

// Função auxiliar para verificar se a academia está aberta
function checkIfOpen(hours: AcademyInfo["hours"]): boolean | null {
  const now = new Date();
  const day = now.getDay(); // 0 = domingo, 6 = sábado
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  let todayHours;
  if (day === 0) {
    // Domingo
    todayHours = hours.sunday;
  } else if (day === 6) {
    // Sábado
    todayHours = hours.saturday;
  } else {
    // Semana
    todayHours = hours.weekdays;
  }

  if (!todayHours.open || !todayHours.close) return null;

  return currentTime >= todayHours.open && currentTime <= todayHours.close;
}

// Componente para linha de horário
function HourRow({
  icon,
  label,
  hours,
  colorScheme,
}: {
  icon: string;
  label: string;
  hours: string;
  colorScheme: "light" | "dark";
}) {
  return (
    <View style={styles.hourRow}>
      <FontAwesome
        name={icon as any}
        size={14}
        color={Colors[colorScheme].secondaryText}
      />
      <Text style={[styles.hourLabel, { color: Colors[colorScheme].text }]}>
        {label}
      </Text>
      <Text style={[styles.hourValue, { color: Colors[colorScheme].text }]}>
        {hours}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 16,
    textAlign: "center",
  },
  emptyDesc: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  academyName: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  statusText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
    gap: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
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
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  hourRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
  },
  hourLabel: {
    flex: 1,
    fontSize: 15,
  },
  hourValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
});
