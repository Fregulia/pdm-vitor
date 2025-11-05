import React, { useRef, useState } from "react";
import {
  Alert,
  Text,
  View,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedInput } from "@/components/ThemedInput";
import { Colors } from "@/constants/theme";
import { GlobalStyles } from "@/constants/styles";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, loading } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const passwordRef = useRef<TextInput>(null);

  // FUNÇÃO DE ENVIO DE FORMULÁRIO
  const onSubmit = async () => {
    try {
      // CHAMA FUNÇÃO DE LOGIN E NAVEGA PARA AS TABS
      await signIn(email, password, remember);
      router.replace("/(tabs)");
    } catch (e: any) {
      // TRATA ERRO DE E-MAIL NÃO VERIFICADO E REDIRECIONA PRA PÁGINA DE CONFIRMAÇÃO
      if (e?.message === "EMAIL_NOT_VERIFIED") {
        Alert.alert(
          "Confirmação de e-mail",
          "Verifique seu e-mail antes de entrar.",
          [{ text: "OK", onPress: () => router.push("/auth/confirm-email") }]
        );
      } else {
        // DEMAIS ERROS, MENSAGEM GENÉRICA
        Alert.alert("Erro no login", "Credenciais inválidas ou erro de rede.");
      }
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
        <Text style={[GlobalStyles.title, { color: Colors[colorScheme].text }]}>
          Bem-vindo
        </Text>
        <Text
          style={[
            GlobalStyles.subtitle,
            { color: Colors[colorScheme].secondaryText },
          ]}
        >
          Entre para continuar
        </Text>
        {/* INPUT DE EMAIL */}
        <ThemedInput
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        {/* INPUT DE SENHA */}
        <ThemedInput
          placeholder="Senha"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          ref={passwordRef}
          returnKeyType="go"
          onSubmitEditing={onSubmit}
        />
        {/* LEMBRAR-ME */}
        <Pressable
          onPress={() => setRemember((v) => !v)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
          }}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: remember }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              borderWidth: 2,
              borderColor: Colors[colorScheme].tint,
              backgroundColor: remember
                ? Colors[colorScheme].tint
                : "transparent",
              justifyContent: "center",
              alignItems: "center",
            }}
          />
          <Text style={{ color: Colors[colorScheme].text }}>
            Manter-me logado
          </Text>
        </Pressable>
        {/* BOTÃO DE LOGIN */}
        <ThemedButton
          title={loading ? "Entrando..." : "Entrar"}
          onPress={onSubmit}
          disabled={loading}
        />
        {/* BOTÃO DE RECUPERAÇÃO DE SENHA */}
        <ThemedButton
          title="Esqueci minha senha"
          variant="secondary"
          onPress={() => router.push("/auth/forgot-password")}
          style={{ marginTop: 16 }}
        />
        {/* BOTÃO DE NAVEGAÇÃO PARA CADASTRO */}
        <ThemedButton
          title="Criar conta"
          variant="secondary"
          onPress={() => router.push("/auth/signup")}
          style={{ marginTop: 8 }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}
