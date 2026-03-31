// COMPONENTES
import { UserAvatar } from "../../components/UserAvatar";

// CONSTANTES
import { Colors } from "../../constants/theme";

// CONTEXTOS E HOOKS
import { useAuth } from "../../context/AuthContext";

// SERVIÇOS
import {
  type Conversation,
  type Message,
  getUserInfo,
  markMessagesAsRead,
  sendMessage,
  subscribeToConversations,
  subscribeToMessages,
} from "../../services/messages";

// BIBLIOTECAS EXTERNAS
import { Ionicons } from "@expo/vector-icons";

// REACT
import React, { useEffect, useState } from "react";

// REACT NATIVE
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Compatibilidade com theme
const theme = {
  colors: {
    background: Colors.light.background,
    text: Colors.light.text,
    textSecondary: Colors.light.secondaryText,
    primary: Colors.light.tint,
    surface: Colors.light.card,
    border: Colors.light.border,
  },
};

export default function MessagesScreen() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [otherUserInfo, setOtherUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to conversations
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToConversations(user.uid, (convs) => {
      setConversations(convs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Subscribe to messages when a conversation is selected
  useEffect(() => {
    if (!selectedConversation || !user?.uid) return;

    const unsubscribe = subscribeToMessages(selectedConversation.id, (msgs) => {
      setMessages(msgs);
    });

    // Get other user info
    const otherUserId = selectedConversation.participants.find(
      (id: string) => id !== user.uid
    );
    if (otherUserId) {
      getUserInfo(otherUserId).then(setOtherUserInfo);
      markMessagesAsRead(selectedConversation.id, user.uid);
    }

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation?.id, user?.uid]);

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
      console.error("Error sending message:", error);
    }
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const otherUserId = item.participants.find(
      (id: string) => id !== user?.uid
    );
    const unreadCount = item.unreadCount?.[user?.uid || ""] || 0;

    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          selectedConversation?.id === item.id && styles.selectedConversation,
        ]}
        onPress={() => setSelectedConversation(item)}
      >
        <UserAvatar size={50} name={otherUserId || "User"} />
        <View style={styles.conversationInfo}>
          <Text style={styles.conversationName}>
            {otherUserId} {/* Replace with actual user name */}
          </Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        </View>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === user?.uid;

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
          ]}
        >
          {item.text}
        </Text>
        <Text style={styles.messageTime}>
          {item.timestamp.toDate().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando conversas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mensagens</Text>
      </View>

      <View style={styles.content}>
        {/* Conversations List */}
        <View style={styles.conversationsList}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar conversas..."
            placeholderTextColor={theme.colors.textSecondary}
          />
          <FlatList
            data={conversations}
            renderItem={renderConversationItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhuma conversa ainda</Text>
            }
          />
        </View>

        {/* Messages Area */}
        {selectedConversation ? (
          <KeyboardAvoidingView
            style={styles.messagesArea}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={90}
          >
            <View style={styles.messagesHeader}>
              <UserAvatar
                size={40}
                name={
                  otherUserInfo?.name ||
                  selectedConversation.participants.find(
                    (id: string) => id !== user?.uid
                  ) ||
                  "User"
                }
              />
              <Text style={styles.messagesHeaderText}>
                {otherUserInfo?.name || "Carregando..."}
              </Text>
            </View>

            <FlatList
              data={messages}
              renderItem={renderMessageItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
              inverted={false}
            />

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.messageInput}
                placeholder="Digite sua mensagem..."
                placeholderTextColor={theme.colors.textSecondary}
                value={messageText}
                onChangeText={setMessageText}
                multiline
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendMessage}
                disabled={!messageText.trim()}
              >
                <Ionicons
                  name="send"
                  size={24}
                  color={
                    messageText.trim()
                      ? theme.colors.primary
                      : theme.colors.textSecondary
                  }
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        ) : (
          <View style={styles.noConversationSelected}>
            <Ionicons
              name="chatbubbles-outline"
              size={64}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.noConversationText}>
              Selecione uma conversa para começar
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    flexDirection: "row",
  },
  conversationsList: {
    width: "35%",
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
  },
  searchInput: {
    margin: 10,
    padding: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  selectedConversation: {
    backgroundColor: theme.colors.surface,
  },
  conversationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  lastMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  unreadBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  messagesArea: {
    flex: 1,
  },
  messagesHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  messagesHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
    color: theme.colors.text,
  },
  messagesList: {
    padding: 15,
    flexGrow: 1,
  },
  messageContainer: {
    maxWidth: "70%",
    marginBottom: 10,
    padding: 12,
    borderRadius: 16,
  },
  ownMessage: {
    alignSelf: "flex-end",
    backgroundColor: theme.colors.primary,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.surface,
  },
  messageText: {
    fontSize: 15,
  },
  ownMessageText: {
    color: "#fff",
  },
  otherMessageText: {
    color: theme.colors.text,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  messageInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  noConversationSelected: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noConversationText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 16,
  },
  emptyText: {
    textAlign: "center",
    color: theme.colors.textSecondary,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
