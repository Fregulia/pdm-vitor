import { BackButton } from "@/components/BackButton";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedInput } from "@/components/ThemedInput";
import { TimeInput } from "@/components/TimeInput";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getAcademyById } from "@/services/academy";
import {
  ClassInput,
  createClass,
  getClassById,
  updateClass,
  validateClassTime,
} from "@/services/classes";
import { db } from "@/services/firebase";
import { getTrainers } from "@/services/trainers";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Trainer {
  id: string;
  name: string;
}

export default function ClassFormScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const classId = params.classId as string | undefined;
  const gymIdParam = params.gymId as string | undefined;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [gymId, setGymId] = useState<string | null>(gymIdParam || null);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [academyHours, setAcademyHours] = useState<any>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [trainerId, setTrainerId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Estados dos dropdowns
  const [trainerDropdownOpen, setTrainerDropdownOpen] = useState(false);
  const [dayDropdownOpen, setDayDropdownOpen] = useState(false);

  // Animações
  const trainerDropdownAnim = useRef(new Animated.Value(0)).current;
  const dayDropdownAnim = useRef(new Animated.Value(0)).current;

  const isEditMode = !!classId;

  const daysOfWeek = [
    { value: "monday", label: "Segunda-feira" },
    { value: "tuesday", label: "Terça-feira" },
    { value: "wednesday", label: "Quarta-feira" },
    { value: "thursday", label: "Quinta-feira" },
    { value: "friday", label: "Sexta-feira" },
    { value: "saturday", label: "Sábado" },
    { value: "sunday", label: "Domingo" },
  ];

  useEffect(() => {
    loadData();
  }, []);

  // Controla animação do dropdown de professor
  const toggleTrainerDropdown = () => {
    const toValue = trainerDropdownOpen ? 0 : 1;
    Animated.spring(trainerDropdownAnim, {
      toValue,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
    setTrainerDropdownOpen(!trainerDropdownOpen);
  };

  // Controla animação do dropdown de dia
  const toggleDayDropdown = () => {
    const toValue = dayDropdownOpen ? 0 : 1;
    Animated.spring(dayDropdownAnim, {
      toValue,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
    setDayDropdownOpen(!dayDropdownOpen);
  };

  const loadData = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      // Busca gymId se não foi passado
      let currentGymId = gymIdParam;
      if (!currentGymId) {
        const academiesRef = collection(db, "academies");
        const q = query(
          academiesRef,
          where("ownerUid", "==", user.uid),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          currentGymId = snapshot.docs[0].id;
        }
      }

      if (!currentGymId) {
        Alert.alert("Erro", "Academia não encontrada");
        router.back();
        return;
      }

      setGymId(currentGymId);

      // Carrega academia para pegar horários
      const academy = await getAcademyById(currentGymId);
      if (academy?.hours) {
        setAcademyHours(academy.hours);
      }

      // Carrega professores
      const trainersList = await getTrainers(currentGymId);
      setTrainers(
        trainersList.map((t: any) => ({
          id: t.uid,
          name: t.name || "Professor",
        }))
      );

      // Se está editando, carrega dados da turma
      if (isEditMode && currentGymId) {
        const classData = await getClassById(currentGymId, classId);
        if (classData) {
          setTitle(classData.title);
          setDescription(classData.description);
          setTrainerId(classData.trainerId || "");
          setDayOfWeek(classData.dayOfWeek);
          setStartTime(classData.startTime);
          setEndTime(classData.endTime);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validações
    if (!title.trim()) {
      Alert.alert("Atenção", "Digite um título para a turma");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Atenção", "Digite uma descrição para a turma");
      return;
    }

    if (!dayOfWeek) {
      Alert.alert("Atenção", "Selecione o dia da semana da turma");
      return;
    }

    if (!startTime || !endTime) {
      Alert.alert("Atenção", "Defina os horários de início e fim");
      return;
    }

    // Valida horários
    if (academyHours) {
      const validation = validateClassTime(startTime, endTime, academyHours);
      if (!validation.valid) {
        Alert.alert("Horário Inválido", validation.error || "");
        return;
      }
    }

    if (!gymId) {
      Alert.alert("Erro", "Academia não identificada");
      return;
    }

    setSubmitting(true);
    try {
      const classData: ClassInput = {
        title: title.trim(),
        description: description.trim(),
        trainerId: trainerId || null,
        dayOfWeek,
        startTime,
        endTime,
        students: [],
      };

      if (isEditMode) {
        await updateClass(gymId, classId, classData);
        Alert.alert("Sucesso", "Turma atualizada com sucesso");
      } else {
        await createClass(gymId, classData);
        Alert.alert("Sucesso", "Turma criada com sucesso");
      }

      router.back();
    } catch (error) {
      console.error("Erro ao salvar turma:", error);
      Alert.alert("Erro", "Não foi possível salvar a turma");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors[colorScheme].background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <BackButton />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.select({ ios: 64, android: 0 })}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              padding: 20,
              paddingTop: insets.top + 60,
              paddingBottom: 40,
            }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={{ marginBottom: 32 }}>
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "700",
                  color: Colors[colorScheme].text,
                  marginBottom: 8,
                }}
              >
                {isEditMode ? "Editar Turma" : "Nova Turma"}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: Colors[colorScheme].secondaryText,
                }}
              >
                {isEditMode
                  ? "Atualize as informações da turma"
                  : "Preencha os dados para criar uma turma"}
              </Text>
            </View>

            {/* Form */}
            <View
              style={{
                backgroundColor: Colors[colorScheme].card,
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <ThemedInput
                label="Título"
                placeholder="Nome da turma"
                value={title}
                onChangeText={setTitle}
                returnKeyType="next"
              />

              <ThemedInput
                label="Descrição"
                placeholder="Descreva a turma"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                autoCorrect={true}
                style={{ height: 80, textAlignVertical: "top" }}
              />

              {/* Seleção de Professor - Dropdown */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "500",
                    marginBottom: 8,
                    color: Colors[colorScheme].text,
                  }}
                >
                  Professor Responsável (Opcional)
                </Text>

                {trainers.length === 0 ? (
                  <Text style={{ color: Colors[colorScheme].secondaryText }}>
                    Nenhum professor cadastrado
                  </Text>
                ) : (
                  <View>
                    {/* Botão do Dropdown */}
                    <TouchableOpacity
                      onPress={toggleTrainerDropdown}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: 14,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: trainerDropdownOpen
                          ? Colors[colorScheme].tint
                          : Colors[colorScheme].border,
                        backgroundColor: Colors[colorScheme].card,
                      }}
                      activeOpacity={0.7}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          flex: 1,
                        }}
                      >
                        <Ionicons
                          name="person"
                          size={20}
                          color={
                            trainerId
                              ? Colors[colorScheme].tint
                              : Colors[colorScheme].secondaryText
                          }
                          style={{ marginRight: 10 }}
                        />
                        <Text
                          style={{
                            fontSize: 16,
                            color: trainerId
                              ? Colors[colorScheme].text
                              : Colors[colorScheme].secondaryText,
                            flex: 1,
                            fontStyle: !trainerId ? "italic" : "normal",
                          }}
                        >
                          {trainerId
                            ? trainers.find((t) => t.id === trainerId)?.name ||
                              "Selecionar"
                            : "Nenhum professor"}
                        </Text>
                      </View>
                      <Animated.View
                        style={{
                          transform: [
                            {
                              rotate: trainerDropdownAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ["0deg", "180deg"],
                              }),
                            },
                          ],
                        }}
                      >
                        <Ionicons
                          name="chevron-down"
                          size={20}
                          color={Colors[colorScheme].secondaryText}
                        />
                      </Animated.View>
                    </TouchableOpacity>

                    {/* Lista de Opções */}
                    <Animated.View
                      style={{
                        maxHeight: trainerDropdownAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 300],
                        }),
                        opacity: trainerDropdownAnim,
                        overflow: "hidden",
                      }}
                    >
                      <View
                        style={{
                          marginTop: 8,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: Colors[colorScheme].border,
                          backgroundColor: Colors[colorScheme].card,
                          overflow: "hidden",
                        }}
                      >
                        {/* Opção "Nenhum professor" */}
                        <TouchableOpacity
                          onPress={() => {
                            setTrainerId("");
                            toggleTrainerDropdown();
                          }}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            padding: 14,
                            borderBottomWidth: trainers.length > 0 ? 1 : 0,
                            borderBottomColor: Colors[colorScheme].border,
                            backgroundColor: !trainerId
                              ? Colors[colorScheme].tint + "15"
                              : "transparent",
                          }}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={
                              !trainerId
                                ? "checkmark-circle"
                                : "close-circle-outline"
                            }
                            size={22}
                            color={
                              !trainerId
                                ? Colors[colorScheme].tint
                                : Colors[colorScheme].secondaryText
                            }
                            style={{ marginRight: 12 }}
                          />
                          <Text
                            style={{
                              fontSize: 16,
                              color: Colors[colorScheme].text,
                              fontWeight: !trainerId ? "600" : "400",
                              fontStyle: "italic",
                            }}
                          >
                            Nenhum professor
                          </Text>
                        </TouchableOpacity>

                        {/* Lista de professores */}
                        {trainers.map((trainer, index) => (
                          <TouchableOpacity
                            key={trainer.id}
                            onPress={() => {
                              setTrainerId(trainer.id);
                              toggleTrainerDropdown();
                            }}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              padding: 14,
                              borderBottomWidth:
                                index < trainers.length - 1 ? 1 : 0,
                              borderBottomColor: Colors[colorScheme].border,
                              backgroundColor:
                                trainerId === trainer.id
                                  ? Colors[colorScheme].tint + "15"
                                  : "transparent",
                            }}
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name={
                                trainerId === trainer.id
                                  ? "checkmark-circle"
                                  : "person-circle-outline"
                              }
                              size={22}
                              color={
                                trainerId === trainer.id
                                  ? Colors[colorScheme].tint
                                  : Colors[colorScheme].secondaryText
                              }
                              style={{ marginRight: 12 }}
                            />
                            <Text
                              style={{
                                fontSize: 16,
                                color: Colors[colorScheme].text,
                                fontWeight:
                                  trainerId === trainer.id ? "600" : "400",
                              }}
                            >
                              {trainer.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </Animated.View>
                  </View>
                )}
              </View>

              {/* Seleção de Dia da Semana - Dropdown */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "500",
                    marginBottom: 8,
                    color: Colors[colorScheme].text,
                  }}
                >
                  Dia da Semana
                </Text>

                <View>
                  {/* Botão do Dropdown */}
                  <TouchableOpacity
                    onPress={toggleDayDropdown}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: 14,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: dayDropdownOpen
                        ? Colors[colorScheme].tint
                        : Colors[colorScheme].border,
                      backgroundColor: Colors[colorScheme].card,
                    }}
                    activeOpacity={0.7}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        flex: 1,
                      }}
                    >
                      <Ionicons
                        name="calendar"
                        size={20}
                        color={
                          dayOfWeek
                            ? Colors[colorScheme].tint
                            : Colors[colorScheme].secondaryText
                        }
                        style={{ marginRight: 10 }}
                      />
                      <Text
                        style={{
                          fontSize: 16,
                          color: dayOfWeek
                            ? Colors[colorScheme].text
                            : Colors[colorScheme].secondaryText,
                          flex: 1,
                        }}
                      >
                        {dayOfWeek
                          ? daysOfWeek.find((d) => d.value === dayOfWeek)
                              ?.label || "Selecionar"
                          : "Selecionar dia da semana"}
                      </Text>
                    </View>
                    <Animated.View
                      style={{
                        transform: [
                          {
                            rotate: dayDropdownAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ["0deg", "180deg"],
                            }),
                          },
                        ],
                      }}
                    >
                      <Ionicons
                        name="chevron-down"
                        size={20}
                        color={Colors[colorScheme].secondaryText}
                      />
                    </Animated.View>
                  </TouchableOpacity>

                  {/* Lista de Opções */}
                  <Animated.View
                    style={{
                      maxHeight: dayDropdownAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 400],
                      }),
                      opacity: dayDropdownAnim,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        marginTop: 8,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: Colors[colorScheme].border,
                        backgroundColor: Colors[colorScheme].card,
                        overflow: "hidden",
                      }}
                    >
                      {daysOfWeek.map((day, index) => (
                        <TouchableOpacity
                          key={day.value}
                          onPress={() => {
                            setDayOfWeek(day.value);
                            toggleDayDropdown();
                          }}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            padding: 14,
                            borderBottomWidth:
                              index < daysOfWeek.length - 1 ? 1 : 0,
                            borderBottomColor: Colors[colorScheme].border,
                            backgroundColor:
                              dayOfWeek === day.value
                                ? Colors[colorScheme].tint + "15"
                                : "transparent",
                          }}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={
                              dayOfWeek === day.value
                                ? "checkmark-circle"
                                : "calendar-outline"
                            }
                            size={22}
                            color={
                              dayOfWeek === day.value
                                ? Colors[colorScheme].tint
                                : Colors[colorScheme].secondaryText
                            }
                            style={{ marginRight: 12 }}
                          />
                          <Text
                            style={{
                              fontSize: 16,
                              color: Colors[colorScheme].text,
                              fontWeight:
                                dayOfWeek === day.value ? "600" : "400",
                            }}
                          >
                            {day.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </Animated.View>
                </View>
              </View>

              {/* Horários */}
              <View style={{ gap: 12 }}>
                <TimeInput
                  label="Horário de Início"
                  value={startTime}
                  onChange={setStartTime}
                />
                <TimeInput
                  label="Horário de Término"
                  value={endTime}
                  onChange={setEndTime}
                />
              </View>

              {academyHours && (
                <View
                  style={{
                    marginTop: 12,
                    padding: 12,
                    backgroundColor: Colors[colorScheme].tint + "10",
                    borderRadius: 8,
                    flexDirection: "row",
                    gap: 8,
                  }}
                >
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color={Colors[colorScheme].tint}
                  />
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 13,
                      color: Colors[colorScheme].text,
                    }}
                  >
                    Horário da academia: {academyHours.weekdays.open} às{" "}
                    {academyHours.weekdays.close}
                  </Text>
                </View>
              )}
            </View>

            {/* Botão Salvar */}
            <ThemedButton
              title={isEditMode ? "Atualizar Turma" : "Criar Turma"}
              onPress={handleSubmit}
              loading={submitting}
              icon={
                <Ionicons
                  name={isEditMode ? "checkmark-circle" : "add-circle"}
                  size={20}
                  color="#FFF"
                  style={{ marginRight: 8 }}
                />
              }
            />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}
