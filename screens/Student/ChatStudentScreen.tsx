// CONSTANTES
import { Colors } from "@/constants/theme";

// CONTEXTOS E HOOKS
import { useColorScheme } from "@/hooks/use-color-scheme";

// BIBLIOTECAS EXTERNAS
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatStudentScreen() {
  const colorScheme = useColorScheme() ?? "light";

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
        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors[colorScheme].text }]}>
            Chat
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: Colors[colorScheme].secondaryText },
            ]}
          >
            Converse com seu professor
          </Text>
        </View>

        <View style={styles.emptyState}>
          <View
            style={[
              styles.emptyIconContainer,
              { backgroundColor: Colors[colorScheme].tint + "20" },
            ]}
          >
            <Ionicons
              name="chatbubbles"
              size={80}
              color={Colors[colorScheme].tint}
              style={{ opacity: 0.5 }}
            />
          </View>
          <Text
            style={[styles.emptyTitle, { color: Colors[colorScheme].text }]}
          >
            Chat em Desenvolvimento
          </Text>
          <Text
            style={[
              styles.emptyDescription,
              { color: Colors[colorScheme].secondaryText },
            ]}
          >
            Em breve você poderá trocar mensagens com seu professor e receber
            feedback sobre seus treinos em tempo real.
          </Text>

          <View style={styles.featuresContainer}>
            <View
              style={[
                styles.featureCard,
                {
                  backgroundColor: Colors[colorScheme].card,
                  borderColor: Colors[colorScheme].border,
                },
              ]}
            >
              <Ionicons
                name="flash"
                size={24}
                color={Colors[colorScheme].tint}
              />
              <Text
                style={[
                  styles.featureTitle,
                  { color: Colors[colorScheme].text },
                ]}
              >
                Mensagens em Tempo Real
              </Text>
              <Text
                style={[
                  styles.featureDescription,
                  { color: Colors[colorScheme].secondaryText },
                ]}
              >
                Comunicação instantânea com seu professor
              </Text>
            </View>

            <View
              style={[
                styles.featureCard,
                {
                  backgroundColor: Colors[colorScheme].card,
                  borderColor: Colors[colorScheme].border,
                },
              ]}
            >
              <Ionicons
                name="image"
                size={24}
                color={Colors[colorScheme].tint}
              />
              <Text
                style={[
                  styles.featureTitle,
                  { color: Colors[colorScheme].text },
                ]}
              >
                Compartilhamento de Mídia
              </Text>
              <Text
                style={[
                  styles.featureDescription,
                  { color: Colors[colorScheme].secondaryText },
                ]}
              >
                Envie fotos e vídeos dos seus treinos
              </Text>
            </View>

            <View
              style={[
                styles.featureCard,
                {
                  backgroundColor: Colors[colorScheme].card,
                  borderColor: Colors[colorScheme].border,
                },
              ]}
            >
              <Ionicons
                name="checkmark-done"
                size={24}
                color={Colors[colorScheme].tint}
              />
              <Text
                style={[
                  styles.featureTitle,
                  { color: Colors[colorScheme].text },
                ]}
              >
                Confirmação de Leitura
              </Text>
              <Text
                style={[
                  styles.featureDescription,
                  { color: Colors[colorScheme].secondaryText },
                ]}
              >
                Saiba quando suas mensagens foram lidas
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    width: "100%",
    gap: 16,
  },
  featureCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});