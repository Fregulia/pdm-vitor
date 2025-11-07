import { ThemedButton } from "@/components/ThemedButton";
import { GlobalStyles } from "@/constants/styles";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AcademyInfo, getAcademy, isAcademyComplete } from "@/services/academy";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function AcademyViewScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [academy, setAcademy] = useState<AcademyInfo | null>(null);

  const load = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const data = await getAcademy(user.uid);
      setAcademy(data);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <View
        style={[
          GlobalStyles.container,
          {
            backgroundColor: Colors[colorScheme].background,
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      </View>
    );
  }

  if (!academy || !isAcademyComplete(academy)) {
    return (
      <View
        style={[
          GlobalStyles.container,
          {
            backgroundColor: Colors[colorScheme].background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <View
          style={[
            GlobalStyles.card,
            {
              backgroundColor: Colors[colorScheme].card,
              width: "100%",
              maxWidth: 480,
            },
          ]}
        >
          <Text
            style={{
              color: Colors[colorScheme].text,
              fontSize: 22,
              fontWeight: "700",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Sua academia ainda não está configurada
          </Text>
          <Text
            style={{
              color: Colors[colorScheme].secondaryText,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            Complete as informações para visualizar os detalhes aqui.
          </Text>
          <ThemedButton
            title="Configurar agora"
            onPress={() => router.push("/setup" as any)}
          />
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        GlobalStyles.container,
        { backgroundColor: Colors[colorScheme].background, paddingTop: 48 },
      ]}
    >
      {/* Título com o nome da academia */}
      <Text
        style={[
          GlobalStyles.title,
          { color: Colors[colorScheme].text, marginBottom: 4 },
        ]}
      >
        {academy.name}
      </Text>
      <Text
        style={{
          color: Colors[colorScheme].secondaryText,
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        Informações da sua academia
      </Text>

      {/* Card: Endereço */}
      <View
        style={[
          GlobalStyles.card,
          {
            backgroundColor: Colors[colorScheme].card,
            width: "100%",
            maxWidth: 520,
          },
        ]}
      >
        <Text
          style={{ color: Colors[colorScheme].secondaryText, marginBottom: 6 }}
        >
          Endereço
        </Text>
        <Text style={{ color: Colors[colorScheme].text, fontSize: 16 }}>
          {academy.address}
        </Text>
      </View>

      {/* Card: Contato */}
      <View
        style={[
          GlobalStyles.card,
          {
            backgroundColor: Colors[colorScheme].card,
            width: "100%",
            maxWidth: 520,
          },
        ]}
      >
        <Text
          style={{ color: Colors[colorScheme].secondaryText, marginBottom: 6 }}
        >
          Contato
        </Text>
        <Text style={{ color: Colors[colorScheme].text, fontSize: 16 }}>
          {academy.contact}
        </Text>
      </View>

      {/* Card: Horários de funcionamento */}
      <View
        style={[
          GlobalStyles.card,
          {
            backgroundColor: Colors[colorScheme].card,
            width: "100%",
            maxWidth: 520,
          },
        ]}
      >
        <Text
          style={{
            color: Colors[colorScheme].text,
            fontWeight: "600",
            marginBottom: 8,
          }}
        >
          Horários de funcionamento
        </Text>
        <Row
          label="Segunda a Sexta"
          value={`${academy.hours.weekdays.open} - ${academy.hours.weekdays.close}`}
          colorScheme={colorScheme}
        />
        <Row
          label="Sábado"
          value={`${academy.hours.saturday.open} - ${academy.hours.saturday.close}`}
          colorScheme={colorScheme}
        />
        <Row
          label="Domingo"
          value={`${academy.hours.sunday.open} - ${academy.hours.sunday.close}`}
          colorScheme={colorScheme}
        />
      </View>

      {/* Botão editar */}
      <ThemedButton
        title="Editar informações"
        onPress={() => router.push({ pathname: "/academy-edit" } as any)}
        style={{ marginTop: 8, width: "100%", maxWidth: 520 }}
      />
    </View>
  );
}

function Row({
  label,
  value,
  colorScheme,
}: {
  label: string;
  value: string;
  colorScheme: "light" | "dark";
}) {
  return (
    <View style={{ marginBottom: 6 }}>
      <Text style={{ color: Colors[colorScheme].secondaryText }}>{label}</Text>
      <Text style={{ color: Colors[colorScheme].text, fontSize: 16 }}>
        {value}
      </Text>
    </View>
  );
}
