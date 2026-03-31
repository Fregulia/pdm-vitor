// COMPONENTES
import { BackButton } from "@/components/BackButton";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedInput } from "@/components/ThemedInput";

// CONSTANTES
import { GlobalStyles } from "@/constants/styles";
import { Colors } from "@/constants/theme";

// CONTEXTOS E HOOKS
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

// SERVIÇOS
import { joinAsTrainerWithInvite } from "@/services/trainers";

// BIBLIOTECAS EXTERNAS
import { useRouter } from "expo-router";

// FIREBASE

// REACT
import React, { useRef, useState } from "react";

// REACT NATIVE
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

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, loading } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const { role } = useLocalSearchParams<{ role?: "owner" | "trainer" }>();
  const [selectedRole, setSelectedRole] = useState<
    "owner" | "trainer" | undefined
  >((role as "owner" | "trainer" | undefined) ?? undefined);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const [inviteCode, setInviteCode] = useState("");
  const [bio, setBio] = useState("");
  const [cref, setCref] = useState("");

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
      // VALIDA ROLE QUANDO NÃO VEM PELA ROTA
      const finalRole =
        selectedRole ?? (role as "owner" | "trainer" | undefined);
      if (!finalRole) {
        Alert.alert(
          "Selecione o tipo de conta",
          "Escolha Dono de academia ou Personal trainer."
        );
        return;
      }
      // PARA TRAINER: valida campos adicionais ANTES de criar a conta
      if (finalRole === "trainer") {
        if (!inviteCode.trim()) {
          Alert.alert("Convite obrigatório", "Informe o código de convite.");
          return;
        }
        if (!bio.trim() || !cref.trim()) {
          Alert.alert("Dados obrigatórios", "Preencha Bio e CREF.");
          return;
        }
      }

      // CHAMA A FUNÇÃO DE CADASTRO (somente após validações completas)
      await signUp(email, password, name, finalRole);

      // Se for trainer, vincula via convite somente após o cadastro bem-sucedido
      if (finalRole === "trainer") {
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
              {selectedRole || role ? (
                <Text
                  style={{
                    color: Colors[colorScheme].secondaryText,
                    fontSize: 14,
                    marginTop: 4,
                    marginBottom: 8,
                  }}
                >
                  Tipo de conta:{" "}
                  {(selectedRole ?? role) === "owner"
                    ? "Dono de academia"
                    : "Personal trainer"}
                </Text>
              ) : (
                <>
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
                  <View
                    style={{ flexDirection: "row", gap: 12, marginBottom: 8 }}
                  >
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
                </>
              )}
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
              {/* Campos adicionais para trainer */}
              {(selectedRole ?? role) === "trainer" && (
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
