import { ThemedButton } from "@/components/ThemedButton";
import { GlobalStyles } from "@/constants/styles";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function NotLoggedScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";

  return (
    <View
      style={[
        GlobalStyles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      {/* Cabeçalho de marketing */}
      <Text
        style={[
          GlobalStyles.title,
          {
            color: Colors[colorScheme].text,
            marginBottom: 8,
            textAlign: "center",
          },
        ]}
      >
        Conecte donos de academias e personal trainers
      </Text>
      <Text
        style={{
          color: Colors[colorScheme].secondaryText,
          fontSize: 16,
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        Gerencie turmas, otimize agendas e potencialize resultados com o nosso
        app.
      </Text>

      {/* Seção Dono de academia */}
      <View style={{ width: "100%", marginBottom: 16 }}>
        <Text
          style={{
            color: Colors[colorScheme].text,
            fontSize: 18,
            fontWeight: "600",
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          É dono de academia?
        </Text>
        <Text
          style={{
            color: Colors[colorScheme].secondaryText,
            fontSize: 14,
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          Cadastre sua academia e conecte-se com profissionais qualificados.
        </Text>
        <ThemedButton
          title="Criar conta como Dono"
          onPress={() =>
            router.push({ pathname: "/auth/signup", params: { role: "owner" } })
          }
        />
      </View>

      {/* Seção Personal trainer */}
      <View style={{ width: "100%", marginBottom: 24 }}>
        <Text
          style={{
            color: Colors[colorScheme].text,
            fontSize: 18,
            fontWeight: "600",
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          É personal trainer?
        </Text>
        <Text
          style={{
            color: Colors[colorScheme].secondaryText,
            fontSize: 14,
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          Encontre academias e alunos, gerencie sua agenda e turmas.
        </Text>
        <ThemedButton
          title="Criar conta como Personal"
          onPress={() =>
            router.push({
              pathname: "/auth/signup",
              params: { role: "trainer" },
            })
          }
        />
      </View>

      {/* Já tem conta */}
      <ThemedButton
        title="Já tenho conta"
        variant="secondary"
        onPress={() => router.push("/auth/signin")}
      />
    </View>
  );
}
