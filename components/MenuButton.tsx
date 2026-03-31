import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// BOTÃO PARA ABRIR O MENU LATERAL
export function MenuButton() {
  const colorScheme = useColorScheme() ?? "light";
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        position: "absolute",
        top: insets.top + 16,
        left: 16,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors[colorScheme].card,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      activeOpacity={0.7}
    >
      <Ionicons name="menu" size={24} color={Colors[colorScheme].text} />
    </TouchableOpacity>
  );
}
