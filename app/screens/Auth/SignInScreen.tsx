import { BackButton } from "@/components/BackButton";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedInput } from "@/components/ThemedInput";
import { GlobalStyles } from "@/constants/styles";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const styles = StyleSheet.create({
  welcomeContainer: {
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
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkboxText: {
    fontSize: 15,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.2,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    opacity: 0.6,
  },
  linkButton: {
    marginTop: 8,
  },
  linkButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  linkButtonText: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginTop: -4,
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

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
      // CHAMA FUNÇÃO DE LOGIN e deixa o Preload decidir o fluxo por role
      await signIn(email, password, remember);
      router.replace("/preload");
    } catch {
      // Erros genéricos de login
      Alert.alert("Erro no login", "Credenciais inválidas ou erro de rede.");
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
                { backgroundColor: "transparent", paddingTop: 100 },
              ]}
            >
              {/* Welcome Header with Icon */}
              <View style={styles.welcomeContainer}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: Colors[colorScheme].card },
                  ]}
                >
                  <Ionicons
                    name="barbell"
                    size={40}
                    color={Colors[colorScheme].tint}
                  />
                </View>
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
                  Bem-vindo de volta
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
                  Entre para continuar sua jornada
                </Text>
              </View>

              {/* Login Form */}
              <ThemedInput
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="E-mail"
                value={email}
                onChangeText={setEmail}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => passwordRef.current?.focus()}
                autoComplete="email"
                textContentType="emailAddress"
              />
              <ThemedInput
                placeholder="Senha"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                ref={passwordRef}
                returnKeyType="go"
                onSubmitEditing={onSubmit}
                autoComplete="password"
                textContentType="password"
              />

              {/* Forgot Password Link */}
              <TouchableOpacity
                onPress={() => router.push("/auth/forgot-password")}
                style={styles.forgotPasswordButton}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.forgotPasswordText,
                    { color: Colors[colorScheme].tint },
                  ]}
                >
                  Esqueceu a senha?
                </Text>
              </TouchableOpacity>

              {/* Remember Me Checkbox */}
              <Pressable
                onPress={() => setRemember((v) => !v)}
                style={styles.checkboxContainer}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: remember }}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: Colors[colorScheme].tint,
                      backgroundColor: remember
                        ? Colors[colorScheme].tint
                        : "transparent",
                    },
                  ]}
                >
                  {remember && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={Colors[colorScheme].card}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.checkboxText,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  Manter-me conectado
                </Text>
              </Pressable>

              {/* Sign In Button */}
              <ThemedButton
                title={loading ? "Entrando..." : "Entrar"}
                onPress={onSubmit}
                disabled={loading}
              />

              {/* Divider */}
              <View style={styles.divider}>
                <View
                  style={[
                    styles.dividerLine,
                    { backgroundColor: Colors[colorScheme].border },
                  ]}
                />
                <Text
                  style={[
                    styles.dividerText,
                    { color: Colors[colorScheme].secondaryText },
                  ]}
                >
                  ou
                </Text>
                <View
                  style={[
                    styles.dividerLine,
                    { backgroundColor: Colors[colorScheme].border },
                  ]}
                />
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/auth/signup-choose")}
                style={[
                  styles.linkButtonContent,
                  {
                    borderColor: Colors[colorScheme].tint,
                    backgroundColor: Colors[colorScheme].background,
                  },
                ]}
              >
                <Ionicons
                  name="person-add"
                  size={20}
                  color={Colors[colorScheme].tint}
                />
                <Text
                  style={[
                    styles.linkButtonText,
                    { color: Colors[colorScheme].tint },
                  ]}
                >
                  Criar nova conta
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}
