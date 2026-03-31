// COMPONENTES
import { BackButton } from "@/components/BackButton";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedInput } from "@/components/ThemedInput";

// CONSTANTES
import { GlobalStyles } from "@/constants/styles";
import { Colors } from "@/constants/theme";

// CONTEXTOS E HOOKS
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

// SERVIÇOS
import { getAcademy } from "@/services/academy";
import {
  createPlan,
  deletePlan,
  getPlans,
  Plan,
  PlanInput,
  PlanValidity,
  updatePlan,
} from "@/services/plans";

// BIBLIOTECAS EXTERNAS
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const VALIDITY_LABELS: Record<PlanValidity, string> = {
  daily: "Diário",
  monthly: "Mensal",
  quarterly: "Trimestral",
  annual: "Anual",
};

export default function PlansManagementScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme() ?? "light";

  const [gymId, setGymId] = useState<string>("");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [validity, setValidity] = useState<PlanValidity>("monthly");

  useEffect(() => {
    loadPlans();
  }, [user?.uid]);

  const loadPlans = async () => {
    if (!user?.uid) return;
    const academy = await getAcademy(user.uid);
    if (academy) {
      const id = (academy as any).id || user.uid;
      setGymId(id);
      const existingPlans = await getPlans(id);
      setPlans(existingPlans);
    }
  };

  const openModal = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setTitle(plan.title);
      setDescription(plan.description);
      setPrice(plan.price.toFixed(2).replace(".", ","));
      setValidity(plan.validity);
    } else {
      setEditingPlan(null);
      setTitle("");
      setDescription("");
      setPrice("");
      setValidity("monthly");
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingPlan(null);
    setTitle("");
    setDescription("");
    setPrice("");
    setValidity("monthly");
  };

  const handleSavePlan = async () => {
    if (!title || !description || !price) {
      Alert.alert("Campos obrigatórios", "Preencha todos os campos do plano.");
      return;
    }

    const priceNum = parseFloat(price.replace(",", "."));
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert("Valor inválido", "Digite um valor válido para o plano.");
      return;
    }

    try {
      setLoading(true);
      const planData: PlanInput = {
        title,
        description,
        price: priceNum,
        validity,
      };

      if (editingPlan) {
        await updatePlan(gymId, editingPlan.id, planData);
      } else {
        await createPlan(gymId, planData);
      }

      await loadPlans();
      closeModal();
      Keyboard.dismiss();
    } catch (e: any) {
      Alert.alert("Erro", e?.message || "Não foi possível salvar o plano.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    Alert.alert("Excluir plano", "Tem certeza que deseja excluir este plano?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePlan(gymId, planId);
            await loadPlans();
          } catch (e: any) {
            Alert.alert("Erro", "Não foi possível excluir o plano.");
          }
        },
      },
    ]);
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}
    >
      <BackButton />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 24,
          paddingTop: 72,
          paddingBottom: 40,
        }}
      >
        <Text
          style={[
            GlobalStyles.title,
            { color: Colors[colorScheme].text, marginBottom: 8 },
          ]}
        >
          Gerenciar Planos
        </Text>
        <Text
          style={[
            GlobalStyles.subtitle,
            { color: Colors[colorScheme].secondaryText, marginBottom: 24 },
          ]}
        >
          Adicione, edite ou remova os planos da sua academia.
        </Text>

        {plans.length === 0 ? (
          <View
            style={{
              padding: 32,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="pricetag-outline"
              size={64}
              color={Colors[colorScheme].secondaryText}
            />
            <Text
              style={{
                color: Colors[colorScheme].text,
                fontSize: 18,
                fontWeight: "600",
                marginTop: 16,
                textAlign: "center",
              }}
            >
              Nenhum plano cadastrado
            </Text>
            <Text
              style={{
                color: Colors[colorScheme].secondaryText,
                fontSize: 14,
                marginTop: 8,
                textAlign: "center",
              }}
            >
              Adicione o primeiro plano da sua academia
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12, marginBottom: 24 }}>
            {plans.map((plan) => (
              <View
                key={plan.id}
                style={{
                  backgroundColor: Colors[colorScheme].card,
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: Colors[colorScheme].border,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: Colors[colorScheme].text,
                        fontSize: 16,
                        fontWeight: "600",
                        marginBottom: 4,
                      }}
                    >
                      {plan.title}
                    </Text>
                    <Text
                      style={{
                        color: Colors[colorScheme].secondaryText,
                        fontSize: 14,
                        marginBottom: 8,
                      }}
                    >
                      {plan.description}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: Colors[colorScheme].tint,
                          fontSize: 18,
                          fontWeight: "700",
                        }}
                      >
                        R$ {plan.price.toFixed(2).replace(".", ",")}
                      </Text>
                      <Text
                        style={{
                          color: Colors[colorScheme].secondaryText,
                          fontSize: 14,
                        }}
                      >
                        {VALIDITY_LABELS[plan.validity]}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => openModal(plan)}
                      style={{ padding: 4 }}
                    >
                      <Ionicons
                        name="pencil"
                        size={20}
                        color={Colors[colorScheme].tint}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeletePlan(plan.id)}
                      style={{ padding: 4 }}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={Colors[colorScheme].destructive}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <ThemedButton
          title="Adicionar Novo Plano"
          onPress={() => openModal()}
          icon={<Ionicons name="add" size={20} color="#fff" />}
        />
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "flex-end",
              }}
            >
              <View
                style={{
                  backgroundColor: Colors[colorScheme].background,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  padding: 24,
                  maxHeight: "90%",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <Text
                    style={{
                      color: Colors[colorScheme].text,
                      fontSize: 20,
                      fontWeight: "700",
                    }}
                  >
                    {editingPlan ? "Editar Plano" : "Novo Plano"}
                  </Text>
                  <TouchableOpacity onPress={closeModal}>
                    <Ionicons
                      name="close"
                      size={28}
                      color={Colors[colorScheme].text}
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <ThemedInput
                    placeholder="Título do plano"
                    value={title}
                    onChangeText={setTitle}
                    returnKeyType="next"
                  />
                  <ThemedInput
                    placeholder="Descrição"
                    value={description}
                    onChangeText={setDescription}
                    returnKeyType="next"
                    multiline
                  />
                  <ThemedInput
                    placeholder="Valor (R$)"
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                  />

                  <Text
                    style={{
                      color: Colors[colorScheme].text,
                      fontSize: 14,
                      fontWeight: "600",
                      marginBottom: 8,
                      marginTop: 8,
                    }}
                  >
                    Validade
                  </Text>
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                  >
                    {(
                      [
                        "daily",
                        "monthly",
                        "quarterly",
                        "annual",
                      ] as PlanValidity[]
                    ).map((v) => (
                      <TouchableOpacity
                        key={v}
                        onPress={() => setValidity(v)}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderRadius: 8,
                          backgroundColor:
                            validity === v
                              ? Colors[colorScheme].tint
                              : Colors[colorScheme].card,
                          borderWidth: 1,
                          borderColor:
                            validity === v
                              ? Colors[colorScheme].tint
                              : Colors[colorScheme].border,
                        }}
                      >
                        <Text
                          style={{
                            color:
                              validity === v ? "#FFF" : Colors[colorScheme].text,
                            fontWeight: validity === v ? "600" : "400",
                          }}
                        >
                          {VALIDITY_LABELS[v]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <ThemedButton
                    title={loading ? "Salvando..." : "Salvar"}
                    onPress={handleSavePlan}
                    disabled={loading}
                    style={{ marginTop: 24 }}
                  />
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
