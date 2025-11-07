import { ThemedButton } from "@/components/ThemedButton";
import { UserAvatar } from "@/components/UserAvatar";
import { GlobalStyles } from "@/constants/styles";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";

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
    <View
      style={[
        GlobalStyles.container,
        {
          backgroundColor: Colors[colorScheme].background,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 0,
        },
      ]}
    >
      {/* CARD DE PERFIL */}
      <View
        style={[
          GlobalStyles.card,
          {
            backgroundColor: Colors[colorScheme].card,
            width: "100%",
            maxWidth: 420,
            alignItems: "center",
          },
        ]}
      >
        {/* FOTO DO PERFIL */}
        <UserAvatar
          name={profile?.displayName || user?.displayName || ""}
          size={80}
        />

        {/* NOME DO USUÁRIO */}
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: Colors[colorScheme].text,
            marginTop: 12,
            marginBottom: 4,
          }}
        >
          {profile?.displayName || user?.displayName || "Usuário"}
        </Text>

        {/* EMAIL DO USUÁRIO */}
        <Text
          style={{
            fontSize: 16,
            color: Colors[colorScheme].secondaryText,
            marginBottom: 16,
          }}
        >
          {user?.email}
        </Text>

        {/* BIO */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: Colors[colorScheme].border,
            width: "100%",
            paddingTop: 16,
            marginTop: 8,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: Colors[colorScheme].secondaryText,
              fontStyle: "italic",
              textAlign: "center",
            }}
          >
            {profile?.bio || "Edite seu perfil para adicionar uma bio."}
          </Text>
        </View>
      </View>

      {/* BOTOES DE ACOES DO PERFIL */}
      <View style={{ width: "100%", maxWidth: 420, marginTop: 8 }}>
        <ThemedButton
          title="Editar perfil"
          onPress={() => router.push("/profile-edit")}
          style={{ marginTop: 16 }}
        />
        <ThemedButton
          title="Sair"
          onPress={async () => {
            try {
              await signOut();
              router.replace("/auth/signin");
            } catch (error) {
              console.error("Erro ao fazer logout:", error);
              Alert.alert("Erro", "Não foi possível sair. Tente novamente.");
            }
          }}
          variant="secondary"
          style={{ marginTop: 8 }}
        />
        <ThemedButton
          title="Excluir conta"
          onPress={onDelete}
          variant="destructive"
          style={{ marginTop: 24 }}
        />
        <ThemedButton
          title="Sobre o App"
          onPress={() => router.push("/(tabs)/proposta")}
          variant="secondary"
          style={{ marginTop: 8 }}
        />
      </View>
    </View>
  );
}
