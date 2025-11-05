import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { ThemedButton } from "@/components/ThemedButton";
import { GlobalStyles } from "@/constants/styles";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

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
      <Text
        style={[
          GlobalStyles.title,
          { color: Colors[colorScheme].text, marginBottom: 8 },
        ]}
      >
        Você não está logado
      </Text>
      <Text
        style={{
          color: Colors[colorScheme].secondaryText,
          fontSize: 16,
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        Para acessar o aplicativo, faça login com sua conta.
      </Text>
      <ThemedButton
        title="Ir para Login"
        onPress={() => router.push("/auth/signin")}
      />
    </View>
  );
}
