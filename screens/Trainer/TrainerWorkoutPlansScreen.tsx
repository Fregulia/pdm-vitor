import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getExercises } from "@/services/exercises";
import { getTrainerContext } from "@/services/trainers";
import { deleteWorkout, getWorkouts, Workout } from "@/services/workouts";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TrainerWorkoutPlansScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [gymId, setGymId] = useState<string | null>(null);
  const [exercisesCount, setExercisesCount] = useState(0);
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Busca o contexto do trainer (academia vinculada)
      const context = await getTrainerContext();
      if (!context?.gymId) {
        setLoading(false);
        return;
      }

      setGymId(context.gymId);

      // Verifica quantos exercícios existem
      const exercises = await getExercises(context.gymId);
      setExercisesCount(exercises.length);

      // Busca os treinos criados
      const workoutsData = await getWorkouts(context.gymId);
      setWorkouts(workoutsData);
    } catch (error) {
      console.error("[TrainerWorkoutPlans] Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleCreateWorkout = () => {
    if (!gymId) return;
    router.push("/workout-form");
  };

  const handleEditWorkout = (workoutId: string) => {
    router.push(`/workout-form?id=${workoutId}`);
  };

  const handleDeleteWorkout = (workout: Workout) => {
    Alert.alert(
      "Excluir Treino",
      `Deseja realmente excluir o treino "${workout.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              if (!gymId) return;
              await deleteWorkout(gymId, workout.id);
              Alert.alert("Sucesso", "Treino excluído com sucesso");
              loadData(); // Recarrega a lista
            } catch (error) {
              console.error("Erro ao excluir treino:", error);
              Alert.alert("Erro", "Não foi possível excluir o treino");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: Colors[colorScheme].background },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: Colors[colorScheme].text }]}>
              Meus Treinos
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: Colors[colorScheme].secondaryText },
              ]}
            >
              {workouts.length} {workouts.length === 1 ? "treino" : "treinos"}{" "}
              criados
            </Text>
          </View>
        </View>

        {/* Floating Action Button - Criar Treino */}
        <TouchableOpacity
          style={[
            styles.fabCreate,
            { backgroundColor: Colors[colorScheme].tint },
          ]}
          onPress={handleCreateWorkout}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#FFF" />
          <Text style={styles.fabText}>Criar Treino</Text>
        </TouchableOpacity>

        {/* Stats Card */}
        {exercisesCount > 0 && (
          <View
            style={[
              styles.statsCard,
              {
                backgroundColor: Colors[colorScheme].card,
              },
            ]}
          >
            <View
              style={[
                styles.statsIconContainer,
                { backgroundColor: Colors[colorScheme].tint + "20" },
              ]}
            >
              <Ionicons
                name="barbell"
                size={24}
                color={Colors[colorScheme].tint}
              />
            </View>
            <View style={styles.statsContent}>
              <Text
                style={[
                  styles.statsNumber,
                  { color: Colors[colorScheme].text },
                ]}
              >
                {exercisesCount}
              </Text>
              <Text
                style={[
                  styles.statsLabel,
                  { color: Colors[colorScheme].secondaryText },
                ]}
              >
                exercícios disponíveis
              </Text>
            </View>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={Colors[colorScheme].tint}
            />
          </View>
        )}

        {/* Lista de Treinos */}
        {workouts.length === 0 ? (
          <View
            style={[
              styles.emptyState,
              {
                backgroundColor: Colors[colorScheme].card,
              },
            ]}
          >
            <View
              style={[
                styles.emptyIconContainer,
                { backgroundColor: Colors[colorScheme].tint + "15" },
              ]}
            >
              <Ionicons
                name="fitness-outline"
                size={64}
                color={Colors[colorScheme].tint}
              />
            </View>
            <Text
              style={[styles.emptyTitle, { color: Colors[colorScheme].text }]}
            >
              Nenhum treino criado
            </Text>
            <Text
              style={[
                styles.emptyDescription,
                { color: Colors[colorScheme].secondaryText },
              ]}
            >
              Comece criando seu primeiro plano de treino personalizado
            </Text>
            <TouchableOpacity
              style={[
                styles.emptyButton,
                { backgroundColor: Colors[colorScheme].tint },
              ]}
              onPress={handleCreateWorkout}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFF" />
              <Text style={styles.emptyButtonText}>Criar Primeiro Treino</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.workoutsList}>
            {workouts.map((workout, index) => (
              <TouchableOpacity
                key={workout.id}
                style={[
                  styles.workoutCard,
                  {
                    backgroundColor: Colors[colorScheme].card,
                  },
                ]}
                onPress={() => handleEditWorkout(workout.id)}
                activeOpacity={0.7}
              >
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.cardIconContainer,
                      { backgroundColor: Colors[colorScheme].tint + "20" },
                    ]}
                  >
                    <Ionicons
                      name="fitness"
                      size={24}
                      color={Colors[colorScheme].tint}
                    />
                  </View>
                  <View style={styles.cardHeaderContent}>
                    <Text
                      style={[
                        styles.workoutName,
                        { color: Colors[colorScheme].text },
                      ]}
                    >
                      {workout.name}
                    </Text>
                    {workout.description && (
                      <Text
                        style={[
                          styles.workoutDescription,
                          { color: Colors[colorScheme].secondaryText },
                        ]}
                        numberOfLines={1}
                      >
                        {workout.description}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Stats */}
                <View style={styles.cardStats}>
                  <View
                    style={[
                      styles.statBadge,
                      { backgroundColor: Colors[colorScheme].tint + "15" },
                    ]}
                  >
                    <Ionicons
                      name="barbell-outline"
                      size={16}
                      color={Colors[colorScheme].tint}
                    />
                    <Text
                      style={[
                        styles.statBadgeText,
                        { color: Colors[colorScheme].tint },
                      ]}
                    >
                      {workout.exercises.length}{" "}
                      {workout.exercises.length === 1
                        ? "exercício"
                        : "exercícios"}
                    </Text>
                  </View>
                </View>

                {/* Divider */}
                <View
                  style={[
                    styles.divider,
                    { backgroundColor: Colors[colorScheme].border },
                  ]}
                />

                {/* Actions */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.actionLink}
                    onPress={() => handleEditWorkout(workout.id)}
                  >
                    <Ionicons
                      name="create-outline"
                      size={18}
                      color={Colors[colorScheme].tint}
                    />
                    <Text
                      style={[
                        styles.actionLinkText,
                        { color: Colors[colorScheme].tint },
                      ]}
                    >
                      Editar
                    </Text>
                  </TouchableOpacity>

                  <View
                    style={[
                      styles.actionDivider,
                      { backgroundColor: Colors[colorScheme].border },
                    ]}
                  />

                  <TouchableOpacity
                    style={styles.actionLink}
                    onPress={() => handleDeleteWorkout(workout)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                    <Text style={[styles.actionLinkText, { color: "#FF3B30" }]}>
                      Excluir
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Spacing para o FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4,
    fontWeight: "500",
  },
  fabCreate: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 20,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statsContent: {
    flex: 1,
  },
  statsNumber: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  statsLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 2,
  },
  emptyState: {
    padding: 40,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  workoutsList: {
    gap: 16,
  },
  workoutCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeaderContent: {
    flex: 1,
  },
  workoutName: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  workoutDescription: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  cardStats: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  statBadgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
  },
  actionLink: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 6,
  },
  actionLinkText: {
    fontSize: 15,
    fontWeight: "600",
  },
  actionDivider: {
    width: 1,
    height: 24,
  },
});
