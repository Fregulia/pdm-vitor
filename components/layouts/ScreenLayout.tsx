import { GlobalStyles } from "@/constants/styles";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenLayoutProps {
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
}

export function ScreenLayout({
  children,
  style,
  noPadding = false,
}: ScreenLayoutProps) {
  const colorScheme = useColorScheme() ?? "light";

  return (
    <SafeAreaView
      style={[
        GlobalStyles.container,
        {
          backgroundColor: Colors[colorScheme].background,
          padding: 0,
        },
        style,
      ]}
    >
      <View style={{ flex: 1, paddingHorizontal: noPadding ? 0 : 16 }}>
        {children}
      </View>
    </SafeAreaView>
  );
}
