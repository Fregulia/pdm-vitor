import { ThemedButton } from "@/components/ThemedButton";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getAcademy } from "@/services/academy";
import { populateDefaultExercises } from "@/services/exercises";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PopulateExercisesScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePopulate = async () => {
    if (!user) {
      Alert.alert("Erro", "Você precisa estar logado");
      return;
    }

    try {
      setLoading(true);
      setSuccess(false);

      // Busca a academia do usuário
      const academy = await getAcademy(user.uid);
      if (!academy) {
        Alert.alert("Erro", "Academia não encontrada");
        return;
      }

      const gymId = (academy as any).id || user.uid;

      // Popula os exercícios
      await populateDefaultExercises(gymId);

      setSuccess(true);
      Alert.alert(
        "Sucesso! 🎉",
        "36 exercícios foram criados na sua academia!"
      );
    } catch (error) {
      console.error("Erro ao popular exercícios:", error);
      Alert.alert("Erro", "Não foi possível criar os exercícios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: Colors[colorScheme].text }]}>
          Popular Exercícios
        </Text>

        <Text
          style={[
            styles.description,
            { color: Colors[colorScheme].secondaryText },
          ]}
        >
          Esta ação irá criar 36 exercícios padrão na sua academia, divididos em
          9 categorias:
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: Colors[colorScheme].card,
              borderColor: Colors[colorScheme].border,
            },
          ]}
        >
          <Text
            style={[styles.categoryTitle, { color: Colors[colorScheme].text }]}
          >
            Categorias:
          </Text>
          {[
            "💪 Peito (4 exercícios)",
            "🔙 Costas (4 exercícios)",
            "💪 Bíceps (4 exercícios)",
            "💪 Tríceps (4 exercícios)",
            "🦵 Quadríceps (4 exercícios)",
            "🦶 Panturrilha (4 exercícios)",
            "💪 Ombros (4 exercícios)",
            "🦵 Posterior (4 exercícios)",
            "🍑 Glúteos (4 exercícios)",
          ].map((category, index) => (
            <Text
              key={index}
              style={[
                styles.category,
                { color: Colors[colorScheme].secondaryText },
              ]}
            >
              {category}
            </Text>
          ))}
        </View>

        {success && (
          <View
            style={[
              styles.successCard,
              { backgroundColor: Colors[colorScheme].tint + "20" },
            ]}
          >
            <Text
              style={[styles.successText, { color: Colors[colorScheme].tint }]}
            >
              ✅ Exercícios criados com sucesso!
            </Text>
          </View>
        )}

        <ThemedButton
          title={loading ? "Criando..." : "Criar Exercícios"}
          onPress={handlePopulate}
          disabled={loading}
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
            <Text
              style={[
                styles.loadingText,
                { color: Colors[colorScheme].secondaryText },
              ]}
            >
              Criando exercícios...
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  category: {
    fontSize: 16,
    marginBottom: 8,
    paddingLeft: 8,
  },
  successCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  successText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  loadingContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
});
