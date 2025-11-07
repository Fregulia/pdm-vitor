import { Tabs } from "expo-router";
import React from "react";

export default function OwnerTabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="teachers" options={{ title: "Professores" }} />
      <Tabs.Screen name="students" options={{ title: "Alunos" }} />
      <Tabs.Screen name="academy" options={{ title: "Academia" }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
    </Tabs>
  );
}
