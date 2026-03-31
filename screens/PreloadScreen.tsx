// CONTEXTOS E HOOKS
import { tryAutoSignIn, useAuth } from "@/context/AuthContext";

// SERVIÇOS
import {
  ensureAcademyHasDifferentId,
  getAcademy,
  isAcademyComplete,
} from "@/services/academy";

// ROTAS
import { useRouter } from "expo-router";

// REACT
import React, { useEffect, useState } from "react";

// REACT NATIVE
import { ActivityIndicator, View } from "react-native";

export default function PreloadScreen() {
  const router = useRouter();
  const { user, initializing, getProfile } = useAuth();
  const [autoTried, setAutoTried] = useState(false);

  // TENTA FAZER LOGIN AUTOMATICO COM INFOS DO SECURE STORE
  useEffect(() => {
    (async () => {
      await tryAutoSignIn();
      setAutoTried(true);
    })();
  }, []);

  // REDIRECIONA PARA TELA ADEQUADA APOS VERIFICAR STATUS DE LOGIN
  useEffect(() => {
    (async () => {
      if (initializing || !autoTried) return;
      if (!user) {
        router.replace({ pathname: "/auth/not-logged" } as any);
        return;
      }

      // DESABILITADO POR ENQUANTO: VERIFICAÇÃO DE EMAIL
      // if (!user.emailVerified) {
      //   router.replace({ pathname: "/auth/confirm-email" } as any);
      //   return;
      // }

      // Obtem o perfil para decidir o fluxo
      try {
        const profile = await getProfile();
        const role = profile?.role as
          | "owner"
          | "trainer"
          | "student"
          | undefined;

        if (role === "owner") {
          const academy = await getAcademy(user.uid);
          // Migração: garante que gym_id != ownerUid e que o campo id esteja definido
          await ensureAcademyHasDifferentId(user.uid);
          if (!isAcademyComplete(academy)) {
            router.replace({ pathname: "/setup" } as any);
          } else {
            // Owner completo vai para o dashboard dentro das abas do owner
            router.replace({ pathname: "/(owner)/(drawer)/dashboard" } as any);
          }
          return;
        }

        if (role === "student") {
          // Aluno vai para o dashboard de aluno
          router.replace({ pathname: "/(student)/dashboard" } as any);
          return;
        }

        // Trainer vai para o conjunto de abas do trainer
        router.replace({ pathname: "/(trainer)/(tabs)/dashboard" } as any);
      } catch {
        // Falha ao obter perfil -> envia para abas do trainer por padrão
        router.replace({ pathname: "/(trainer)/(tabs)/dashboard" } as any);
      }
    })();
  }, [user, initializing, router, getProfile, autoTried]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
