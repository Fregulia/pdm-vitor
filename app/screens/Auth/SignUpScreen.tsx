import React, { useRef, useState } from "react";
import {
  Alert,
  Text,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { ThemedInput } from "@/components/ThemedInput";
import { ThemedButton } from "@/components/ThemedButton";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { GlobalStyles } from "@/constants/styles";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, loading } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  // FUNÇÃO DE ENVIO DE FORMULÁRIO
  const onSubmit = async () => {
    try {
      // VALIDA EMAIL
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        Alert.alert("E-mail inválido", "Informe um e-mail válido.");
        return;
      }
      // VALIDA SENHA
      if (password.length < 6) {
        Alert.alert("Senha fraca", "A senha deve ter pelo menos 6 caracteres.");
        return;
      }
      // CHAMA A FUNÇÃO DE CADASTRO
      await signUp(email, password, name);
      // GERA UM ALERTA DE SUCESSO
      Alert.alert(
        "Verifique seu e-mail",
        "Enviamos um e-mail de confirmação.",
        [{ text: "OK", onPress: () => router.replace("/auth/confirm-email") }]
      );   
    } catch (e: any) {
      // GERA UM ALERTA DE ERRO
      Alert.alert(
        "Erro no cadastro",
        e?.code === "auth/email-already-in-use"
          ? "Este e-mail já está em uso."
          : "Tente novamente."
      );
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
          Criar conta
        </Text>
        <Text
          style={[
            GlobalStyles.subtitle,
            { color: Colors[colorScheme].secondaryText },
          ]}
        >
          Rápido e fácil
        </Text>
        {/* NOME DO USUÁRIO */}
        <ThemedInput
          placeholder="Nome"
          value={name}
          onChangeText={setName}
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => emailRef.current?.focus()}
        />
        {/* E-MAIL DO USUÁRIO */}
        <ThemedInput
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          ref={emailRef}
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        {/* SENHA DO USUÁRIO */}
        <ThemedInput
          placeholder="Senha"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          ref={passwordRef}
          returnKeyType="go"
          onSubmitEditing={onSubmit}
        />
        {/* BOTÃO DE CADASTRO */}
        <ThemedButton
          title={loading ? "Criando..." : "Criar conta"}
          onPress={onSubmit}
          disabled={loading}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}
