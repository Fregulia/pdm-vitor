import { MenuButton } from "@/components/MenuButton";
import { ThemedButton } from "@/components/ThemedButton";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getAcademy } from "@/services/academy";
import { getExercises, populateDefaultExercises } from "@/services/exercises";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WorkoutPlansScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [gymId, setGymId] = useState<string | null>(null);
  const [exercisesPopulated, setExercisesPopulated] = useState(false);
  const [populatingExercises, setPopulatingExercises] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user])
  );

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Busca a academia
      const academy = await getAcademy(user.uid);
      if (!academy) {
        setLoading(false);
        return;
      }

      const academyId = (academy as any).id || user.uid;
      setGymId(academyId);

      // Verifica se já existem exercícios
      const exercises = await getExercises(academyId);

      if (exercises.length === 0) {
        // Primeira vez acessando - popula exercícios automaticamente
        console.log(
          "[WorkoutPlans] Primeira vez acessando - populando exercícios..."
        );
        await populateExercisesAutomatically(academyId);
      } else {
        setExercisesPopulated(true);
      }
    } catch (error) {
      console.error("[WorkoutPlans] Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const populateExercisesAutomatically = async (academyId: string) => {
    try {
      setPopulatingExercises(true);


      await populateDefaultExercises(academyId);


      setExercisesPopulated(true);
    } catch (error) {
      console.error("[WorkoutPlans] Erro ao popular exercícios:", error);
    } finally {
      setPopulatingExercises(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: Colors[colorScheme].background },
        ]}
      >
        <MenuButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
        </View>
      </SafeAreaView>
    );
  }

  if (populatingExercises) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: Colors[colorScheme].background },
        ]}
      >
        <MenuButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
          <Text
            style={[
              styles.loadingText,
              { color: Colors[colorScheme].secondaryText },
            ]}
          >
            Preparando exercícios...
          </Text>
          <Text
            style={[
              styles.loadingSubtext,
              { color: Colors[colorScheme].secondaryText },
            ]}
          >
            Criando 36 exercícios padrão para você 🎉
          </Text>
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
      <MenuButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors[colorScheme].text }]}>
            Planos de Treino
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: Colors[colorScheme].secondaryText },
            ]}
          >
            Crie e gerencie planos personalizados
          </Text>
        </View>

        {/* Status dos exercícios */}
        {exercisesPopulated && (
          <View
            style={[
              styles.statusCard,
              {
                backgroundColor: Colors[colorScheme].tint + "20",
                borderColor: Colors[colorScheme].tint,
              },
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={Colors[colorScheme].tint}
            />
            <Text
              style={[styles.statusText, { color: Colors[colorScheme].tint }]}
            >
              36 exercícios disponíveis
            </Text>
          </View>
        )}

        {/* Card de boas-vindas */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: Colors[colorScheme].card,
              borderColor: Colors[colorScheme].border,
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons
              name="fitness"
              size={48}
              color={Colors[colorScheme].tint}
            />
          </View>
          <Text style={[styles.cardTitle, { color: Colors[colorScheme].text }]}>
            Em Desenvolvimento
          </Text>
          <Text
            style={[
              styles.cardDescription,
              { color: Colors[colorScheme].secondaryText },
            ]}
          >
            A funcionalidade de planos de treino está sendo desenvolvida.
            {"\n\n"}
            Em breve você poderá:
          </Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={Colors[colorScheme].tint}
              />
              <Text
                style={[
                  styles.featureText,
                  { color: Colors[colorScheme].secondaryText },
                ]}
              >
                Criar planos de treino personalizados
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={Colors[colorScheme].tint}
              />
              <Text
                style={[
                  styles.featureText,
                  { color: Colors[colorScheme].secondaryText },
                ]}
              >
                Atribuir planos aos alunos
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={Colors[colorScheme].tint}
              />
              <Text
                style={[
                  styles.featureText,
                  { color: Colors[colorScheme].secondaryText },
                ]}
              >
                Acompanhar progresso dos treinos
              </Text>
            </View>
          </View>
        </View>

        {/* Botão placeholder */}
        <ThemedButton
          title="Criar Novo Plano"
          onPress={() => {
            // TODO: Implementar
          }}
          disabled={true}
        />
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
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    gap: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  cardDescription: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  featureList: {
    width: "100%",
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    flex: 1,
  },
});
