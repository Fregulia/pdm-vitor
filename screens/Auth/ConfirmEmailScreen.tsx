import React, { useState } from "react";
import { Alert, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ThemedButton } from "@/components/ThemedButton";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { GlobalStyles } from "@/constants/styles";
import { useAuth } from "@/context/AuthContext";

export default function ConfirmEmailScreen() {
  const router = useRouter();
  const { resendEmailVerification } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const [loading, setLoading] = useState(false);

  // FUNÇÃO DE REENVIO DE EMAIL
  const onResend = async () => {
    setLoading(true);
    try {
      await resendEmailVerification();
      Alert.alert("Enviado", "E-mail de verificação reenviado.");
    } catch {
      Alert.alert(
        "Erro",
        "Não foi possível reenviar. Tente novamente mais tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        GlobalStyles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <Text style={[GlobalStyles.title, { color: Colors[colorScheme].text }]}>
        Confirme seu e-mail
      </Text>
      <Text
        style={[
          GlobalStyles.subtitle,
          { color: Colors[colorScheme].secondaryText },
        ]}
      >
        Verifique sua caixa de entrada e clique no link para confirmar.
      </Text>
      {/* BOTÃO REENVIO DE EMAIL*/}
      <ThemedButton
        title={loading ? "Reenviando..." : "Reenviar e-mail"}
        onPress={onResend}
        disabled={loading}
      />
      {/* BOTÃO DE NAVEGAÇÃO PARA LOGIN */}
      <ThemedButton
        title="Ir para Login"
        onPress={() => router.replace("/auth/signin")}
        variant="secondary"
        style={{ marginTop: 8 }}
      />
    </View>
  );
}
