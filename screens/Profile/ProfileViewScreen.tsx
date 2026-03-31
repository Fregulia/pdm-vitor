// COMPONENTES
import { MenuButton } from "@/components/MenuButton";
import { UserAvatar } from "@/components/UserAvatar";

// CONSTANTES
import { GlobalStyles } from "@/constants/styles";
import { Colors } from "@/constants/theme";

// CONTEXTOS E HOOKS
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

// BIBLIOTECAS EXTERNAS
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileViewScreen() {
  const router = useRouter();
  const { user, getProfile, signOut, deleteAccountHard } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // FUNCAO PARA CARREGAR O PERFIL DO USUARIO
  const loadProfile = useCallback(async () => {
    // Se não há usuário autenticado, não tentar carregar
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (error) {
      console.error("Failed to load profile:", error);
      Alert.alert("Erro", "Não foi possível carregar o perfil.");
    } finally {
      setLoading(false);
    }
  }, [getProfile, user]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  // FUNCAO PARA EXCLUIR A CONTA DO USUARIO
  const onDelete = async () => {
    Alert.alert("Excluir conta", "Tem certeza? Esta ação é irreversível.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAccountHard();
          } catch {
            Alert.alert("Erro", "Faça login novamente para excluir sua conta.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View
        style={[
          GlobalStyles.container,
          {
            backgroundColor: Colors[colorScheme].background,
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      </View>
    );
  }

  // TELA DE VISUALIZAÇÃO DO PERFIL
  return (
    <>
      {profile?.role === "owner" && <MenuButton />}
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: Colors[colorScheme].background,
        }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER COM GRADIENTE */}
        <View
          style={[styles.header, { backgroundColor: Colors[colorScheme].tint }]}
        >
          <View style={styles.headerOverlay}>
            <View style={styles.avatarWrapper}>
              <UserAvatar
                name={profile?.displayName || user?.displayName || ""}
                size={100}
                photoUrl={profile?.photoUrl}
              />
            </View>
          </View>
        </View>

        {/* CARD DE INFORMAÇÕES PRINCIPAIS */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: Colors[colorScheme].card,
              marginTop: -70,
            },
          ]}
        >
          {/* NOME DO USUÁRIO */}
          <Text style={[styles.userName, { color: Colors[colorScheme].text }]}>
            {profile?.displayName || user?.displayName || "Usuário"}
          </Text>

          {/* EMAIL DO USUÁRIO */}
          <View style={styles.emailContainer}>
            <Ionicons
              name="mail-outline"
              size={16}
              color={Colors[colorScheme].secondaryText}
            />
            <Text
              style={[
                styles.userEmail,
                { color: Colors[colorScheme].secondaryText },
              ]}
            >
              {user?.email}
            </Text>
          </View>

          {/* BIO */}
          {profile?.bio && (
            <View
              style={[
                styles.bioContainer,
                { borderTopColor: Colors[colorScheme].border },
              ]}
            >
              <Text
                style={[
                  styles.bioLabel,
                  { color: Colors[colorScheme].secondaryText },
                ]}
              >
                Sobre
              </Text>
              <Text
                style={[styles.bioText, { color: Colors[colorScheme].text }]}
              >
                {profile.bio}
              </Text>
            </View>
          )}
        </View>

        {/* AÇÕES PRINCIPAIS */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: Colors[colorScheme].tint },
            ]}
            onPress={() => router.push("/profile-edit")}
          >
            <Ionicons name="create-outline" size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>Editar Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: Colors[colorScheme].card },
            ]}
            onPress={() => router.push("/proposta")}
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={Colors[colorScheme].tint}
            />
            <Text
              style={[
                styles.actionButtonTextSecondary,
                { color: Colors[colorScheme].text },
              ]}
            >
              Sobre o App
            </Text>
          </TouchableOpacity>
        </View>

        {/* OPÇÕES DE CONTA */}
        <View style={styles.optionsContainer}>
          <Text
            style={[
              styles.sectionTitle,
              { color: Colors[colorScheme].secondaryText },
            ]}
          >
            CONFIGURAÇÕES
          </Text>

          <View
            style={[
              styles.optionCard,
              { backgroundColor: Colors[colorScheme].card },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.optionItem,
                { borderBottomColor: Colors[colorScheme].border },
              ]}
              onPress={async () => {
                try {
                  await signOut();
                  router.replace("/auth/signin");
                } catch (error) {
                  console.error("Erro ao fazer logout:", error);
                  Alert.alert(
                    "Erro",
                    "Não foi possível sair. Tente novamente."
                  );
                }
              }}
            >
              <View style={styles.optionLeft}>
                <View
                  style={[
                    styles.optionIconContainer,
                    { backgroundColor: Colors[colorScheme].tint + "20" },
                  ]}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={20}
                    color={Colors[colorScheme].tint}
                  />
                </View>
                <Text
                  style={[
                    styles.optionText,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  Sair da conta
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors[colorScheme].secondaryText}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionItem, { borderBottomWidth: 0 }]}
              onPress={onDelete}
            >
              <View style={styles.optionLeft}>
                <View
                  style={[
                    styles.optionIconContainer,
                    { backgroundColor: "#FF3B3020" },
                  ]}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </View>
                <Text style={[styles.optionText, { color: "#FF3B30" }]}>
                  Excluir conta
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors[colorScheme].secondaryText}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  headerOverlay: {
    alignItems: "center",
    paddingTop: 40,
  },
  avatarWrapper: {
    zIndex: 10,
    elevation: 10,
  },
  infoCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 24,
    paddingTop: 64,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  userName: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 0,
    marginBottom: 8,
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  userEmail: {
    fontSize: 14,
  },
  bioContainer: {
    borderTopWidth: 1,
    width: "100%",
    paddingTop: 16,
    marginTop: 8,
  },
  bioLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  bioText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 16,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  actionButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
  actionButtonTextSecondary: {
    fontSize: 15,
    fontWeight: "600",
  },
  optionsContainer: {
    marginHorizontal: 16,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  optionCard: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
