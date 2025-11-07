import { ThemedButton } from "@/components/ThemedButton";
import { ThemedInput } from "@/components/ThemedInput";
import { TimeInput } from "@/components/TimeInput";
import { GlobalStyles } from "@/constants/styles";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getAcademy, Hours, saveAcademy } from "@/services/academy";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function AcademyInfoScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [hours, setHours] = useState<Hours>({
    weekdays: { open: "", close: "" },
    saturday: { open: "", close: "" },
    sunday: { open: "", close: "" },
  });
  const [loading, setLoading] = useState(false);

  const nameRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);
  const contactRef = useRef<TextInput>(null);
  // No hoursRef since time inputs are custom components

  useEffect(() => {
    (async () => {
      if (!user?.uid) return;
      setLoading(true);
      try {
        const data = await getAcademy(user.uid);
        if (data) {
          setName(data.name || "");
          setAddress(data.address || "");
          setContact(data.contact || "");
          const h: any = (data as any).hours;
          if (h && typeof h !== "string") {
            setHours({
              weekdays: {
                open: h.weekdays?.open || "",
                close: h.weekdays?.close || "",
              },
              saturday: {
                open: h.saturday?.open || "",
                close: h.saturday?.close || "",
              },
              sunday: {
                open: h.sunday?.open || "",
                close: h.sunday?.close || "",
              },
            });
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid]);

  const onSave = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      await saveAcademy(user.uid, { name, address, contact, hours });
      // Após salvar, redireciona para a página de informações da academia (tab do owner)
      router.replace({ pathname: "/(owner)/(tabs)/academy" } as any);
    } catch (e: any) {
      Alert.alert("Erro", e?.message || "Não foi possível salvar.");
    } finally {
      setLoading(false);
    }
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
              style={[GlobalStyles.title, { color: Colors[colorScheme].text }]}
            >
              Informações da Academia
            </Text>
            <Text
              style={[
                GlobalStyles.subtitle,
                { color: Colors[colorScheme].secondaryText },
              ]}
            >
              Atualize os dados da sua academia.
            </Text>

            <ThemedInput
              placeholder="Nome da academia"
              value={name}
              onChangeText={setName}
              ref={nameRef}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => addressRef.current?.focus()}
            />
            <ThemedInput
              placeholder="Endereço"
              value={address}
              onChangeText={setAddress}
              ref={addressRef}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => contactRef.current?.focus()}
            />
            <ThemedInput
              placeholder="Contato (telefone/email)"
              value={contact}
              onChangeText={setContact}
              ref={contactRef}
              returnKeyType="done"
            />

            <Text
              style={{
                color: Colors[colorScheme].text,
                fontWeight: "600",
                marginTop: 8,
                marginBottom: 4,
              }}
            >
              Horários de funcionamento
            </Text>
            <View style={{ gap: 12 }}>
              <View>
                <Text
                  style={{
                    color: Colors[colorScheme].secondaryText,
                    marginBottom: 6,
                  }}
                >
                  Segunda a Sexta
                </Text>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TimeInput
                    label="Abertura"
                    value={hours.weekdays.open}
                    onChange={(v) =>
                      setHours((h) => ({
                        ...h,
                        weekdays: { ...h.weekdays, open: v },
                      }))
                    }
                  />
                  <TimeInput
                    label="Fechamento"
                    value={hours.weekdays.close}
                    onChange={(v) =>
                      setHours((h) => ({
                        ...h,
                        weekdays: { ...h.weekdays, close: v },
                      }))
                    }
                  />
                </View>
              </View>
              <View>
                <Text
                  style={{
                    color: Colors[colorScheme].secondaryText,
                    marginBottom: 6,
                  }}
                >
                  Sábado
                </Text>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TimeInput
                    label="Abertura"
                    value={hours.saturday.open}
                    onChange={(v) =>
                      setHours((h) => ({
                        ...h,
                        saturday: { ...h.saturday, open: v },
                      }))
                    }
                  />
                  <TimeInput
                    label="Fechamento"
                    value={hours.saturday.close}
                    onChange={(v) =>
                      setHours((h) => ({
                        ...h,
                        saturday: { ...h.saturday, close: v },
                      }))
                    }
                  />
                </View>
              </View>
              <View>
                <Text
                  style={{
                    color: Colors[colorScheme].secondaryText,
                    marginBottom: 6,
                  }}
                >
                  Domingo
                </Text>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TimeInput
                    label="Abertura"
                    value={hours.sunday.open}
                    onChange={(v) =>
                      setHours((h) => ({
                        ...h,
                        sunday: { ...h.sunday, open: v },
                      }))
                    }
                  />
                  <TimeInput
                    label="Fechamento"
                    value={hours.sunday.close}
                    onChange={(v) =>
                      setHours((h) => ({
                        ...h,
                        sunday: { ...h.sunday, close: v },
                      }))
                    }
                  />
                </View>
              </View>
            </View>
            <ThemedButton
              title={loading ? "Salvando..." : "Salvar"}
              onPress={onSave}
              disabled={loading}
              style={{ marginTop: 16 }}
            />
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
