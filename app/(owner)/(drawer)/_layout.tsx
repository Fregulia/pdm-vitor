import { CustomDrawer } from "@/components/CustomDrawer";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { Drawer } from "expo-router/drawer";
import React from "react";

export default function OwnerDrawerLayout() {
  const colorScheme = useColorScheme() ?? "light";

  // Cria o menu drawer do owner
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: Colors[colorScheme].tint,
        drawerInactiveTintColor: Colors[colorScheme].secondaryText,
        drawerActiveBackgroundColor: Colors[colorScheme].tint + "15",
        drawerStyle: {
          backgroundColor: Colors[colorScheme].background,
        },
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: "600",
        },
        drawerItemStyle: {
          borderRadius: 8,
          marginHorizontal: 8,
          paddingHorizontal: 8,
        },
      }}
    >
      <Drawer.Screen
        name="dashboard"
        options={{
          drawerLabel: "Dashboard",
          title: "Dashboard",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="teachers"
        options={{
          drawerLabel: "Professores",
          title: "Professores",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="classes"
        options={{
          drawerLabel: "Turmas",
          title: "Turmas",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="students"
        options={{
          drawerLabel: "Alunos",
          title: "Alunos",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="school" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="academy"
        options={{
          drawerLabel: "Academia",
          title: "Academia",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="business" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="profile"
        options={{
          drawerLabel: "Perfil",
          title: "Perfil",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
