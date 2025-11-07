import { GlobalStyles } from "@/constants/styles";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { Text, View } from "react-native";

export default function ChatScreen() {
  const colorScheme = useColorScheme() ?? "light";

  return (
    <View
      style={[
        GlobalStyles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <Text style={[GlobalStyles.title, { color: Colors[colorScheme].text }]}>
        Chat
      </Text>
      <Text
        style={[
          GlobalStyles.subtitle,
          { color: Colors[colorScheme].secondaryText },
        ]}
      >
        Funcionalidade em desenvolvimento
      </Text>
    </View>
  );
}
