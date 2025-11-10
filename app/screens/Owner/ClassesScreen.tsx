import { MenuButton } from "@/components/MenuButton";
import { ThemedButton } from "@/components/ThemedButton";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Class, deleteClass, getClasses } from "@/services/classes";
import { db } from "@/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ClassesScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [gymId, setGymId] = useState<string | null>(null);

  const getDayLabel = (day: string) => {
    const days: Record<string, string> = {
      monday: "Segunda",
      tuesday: "Terça",
      wednesday: "Quarta",
      thursday: "Quinta",
      friday: "Sexta",
      saturday: "Sábado",
      sunday: "Domingo",
    };
    return days[day] || day;
  };

  const loadData = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      // Busca a academia pelo ownerId usando query
      const academiesRef = collection(db, "academies");
      const q = query(
        academiesRef,
        where("ownerUid", "==", user.uid),
        limit(1)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const academyDoc = snapshot.docs[0];
        const academyGymId = academyDoc.id;
        setGymId(academyGymId);
        const classesList = await getClasses(academyGymId);
        setClasses(classesList);
      }
    } catch (error) {
      console.error("Erro ao carregar turmas:", error);
      Alert.alert("Erro", "Não foi possível carregar as turmas");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user?.uid])
  );

  const handleDeleteClass = (classItem: Class) => {
    Alert.alert(
      "Excluir Turma",
      `Tem certeza que deseja excluir a turma "${classItem.title}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              if (gymId) {
                await deleteClass(gymId, classItem.id);
                await loadData();
                Alert.alert("Sucesso", "Turma excluída com sucesso");
              }
            } catch (error) {
              Alert.alert("Erro", "Não foi possível excluir a turma");
            }
          },
        },
      ]
    );
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
    <View
      style={{
        flex: 1,
        backgroundColor: Colors[colorScheme].background,
        paddingTop: insets.top,
      }}
    >
      <MenuButton />
      {/* Header */}
      <View style={{ padding: 20, paddingBottom: 16 }}>
        <Text
          style={{
            fontSize: 32,
            fontWeight: "700",
            color: Colors[colorScheme].text,
            marginBottom: 4,
          }}
        >
          Turmas
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: Colors[colorScheme].secondaryText,
          }}
        >
          {classes.length} {classes.length === 1 ? "turma" : "turmas"}{" "}
          cadastrada{classes.length === 1 ? "" : "s"}
        </Text>
      </View>

      {/* Botão Adicionar */}
      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        <ThemedButton
          title="Nova Turma"
          onPress={() => router.push("/class-form")}
          icon={
            <Ionicons
              name="add-circle"
              size={20}
              color="#FFF"
              style={{ marginRight: 8 }}
            />
          }
        />
      </View>

      {/* Lista de Turmas */}
      {classes.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
          }}
        >
          <Ionicons
            name="calendar-outline"
            size={80}
            color={Colors[colorScheme].secondaryText}
            style={{ opacity: 0.3, marginBottom: 16 }}
          />
          <Text
            style={{
              color: Colors[colorScheme].text,
              fontSize: 18,
              fontWeight: "600",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Nenhuma turma cadastrada
          </Text>
          <Text
            style={{
              color: Colors[colorScheme].secondaryText,
              textAlign: "center",
              fontSize: 15,
            }}
          >
            Crie sua primeira turma para começar
          </Text>
        </View>
      ) : (
        <FlatList
          data={classes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingTop: 0 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/class-detail",
                  params: { classId: item.id, gymId: gymId || "" },
                })
              }
              style={{
                backgroundColor: Colors[colorScheme].card,
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
              activeOpacity={0.7}
            >
              {/* Header da Turma */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 12,
                }}
              >
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: Colors[colorScheme].text,
                      marginBottom: 4,
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: Colors[colorScheme].secondaryText,
                      lineHeight: 20,
                    }}
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>
                </View>

                {/* Botões de Ação */}
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/class-form",
                        params: { classId: item.id, gymId: gymId || "" },
                      })
                    }
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      backgroundColor: Colors[colorScheme].tint + "20",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="create"
                      size={18}
                      color={Colors[colorScheme].tint}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteClass(item)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      backgroundColor: "#ff4444" + "20",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="trash" size={18} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Informações */}
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 12,
                  marginTop: 8,
                }}
              >
                {/* Dia da Semana */}
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="calendar"
                    size={16}
                    color={Colors[colorScheme].icon}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      color: Colors[colorScheme].secondaryText,
                    }}
                  >
                    {getDayLabel(item.dayOfWeek)}
                  </Text>
                </View>

                {/* Horário */}
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="time"
                    size={16}
                    color={Colors[colorScheme].icon}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      color: Colors[colorScheme].secondaryText,
                    }}
                  >
                    {item.startTime} - {item.endTime}
                  </Text>
                </View>

                {/* Número de Alunos */}
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="people"
                    size={16}
                    color={Colors[colorScheme].icon}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      color: Colors[colorScheme].secondaryText,
                    }}
                  >
                    {item.students?.length || 0} aluno
                    {item.students?.length === 1 ? "" : "s"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
