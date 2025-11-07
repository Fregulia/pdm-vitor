import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, StatusBar, Text, View } from "react-native";

export function BackButton({ label = "Voltar" }: { label?: string }) {
  const router = useRouter();
  const navigation = useNavigation();
  const colorScheme = useColorScheme() ?? "light";
  const canGoBack = navigation.canGoBack();

  if (!canGoBack) return <View style={{ height: 8 }} />;

  const topOffset =
    Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 8 : 65; // basic safe area for iOS; adjust per screen padding

  return (
    <Pressable
      onPress={() => router.back()}
      accessibilityRole="button"
      style={{
        position: "absolute",
        left: 12,
        top: topOffset,
        zIndex: 1000,
        elevation: 4,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: Colors[colorScheme].card,
      }}
    >
      <Text
        style={{
          color: Colors[colorScheme].tint,
          fontSize: 16,
          marginRight: 6,
        }}
      >
        ←
      </Text>
      <Text style={{ color: Colors[colorScheme].text, fontSize: 16 }}>
        {label}
      </Text>
    </Pressable>
  );
}
