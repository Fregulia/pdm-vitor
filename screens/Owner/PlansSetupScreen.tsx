// COMPONENTES
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
} from "@/services/plans";

// BIBLIOTECAS EXTERNAS
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
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

export default function PlansSetupScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme() ?? "light";

  const [gymId, setGymId] = useState<string>("");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [validity, setValidity] = useState<PlanValidity>("monthly");

  useEffect(() => {
    (async () => {
      if (!user?.uid) return;
      const academy = await getAcademy(user.uid);
      if (academy) {
        const id = (academy as any).id || user.uid;
        setGymId(id);
        const existingPlans = await getPlans(id);
        setPlans(existingPlans);
      }
    })();
  }, [user?.uid]);

  const handleAddPlan = async () => {
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
      await createPlan(gymId, planData);
      const updatedPlans = await getPlans(gymId);
      setPlans(updatedPlans);
      setTitle("");
      setDescription("");
      setPrice("");
      setValidity("monthly");
      Keyboard.dismiss();
    } catch (e: any) {
      Alert.alert("Erro", e?.message || "Não foi possível adicionar o plano.");
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
            setPlans((prev) => prev.filter((p) => p.id !== planId));
          } catch (e: any) {
            Alert.alert("Erro", "Não foi possível excluir o plano.");
          }
        },
      },
    ]);
  };

  const handleFinish = () => {
    if (plans.length === 0) {
      Alert.alert(
        "Nenhum plano cadastrado",
        "Cadastre pelo menos um plano antes de continuar.",
        [{ text: "OK" }]
      );
      return;
    }
    router.replace({ pathname: "/(owner)/(drawer)/dashboard" } as any);
  };

  const handleSkip = () => {
    router.replace({ pathname: "/(owner)/(drawer)/dashboard" } as any);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.select({ ios: 64, android: 0 })}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              padding: 24,
              paddingTop: 72,
              paddingBottom: 40,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <Text
              style={[
                GlobalStyles.title,
                { color: Colors[colorScheme].text, marginBottom: 8 },
              ]}
            >
              Planos da Academia
            </Text>
            <Text
              style={[
                GlobalStyles.subtitle,
                { color: Colors[colorScheme].secondaryText, marginBottom: 24 },
              ]}
            >
              Cadastre os planos oferecidos pela sua academia.
            </Text>

            {plans.length > 0 && (
              <View style={{ marginBottom: 24, gap: 12 }}>
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
                ))}
              </View>
            )}

            <View
              style={{
                backgroundColor: Colors[colorScheme].card,
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: Colors[colorScheme].border,
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  color: Colors[colorScheme].text,
                  fontSize: 16,
                  fontWeight: "600",
                  marginBottom: 12,
                }}
              >
                Adicionar novo plano
              </Text>

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
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {(
                  ["daily", "monthly", "quarterly", "annual"] as PlanValidity[]
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
                          : Colors[colorScheme].background,
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
                          validity === v
                            ? "#FFF"
                            : Colors[colorScheme].text,
                        fontWeight: validity === v ? "600" : "400",
                      }}
                    >
                      {VALIDITY_LABELS[v]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <ThemedButton
                title={loading ? "Adicionando..." : "Adicionar plano"}
                onPress={handleAddPlan}
                disabled={loading}
                style={{ marginTop: 16 }}
              />
            </View>

            <ThemedButton
              title="Concluir"
              onPress={handleFinish}
              style={{ marginBottom: 12 }}
            />
            <TouchableOpacity onPress={handleSkip}>
              <Text
                style={{
                  color: Colors[colorScheme].tint,
                  textAlign: "center",
                  fontSize: 16,
                }}
              >
                Pular por enquanto
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
