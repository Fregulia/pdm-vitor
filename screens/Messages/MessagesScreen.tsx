import { UserAvatar } from "@/components/UserAvatar";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getAcademy } from "@/services/academy";
import {
    type ChatMember,
    type Conversation,
    type Message,
    getAcademyChatMembers,
    getOrCreateConversation,
    getUserInfo,
    markMessagesAsRead,
    sendMessage,
    subscribeToConversations,
    subscribeToMessages,
} from "@/services/messages";
import { getStudentContext } from "@/services/students";
import { getTrainerContext } from "@/services/trainers";
import { Ionicons } from "@expo/vector-icons";
import { Timestamp } from "firebase/firestore";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function roleLabel(role: ChatMember["role"]) {
  switch (role) {
    case "owner":
      return "Proprietário";
    case "trainer":
      return "Professor";
    case "student":
      return "Aluno";
    default:
      return "Contato";
  }
}

export default function MessagesScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const { user, getProfile } = useAuth();

  const messageListRef = useRef<FlatList<Message>>(null);

  const [loading, setLoading] = useState(true);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [academyName, setAcademyName] = useState<string>("Academia");
  const [gymId, setGymId] = useState<string>("");
  const [ownerUid, setOwnerUid] = useState<string>("");
  const [contacts, setContacts] = useState<ChatMember[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [selectedMember, setSelectedMember] = useState<ChatMember | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "chat">("list");

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToConversations(user.uid, (convs) => {
      setConversations(convs);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    if (!selectedConversation || !user?.uid) {
      setMessages([]);
      return;
    }

    const unsubscribe = subscribeToMessages(selectedConversation.id, (msgs) => {
      setMessages(msgs);
    });

    const otherUserId = selectedConversation.participants.find(
      (id) => id !== user.uid
    );

    if (otherUserId) {
      markMessagesAsRead(selectedConversation.id, user.uid);

      const localContact = contacts.find((contact) => contact.id === otherUserId);
      if (localContact) {
        setSelectedMember(localContact);
      } else {
        getUserInfo(otherUserId)
          .then((info) => {
            if (!info) return;
            setSelectedMember({
              id: otherUserId,
              name: info.displayName || info.name || info.email || "Contato",
              role: "student",
              photoUrl: info.photoUrl || null,
              subtitle: info.role || "Contato",
            });
          })
          .catch(() => {
            setSelectedMember({
              id: otherUserId,
              name: "Contato",
              role: "student",
              subtitle: "Contato",
            });
          });
      }
    }

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation?.id, user?.uid, contacts]);

  useEffect(() => {
    if (viewMode !== "chat" || messages.length === 0) return;

    const timeout = setTimeout(() => {
      messageListRef.current?.scrollToEnd({ animated: false });
    }, 80);

    return () => clearTimeout(timeout);
  }, [messages.length, viewMode]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!user?.uid) return;
      setLoading(true);
      setLoadingContacts(true);

      try {
        const profile = await getProfile();
        const role = (profile?.role as string | undefined) || "";

        let resolvedGymId = (profile?.gym_id as string | undefined) || "";
        let resolvedOwnerUid = (profile?.owner_id as string | undefined) || "";
        let resolvedAcademyName = (profile?.academy_name as string | undefined) || "";

        if (role === "owner" || !resolvedGymId) {
          const academy = await getAcademy(user.uid);
          resolvedGymId = (academy as any)?.id || resolvedGymId;
          resolvedOwnerUid = academy?.ownerUid || user.uid;
          resolvedAcademyName = academy?.name || resolvedAcademyName;
        }

        if (role === "trainer" && (!resolvedGymId || !resolvedOwnerUid)) {
          const ctx = await getTrainerContext();
          resolvedGymId = ctx?.gymId || resolvedGymId;
          resolvedOwnerUid = ctx?.ownerUid || resolvedOwnerUid;
        }

        if (role === "student" && (!resolvedGymId || !resolvedOwnerUid)) {
          const ctx = await getStudentContext();
          resolvedGymId = ctx?.gymId || resolvedGymId;
          resolvedOwnerUid = ctx?.ownerUid || resolvedOwnerUid;
        }

        if (!resolvedGymId) {
          throw new Error("ACADEMY_NOT_FOUND");
        }

        const academyMembers = await getAcademyChatMembers(
          resolvedGymId,
          user.uid,
          resolvedOwnerUid || undefined
        );

        if (!mounted) return;

        setGymId(resolvedGymId);
        setOwnerUid(resolvedOwnerUid);
        setAcademyName(resolvedAcademyName || "Academia");
        setContacts(academyMembers);
      } catch (error) {
        console.error("[MessagesScreen] Falha ao carregar chat:", error);
        if (mounted) {
          setContacts([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setLoadingContacts(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [getProfile, user?.uid]);

  const contactsMap = useMemo(() => {
    return new Map(contacts.map((contact) => [contact.id, contact]));
  }, [contacts]);

  const visibleContacts = useMemo(() => {
    const query = normalizeText(searchText.trim());
    if (!query) return contacts;

    return contacts.filter((contact) => {
      return [contact.name, contact.subtitle || "", contact.role]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [contacts, searchText]);

  const visibleConversations = useMemo(() => {
    const query = normalizeText(searchText.trim());

    return conversations.filter((conversation) => {
      const otherUserId = conversation.participants.find(
        (id) => id !== user?.uid
      );

      if (!otherUserId) return false;
      const contact = contactsMap.get(otherUserId);
      if (!contact) return false;

      if (!query) return true;

      return [contact.name, contact.subtitle || "", conversation.lastMessage || ""]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [contactsMap, conversations, searchText, user?.uid]);

  const currentMember = selectedMember;

  const handleOpenContact = async (contact: ChatMember) => {
    if (!user?.uid) return;

    try {
      const conversationId = await getOrCreateConversation(user.uid, contact.id);
      const existingConversation = conversations.find(
        (conversation) => conversation.id === conversationId
      );

      setSelectedMember(contact);
      setSelectedConversation(
        existingConversation || {
          id: conversationId,
          participants: [user.uid, contact.id],
          lastMessage: "",
          lastMessageTime: Timestamp.now(),
          unreadCount: {},
        }
      );
      setViewMode("chat");
    } catch (error) {
      console.error("[MessagesScreen] Erro ao abrir conversa:", error);
    }
  };

  const handleOpenConversation = (conversation: Conversation) => {
    if (!user?.uid) return;

    const otherUserId = conversation.participants.find((id) => id !== user.uid);
    if (!otherUserId) return;

    const contact = contactsMap.get(otherUserId);
    setSelectedConversation(conversation);
    setSelectedMember(
      contact || {
        id: otherUserId,
        name: otherUserId,
        role: "student",
        subtitle: "Contato",
      }
    );
    setViewMode("chat");
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || !user?.uid) return;

    const otherUserId = selectedConversation.participants.find(
      (id) => id !== user.uid
    );

    if (!otherUserId) return;

    try {
      await sendMessage(
        selectedConversation.id,
        user.uid,
        otherUserId,
        messageText.trim()
      );
      setMessageText("");
    } catch (error) {
      console.error("[MessagesScreen] Erro ao enviar mensagem:", error);
    }
  };

  const renderContactItem = ({ item }: { item: ChatMember }) => {
    const isSelected = selectedMember?.id === item.id;

    return (
      <Pressable
        onPress={() => handleOpenContact(item)}
        style={({ pressed }) => [
          styles.contactCard,
          {
            backgroundColor: palette.card,
            borderColor: isSelected ? palette.tint : palette.border,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <UserAvatar size={44} name={item.name} photoUrl={item.photoUrl} />
        <Text style={[styles.contactName, { color: palette.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text
          style={[styles.contactRole, { color: palette.secondaryText }]}
          numberOfLines={1}
        >
          {item.subtitle || roleLabel(item.role)}
        </Text>
      </Pressable>
    );
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const otherUserId = item.participants.find((id) => id !== user?.uid);
    if (!otherUserId) return null;

    const contact = contactsMap.get(otherUserId);
    const unreadCount = item.unreadCount?.[user?.uid || ""] || 0;

    return (
      <Pressable
        onPress={() => handleOpenConversation(item)}
        style={({ pressed }) => [
          styles.conversationItem,
          {
            backgroundColor:
              selectedConversation?.id === item.id ? palette.tint + "12" : palette.card,
            borderColor: palette.border,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <UserAvatar
          size={50}
          name={contact?.name || item.lastMessage || otherUserId}
          photoUrl={contact?.photoUrl}
        />
        <View style={styles.conversationInfo}>
          <View style={styles.conversationTitleRow}>
            <Text style={[styles.conversationName, { color: palette.text }]} numberOfLines={1}>
              {contact?.name || otherUserId}
            </Text>
            {unreadCount > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: palette.tint }]}>
                <Text style={styles.unreadText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.conversationRole, { color: palette.secondaryText }]}>
            {contact?.subtitle || roleLabel(contact?.role || "student")}
          </Text>
          <Text style={[styles.lastMessage, { color: palette.secondaryText }]} numberOfLines={1}>
            {item.lastMessage || "Sem mensagens ainda"}
          </Text>
        </View>
      </Pressable>
    );
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === user?.uid;

    return (
      <View
        style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
          { backgroundColor: isOwnMessage ? palette.tint : palette.card },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            { color: isOwnMessage ? "#FFFFFF" : palette.text },
          ]}
        >
          {item.text}
        </Text>
        <Text
          style={[
            styles.messageTime,
            { color: isOwnMessage ? "#FFFFFFCC" : palette.secondaryText },
          ]}
        >
          {item.timestamp?.toDate
            ? item.timestamp.toDate().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </Text>
      </View>
    );
  };

  const listHeader = (
    <View style={styles.listHeader}>
      <View style={styles.sectionBlock}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Membros da academia</Text>
        <Text style={[styles.sectionSubtitle, { color: palette.secondaryText }]}>
          Toque em alguém para iniciar uma conversa
        </Text>
        <FlatList
          data={visibleContacts}
          renderItem={renderContactItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.contactsRow}
          ListEmptyComponent={
            loadingContacts ? (
              <View style={styles.inlineLoading}>
                <ActivityIndicator color={palette.tint} />
              </View>
            ) : (
              <Text style={[styles.emptySectionText, { color: palette.secondaryText }]}>
                Nenhum membro encontrado
              </Text>
            )
          }
        />
      </View>

      <View style={styles.sectionBlock}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Conversas recentes</Text>
        <Text style={[styles.sectionSubtitle, { color: palette.secondaryText }]}>
          Conversas da academia {academyName}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.tint} />
          <Text style={[styles.loadingText, { color: palette.text }]}>Carregando chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!gymId) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
        <View style={styles.emptyStateContainer}>
          <Ionicons name="warning-outline" size={64} color={palette.secondaryText} />
          <Text style={[styles.emptyStateTitle, { color: palette.text }]}>
            Chat indisponível
          </Text>
          <Text style={[styles.emptyStateDescription, { color: palette.secondaryText }]}>
            Não foi possível identificar a academia deste usuário.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <View style={styles.container}>
        <View style={[styles.header, { borderBottomColor: palette.border, backgroundColor: palette.background }]}>
          <View>
            <Text style={[styles.headerTitle, { color: palette.text }]}>Chat</Text>
            <Text style={[styles.headerSubtitle, { color: palette.secondaryText }]}>
              {academyName}
            </Text>
          </View>

          {viewMode === "chat" && (
            <TouchableOpacity
              onPress={() => setViewMode("list")}
              style={[styles.backButton, { backgroundColor: palette.card, borderColor: palette.border }]}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={18} color={palette.text} />
              <Text style={[styles.backButtonText, { color: palette.text }]}>Voltar</Text>
            </TouchableOpacity>
          )}
        </View>

        {viewMode === "list" ? (
          <FlatList
            data={visibleConversations}
            renderItem={renderConversationItem}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={
              <View style={styles.listTop}>
                <TextInput
                  style={[
                    styles.searchInput,
                    {
                      backgroundColor: palette.card,
                      borderColor: palette.border,
                      color: palette.text,
                    },
                  ]}
                  placeholder="Buscar contatos ou conversas..."
                  placeholderTextColor={palette.secondaryText}
                  value={searchText}
                  onChangeText={setSearchText}
                />
                {listHeader}
              </View>
            }
            ListEmptyComponent={
              <View style={styles.noConversationState}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={72}
                  color={palette.secondaryText}
                />
                <Text style={[styles.noConversationTitle, { color: palette.text }]}>Sem conversas ainda</Text>
                <Text style={[styles.noConversationDescription, { color: palette.secondaryText }]}>
                  Toque em um membro da academia para iniciar o primeiro chat.
                </Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <KeyboardAvoidingView
            style={styles.chatContainer}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={88}
          >
            <View style={[styles.chatHeader, { borderBottomColor: palette.border }]}>
              <UserAvatar
                size={44}
                name={currentMember?.name || selectedConversation?.participants.find((id) => id !== user?.uid) || "Contato"}
                photoUrl={currentMember?.photoUrl}
              />
              <View style={styles.chatHeaderInfo}>
                <Text style={[styles.chatHeaderName, { color: palette.text }]} numberOfLines={1}>
                  {currentMember?.name || "Contato"}
                </Text>
                <Text style={[styles.chatHeaderRole, { color: palette.secondaryText }]}>
                  {currentMember?.subtitle || roleLabel(currentMember?.role || "student")}
                </Text>
              </View>
            </View>

            <FlatList
              ref={messageListRef}
              data={messages}
              renderItem={renderMessageItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
              ListEmptyComponent={
                <View style={styles.noMessagesState}>
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={54}
                    color={palette.secondaryText}
                  />
                  <Text style={[styles.noMessagesTitle, { color: palette.text }]}>Sem mensagens</Text>
                  <Text style={[styles.noMessagesDescription, { color: palette.secondaryText }]}>
                    Envie a primeira mensagem para iniciar a conversa.
                  </Text>
                </View>
              }
            />

            <View style={[styles.inputBar, { borderTopColor: palette.border, backgroundColor: palette.background }]}>
              <TextInput
                style={[
                  styles.messageInput,
                  {
                    backgroundColor: palette.card,
                    borderColor: palette.border,
                    color: palette.text,
                  },
                ]}
                placeholder="Digite sua mensagem..."
                placeholderTextColor={palette.secondaryText}
                value={messageText}
                onChangeText={setMessageText}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  { backgroundColor: messageText.trim() ? palette.tint : palette.border },
                ]}
                onPress={handleSendMessage}
                disabled={!messageText.trim()}
                activeOpacity={0.8}
              >
                <Ionicons name="send" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyStateDescription: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "800",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 24,
  },
  listTop: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 15,
    marginBottom: 18,
  },
  listHeader: {
    gap: 20,
  },
  sectionBlock: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  sectionSubtitle: {
    fontSize: 13,
  },
  contactsRow: {
    gap: 12,
    paddingVertical: 4,
    paddingRight: 20,
  },
  contactCard: {
    width: 118,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  contactName: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  contactRole: {
    fontSize: 12,
    textAlign: "center",
  },
  inlineLoading: {
    width: 118,
    height: 118,
    justifyContent: "center",
    alignItems: "center",
  },
  emptySectionText: {
    fontSize: 13,
    paddingVertical: 8,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  conversationInfo: {
    flex: 1,
    gap: 4,
  },
  conversationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  conversationName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
  },
  conversationRole: {
    fontSize: 12,
    fontWeight: "600",
  },
  lastMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  noConversationState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
    gap: 10,
  },
  noConversationTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  noConversationDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 17,
    fontWeight: "700",
  },
  chatHeaderRole: {
    fontSize: 13,
    marginTop: 2,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: "82%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  ownMessage: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 6,
  },
  otherMessage: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 6,
    alignSelf: "flex-end",
  },
  noMessagesState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
    gap: 10,
  },
  noMessagesTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  noMessagesDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  messageInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
