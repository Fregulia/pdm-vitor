import { BackButton } from "@/components/BackButton";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedInput } from "@/components/ThemedInput";
import { GlobalStyles } from "@/constants/styles";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { joinAsTrainerWithInvite } from "@/services/trainers";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
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

export default function SignUpChooseScreen() {
  const router = useRouter();
  const { signUp, loading } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const [selectedRole, setSelectedRole] = useState<
    "owner" | "trainer" | undefined
  >(undefined);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const [inviteCode, setInviteCode] = useState("");
  const [bio, setBio] = useState("");
  const [cref, setCref] = useState("");

  const onSubmit = async () => {
    try {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        Alert.alert("E-mail inválido", "Informe um e-mail válido.");
        return;
      }
      if (password.length < 6) {
        Alert.alert("Senha fraca", "A senha deve ter pelo menos 6 caracteres.");
        return;
      }
      if (!selectedRole) {
        Alert.alert(
          "Selecione o tipo de conta",
          "Escolha Dono de academia ou Personal trainer."
        );
        return;
      }
      // Para trainer: validações necessárias ANTES de criar a conta
      if (selectedRole === "trainer") {
        if (!inviteCode.trim()) {
          Alert.alert("Convite obrigatório", "Informe o código de convite.");
          return;
        }
        if (!bio.trim() || !cref.trim()) {
          Alert.alert("Dados obrigatórios", "Preencha Bio e CREF.");
          return;
        }
      }

      await signUp(email, password, name, selectedRole);

      if (selectedRole === "trainer") {
        try {
          await joinAsTrainerWithInvite({ inviteCode, name, bio, cref });
        } catch (e: any) {
          Alert.alert(
            "Convite inválido",
            e?.message === "CODE_NOT_FOUND"
              ? "Código não encontrado."
              : e?.message === "CODE_ALREADY_USED"
              ? "Este código já foi utilizado."
              : "Não foi possível validar o convite."
          );
          return;
        }
      }
      Alert.alert("Conta criada", "Seu cadastro foi realizado com sucesso.");
      router.replace("/preload");
    } catch (e: any) {
      Alert.alert(
        "Erro no cadastro",
        e?.code === "auth/email-already-in-use"
          ? "Este e-mail já está em uso."
          : "Tente novamente."
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <BackButton />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.select({ ios: 64, android: 0 })}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={[
                GlobalStyles.container,
                { backgroundColor: "transparent" },
              ]}
            >
              <Text
                style={[
                  GlobalStyles.title,
                  { color: Colors[colorScheme].text },
                ]}
              >
                Criar conta
              </Text>
              <Text
                style={[
                  GlobalStyles.subtitle,
                  { color: Colors[colorScheme].secondaryText },
                ]}
              >
                Escolha o tipo de conta e preencha seus dados
              </Text>

              {/* Seleção de role sempre visível */}
              <Text
                style={{
                  color: Colors[colorScheme].text,
                  fontSize: 16,
                  marginTop: 8,
                  marginBottom: 8,
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                Selecione o tipo de conta
              </Text>
              <View style={{ flexDirection: "row", gap: 12, marginBottom: 8 }}>
                <ThemedButton
                  title={"Dono de academia"}
                  variant="secondary"
                  onPress={() => setSelectedRole("owner")}
                  style={{
                    flex: 1,
                    backgroundColor:
                      selectedRole === "owner"
                        ? Colors[colorScheme].tint + "33"
                        : Colors[colorScheme].card,
                  }}
                />
                <ThemedButton
                  title={"Personal trainer"}
                  variant="secondary"
                  onPress={() => setSelectedRole("trainer")}
                  style={{
                    flex: 1,
                    backgroundColor:
                      selectedRole === "trainer"
                        ? Colors[colorScheme].tint + "33"
                        : Colors[colorScheme].card,
                  }}
                />
              </View>

              {/* Botão para cadastro de aluno */}
              <ThemedButton
                title="Sou Aluno - Cadastrar com Código"
                variant="secondary"
                onPress={() => router.push("/auth/signup-student")}
                style={{
                  marginBottom: 16,
                  backgroundColor: Colors[colorScheme].card,
                }}
              />

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
              {/* Campos adicionais para trainer */}
              {selectedRole === "trainer" && (
                <>
                  <ThemedInput
                    placeholder="Código de convite"
                    value={inviteCode}
                    onChangeText={setInviteCode}
                    autoCapitalize="characters"
                  />
                  <ThemedInput
                    placeholder="Bio"
                    value={bio}
                    onChangeText={setBio}
                  />
                  <ThemedInput
                    placeholder="CREF"
                    value={cref}
                    onChangeText={setCref}
                    autoCapitalize="characters"
                  />
                </>
              )}
              {/* BOTÃO DE CADASTRO */}
              <ThemedButton
                title={loading ? "Criando..." : "Criar conta"}
                onPress={onSubmit}
                disabled={loading}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}
