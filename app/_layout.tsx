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
  // Detect system theme
  const colorScheme = useColorScheme();

  return (
    // Provide the theme to navigation
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {/* Auth context provider */}
      <AuthProvider>
        {/* Define routes */}
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
