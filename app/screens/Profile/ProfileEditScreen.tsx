import { BackButton } from "@/components/BackButton";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedInput } from "@/components/ThemedInput";
import { GlobalStyles } from "@/constants/styles";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function ProfileEditScreen() {
  const router = useRouter();
  const { user, getProfile, updateProfileDoc } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
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
      } catch (error) {
        console.error("Failed to load profile for editing:", error);
        Alert.alert("Erro", "Não foi possível carregar os dados para edição.");
      } finally {
        setLoading(false);
      }
    })();
  }, [getProfile, user?.displayName]);

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
        style={[
          GlobalStyles.container,
          { backgroundColor: Colors[colorScheme].background },
        ]}
      >
        <BackButton />
        <Text
          style={[
            GlobalStyles.title,
            { color: Colors[colorScheme].text, marginBottom: 24 },
          ]}
        >
          Editar Perfil
        </Text>

        {/* NOME DO USUÁRIO */}
        <ThemedInput
          placeholder="Nome"
          value={displayName}
          onChangeText={setDisplayName}
          style={{ marginBottom: 12 }}
          ref={nameRef}
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => bioRef.current?.focus()}
        />
        {/* BIO DO USUÁRIO */}
        <ThemedInput
          placeholder="Bio"
          value={bio}
          onChangeText={setBio}
          style={{ marginBottom: 24 }}
          multiline
          ref={bioRef}
          returnKeyType="go"
          onSubmitEditing={onSave}
        />
        {/* BOTÕES DE AÇÃO */}
        <ThemedButton title="Salvar" onPress={onSave} />
        <ThemedButton
          title="Cancelar"
          onPress={() => router.back()}
          variant="secondary"
          style={{ marginTop: 8 }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}
