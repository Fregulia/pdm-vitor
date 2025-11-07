import { GlobalStyles } from "@/constants/styles";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  AcademyInfo,
  getAcademyById,
  isAcademyComplete,
} from "@/services/academy";
import { getTrainerContext } from "@/services/trainers";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function TrainerAcademyViewScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const [loading, setLoading] = React.useState(true);
  const [gymId, setGymId] = React.useState<string | null>(null);
  const [academy, setAcademy] = React.useState<AcademyInfo | null>(null);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        console.log("[AcademyView] Iniciando carregamento...");
        const ctx = await getTrainerContext();
        console.log("[AcademyView] Contexto do trainer:", ctx);
        if (!ctx?.gymId) {
          console.log("[AcademyView] Nenhum gymId encontrado");
          setGymId(null);
          setAcademy(null);
          return;
        }
        setGymId(ctx.gymId);
        console.log("[AcademyView] Carregando academia para gymId:", ctx.gymId);
        const data = await getAcademyById(ctx.gymId);
        console.log(
          "[AcademyView] Academia carregada:",
          data?.name || "não encontrada"
        );
        setAcademy(data);
      } catch (err) {
        console.error("[AcademyView] Erro ao carregar:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

  if (!gymId) {
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
        <Text style={{ color: Colors[colorScheme].text, textAlign: "center" }}>
          Você ainda não está vinculado a uma academia.
        </Text>
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
          style={{
            backgroundColor: Colors[colorScheme].card,
            borderRadius: 12,
            padding: 16,
            width: "100%",
            maxWidth: 480,
          }}
        >
          <Text
            style={{
              color: Colors[colorScheme].text,
              fontSize: 20,
              fontWeight: "700",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            A academia ainda não está configurada
          </Text>
          <Text
            style={{
              color: Colors[colorScheme].secondaryText,
              textAlign: "center",
            }}
          >
            Peça ao proprietário para completar as informações.
          </Text>
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
        Informações da academia
      </Text>

      {/* Endereço */}
      <View
        style={{
          backgroundColor: Colors[colorScheme].card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          width: "100%",
          maxWidth: 520,
        }}
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

      {/* Contato */}
      <View
        style={{
          backgroundColor: Colors[colorScheme].card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          width: "100%",
          maxWidth: 520,
        }}
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

      {/* Horários */}
      <View
        style={{
          backgroundColor: Colors[colorScheme].card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 8,
          width: "100%",
          maxWidth: 520,
        }}
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
