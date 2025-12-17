import { ThemedButton } from "@/components/ThemedButton";
import { UserAvatar } from "@/components/UserAvatar";
import { GlobalStyles } from "@/constants/styles";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { makeMockStudents } from "@/utils/mock-data";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { user, justSignedIn, ackJustSignedIn } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const [showWelcome, setShowWelcome] = useState(false);

  const today = useMemo(() => new Date(), []);
  const students = useMemo(() => makeMockStudents(20), []);

  const tomorrow = useMemo(() => {
    const t = new Date(today);
    t.setDate(t.getDate() + 1);
    return t;
  }, [today]);

  const classesToday = students.filter(
    (s) => new Date(s.nextClass).toDateString() === today.toDateString()
  );
  const classesTomorrow = students.filter(
    (s) => new Date(s.nextClass).toDateString() === tomorrow.toDateString()
  );
  const bdayMonth = today.getMonth();
  const birthdays = students
    .filter((s) => new Date(s.birthday).getMonth() === bdayMonth)
    .sort(
      (a, b) => new Date(a.birthday).getDate() - new Date(b.birthday).getDate()
    );

  useEffect(() => {
    if (justSignedIn) {
      setShowWelcome(true);
      const t = setTimeout(() => {
        setShowWelcome(false);
        ackJustSignedIn();
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [justSignedIn, ackJustSignedIn]);

  return (
    <SafeAreaView
      style={[
        GlobalStyles.container,
        { backgroundColor: Colors[colorScheme].background, paddingTop: 24 },
      ]}
    >
      {/* Header fixo (igual ao de Alunos) */}
      <Text style={[GlobalStyles.title, { color: Colors[colorScheme].text }]}>
        Dashboard
      </Text>
      <Text
        style={[
          GlobalStyles.subtitle,
          { color: Colors[colorScheme].secondaryText },
        ]}
      >
        Visualize suas Atividades
      </Text>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Card: Aulas de hoje */}
        <View
          style={[
            GlobalStyles.card,
            {
              backgroundColor: Colors[colorScheme].card,
              width: "100%",
            },
          ]}
        >
          <Text
            style={[
              GlobalStyles.cardTitle,
              { color: Colors[colorScheme].text },
            ]}
          >
            Aulas de hoje ({classesToday.length})
          </Text>
          <View style={{ gap: 8 }}>
            {classesToday.slice(0, 5).map((s) => (
              <View
                key={`today-${s.id}`}
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <UserAvatar name={s.name} size={36} />
                <Text
                  style={{
                    color: Colors[colorScheme].secondaryText,
                    fontSize: 16,
                  }}
                >
                  {s.name}
                </Text>
              </View>
            ))}
          </View>
          {classesToday.length === 0 && (
            <Text style={{ color: Colors[colorScheme].secondaryText }}>
              Sem aulas hoje.
            </Text>
          )}
        </View>

        {/* Card: Aulas de amanhã */}
        <View
          style={[
            GlobalStyles.card,
            {
              backgroundColor: Colors[colorScheme].card,
              width: "100%",
            },
          ]}
        >
          <Text
            style={[
              GlobalStyles.cardTitle,
              { color: Colors[colorScheme].text },
            ]}
          >
            Aulas de amanhã ({classesTomorrow.length})
          </Text>
          <View style={{ gap: 8 }}>
            {classesTomorrow.slice(0, 5).map((s) => (
              <View
                key={`tmm-${s.id}`}
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <UserAvatar name={s.name} size={36} />
                <Text
                  style={{
                    color: Colors[colorScheme].secondaryText,
                    fontSize: 16,
                  }}
                >
                  {s.name}
                </Text>
              </View>
            ))}
          </View>
          {classesTomorrow.length === 0 && (
            <Text style={{ color: Colors[colorScheme].secondaryText }}>
              Sem aulas amanhã.
            </Text>
          )}
        </View>

        {/* Card: Aniversariantes do mês */}
        <View
          style={[
            GlobalStyles.card,
            {
              backgroundColor: Colors[colorScheme].card,
              width: "100%",
            },
          ]}
        >
          <Text
            style={[
              GlobalStyles.cardTitle,
              { color: Colors[colorScheme].text },
            ]}
          >
            Aniversariantes do mês ({birthdays.length})
          </Text>
          <View style={{ gap: 8 }}>
            {birthdays.slice(0, 5).map((s) => {
              const d = new Date(s.birthday);
              const label = `${String(d.getDate()).padStart(2, "0")}/${String(
                d.getMonth() + 1
              ).padStart(2, "0")}`;
              return (
                <View
                  key={`bd-${s.id}`}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <UserAvatar name={s.name} size={36} />
                  <Text
                    style={{
                      color: Colors[colorScheme].secondaryText,
                      fontSize: 16,
                    }}
                  >
                    {s.name} — {label}
                  </Text>
                </View>
              );
            })}
          </View>
          {birthdays.length === 0 && (
            <Text style={{ color: Colors[colorScheme].secondaryText }}>
              Sem aniversariantes neste mês.
            </Text>
          )}
        </View>

        {/* Acesso rápido ao Perfil */}
        <ThemedButton
          title="Ver todos os alunos"
          onPress={() => router.push("/(tabs)/alunos")}
          style={{ marginTop: 8 }}
        />

        {/* Modal flutuante de boas-vindas */}
        <Modal
          visible={showWelcome}
          transparent={true}
          animationType="fade"
          statusBarTranslucent={true}
        >
          <BlurView
            intensity={20}
            tint={colorScheme === "dark" ? "dark" : "light"}
            style={styles.blurContainer}
          >
            <View style={styles.modalContent}>
              <View
                style={[
                  styles.welcomeCard,
                  {
                    backgroundColor: Colors[colorScheme].card,
                    borderColor: Colors[colorScheme].tint,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: Colors[colorScheme].text,
                    marginBottom: 8,
                    textAlign: "center",
                  }}
                >
                  ✓ Login bem sucedido
                </Text>
                <Text
                  style={{
                    color: Colors[colorScheme].secondaryText,
                    fontSize: 15,
                    textAlign: "center",
                  }}
                >
                  Você entrou como {user?.email}
                </Text>
              </View>
            </View>
          </BlurView>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  welcomeCard: {
    padding: 24,
    borderRadius: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1,
  },
});
