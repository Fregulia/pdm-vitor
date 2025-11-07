import { BackButton } from "@/components/BackButton";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedInput } from "@/components/ThemedInput";
import { GlobalStyles } from "@/constants/styles";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { auth } from "@/services/firebase";
import { joinAsStudentWithInvite } from "@/services/students";
import { router } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function SignUpStudentScreen() {
  const colorScheme = useColorScheme() ?? "light";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    // Validações
    if (!email.trim() || !password || !confirmPassword || !inviteCode.trim()) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Erro", "A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      // 1. Cria usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // 2. Atualiza profile (o nome virá do convite)
      await updateProfile(userCredential.user, {
        displayName: "Aluno", // Será atualizado após consumir o convite
      });

      // 3. Consome o convite e cria documento do aluno
      await joinAsStudentWithInvite(inviteCode.trim().toUpperCase());

      Alert.alert("Sucesso!", "Cadastro realizado com sucesso!", [
        {
          text: "OK",
          onPress: () => router.replace("/"),
        },
      ]);
    } catch (error: any) {
      console.error("Erro no signup de aluno:", error);
      console.error("Erro completo:", JSON.stringify(error, null, 2));
      console.error("Código do erro:", error.code);
      console.error("Mensagem do erro:", error.message);

      let errorMessage = "Erro ao criar conta.";

      if (error.message === "INVITE_NOT_FOUND") {
        errorMessage = "Código de convite não encontrado.";
      } else if (error.message === "INVITE_ALREADY_USED") {
        errorMessage = "Este convite já foi utilizado.";
      } else if (error.message === "INVITE_EXPIRED") {
        errorMessage = "Este convite expirou.";
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este e-mail já está em uso.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "E-mail inválido.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Senha muito fraca.";
      }

      Alert.alert("Erro", errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          GlobalStyles.container,
          {
            backgroundColor: Colors[colorScheme].background,
            justifyContent: "center",
          },
        ]}
      >
        <BackButton />

        <Text
          style={[
            GlobalStyles.title,
            { color: Colors[colorScheme].text, marginBottom: 8 },
          ]}
        >
          Cadastro de Aluno
        </Text>
        <Text
          style={[
            GlobalStyles.subtitle,
            { color: Colors[colorScheme].secondaryText, marginBottom: 24 },
          ]}
        >
          Preencha seus dados para se cadastrar
        </Text>

        <View style={{ width: "100%", maxWidth: 400 }}>
          <Text
            style={{
              color: Colors[colorScheme].text,
              marginBottom: 8,
              fontWeight: "500",
            }}
          >
            E-mail
          </Text>
          <ThemedInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="seu@email.com"
          />

          <Text
            style={{
              color: Colors[colorScheme].text,
              marginBottom: 8,
              fontWeight: "500",
            }}
          >
            Senha
          </Text>
          <ThemedInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Mínimo 6 caracteres"
          />

          <Text
            style={{
              color: Colors[colorScheme].text,
              marginBottom: 8,
              fontWeight: "500",
            }}
          >
            Confirmar Senha
          </Text>
          <ThemedInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Digite a senha novamente"
          />

          <Text
            style={{
              color: Colors[colorScheme].text,
              marginBottom: 8,
              fontWeight: "500",
            }}
          >
            Código de Convite
          </Text>
          <ThemedInput
            value={inviteCode}
            onChangeText={(text) => setInviteCode(text.toUpperCase())}
            placeholder="Digite o código recebido"
            autoCapitalize="characters"
            maxLength={8}
          />

          {loading ? (
            <ActivityIndicator
              size="large"
              color={Colors[colorScheme].tint}
              style={{ marginTop: 24 }}
            />
          ) : (
            <ThemedButton
              title="Cadastrar"
              onPress={handleSignUp}
              style={{ marginTop: 24 }}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
