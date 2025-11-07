import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";
import { tryAutoSignIn, useAuth } from "@/context/AuthContext";

export default function PreloadScreen() {
  const router = useRouter();
  const { user, initializing } = useAuth();

  // TENTA FAZER LOGIN AUTOMATICO COM INFOS DO SECURE STORE
  useEffect(() => {
    (async () => {
      await tryAutoSignIn();
    })();
  }, []);

  // REDIRECIONA PARA TELA ADEQUADA APOS VERIFICAR STATUS DE LOGIN
  useEffect(() => {
    if (initializing) return;
    if (user) {
      router.replace("/(tabs)");
    } else {
      router.replace("/auth/not-logged");
    }
  }, [user, initializing, router]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
