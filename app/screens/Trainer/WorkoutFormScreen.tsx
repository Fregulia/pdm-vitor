import { ThemedButton } from "@/components/ThemedButton";
import { ThemedInput } from "@/components/ThemedInput";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  createExercise,
  Exercise,
  ExerciseCategory,
  getExercises,
} from "@/services/exercises";
import { getTrainerContext } from "@/services/trainers";
import {
  createWorkout,
  getWorkoutById,
  updateWorkout,
  WorkoutExercise,
} from "@/services/workouts";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WorkoutFormScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const workoutId = params.id as string | undefined;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gymId, setGymId] = useState<string | null>(null);

  // Formulário
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>(
    []
  );

  // Modal de seleção de exercícios
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<ExerciseCategory | null>(null);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);

  // Modal de criação de exercício personalizado
  const [showCreateExercise, setShowCreateExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseDescription, setNewExerciseDescription] = useState("");
  const [newExerciseCategory, setNewExerciseCategory] =
    useState<ExerciseCategory>("peito");

  // Modal de configuração de exercício
  const [editingExercise, setEditingExercise] = useState<{
    index: number;
    exercise: WorkoutExercise;
  } | null>(null);
  const [exerciseSets, setExerciseSets] = useState("");
  const [exerciseReps, setExerciseReps] = useState("");
  const [exerciseRest, setExerciseRest] = useState("");
  const [exerciseNotes, setExerciseNotes] = useState("");

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const context = await getTrainerContext();
      if (!context?.gymId) {
        Alert.alert("Erro", "Você não está vinculado a nenhuma academia");
        router.back();
        return;
      }

      setGymId(context.gymId);

      // Carrega exercícios disponíveis
      const exercises = await getExercises(context.gymId);
      setAvailableExercises(exercises);

      // Se está editando, carrega os dados do treino
      if (workoutId) {
        const workout = await getWorkoutById(context.gymId, workoutId);
        if (workout) {
          setName(workout.name);
          setDescription(workout.description || "");
          setSelectedExercises(workout.exercises);
        } else {
          Alert.alert("Erro", "Treino não encontrado");
          router.back();
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenCategoryPicker = () => {
    setShowCategoryPicker(true);
  };

  const handleSelectCategory = (category: ExerciseCategory) => {
    setSelectedCategory(category);
    setShowCategoryPicker(false);

    // Filtra exercícios pela categoria selecionada
    const filtered = availableExercises.filter(
      (ex) => ex.category === category
    );
    setFilteredExercises(filtered);

    // Abre o modal de seleção de exercícios
    setShowExercisePicker(true);
  };

  const handleAddExercise = (exercise: Exercise) => {
    setShowExercisePicker(false);

    // Abre modal para configurar sets, reps, rest
    setEditingExercise({
      index: -1, // -1 indica novo exercício
      exercise: {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets: 3,
        reps: "12",
        rest: "60s",
        notes: "",
      },
    });
    setExerciseSets("3");
    setExerciseReps("12");
    setExerciseRest("60s");
    setExerciseNotes("");
  };

  const handleEditExercise = (index: number) => {
    const exercise = selectedExercises[index];
    setEditingExercise({ index, exercise });
    setExerciseSets(exercise.sets.toString());
    setExerciseReps(exercise.reps);
    setExerciseRest(exercise.rest);
    setExerciseNotes(exercise.notes || "");
  };

  const handleSaveExerciseConfig = () => {
    if (!editingExercise) return;

    const sets = parseInt(exerciseSets) || 3;
    if (sets <= 0) {
      Alert.alert("Erro", "Número de séries inválido");
      return;
    }

    const updatedExercise: WorkoutExercise = {
      ...editingExercise.exercise,
      sets,
      reps: exerciseReps || "12",
      rest: exerciseRest || "60s",
      notes: exerciseNotes,
    };

    if (editingExercise.index === -1) {
      // Novo exercício
      setSelectedExercises([...selectedExercises, updatedExercise]);
    } else {
      // Editar existente
      const updated = [...selectedExercises];
      updated[editingExercise.index] = updatedExercise;
      setSelectedExercises(updated);
    }

    setEditingExercise(null);
  };

  const handleRemoveExercise = (index: number) => {
    Alert.alert(
      "Remover Exercício",
      "Deseja remover este exercício do treino?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => {
            const updated = selectedExercises.filter((_, i) => i !== index);
            setSelectedExercises(updated);
          },
        },
      ]
    );
  };

  const handleCreateCustomExercise = async () => {
    if (!newExerciseName.trim()) {
      Alert.alert("Erro", "Digite um nome para o exercício");
      return;
    }

    if (!gymId) return;

    try {
      await createExercise(gymId, {
        name: newExerciseName.trim(),
        description: newExerciseDescription.trim(),
        category: newExerciseCategory,
      });

      // Recarrega a lista de exercícios
      const exercises = await getExercises(gymId);
      setAvailableExercises(exercises);

      // Limpa o formulário
      setNewExerciseName("");
      setNewExerciseDescription("");
      setShowCreateExercise(false);

      Alert.alert("Sucesso", "Exercício criado com sucesso!");

      // Abre o seletor de categoria para o usuário adicionar o novo exercício
      setShowCategoryPicker(true);
    } catch (error) {
      console.error("Erro ao criar exercício:", error);
      Alert.alert("Erro", "Não foi possível criar o exercício");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Erro", "Digite um nome para o treino");
      return;
    }

    if (selectedExercises.length === 0) {
      Alert.alert("Erro", "Adicione pelo menos um exercício");
      return;
    }

    if (!gymId) return;

    try {
      setSaving(true);

      const workoutData = {
        name: name.trim(),
        description: description.trim(),
        exercises: selectedExercises,
      };

      if (workoutId) {
        await updateWorkout(gymId, workoutId, workoutData);
        Alert.alert("Sucesso", "Treino atualizado com sucesso");
      } else {
        await createWorkout(gymId, user!.uid, workoutData);
        Alert.alert("Sucesso", "Treino criado com sucesso");
      }

      router.back();
    } catch (error) {
      console.error("Erro ao salvar treino:", error);
      Alert.alert("Erro", "Não foi possível salvar o treino");
    } finally {
      setSaving(false);
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
      {/* Header */}
      <View
        style={[
          styles.header,
          { borderBottomColor: Colors[colorScheme].border },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={Colors[colorScheme].text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[colorScheme].text }]}>
          {workoutId ? "Editar Treino" : "Novo Treino"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Informações básicas */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}
          >
            Informações Básicas
          </Text>

          <ThemedInput
            placeholder="Nome do treino"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <ThemedInput
            placeholder="Descrição (opcional)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={{ height: 80 }}
          />
        </View>

        {/* Exercícios */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text
              style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}
            >
              Exercícios ({selectedExercises.length})
            </Text>
            <TouchableOpacity
              onPress={handleOpenCategoryPicker}
              style={[
                styles.addButton,
                { backgroundColor: Colors[colorScheme].tint },
              ]}
            >
              <Ionicons name="add" size={20} color="#FFF" />
              <Text style={styles.addButtonText}>Adicionar</Text>
            </TouchableOpacity>
          </View>

          {selectedExercises.length === 0 ? (
            <View
              style={[
                styles.emptyState,
                {
                  backgroundColor: Colors[colorScheme].card,
                  borderColor: Colors[colorScheme].border,
                },
              ]}
            >
              <Ionicons
                name="barbell-outline"
                size={48}
                color={Colors[colorScheme].secondaryText}
              />
              <Text
                style={[
                  styles.emptyText,
                  { color: Colors[colorScheme].secondaryText },
                ]}
              >
                Nenhum exercício adicionado
              </Text>
            </View>
          ) : (
            <View style={styles.exercisesList}>
              {selectedExercises.map((exercise, index) => (
                <View
                  key={index}
                  style={[
                    styles.exerciseCard,
                    {
                      backgroundColor: Colors[colorScheme].card,
                      borderColor: Colors[colorScheme].border,
                    },
                  ]}
                >
                  <View style={styles.exerciseInfo}>
                    <Text
                      style={[
                        styles.exerciseName,
                        { color: Colors[colorScheme].text },
                      ]}
                    >
                      {index + 1}. {exercise.exerciseName}
                    </Text>
                    <Text
                      style={[
                        styles.exerciseDetails,
                        { color: Colors[colorScheme].secondaryText },
                      ]}
                    >
                      {exercise.sets}x{exercise.reps} • {exercise.rest} descanso
                    </Text>
                    {exercise.notes && (
                      <Text
                        style={[
                          styles.exerciseNotes,
                          { color: Colors[colorScheme].secondaryText },
                        ]}
                      >
                        {exercise.notes}
                      </Text>
                    )}
                  </View>

                  <View style={styles.exerciseActions}>
                    <TouchableOpacity
                      onPress={() => handleEditExercise(index)}
                      style={styles.iconButton}
                    >
                      <Ionicons
                        name="create-outline"
                        size={20}
                        color={Colors[colorScheme].tint}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRemoveExercise(index)}
                      style={styles.iconButton}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#FF3B30"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Botão salvar */}
        <View style={{ marginTop: 24, marginBottom: 32 }}>
          <ThemedButton
            title={workoutId ? "Salvar Alterações" : "Criar Treino"}
            onPress={handleSave}
            disabled={saving}
            loading={saving}
          />
        </View>
      </ScrollView>

      {/* Modal de seleção de categoria */}
      <Modal
        visible={showCategoryPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.categoryModal,
              { backgroundColor: Colors[colorScheme].background },
            ]}
          >
            <View
              style={[
                styles.categoryHeader,
                { borderBottomColor: Colors[colorScheme].border },
              ]}
            >
              <Text
                style={[
                  styles.categoryTitle,
                  { color: Colors[colorScheme].text },
                ]}
              >
                Selecione o Grupo Muscular
              </Text>
              <TouchableOpacity
                onPress={() => setShowCategoryPicker(false)}
                style={styles.closeButton}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={Colors[colorScheme].text}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.categoryContent}>
              <View style={styles.categoryGrid}>
                {[
                  {
                    key: "peito" as ExerciseCategory,
                    icon: "body",
                    label: "Peito",
                  },
                  {
                    key: "costas" as ExerciseCategory,
                    icon: "body",
                    label: "Costas",
                  },
                  {
                    key: "biceps" as ExerciseCategory,
                    icon: "arm",
                    label: "Bíceps",
                  },
                  {
                    key: "triceps" as ExerciseCategory,
                    icon: "arm",
                    label: "Tríceps",
                  },
                  {
                    key: "ombros" as ExerciseCategory,
                    icon: "fitness",
                    label: "Ombros",
                  },
                  {
                    key: "quadriceps" as ExerciseCategory,
                    icon: "walk",
                    label: "Quadríceps",
                  },
                  {
                    key: "posterior" as ExerciseCategory,
                    icon: "walk",
                    label: "Posterior",
                  },
                  {
                    key: "panturrilha" as ExerciseCategory,
                    icon: "walk",
                    label: "Panturrilha",
                  },
                  {
                    key: "gluteos" as ExerciseCategory,
                    icon: "body",
                    label: "Glúteos",
                  },
                ].map((category) => (
                  <TouchableOpacity
                    key={category.key}
                    style={[
                      styles.categoryCard,
                      {
                        backgroundColor: Colors[colorScheme].card,
                        borderColor: Colors[colorScheme].border,
                      },
                    ]}
                    onPress={() => handleSelectCategory(category.key)}
                  >
                    <View
                      style={[
                        styles.categoryIconContainer,
                        { backgroundColor: Colors[colorScheme].tint + "20" },
                      ]}
                    >
                      <Ionicons
                        name={category.icon as any}
                        size={32}
                        color={Colors[colorScheme].tint}
                      />
                    </View>
                    <Text
                      style={[
                        styles.categoryLabel,
                        { color: Colors[colorScheme].text },
                      ]}
                    >
                      {category.label}
                    </Text>
                    <Text
                      style={[
                        styles.categoryCount,
                        { color: Colors[colorScheme].secondaryText },
                      ]}
                    >
                      {
                        availableExercises.filter(
                          (ex) => ex.category === category.key
                        ).length
                      }{" "}
                      exercícios
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Botão para criar exercício personalizado */}
              <TouchableOpacity
                style={[
                  styles.createExerciseButton,
                  {
                    backgroundColor: Colors[colorScheme].tint + "15",
                    borderColor: Colors[colorScheme].tint,
                  },
                ]}
                onPress={() => {
                  setShowCategoryPicker(false);
                  setShowCreateExercise(true);
                }}
              >
                <Ionicons
                  name="add-circle"
                  size={24}
                  color={Colors[colorScheme].tint}
                />
                <Text
                  style={[
                    styles.createExerciseButtonText,
                    { color: Colors[colorScheme].tint },
                  ]}
                >
                  Criar Exercício Personalizado
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de seleção de exercícios */}
      <Modal
        visible={showExercisePicker}
        animationType="slide"
        onRequestClose={() => setShowExercisePicker(false)}
      >
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: Colors[colorScheme].background },
          ]}
        >
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: Colors[colorScheme].border },
            ]}
          >
            <TouchableOpacity
              onPress={() => setShowExercisePicker(false)}
              style={styles.backButton}
            >
              <Ionicons
                name="close"
                size={24}
                color={Colors[colorScheme].text}
              />
            </TouchableOpacity>
            <Text
              style={[styles.modalTitle, { color: Colors[colorScheme].text }]}
            >
              {selectedCategory
                ? `Exercícios - ${
                    selectedCategory.charAt(0).toUpperCase() +
                    selectedCategory.slice(1)
                  }`
                : "Selecionar Exercício"}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <FlatList
            data={filteredExercises}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={
              <View style={styles.emptyExercises}>
                <Ionicons
                  name="barbell-outline"
                  size={48}
                  color={Colors[colorScheme].secondaryText}
                />
                <Text
                  style={[
                    styles.emptyExercisesText,
                    { color: Colors[colorScheme].secondaryText },
                  ]}
                >
                  Nenhum exercício encontrado nesta categoria
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.exercisePickerItem,
                  {
                    backgroundColor: Colors[colorScheme].card,
                    borderColor: Colors[colorScheme].border,
                  },
                ]}
                onPress={() => handleAddExercise(item)}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.exercisePickerName,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      styles.exercisePickerCategory,
                      { color: Colors[colorScheme].secondaryText },
                    ]}
                  >
                    {item.category}
                  </Text>
                  {item.description && (
                    <Text
                      style={[
                        styles.exercisePickerDescription,
                        { color: Colors[colorScheme].secondaryText },
                      ]}
                      numberOfLines={2}
                    >
                      {item.description}
                    </Text>
                  )}
                </View>
                <Ionicons
                  name="add-circle"
                  size={24}
                  color={Colors[colorScheme].tint}
                />
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* Modal de configuração de exercício */}
      <Modal
        visible={editingExercise !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setEditingExercise(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View
              style={[
                styles.configModal,
                { backgroundColor: Colors[colorScheme].background },
              ]}
            >
              <View
                style={[
                  styles.configHeader,
                  { borderBottomColor: Colors[colorScheme].border },
                ]}
              >
                <Text
                  style={[
                    styles.configTitle,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  {editingExercise?.exercise.exerciseName}
                </Text>
              </View>

              <ScrollView
                style={styles.configContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <ThemedInput
                  label="Séries"
                  placeholder="Ex: 3"
                  value={exerciseSets}
                  onChangeText={setExerciseSets}
                  keyboardType="number-pad"
                />

                <ThemedInput
                  label="Repetições"
                  placeholder="Ex: 12, 10-12, até a falha"
                  value={exerciseReps}
                  onChangeText={setExerciseReps}
                />

                <ThemedInput
                  label="Descanso"
                  placeholder="Ex: 60s, 1-2min"
                  value={exerciseRest}
                  onChangeText={setExerciseRest}
                />

                <ThemedInput
                  label="Observações (opcional)"
                  placeholder="Ex: Usar pegada pronada"
                  value={exerciseNotes}
                  onChangeText={setExerciseNotes}
                  multiline
                  numberOfLines={2}
                />
              </ScrollView>

              <View style={styles.configActions}>
                <TouchableOpacity
                  style={[
                    styles.configButton,
                    {
                      backgroundColor: Colors[colorScheme].card,
                      borderColor: Colors[colorScheme].border,
                    },
                  ]}
                  onPress={() => setEditingExercise(null)}
                >
                  <Text
                    style={[
                      styles.configButtonText,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.configButton,
                    { backgroundColor: Colors[colorScheme].tint },
                  ]}
                  onPress={handleSaveExerciseConfig}
                >
                  <Text style={[styles.configButtonText, { color: "#FFF" }]}>
                    Confirmar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal de criação de exercício personalizado */}
      <Modal
        visible={showCreateExercise}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateExercise(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.configModal,
              { backgroundColor: Colors[colorScheme].background },
            ]}
          >
            <View
              style={[
                styles.configHeader,
                { borderBottomColor: Colors[colorScheme].border },
              ]}
            >
              <Text
                style={[
                  styles.configTitle,
                  { color: Colors[colorScheme].text },
                ]}
              >
                Criar Exercício Personalizado
              </Text>
            </View>

            <ScrollView style={styles.configContent}>
              <ThemedInput
                label="Nome do Exercício"
                placeholder="Ex: Supino Inclinado com Halteres"
                value={newExerciseName}
                onChangeText={setNewExerciseName}
                autoCapitalize="words"
              />

              <ThemedInput
                label="Descrição"
                placeholder="Descreva como executar o exercício"
                value={newExerciseDescription}
                onChangeText={setNewExerciseDescription}
                multiline
                numberOfLines={3}
                style={{ height: 80 }}
              />

              <Text
                style={[styles.inputLabel, { color: Colors[colorScheme].text }]}
              >
                Categoria
              </Text>
              <View style={styles.categoryPicker}>
                {[
                  { key: "peito" as ExerciseCategory, label: "Peito" },
                  { key: "costas" as ExerciseCategory, label: "Costas" },
                  { key: "biceps" as ExerciseCategory, label: "Bíceps" },
                  { key: "triceps" as ExerciseCategory, label: "Tríceps" },
                  { key: "ombros" as ExerciseCategory, label: "Ombros" },
                  {
                    key: "quadriceps" as ExerciseCategory,
                    label: "Quadríceps",
                  },
                  { key: "posterior" as ExerciseCategory, label: "Posterior" },
                  {
                    key: "panturrilha" as ExerciseCategory,
                    label: "Panturrilha",
                  },
                  { key: "gluteos" as ExerciseCategory, label: "Glúteos" },
                ].map((category) => (
                  <TouchableOpacity
                    key={category.key}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor:
                          newExerciseCategory === category.key
                            ? Colors[colorScheme].tint
                            : Colors[colorScheme].card,
                        borderColor:
                          newExerciseCategory === category.key
                            ? Colors[colorScheme].tint
                            : Colors[colorScheme].border,
                      },
                    ]}
                    onPress={() => setNewExerciseCategory(category.key)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        {
                          color:
                            newExerciseCategory === category.key
                              ? "#FFF"
                              : Colors[colorScheme].text,
                        },
                      ]}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.configActions}>
              <TouchableOpacity
                style={[
                  styles.configButton,
                  {
                    backgroundColor: Colors[colorScheme].card,
                    borderColor: Colors[colorScheme].border,
                  },
                ]}
                onPress={() => {
                  setShowCreateExercise(false);
                  setNewExerciseName("");
                  setNewExerciseDescription("");
                }}
              >
                <Text
                  style={[
                    styles.configButtonText,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.configButton,
                  { backgroundColor: Colors[colorScheme].tint },
                ]}
                onPress={handleCreateCustomExercise}
              >
                <Text style={[styles.configButtonText, { color: "#FFF" }]}>
                  Criar Exercício
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
  },
  exercisesList: {
    gap: 12,
  },
  exerciseCard: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 14,
    marginBottom: 2,
  },
  exerciseNotes: {
    fontSize: 12,
    fontStyle: "italic",
  },
  exerciseActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  exercisePickerItem: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
    alignItems: "center",
  },
  exercisePickerName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  exercisePickerCategory: {
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  exercisePickerDescription: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  categoryModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  categoryContent: {
    padding: 16,
  },
  categoryGrid: {
    gap: 12,
  },
  categoryCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 12,
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  categoryLabel: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 14,
  },
  createExerciseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginTop: 16,
    marginBottom: 8,
    gap: 8,
  },
  createExerciseButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  emptyExercises: {
    alignItems: "center",
    padding: 40,
  },
  emptyExercisesText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: "center",
  },
  configModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  configHeader: {
    padding: 20,
    borderBottomWidth: 1,
  },
  configTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  configContent: {
    padding: 20,
  },
  configActions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  configButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  configButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 8,
  },
  categoryPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
