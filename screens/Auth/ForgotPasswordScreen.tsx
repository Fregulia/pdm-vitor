import { BackButton } from "@/components/BackButton";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedInput } from "@/components/ThemedInput";
import { GlobalStyles } from "@/constants/styles";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<TextInput>(null);

  // FUNÇÃO DE ENVIO DE FORMULÁRIO
  const onSubmit = async () => {
    setLoading(true);
    try {
      await resetPassword(email);
      Alert.alert(
        "Verifique seu e-mail",
        "Enviamos um link para redefinir sua senha.",
        [{ text: "OK", onPress: () => router.replace("/auth/signin") }]
      );
    } catch {
      Alert.alert(
        "Erro",
        "Não foi possível enviar o e-mail. Verifique o endereço e tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View
        style={[
          GlobalStyles.container,
          { backgroundColor: Colors[colorScheme].background },
        ]}
      >
        <BackButton />
        <Text style={[GlobalStyles.title, { color: Colors[colorScheme].text }]}>
          Recuperar senha
        </Text>
        <Text
          style={[
            GlobalStyles.subtitle,
            { color: Colors[colorScheme].secondaryText },
          ]}
        >
          Enviaremos um link para seu e-mail
        </Text>
        {/* INPUT DE EMAIL */}
        <ThemedInput
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          ref={emailRef}
          returnKeyType="go"
          onSubmitEditing={onSubmit}
        />
        {/* BOTÃO DE ENVIAR */}
        <ThemedButton
          title={loading ? "Enviando..." : "Enviar"}
          onPress={onSubmit}
          disabled={loading}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}
