import { UserAvatar } from "@/components/UserAvatar";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function CustomDrawer(props: DrawerContentComponentProps) {
  const colorScheme = useColorScheme() ?? "light";
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert("Sair", "Deseja realmente sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            router.replace("/auth/signin");
          } catch (error) {
            console.error("Erro ao fazer logout:", error);
            Alert.alert("Erro", "Não foi possível sair da conta");
          }
        },
      },
    ]);
  };

  const handleProfilePress = () => {
    router.push("/(owner)/(drawer)/profile");
    // Fecha o drawer após navegar
    props.navigation.closeDrawer();
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.container}
      style={{ backgroundColor: Colors[colorScheme].background }}
    >
      {/* Header com informações do usuário */}
      <TouchableOpacity
        style={[
          styles.header,
          {
            backgroundColor: Colors[colorScheme].tint,
            borderRadius: 12,
          },
        ]}
        onPress={handleProfilePress}
        activeOpacity={0.8}
      >
        <UserAvatar name={user?.displayName || "Owner"} size={64} />
        <Text style={styles.userName}>{user?.displayName || "Owner"}</Text>
        <Text style={styles.userEmail}>{user?.email || ""}</Text>
      </TouchableOpacity>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        <DrawerItemList {...props} />
      </View>

      {/* Footer com botão de logout */}
      <View
        style={[
          styles.footer,
          {
            borderTopColor: Colors[colorScheme].border,
            paddingBottom: insets.bottom + 16,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.logoutButton,
            { backgroundColor: Colors[colorScheme].card },
          ]}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={[styles.logoutText, { color: "#FF3B30" }]}>Sair</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 12,
  },
  userEmail: {
    fontSize: 14,
    color: "#FFFFFFCC",
    marginTop: 4,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 8,
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
