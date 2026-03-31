// COMPONENTES
import { BackButton } from "@/components/BackButton";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedInput } from "@/components/ThemedInput";

// CONSTANTES
import { Colors } from "@/constants/theme";

// CONTEXTOS E HOOKS
import { useColorScheme } from "@/hooks/use-color-scheme";

// SERVIÇOS
import { auth } from "@/services/firebase";
import { joinAsStudentWithInvite } from "@/services/students";

// BIBLIOTECAS EXTERNAS
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// FIREBASE
import {
  createUserWithEmailAndPassword,
  // sendEmailVerification, // TEMPORARIAMENTE DESABILITADO
  updateProfile,
} from "firebase/auth";

// REACT
import React, { useRef, useState } from "react";

// REACT NATIVE
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
    backgroundColor: "transparent",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.8,
    marginBottom: 0,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.7,
  },
  formSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    opacity: 0.6,
    marginBottom: 16,
  },
  inviteCodeContainer: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  inviteCodeTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
    opacity: 0.8,
  },
  helpText: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 8,
    textAlign: "center",
  },
});

export default function SignUpStudentScreen() {
  const colorScheme = useColorScheme() ?? "light";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const inviteCodeRef = useRef<TextInput>(null);

  async function handleSignUp() {
    // Validações
    if (!email.trim() || !password || !confirmPassword || !inviteCode.trim()) {
      Alert.alert(
        "Campos obrigatórios",
        "Preencha todos os campos para continuar."
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("E-mail inválido", "Por favor, informe um e-mail válido.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Senhas não coincidem",
        "As senhas digitadas são diferentes."
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert("Senha fraca", "A senha deve ter no mínimo 6 caracteres.");
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

      // TEMPORARIAMENTE DESABILITADO: 2. Envia email de verificação
      // await sendEmailVerification(userCredential.user);

      // 3. Atualiza profile (o nome virá do convite)
      await updateProfile(userCredential.user, {
        displayName: "Aluno", // Será atualizado após consumir o convite
      });

      // 4. Consome o convite e cria documento do aluno
      await joinAsStudentWithInvite(inviteCode.trim().toUpperCase());

      Alert.alert(
        "✅ Cadastro realizado!",
        "Sua conta foi criada com sucesso!",
        [
          {
            text: "OK",
            onPress: () => router.replace("/preload"),
          },
        ]
      );
    } catch (error: any) {
      console.error("Erro no signup de aluno:", error);

      let errorMessage = "Erro ao criar conta. Tente novamente.";

      if (error.message === "INVITE_NOT_FOUND") {
        errorMessage =
          "Código de convite não encontrado. Verifique e tente novamente.";
      } else if (error.message === "INVITE_ALREADY_USED") {
        errorMessage = "Este convite já foi utilizado por outro aluno.";
      } else if (error.message === "INVITE_EXPIRED") {
        errorMessage = "Este convite expirou. Solicite um novo à sua academia.";
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage =
          "Este e-mail já está cadastrado. Faça login ou use outro e-mail.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "E-mail inválido. Verifique o formato.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Senha muito fraca. Use uma senha mais segura.";
      }

      Alert.alert("Erro no cadastro", errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <BackButton />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.select({ ios: 64, android: 0 })}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.contentContainer}>
              {/* Header */}
              <View style={styles.headerSection}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: Colors[colorScheme].card },
                  ]}
                >
                  <Ionicons
                    name="person"
                    size={40}
                    color={Colors[colorScheme].tint}
                  />
                </View>
                <Text
                  style={[styles.title, { color: Colors[colorScheme].text }]}
                >
                  Cadastro de Aluno
                </Text>
                <Text
                  style={[
                    styles.subtitle,
                    { color: Colors[colorScheme].secondaryText },
                  ]}
                >
                  Junte-se à sua academia
                </Text>
              </View>

              {/* Info Card */}
              <View
                style={[
                  styles.infoCard,
                  {
                    backgroundColor: Colors[colorScheme].card,
                    borderColor: Colors[colorScheme].border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.infoIconContainer,
                    { backgroundColor: Colors[colorScheme].tint + "20" },
                  ]}
                >
                  <Ionicons
                    name="information-circle"
                    size={24}
                    color={Colors[colorScheme].tint}
                  />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text
                    style={[
                      styles.infoTitle,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    Precisa de um código de convite
                  </Text>
                  <Text
                    style={[
                      styles.infoDescription,
                      { color: Colors[colorScheme].secondaryText },
                    ]}
                  >
                    Solicite o código de convite com sua academia ou personal
                    trainer antes de se cadastrar.
                  </Text>
                </View>
              </View>

              {/* Form */}
              <View style={styles.formSection}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: Colors[colorScheme].secondaryText },
                  ]}
                >
                  Dados de acesso
                </Text>

                <ThemedInput
                  placeholder="E-mail"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  autoComplete="email"
                  textContentType="username"
                  importantForAutofill="yes"
                />

                <ThemedInput
                  placeholder="Senha (mínimo 6 caracteres)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  ref={passwordRef}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                  autoComplete="password-new"
                  textContentType="newPassword"
                  importantForAutofill="yes"
                />

                <ThemedInput
                  placeholder="Confirmar senha"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  ref={confirmPasswordRef}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => inviteCodeRef.current?.focus()}
                  autoComplete="password-new"
                  textContentType="newPassword"
                  importantForAutofill="yes"
                />
              </View>

              {/* Invite Code Section */}
              <View
                style={[
                  styles.inviteCodeContainer,
                  {
                    backgroundColor: Colors[colorScheme].card,
                    borderColor: Colors[colorScheme].border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.inviteCodeTitle,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  🎟️ Código de Convite
                </Text>
                <ThemedInput
                  placeholder="Digite o código (ex: ABC12345)"
                  value={inviteCode}
                  onChangeText={(text) => setInviteCode(text.toUpperCase())}
                  autoCapitalize="characters"
                  maxLength={8}
                  ref={inviteCodeRef}
                  returnKeyType="go"
                  onSubmitEditing={handleSignUp}
                />
                <Text
                  style={[
                    styles.helpText,
                    { color: Colors[colorScheme].secondaryText },
                  ]}
                >
                  O código possui 8 caracteres (letras e números)
                </Text>
              </View>

              {/* Submit Button */}
              <ThemedButton
                title={loading ? "Criando conta..." : "Criar conta"}
                onPress={handleSignUp}
                disabled={loading}
                style={{ marginTop: 8 }}
              />

              {/* Footer Help Text */}
              <Text
                style={[
                  styles.helpText,
                  { color: Colors[colorScheme].secondaryText, marginTop: 20 },
                ]}
              >
                Ao criar uma conta, você concorda com nossos termos de uso
              </Text>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}
