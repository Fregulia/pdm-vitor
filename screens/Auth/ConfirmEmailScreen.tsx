import { ThemedButton } from "@/components/ThemedButton";
import { GlobalStyles } from "@/constants/styles";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { auth } from "@/services/firebase";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, View } from "react-native";

export default function ConfirmEmailScreen() {
  const router = useRouter();
  const { resendEmailVerification } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

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

  // Verifica se o e-mail já foi confirmado e segue o fluxo normal
  const onIConfirmed = async () => {
    setChecking(true);
    try {
      const u = auth.currentUser;
      if (!u) {
        Alert.alert("Sessão expirada", "Faça login novamente para continuar.", [
          { text: "OK", onPress: () => router.replace("/auth/signin") },
        ]);
        return;
      }
      // Recarrega os dados do usuário do servidor
      await u.reload();
      if (u.emailVerified) {
        Alert.alert("Verificado", "Seu e-mail foi verificado com sucesso.");
        router.replace("/preload");
      } else {
        Alert.alert(
          "Ainda não verificado",
          "Não encontramos a verificação ainda. Aguarde alguns segundos após clicar no link e tente novamente."
        );
      }
    } catch {
      Alert.alert("Erro", "Não foi possível verificar agora. Tente novamente.");
    } finally {
      setChecking(false);
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
      {/* BOTÃO PARA CONFIRMAR QUE JÁ VALIDOU O EMAIL */}
      <ThemedButton
        title={checking ? "Verificando..." : "Já confirmei meu e-mail"}
        onPress={onIConfirmed}
        variant="secondary"
        style={{ marginTop: 8 }}
        disabled={checking}
      />
    </View>
  );
}
