import { BackButton } from "@/components/BackButton";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedInput } from "@/components/ThemedInput";
import { UserAvatar } from "@/components/UserAvatar";
import { GlobalStyles } from "@/constants/styles";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { pickAndUploadProfilePhoto, takeAndUploadProfilePhoto, deleteProfilePhoto } from "@/services/storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function ProfileEditScreen() {
  const router = useRouter();
  const { user, getProfile, updateProfileDoc } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const nameRef = useRef<TextInput>(null);
  const bioRef = useRef<TextInput>(null);

  // CARREGA DADOS DO PERFIL PARA EDIÇÃO
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getProfile();
        setDisplayName(data?.displayName || user?.displayName || "");
        setBio(data?.bio || "");
        setPhotoUrl(data?.photoUrl || null);
      } catch (error) {
        console.error("Failed to load profile for editing:", error);
        Alert.alert("Erro", "Não foi possível carregar os dados para edição.");
      } finally {
        setLoading(false);
      }
    })();
  }, [getProfile, user?.displayName]);

  const handlePhotoOptions = () => {
    Alert.alert(
      "Foto de perfil",
      "Escolha uma opção",
      [
        {
          text: "Tirar foto",
          onPress: async () => {
            try {
              setUploading(true);
              const url = await takeAndUploadProfilePhoto();
              if (url) {
                setPhotoUrl(url);
                await updateProfileDoc({ photoUrl: url });
                Alert.alert("Sucesso", "Foto atualizada.");
              }
            } catch (e: any) {
              Alert.alert("Erro", e?.message || "Não foi possível atualizar a foto.");
            } finally {
              setUploading(false);
            }
          },
        },
        {
          text: "Escolher da galeria",
          onPress: async () => {
            try {
              setUploading(true);
              const url = await pickAndUploadProfilePhoto();
              if (url) {
                setPhotoUrl(url);
                await updateProfileDoc({ photoUrl: url });
                Alert.alert("Sucesso", "Foto atualizada.");
              }
            } catch (e: any) {
              Alert.alert("Erro", e?.message || "Não foi possível atualizar a foto.");
            } finally {
              setUploading(false);
            }
          },
        },
        ...(photoUrl
          ? [
              {
                text: "Remover foto",
                style: "destructive" as const,
                onPress: async () => {
                  try {
                    setUploading(true);
                    await deleteProfilePhoto();
                    setPhotoUrl(null);
                    await updateProfileDoc({ photoUrl: null });
                    Alert.alert("Sucesso", "Foto removida.");
                  } catch (e: any) {
                    Alert.alert("Erro", e?.message || "Não foi possível remover a foto.");
                  } finally {
                    setUploading(false);
                  }
                },
              },
            ]
          : []),
        { text: "Cancelar", style: "cancel" as const },
      ],
      { cancelable: true }
    );
  };

  // SALVA AS ALTERAÇÕES DO PERFIL
  const onSave = async () => {
    try {
      await updateProfileDoc({ displayName, bio });
      Alert.alert("Sucesso", "Perfil atualizado.");
      router.back();
    } catch (e: any) {
      Alert.alert("Erro", e?.message || "Tente novamente");
    }
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

  // TELA DE EDIÇÃO DO PERFIL
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View
        style={{
          flex: 1,
          padding: 16,
          backgroundColor: Colors[colorScheme].background,
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <BackButton />

          {/* HEADER */}
          <View style={styles.headerSection}>
            <TouchableOpacity onPress={handlePhotoOptions} activeOpacity={0.7}>
              <View
                style={[
                  styles.avatarContainer,
                  { backgroundColor: Colors[colorScheme].card },
                ]}
              >
                {uploading ? (
                  <View style={{ width: 80, height: 80, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
                  </View>
                ) : (
                  <UserAvatar
                    name={displayName || user?.displayName || ""}
                    size={80}
                    photoUrl={photoUrl}
                  />
                )}
                <View
                  style={[
                    styles.editBadge,
                    { backgroundColor: Colors[colorScheme].tint },
                  ]}
                >
                  <Ionicons name="camera" size={16} color="#FFF" />
                </View>
              </View>
            </TouchableOpacity>
            <Text
              style={[styles.headerTitle, { color: Colors[colorScheme].text }]}
            >
              Editar Perfil
            </Text>
            <Text
              style={[
                styles.headerSubtitle,
                { color: Colors[colorScheme].secondaryText },
              ]}
            >
              Personalize suas informações
            </Text>
          </View>

          {/* FORMULÁRIO */}
          <View style={styles.formSection}>
            {/* SEÇÃO DE INFORMAÇÕES PESSOAIS */}
            <View style={styles.sectionContainer}>
              <Text
                style={[
                  styles.sectionLabel,
                  { color: Colors[colorScheme].secondaryText },
                ]}
              >
                INFORMAÇÕES PESSOAIS
              </Text>

              <View
                style={[
                  styles.inputCard,
                  { backgroundColor: Colors[colorScheme].card },
                ]}
              >
                <View style={styles.inputWrapper}>
                  <View style={styles.inputHeader}>
                    <Ionicons
                      name="person-outline"
                      size={18}
                      color={Colors[colorScheme].tint}
                    />
                    <Text
                      style={[
                        styles.inputLabel,
                        { color: Colors[colorScheme].secondaryText },
                      ]}
                    >
                      Nome completo
                    </Text>
                  </View>
                  <ThemedInput
                    placeholder="Digite seu nome"
                    value={displayName}
                    onChangeText={setDisplayName}
                    ref={nameRef}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => bioRef.current?.focus()}
                    style={{ marginTop: 8 }}
                  />
                </View>

                <View
                  style={[
                    styles.divider,
                    { backgroundColor: Colors[colorScheme].border },
                  ]}
                />

                <View style={styles.inputWrapper}>
                  <View style={styles.inputHeader}>
                    <Ionicons
                      name="document-text-outline"
                      size={18}
                      color={Colors[colorScheme].tint}
                    />
                    <Text
                      style={[
                        styles.inputLabel,
                        { color: Colors[colorScheme].secondaryText },
                      ]}
                    >
                      Biografia
                    </Text>
                  </View>
                  <ThemedInput
                    placeholder="Conte um pouco sobre você..."
                    value={bio}
                    onChangeText={setBio}
                    multiline
                    numberOfLines={4}
                    ref={bioRef}
                    returnKeyType="go"
                    onSubmitEditing={onSave}
                    style={{ marginTop: 8, minHeight: 80, marginBottom: 24 }}
                  />
                </View>
              </View>
            </View>

            {/* INFORMAÇÃO DO EMAIL (APENAS VISUALIZAÇÃO) */}
            <View style={styles.sectionContainer}>
              <Text
                style={[
                  styles.sectionLabel,
                  { color: Colors[colorScheme].secondaryText },
                ]}
              >
                INFORMAÇÕES DA CONTA
              </Text>

              <View
                style={[
                  styles.infoCard,
                  { backgroundColor: Colors[colorScheme].card },
                ]}
              >
                <View style={styles.infoRow}>
                  <View
                    style={[
                      styles.infoIconContainer,
                      { backgroundColor: Colors[colorScheme].tint + "20" },
                    ]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={Colors[colorScheme].tint}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.infoLabel,
                        { color: Colors[colorScheme].secondaryText },
                      ]}
                    >
                      Email
                    </Text>
                    <Text
                      style={[
                        styles.infoValue,
                        { color: Colors[colorScheme].text },
                      ]}
                    >
                      {user?.email}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.verifiedBadge,
                      { backgroundColor: "#34C75920" },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#34C759"
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* BOTÕES DE AÇÃO */}
          <View style={styles.buttonContainer}>
            <ThemedButton title="Salvar alterações" onPress={onSave} />
            <ThemedButton
              title="Cancelar"
              onPress={() => router.back()}
              variant="secondary"
              style={{ marginTop: 12 }}
            />
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    alignItems: "center",
    marginTop: 48,
    marginBottom: 32,
  },
  avatarContainer: {
    position: "relative",
    padding: 4,
    borderRadius: 50,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFF",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  formSection: {
    gap: 24,
  },
  sectionContainer: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  inputCard: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  inputWrapper: {
    gap: 4,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
  },
  verifiedBadge: {
    padding: 6,
    borderRadius: 8,
  },
  buttonContainer: {
    marginTop: 32,
  },
});
