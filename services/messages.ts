import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

// TIPOS DE MENSAGEM
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Timestamp;
  read: boolean;
}

// TIPOS DE CONVERSA
export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: Timestamp;
  unreadCount: { [userId: string]: number };
}

export type ChatMemberRole = "owner" | "trainer" | "student";

export type ChatMember = {
  id: string;
  name: string;
  role: ChatMemberRole;
  photoUrl?: string | null;
  subtitle?: string;
};

// ENVIAR MENSAGEM - PÁGINA DE CHAT
export async function sendMessage(
  conversationId: string,
  senderId: string,
  receiverId: string,
  text: string
): Promise<string> {
  try {
    // CRIA O DOCUMENTO DA MENSAGEM
    const messagesRef = collection(
      db,
      "conversations",
      conversationId,
      "messages"
    );
    const messageData = {
      senderId,
      receiverId,
      text,
      timestamp: Timestamp.now(),
      read: false,
    };

    const docRef = await addDoc(messagesRef, messageData);

    // ATUALIZA A ULTIMA MENSAGEM DO DOC DA CONVERSA
    const conversationRef = doc(db, "conversations", conversationId);
    await updateDoc(conversationRef, {
      lastMessage: text,
      lastMessageTime: Timestamp.now(),
      [`unreadCount.${receiverId}`]:
        (await getDoc(conversationRef)).data()?.unreadCount?.[receiverId] ||
        0 + 1,
    });

    return docRef.id;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

// BUSCA OU CRIA UMA CONVERSA ENTRE DOIS USUÁRIOS - AO ENTRAR NO CHAT
export async function getOrCreateConversation(
  userId1: string,
  userId2: string
): Promise<string> {
  try {
    // BUSCA CONVERSA 
    const conversationsRef = collection(db, "conversations");
    const q = query(
      conversationsRef,
      where("participants", "array-contains", userId1)
    );

    const snapshot = await getDocs(q);

    // VERIFICA SE ESSA CONVERSA EXISTE
    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.participants.includes(userId2)) {
        return doc.id;
      }
    }

    // CRIA CONVERSA NOVA
    const newConversation = {
      participants: [userId1, userId2],
      lastMessage: "",
      lastMessageTime: Timestamp.now(),
      unreadCount: {
        [userId1]: 0,
        [userId2]: 0,
      },
    };

    const docRef = await addDoc(conversationsRef, newConversation);
    return docRef.id;
  } catch (error) {
    console.error("Error getting/creating conversation:", error);
    throw error;
  }
}

// ATUALIZA EM TEMPO REAL AS MENSAGENS -PÁGINA DE CHAT 
export function subscribeToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
): () => void {
  const messagesRef = collection(
    db,
    "conversations",
    conversationId,
    "messages"
  );
  const q = query(messagesRef, orderBy("timestamp", "asc"));

  // LISTENER - A CADA MUDANÇA NO DOC DE MENSAGENS ATUALIZA O CHAT
  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        conversationId,
        ...doc.data(),
      } as Message);
    });
    callback(messages);
  });
}

// ATUALIZA AS CONVERSAS DO USUÁRIO EM TEMPO REAL - LISTA DE CONVERSAS
export function subscribeToConversations(
  userId: string,
  callback: (conversations: Conversation[]) => void
): () => void {
  const conversationsRef = collection(db, "conversations");
  const q = query(
    conversationsRef,
    where("participants", "array-contains", userId),
    orderBy("lastMessageTime", "desc")
  );
  // LISTENER - A CADA MUDANÇA NO DOC DE CONVERSAS ATUALIZA A LISTA DE CONVERSAS
  return onSnapshot(q, (snapshot) => {
    const conversations: Conversation[] = [];
    snapshot.forEach((doc) => {
      conversations.push({
        id: doc.id,
        ...doc.data(),
      } as Conversation);
    });
    callback(conversations);
  });
}

// MARCA AS MENSAGENS COMO LIDAS
export async function markMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<void> {

// AO ENTRAR NA CONVERSA UNREADCOUNT = 0
  try {
    const conversationRef = doc(db, "conversations", conversationId);
    await updateDoc(conversationRef, {
      [`unreadCount.${userId}`]: 0,
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
}

// BUSCA AS INFORMAÇÕES DE UM USUÁRIO DO CHAT - MONTAGEM DE CHAT
export async function getUserInfo(userId: string): Promise<any> {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return {
        id: userSnap.id,
        ...userSnap.data(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting user info:", error);
    throw error;
  }
}

// BUSCA OS MEMBROS DE UMA ACADEMIA PARA O CHAT
export async function getAcademyChatMembers(
  gymId: string,
  currentUserId?: string,
  ownerUid?: string
): Promise<ChatMember[]> {
  try {
    const [teachersSnap, studentsSnap, ownerInfo] = await Promise.all([
      getDocs(collection(db, "academies", gymId, "teachers")),
      getDocs(collection(db, "academies", gymId, "students")),
      ownerUid ? getUserInfo(ownerUid).catch(() => null) : Promise.resolve(null),
    ]);

    const members: ChatMember[] = [];

    if (ownerUid && ownerUid !== currentUserId) {
      members.push({
        id: ownerUid,
        name:
          ownerInfo?.displayName || ownerInfo?.name || ownerInfo?.email || "Owner",
        role: "owner",
        photoUrl: ownerInfo?.photoUrl || null,
        subtitle: "Proprietário",
      });
    }

    teachersSnap.docs.forEach((teacherDoc) => {
      if (teacherDoc.id === currentUserId) return;
      const data = teacherDoc.data() as any;
      members.push({
        id: teacherDoc.id,
        name: data?.name || data?.displayName || "Professor",
        role: "trainer",
        photoUrl: data?.photoUrl || null,
        subtitle: "Professor",
      });
    });

    studentsSnap.docs.forEach((studentDoc) => {
      if (studentDoc.id === currentUserId) return;
      const data = studentDoc.data() as any;
      members.push({
        id: studentDoc.id,
        name: data?.name || data?.displayName || "Aluno",
        role: "student",
        photoUrl: data?.photoUrl || null,
        subtitle: "Aluno",
      });
    });

    const uniqueMembers = new Map<string, ChatMember>();
    members.forEach((member) => {
      if (!uniqueMembers.has(member.id)) {
        uniqueMembers.set(member.id, member);
      }
    });

    return Array.from(uniqueMembers.values()).sort((left, right) => {
      if (left.role !== right.role) {
        const order: Record<ChatMemberRole, number> = {
          owner: 0,
          trainer: 1,
          student: 2,
        };
        return order[left.role] - order[right.role];
      }

      return left.name.localeCompare(right.name, "pt-BR");
    });
  } catch {
    return [];
  }
}
