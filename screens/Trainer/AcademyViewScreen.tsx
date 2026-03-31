// CONSTANTES
import { Colors } from "@/constants/theme";

// CONTEXTOS E HOOKS
import { useColorScheme } from "@/hooks/use-color-scheme";

// SERVIÇOS
import {
  AcademyInfo,
  getAcademyById,
  isAcademyComplete,
} from "@/services/academy";
import { getTrainerContext } from "@/services/trainers";

// BIBLIOTECAS EXTERNAS
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TrainerAcademyViewScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = React.useState(true);
  const [gymId, setGymId] = React.useState<string | null>(null);
  const [academy, setAcademy] = React.useState<AcademyInfo | null>(null);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {

        const ctx = await getTrainerContext();

        if (!ctx?.gymId) {

          setGymId(null);
          setAcademy(null);
          return;
        }
        setGymId(ctx.gymId);

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

  if (!gymId) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors[colorScheme].background,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Ionicons
          name="business-outline"
          size={64}
          color={Colors[colorScheme].secondaryText}
          style={{ opacity: 0.3, marginBottom: 16 }}
        />
        <Text
          style={{
            color: Colors[colorScheme].text,
            textAlign: "center",
            fontSize: 18,
            fontWeight: "600",
          }}
        >
          Você ainda não está vinculado a uma academia
        </Text>
      </View>
    );
  }

  if (!academy || !isAcademyComplete(academy)) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors[colorScheme].background,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: Colors[colorScheme].card,
            borderRadius: 16,
            padding: 24,
            width: "100%",
            maxWidth: 480,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={Colors[colorScheme].tint}
            style={{ alignSelf: "center", marginBottom: 16 }}
          />
          <Text
            style={{
              color: Colors[colorScheme].text,
              fontSize: 20,
              fontWeight: "700",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Academia não configurada
          </Text>
          <Text
            style={{
              color: Colors[colorScheme].secondaryText,
              textAlign: "center",
              fontSize: 16,
            }}
          >
            Peça ao proprietário para completar as informações da academia.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 20 }}
    >
      {/* Header */}
      <View style={{ marginBottom: 32, alignItems: "center" }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: Colors[colorScheme].tint + "20",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Ionicons
            name="business"
            size={40}
            color={Colors[colorScheme].tint}
          />
        </View>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: Colors[colorScheme].text,
            marginBottom: 4,
            textAlign: "center",
          }}
        >
          {academy.name}
        </Text>
        <Text
          style={{
            color: Colors[colorScheme].secondaryText,
            textAlign: "center",
            fontSize: 16,
          }}
        >
          Informações da academia
        </Text>
      </View>

      {/* Card de Endereço */}
      <View
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
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: Colors[colorScheme].tint + "20",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="location"
              size={20}
              color={Colors[colorScheme].tint}
            />
          </View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: Colors[colorScheme].text,
            }}
          >
            Endereço
          </Text>
        </View>
        <Text
          style={{
            color: Colors[colorScheme].secondaryText,
            fontSize: 16,
            lineHeight: 24,
          }}
        >
          {academy.address}
        </Text>
      </View>

      {/* Card de Contato */}
      <View
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
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: Colors[colorScheme].tint + "20",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="call" size={20} color={Colors[colorScheme].tint} />
          </View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: Colors[colorScheme].text,
            }}
          >
            Contato
          </Text>
        </View>
        <Text
          style={{
            color: Colors[colorScheme].secondaryText,
            fontSize: 16,
            lineHeight: 24,
          }}
        >
          {academy.contact}
        </Text>
      </View>

      {/* Card de Horários */}
      <View
        style={{
          backgroundColor: Colors[colorScheme].card,
          borderRadius: 16,
          padding: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: Colors[colorScheme].tint + "20",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="time" size={20} color={Colors[colorScheme].tint} />
          </View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: Colors[colorScheme].text,
            }}
          >
            Horários de Funcionamento
          </Text>
        </View>

        <HourRow
          label="Segunda a Sexta"
          open={academy.hours.weekdays.open}
          close={academy.hours.weekdays.close}
          colorScheme={colorScheme}
        />
        <HourRow
          label="Sábado"
          open={academy.hours.saturday.open}
          close={academy.hours.saturday.close}
          colorScheme={colorScheme}
        />
        <HourRow
          label="Domingo"
          open={academy.hours.sunday.open}
          close={academy.hours.sunday.close}
          colorScheme={colorScheme}
          isLast
        />
      </View>
    </ScrollView>
  );
}

function HourRow({
  label,
  open,
  close,
  colorScheme,
  isLast = false,
}: {
  label: string;
  open: string;
  close: string;
  colorScheme: "light" | "dark";
  isLast?: boolean;
}) {
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 12,
        }}
      >
        <Text
          style={{
            color: Colors[colorScheme].text,
            fontSize: 15,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            color: Colors[colorScheme].secondaryText,
            fontSize: 15,
            fontWeight: "500",
          }}
        >
          {open} - {close}
        </Text>
      </View>
      {!isLast && (
        <View
          style={{
            height: 1,
            backgroundColor: Colors[colorScheme].border,
            opacity: 0.1,
          }}
        />
      )}
    </View>
  );
}
