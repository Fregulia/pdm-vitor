import { Redirect, Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/context/AuthContext";

// DEFINE AS ABAS DE NAVEGAÇÃO
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();

  // SE NÃO TIVER USUÁRIO LOGADO, REDIRECIONA PARA TELA DE NÃO LOGADO

  if (!user) return <Redirect href="/auth/not-logged" />;

  return (
    // CRIA A TAB BAR
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      {/* PÁGINA HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      {/* PÁGINA ALUNOS */}
      <Tabs.Screen
        name="alunos"
        options={{
          title: "Alunos",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.3.fill" color={color} />
          ),
        }}
      />
      {/* PÁGINA DO PERFIL */}
      <Tabs.Screen
        name="explore"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
      {/* PROPOSTA SÓ É ACESSÍVEL VIA PERFIL */}
      <Tabs.Screen
        name="proposta"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
