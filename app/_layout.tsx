import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "@/context/AuthContext";


export default function RootLayout() {
  // DETECTA TEMA DO SISTEMA
  const colorScheme = useColorScheme();

  return (
    // PASSA O TEMA PARA O PROVIDER DE TEMA
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {/* COLOCA TUDO DENTRO DO PROVIDER DE AUTENTICAÇÃO */}
      <AuthProvider>
        {/* DEFINE AS ROTAS */}
        <Stack initialRouteName="preload">
          {/* DÁ NOME E DESATIVA O HEADER */}
          <Stack.Screen name="preload" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth/signin" options={{ title: "Entrar", headerShown: false }} />
          <Stack.Screen name="auth/signup" options={{ title: "Criar conta", headerShown: false}} />
          <Stack.Screen name="auth/confirm-email" options={{ title: "Confirmar e-mail", headerShown: false }} />
          <Stack.Screen name="auth/forgot-password" options={{ title: "Recuperar senha", headerShown: false }} />
          <Stack.Screen name="profile-edit" options={{ title: "Editar perfil", headerShown: false }}/>
        </Stack>
        <StatusBar style="auto" />
      </AuthProvider>
    </ThemeProvider>
  );
}
