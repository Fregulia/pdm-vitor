import { ThemedButton } from "@/components/ThemedButton";
import { GlobalStyles } from "@/constants/styles";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getAcademy } from "@/services/academy";
import { db } from "@/services/firebase";
import { cleanupExpiredInvites, createInvite } from "@/services/invites";
import * as Clipboard from "expo-clipboard";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Modal, Pressable, Text, View } from "react-native";

export default function OwnerTeachersPage() {
  const colorScheme = useColorScheme() ?? "light";
  const { user } = useAuth();
  const [invite, setInvite] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [gymId, setGymId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!user?.uid) return;
      // limpeza oportunista de convites expirados
      cleanupExpiredInvites(user.uid).catch(() => {});
      const academy = await getAcademy(user.uid);
      const id = (academy as any)?.id as string | undefined;
      if (!id) return;
      setGymId(id);
      const ref = collection(db, "academies", id, "teachers");
      const qy = query(ref);
      const unsub = onSnapshot(qy, (snap) => {
        setTeachers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      });
      return unsub;
    })();
  }, [user?.uid]);

  const onCreateInvite = async () => {
    if (!user?.uid || !gymId) return;
    try {
      const code = await createInvite(user.uid);
      setInvite(code);
      setShowInviteModal(true);
    } catch {
      Alert.alert("Erro", "Não foi possível gerar o convite.");
    }
  };

  const onRemoveTeacher = async (id: string) => {
    if (!user?.uid || !gymId) return;
    Alert.alert("Remover professor", "Deseja remover este professor?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "academies", gymId, "teachers", id));
          } catch {
            Alert.alert("Erro", "Sem permissão para remover.");
          }
        },
      },
    ]);
  };

  return (
    <View
      style={[
        GlobalStyles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <Text style={[GlobalStyles.title, { color: Colors[colorScheme].text }]}>
        Professores
      </Text>
      <Text
        style={{ color: Colors[colorScheme].secondaryText, marginBottom: 12 }}
      >
        Gere códigos de convite e gerencie os professores vinculados.
      </Text>

      <ThemedButton title="Gerar código de convite" onPress={onCreateInvite} />
      <Modal transparent visible={showInviteModal} animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          {/* Fundo clicável para fechar (fica atrás do card) */}
          <Pressable
            onPress={() => setShowInviteModal(false)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 0,
            }}
            accessibilityLabel="Fechar modal"
          />
          <View
            style={{
              backgroundColor: Colors[colorScheme].card,
              width: "100%",
              maxWidth: 360,
              borderRadius: 12,
              padding: 16,
              zIndex: 1,
            }}
          >
            <Text
              style={{
                color: Colors[colorScheme].text,
                fontSize: 18,
                fontWeight: "700",
                marginBottom: 8,
              }}
            >
              Código de convite
            </Text>
            <Text
              style={{
                color: Colors[colorScheme].text,
                fontSize: 28,
                fontWeight: "800",
                letterSpacing: 2,
                textAlign: "center",
                marginVertical: 8,
              }}
            >
              {invite}
            </Text>
            <Text
              style={{
                color: Colors[colorScheme].secondaryText,
                marginBottom: 12,
              }}
            >
              Este código expira em 24 horas e será excluído automaticamente.
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <ThemedButton
                title="Copiar"
                onPress={async () => {
                  if (invite) {
                    await Clipboard.setStringAsync(invite);
                    Alert.alert(
                      "Copiado",
                      "Código copiado para a área de transferência."
                    );
                  }
                }}
                style={{ flex: 1 }}
              />
              <ThemedButton
                title="Fechar"
                variant="secondary"
                onPress={() => setShowInviteModal(false)}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: 16 }} />
      <Text
        style={{
          color: Colors[colorScheme].text,
          fontWeight: "600",
          marginBottom: 8,
        }}
      >
        Lista de professores
      </Text>
      {teachers.length === 0 ? (
        <Text style={{ color: Colors[colorScheme].secondaryText }}>
          Nenhum professor vinculado.
        </Text>
      ) : (
        <FlatList
          data={teachers}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: Colors[colorScheme].card,
                borderRadius: 12,
                padding: 12,
                marginBottom: 8,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View>
                <Text
                  style={{ color: Colors[colorScheme].text, fontWeight: "600" }}
                >
                  {item.name}
                </Text>
                <Text style={{ color: Colors[colorScheme].secondaryText }}>
                  CREF: {item.cref}
                </Text>
              </View>
              <ThemedButton
                title="Remover"
                variant="destructive"
                onPress={() => onRemoveTeacher(item.id)}
              />
            </View>
          )}
        />
      )}
    </View>
  );
}
