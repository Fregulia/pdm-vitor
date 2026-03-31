// COMPONENTES
import { MenuButton } from "@/components/MenuButton";
import { ThemedButton } from "@/components/ThemedButton";
import { UserAvatar } from "@/components/UserAvatar";

// CONSTANTES
import { Colors } from "@/constants/theme";

// CONTEXTOS E HOOKS
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

// SERVIÇOS
import { getAcademy } from "@/services/academy";
import { db } from "@/services/firebase";
import { cleanupExpiredInvites, createInvite } from "@/services/invites";

// BIBLIOTECAS EXTERNAS
import { FontAwesome } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <MenuButton />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: Colors[colorScheme].text }]}>
              Professores
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: Colors[colorScheme].secondaryText },
              ]}
            >
              Gerencie a equipe de professores
            </Text>
          </View>
          <View
            style={[
              styles.countBadge,
              { backgroundColor: Colors[colorScheme].tint },
            ]}
          >
            <Text style={styles.countText}>{teachers.length}</Text>
          </View>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: Colors[colorScheme].card },
            ]}
          >
            <FontAwesome
              name="users"
              size={24}
              color={Colors[colorScheme].tint}
            />
            <Text
              style={[styles.statNumber, { color: Colors[colorScheme].text }]}
            >
              {teachers.length}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: Colors[colorScheme].secondaryText },
              ]}
            >
              Total
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: Colors[colorScheme].card },
            ]}
          >
            <FontAwesome
              name="user-plus"
              size={24}
              color={Colors[colorScheme].tint}
            />
            <Text
              style={[styles.statNumber, { color: Colors[colorScheme].text }]}
            >
              {
                teachers.filter((t) => {
                  const created = t.createdAt?.toDate?.();
                  if (!created) return false;
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return created > weekAgo;
                }).length
              }
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: Colors[colorScheme].secondaryText },
              ]}
            >
              Novos (7d)
            </Text>
          </View>
        </View>

        {/* Botão de convite */}
        <View
          style={[
            styles.inviteSection,
            { backgroundColor: Colors[colorScheme].card },
          ]}
        >
          <View style={styles.inviteSectionContent}>
            <FontAwesome
              name="ticket"
              size={32}
              color={Colors[colorScheme].tint}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text
                style={[
                  styles.inviteSectionTitle,
                  { color: Colors[colorScheme].text },
                ]}
              >
                Convidar Professor
              </Text>
              <Text
                style={[
                  styles.inviteSectionDesc,
                  { color: Colors[colorScheme].secondaryText },
                ]}
              >
                Gere um código válido por 24h
              </Text>
            </View>
          </View>
          <ThemedButton
            title="Gerar Convite"
            onPress={onCreateInvite}
            icon={<FontAwesome name="plus" size={16} color="#fff" />}
          />
        </View>

        {/* Lista de professores */}
        <View style={styles.listHeader}>
          <Text
            style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}
          >
            Equipe Atual
          </Text>
          {teachers.length > 0 && (
            <Text
              style={{ color: Colors[colorScheme].secondaryText, fontSize: 14 }}
            >
              {teachers.length}{" "}
              {teachers.length === 1 ? "professor" : "professores"}
            </Text>
          )}
        </View>

        {teachers.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome
              name="user-plus"
              size={48}
              color={Colors[colorScheme].secondaryText}
            />
            <Text
              style={[styles.emptyTitle, { color: Colors[colorScheme].text }]}
            >
              Nenhum professor cadastrado
            </Text>
            <Text
              style={[
                styles.emptyDesc,
                { color: Colors[colorScheme].secondaryText },
              ]}
            >
              Gere um convite para adicionar o primeiro professor à sua equipe
            </Text>
          </View>
        ) : (
          teachers.map((teacher) => (
            <View
              key={teacher.id}
              style={[
                styles.teacherCard,
                { backgroundColor: Colors[colorScheme].card },
              ]}
            >
              <View style={styles.teacherHeader}>
                <UserAvatar name={teacher.name} size={50} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text
                    style={[
                      styles.teacherName,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    {teacher.name}
                  </Text>
                  <View style={styles.teacherInfoRow}>
                    <FontAwesome
                      name="id-card"
                      size={12}
                      color={Colors[colorScheme].secondaryText}
                    />
                    <Text
                      style={[
                        styles.teacherInfo,
                        { color: Colors[colorScheme].secondaryText },
                      ]}
                    >
                      CREF: {teacher.cref || "Não informado"}
                    </Text>
                  </View>
                </View>
              </View>

              {teacher.bio && (
                <View style={styles.bioSection}>
                  <Text
                    style={[
                      styles.bioLabel,
                      { color: Colors[colorScheme].secondaryText },
                    ]}
                  >
                    Sobre
                  </Text>
                  <Text
                    style={[
                      styles.bioText,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    {teacher.bio}
                  </Text>
                </View>
              )}

              <View style={styles.teacherFooter}>
                <View style={{ flex: 1 }}>
                  {teacher.createdAt && (
                    <View style={styles.dateInfo}>
                      <FontAwesome
                        name="calendar"
                        size={12}
                        color={Colors[colorScheme].secondaryText}
                      />
                      <Text
                        style={[
                          styles.dateText,
                          { color: Colors[colorScheme].secondaryText },
                        ]}
                      >
                        Cadastrado em{" "}
                        {teacher.createdAt
                          ?.toDate?.()
                          .toLocaleDateString("pt-BR") || "Data não disponível"}
                      </Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => onRemoveTeacher(teacher.id)}
                  style={[
                    styles.removeButton,
                    { borderColor: Colors[colorScheme].destructive },
                  ]}
                >
                  <FontAwesome
                    name="trash"
                    size={14}
                    color={Colors[colorScheme].destructive}
                  />
                  <Text
                    style={[
                      styles.removeButtonText,
                      { color: Colors[colorScheme].destructive },
                    ]}
                  >
                    Remover
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal de convite */}
      <Modal transparent visible={showInviteModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable
            onPress={() => setShowInviteModal(false)}
            style={styles.modalBackground}
            accessibilityLabel="Fechar modal"
          />
          <View
            style={[
              styles.modalContent,
              { backgroundColor: Colors[colorScheme].card },
            ]}
          >
            <View style={styles.modalHeader}>
              <FontAwesome
                name="ticket"
                size={32}
                color={Colors[colorScheme].tint}
              />
              <Text
                style={[styles.modalTitle, { color: Colors[colorScheme].text }]}
              >
                Código de Convite
              </Text>
            </View>

            <View
              style={[
                styles.codeContainer,
                { backgroundColor: Colors[colorScheme].background },
              ]}
            >
              <Text
                style={[styles.codeText, { color: Colors[colorScheme].tint }]}
              >
                {invite}
              </Text>
            </View>

            <View style={styles.modalInfo}>
              <FontAwesome
                name="info-circle"
                size={16}
                color={Colors[colorScheme].secondaryText}
              />
              <Text
                style={[
                  styles.modalInfoText,
                  { color: Colors[colorScheme].secondaryText },
                ]}
              >
                Este código expira em 24 horas
              </Text>
            </View>

            <View style={styles.modalActions}>
              <ThemedButton
                title="Copiar Código"
                onPress={async () => {
                  if (invite) {
                    await Clipboard.setStringAsync(invite);
                    Alert.alert(
                      "✓ Copiado",
                      "Código copiado para a área de transferência."
                    );
                  }
                }}
                icon={<FontAwesome name="copy" size={16} color="#fff" />}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  countBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  inviteSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  inviteSectionContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  inviteSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  inviteSectionDesc: {
    fontSize: 14,
    marginTop: 2,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 32,
  },
  teacherCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  teacherHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  teacherName: {
    fontSize: 18,
    fontWeight: "700",
  },
  teacherInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 6,
  },
  teacherInfo: {
    fontSize: 14,
  },
  bioSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.2)",
  },
  bioLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
  },
  teacherFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.2)",
  },
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 12,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    zIndex: 1,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 12,
  },
  codeContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  codeText: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 4,
  },
  modalInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  modalInfoText: {
    fontSize: 14,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
});
