// COMPONENTES
import { MenuButton } from "@/components/MenuButton";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedInput } from "@/components/ThemedInput";
import { TimeInput } from "@/components/TimeInput";

// CONSTANTES
import { GlobalStyles } from "@/constants/styles";
import { Colors } from "@/constants/theme";

// CONTEXTOS E HOOKS
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

// SERVIÇOS
import { getAcademy, Hours, saveAcademy } from "@/services/academy";
import { getCoordinatesFromAddress } from "@/services/location";

// ROTAS
import { useRouter } from "expo-router";

// REACT
import React, { useEffect, useRef, useState } from "react";

// REACT NATIVE
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

// MAPA
import MapView, { Callout, Marker, UrlTile } from "react-native-maps";

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
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: -31.766143,
    longitude: -52.351855,
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
          if (data.latitude && data.longitude) {
            setCoords({ latitude: data.latitude, longitude: data.longitude });
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

      // Geocoding logic
      let finalCoords = coords;
      if (address) {
        const found = await getCoordinatesFromAddress(address);
        if (found) {
          finalCoords = found;
          setCoords(found);
        }
      }

      await saveAcademy(user.uid, {
        name,
        address,
        contact,
        hours,
        latitude: finalCoords.latitude,
        longitude: finalCoords.longitude
      });
      // Após salvar, redireciona para a página de informações da academia (tab do owner)
      router.replace({ pathname: "/(owner)/(drawer)/academy" } as any);
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
          <MenuButton />
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

            <Text
              style={{
                color: Colors[colorScheme].text,
                fontWeight: "600",
                marginTop: 24,
                marginBottom: 8,
              }}
            >
              Localização
            </Text>
            <View
              style={{
                height: 250,
                borderRadius: 12,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: Colors[colorScheme].border,
                marginBottom: 16,
              }}
            >
              <MapView
                style={{ flex: 1 }}
                region={{
                  latitude: coords.latitude,
                  longitude: coords.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
              >
                <UrlTile
                  urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  maximumZ={19}
                  flipY={false}
                  zIndex={100}
                />

                {/* Main Marker */}
                <Marker
                  coordinate={coords}
                  title={name || "Minha Academia"}
                  description={address}
                >
                  <Callout>
                    <View style={{ minWidth: 100, padding: 5 }}>
                      <Text style={{ fontWeight: 'bold' }}>{name || "Minha Academia"}</Text>
                      <Text style={{ fontSize: 12 }}>{address}</Text>
                    </View>
                  </Callout>
                </Marker>

                {/* Extra Marker 1 - Nearby */}
                <Marker
                  coordinate={{
                    latitude: coords.latitude + 0.001,
                    longitude: coords.longitude + 0.001,
                  }}
                  pinColor="blue"
                >
                  <Callout>
                    <View style={{ minWidth: 100, padding: 5 }}>
                      <Text style={{ fontWeight: 'bold' }}>Ponto de Referência 1</Text>
                      <Text style={{ fontSize: 12 }}>Local próximo</Text>
                    </View>
                  </Callout>
                </Marker>

                {/* Extra Marker 2 - Nearby */}
                <Marker
                  coordinate={{
                    latitude: coords.latitude - 0.001,
                    longitude: coords.longitude - 0.0005,
                  }}
                  pinColor="green"
                >
                  <Callout>
                    <View style={{ minWidth: 100, padding: 5 }}>
                      <Text style={{ fontWeight: 'bold' }}>Ponto de Referência 2</Text>
                      <Text style={{ fontSize: 12 }}>Outro local próximo</Text>
                    </View>
                  </Callout>
                </Marker>

              </MapView>
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
