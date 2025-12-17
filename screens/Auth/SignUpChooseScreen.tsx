import { BackButton } from "@/components/BackButton";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedInput } from "@/components/ThemedInput";
import { GlobalStyles } from "@/constants/styles";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { auth } from "@/services/firebase";
import { joinAsStudentWithInvite } from "@/services/students";
import { joinAsTrainerWithInvite } from "@/services/trainers";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  // sendEmailVerification, // TEMPORARIAMENTE DESABILITADO
  updateProfile,
} from "firebase/auth";
import React, { useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const styles = StyleSheet.create({
  roleCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  roleCardSelected: {
    borderWidth: 3,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  roleIcon: {
    marginBottom: 12,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    opacity: 0.6,
    marginBottom: 16,
    marginTop: 8,
  },
  studentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    marginBottom: 24,
  },
  studentButtonText: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
  formSection: {
    marginTop: 8,
  },
  trainerFieldsContainer: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  trainerFieldsTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
    opacity: 0.8,
  },
  studentFieldsContainer: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.7,
  },
});

export default function SignUpChooseScreen() {
  const router = useRouter();
  const { signUp, loading } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const [selectedRole, setSelectedRole] = useState<
    "owner" | "trainer" | "student" | undefined
  >(undefined);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
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
          "Escolha Dono de academia, Personal trainer ou Aluno."
        );
        return;
      }

      // Para student: validações específicas
      if (selectedRole === "student") {
        if (!inviteCode.trim()) {
          Alert.alert("Código obrigatório", "Informe o código de convite.");
          return;
        }
        if (password !== confirmPassword) {
          Alert.alert(
            "Senhas não coincidem",
            "As senhas digitadas são diferentes."
          );
          return;
        }

        // Fluxo específico para aluno
        try {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            email.trim(),
            password
          );
          // TEMPORARIAMENTE DESABILITADO: await sendEmailVerification(userCredential.user);
          await updateProfile(userCredential.user, {
            displayName: name || "Aluno",
          });
          await joinAsStudentWithInvite(inviteCode.trim().toUpperCase());

          Alert.alert(
            "✅ Cadastro realizado!",
            "Sua conta foi criada com sucesso!",
            [{ text: "OK", onPress: () => router.replace("/preload") }]
          );
        } catch (error: any) {
          let errorMessage = "Erro ao criar conta. Tente novamente.";
          if (error.message === "INVITE_NOT_FOUND") {
            errorMessage = "Código de convite não encontrado.";
          } else if (error.message === "INVITE_ALREADY_USED") {
            errorMessage = "Este convite já foi utilizado.";
          } else if (error.message === "INVITE_EXPIRED") {
            errorMessage = "Este convite expirou.";
          } else if (error.code === "auth/email-already-in-use") {
            errorMessage = "Este e-mail já está em uso.";
          }
          Alert.alert("Erro no cadastro", errorMessage);
        }
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
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                GlobalStyles.container,
                { backgroundColor: "transparent", paddingTop: 80 },
              ]}
            >
              {/* Header */}
              <View style={{ alignItems: "center", marginBottom: 32 }}>
                <Text
                  style={[
                    GlobalStyles.title,
                    {
                      color: Colors[colorScheme].text,
                      fontSize: 32,
                      marginBottom: 8,
                    },
                  ]}
                >
                  Criar conta
                </Text>
                <Text
                  style={[
                    GlobalStyles.subtitle,
                    {
                      color: Colors[colorScheme].secondaryText,
                      fontSize: 16,
                      marginBottom: 0,
                    },
                  ]}
                >
                  Comece sua jornada fitness
                </Text>
              </View>

              {/* Role Selection */}
              <Text
                style={[
                  styles.sectionTitle,
                  { color: Colors[colorScheme].secondaryText },
                ]}
              >
                Tipo de conta
              </Text>
              <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setSelectedRole("owner")}
                  style={[
                    styles.roleCard,
                    {
                      backgroundColor: Colors[colorScheme].card,
                      borderColor: Colors[colorScheme].tint,
                    },
                    selectedRole === "owner" && styles.roleCardSelected,
                  ]}
                >
                  <Ionicons
                    name="business"
                    size={40}
                    color={
                      selectedRole === "owner"
                        ? Colors[colorScheme].tint
                        : Colors[colorScheme].icon
                    }
                    style={styles.roleIcon}
                  />
                  <Text
                    style={[
                      styles.roleTitle,
                      {
                        color:
                          selectedRole === "owner"
                            ? Colors[colorScheme].tint
                            : Colors[colorScheme].text,
                      },
                    ]}
                  >
                    Dono de{"\n"}Academia
                  </Text>
                  <Text
                    style={[
                      styles.roleDescription,
                      { color: Colors[colorScheme].secondaryText },
                    ]}
                  >
                    Gerencie seu negócio
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setSelectedRole("trainer")}
                  style={[
                    styles.roleCard,
                    {
                      backgroundColor: Colors[colorScheme].card,
                      borderColor: Colors[colorScheme].tint,
                    },
                    selectedRole === "trainer" && styles.roleCardSelected,
                  ]}
                >
                  <Ionicons
                    name="barbell"
                    size={40}
                    color={
                      selectedRole === "trainer"
                        ? Colors[colorScheme].tint
                        : Colors[colorScheme].icon
                    }
                    style={styles.roleIcon}
                  />
                  <Text
                    style={[
                      styles.roleTitle,
                      {
                        color:
                          selectedRole === "trainer"
                            ? Colors[colorScheme].tint
                            : Colors[colorScheme].text,
                      },
                    ]}
                  >
                    Personal{"\n"}Trainer
                  </Text>
                  <Text
                    style={[
                      styles.roleDescription,
                      { color: Colors[colorScheme].secondaryText },
                    ]}
                  >
                    Treine seus alunos
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Student Card */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setSelectedRole("student")}
                style={[
                  styles.studentButton,
                  {
                    borderColor:
                      selectedRole === "student"
                        ? Colors[colorScheme].tint
                        : Colors[colorScheme].border,
                    backgroundColor:
                      selectedRole === "student"
                        ? Colors[colorScheme].tint + "10"
                        : Colors[colorScheme].background,
                    borderWidth: selectedRole === "student" ? 3 : 2,
                    marginBottom: 24,
                  },
                ]}
              >
                <Ionicons
                  name="person"
                  size={20}
                  color={
                    selectedRole === "student"
                      ? Colors[colorScheme].tint
                      : Colors[colorScheme].secondaryText
                  }
                />
                <Text
                  style={[
                    styles.studentButtonText,
                    {
                      color:
                        selectedRole === "student"
                          ? Colors[colorScheme].tint
                          : Colors[colorScheme].secondaryText,
                    },
                  ]}
                >
                  Sou Aluno - Cadastrar com Código
                </Text>
              </TouchableOpacity>

              {/* Form Section */}
              <View style={styles.formSection}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: Colors[colorScheme].secondaryText },
                  ]}
                >
                  Informações pessoais
                </Text>

                <ThemedInput
                  placeholder="Nome completo"
                  value={name}
                  onChangeText={setName}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => emailRef.current?.focus()}
                  autoComplete="name"
                  textContentType="name"
                />
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
                  autoComplete="email"
                  textContentType="username"
                  importantForAutofill="yes"
                />
                <ThemedInput
                  placeholder="Senha (mínimo 6 caracteres)"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  ref={passwordRef}
                  returnKeyType={
                    selectedRole === "trainer" || selectedRole === "student"
                      ? "next"
                      : "go"
                  }
                  onSubmitEditing={
                    selectedRole === "trainer" || selectedRole === "student"
                      ? () => confirmPasswordRef.current?.focus()
                      : onSubmit
                  }
                  autoComplete="password-new"
                  textContentType="newPassword"
                  importantForAutofill="yes"
                />

                {/* Confirm Password for Student */}
                {selectedRole === "student" && (
                  <ThemedInput
                    placeholder="Confirmar senha"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    ref={confirmPasswordRef}
                    returnKeyType="next"
                    autoComplete="password-new"
                    textContentType="newPassword"
                    importantForAutofill="yes"
                  />
                )}

                {/* Student Additional Fields */}
                {selectedRole === "student" && (
                  <View
                    style={[
                      styles.studentFieldsContainer,
                      {
                        backgroundColor: Colors[colorScheme].card,
                        borderColor: Colors[colorScheme].border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.trainerFieldsTitle,
                        { color: Colors[colorScheme].text },
                      ]}
                    >
                      🎟️ Informações de Aluno
                    </Text>
                    <View
                      style={[
                        styles.infoCard,
                        {
                          backgroundColor: Colors[colorScheme].background,
                          borderColor: Colors[colorScheme].border,
                          borderWidth: 1,
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
                          size={18}
                          color={Colors[colorScheme].tint}
                        />
                      </View>
                      <Text
                        style={[
                          styles.infoText,
                          { color: Colors[colorScheme].secondaryText },
                        ]}
                      >
                        Solicite o código de convite com sua academia antes de
                        prosseguir
                      </Text>
                    </View>
                    <ThemedInput
                      placeholder="Código de convite (ex: ABC12345)"
                      value={inviteCode}
                      onChangeText={(text) => setInviteCode(text.toUpperCase())}
                      autoCapitalize="characters"
                      maxLength={8}
                      returnKeyType="go"
                      onSubmitEditing={onSubmit}
                    />
                  </View>
                )}

                {/* Trainer Additional Fields */}
                {selectedRole === "trainer" && (
                  <View
                    style={[
                      styles.trainerFieldsContainer,
                      {
                        backgroundColor: Colors[colorScheme].card,
                        borderColor: Colors[colorScheme].border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.trainerFieldsTitle,
                        { color: Colors[colorScheme].text },
                      ]}
                    >
                      📋 Informações Profissionais
                    </Text>
                    <ThemedInput
                      placeholder="Código de convite"
                      value={inviteCode}
                      onChangeText={setInviteCode}
                      autoCapitalize="characters"
                    />
                    <ThemedInput
                      placeholder="Bio profissional"
                      value={bio}
                      onChangeText={setBio}
                      multiline
                      numberOfLines={3}
                      style={{
                        minHeight: 80,
                        textAlignVertical: "top",
                        paddingTop: 12,
                      }}
                    />
                    <ThemedInput
                      placeholder="CREF (Registro profissional)"
                      value={cref}
                      onChangeText={setCref}
                      autoCapitalize="characters"
                    />
                  </View>
                )}

                {/* Submit Button */}
                <ThemedButton
                  title={loading ? "Criando conta..." : "Criar conta"}
                  onPress={onSubmit}
                  disabled={loading}
                  style={{ marginTop: 8 }}
                />
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}
