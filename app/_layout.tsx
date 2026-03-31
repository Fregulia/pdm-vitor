import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AuthProvider } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  // Detecta cor do sistema
  const colorScheme = useColorScheme();

  return (
    // Passa pra aplicação
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {/* Auth Context */}
      <AuthProvider>
        {/* Stack pra remover o header*/}
        <Stack
          initialRouteName="preload"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="preload" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth/signin" options={{ title: "Entrar" }} />
          <Stack.Screen name="auth/signup" options={{ title: "Criar conta" }} />
          <Stack.Screen
            name="auth/confirm-email"
            options={{ title: "Confirmar e-mail" }}
          />
          <Stack.Screen
            name="auth/forgot-password"
            options={{ title: "Recuperar senha" }}
          />
          <Stack.Screen
            name="profile-edit"
            options={{ title: "Editar perfil" }}
          />
        </Stack>
        <StatusBar style="auto" />
      </AuthProvider>
    </ThemeProvider>
  );
}
