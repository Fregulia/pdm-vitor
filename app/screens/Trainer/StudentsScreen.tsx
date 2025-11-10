import { UserAvatar } from "@/components/UserAvatar";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { db } from "@/services/firebase";
import { getTrainerContext } from "@/services/trainers";
import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import React from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TrainerStudentsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = React.useState(true);
  const [gymId, setGymId] = React.useState<string | null>(null);
  const [students, setStudents] = React.useState<
    { id: string; name: string }[]
  >([]);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const ctx = await getTrainerContext();
        if (!ctx?.gymId) {
          setGymId(null);
          setStudents([]);
          return;
        }
        setGymId(ctx.gymId);
        const ref = collection(db, "academies", ctx.gymId, "students");
        const snaps = await getDocs(query(ref, orderBy("name"), limit(50)));
        // Filtra apenas alunos com cadastro completo (que têm name e uid)
        setStudents(
          snaps.docs
            .map((d) => ({
              id: d.id,
              name: ((d.data() as any).name as string) || d.id,
              uid: (d.data() as any).uid,
            }))
            .filter((s) => s.name && s.uid) // Só mostra se tiver nome e uid
            .map(({ id, name }) => ({ id, name }))
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors[colorScheme].background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      </View>
    );
  }

  if (!gymId) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors[colorScheme].background,
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <Ionicons
          name="people-outline"
          size={64}
          color={Colors[colorScheme].secondaryText}
          style={{ opacity: 0.3, marginBottom: 16 }}
        />
        <Text
          style={{
            color: Colors[colorScheme].text,
            textAlign: "center",
            fontSize: 18,
            fontWeight: "600",
          }}
        >
          Você ainda não está vinculado a uma academia
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors[colorScheme].background,
        paddingTop: insets.top,
      }}
    >
      {/* Header */}
      <View
        style={{
          padding: 20,
          paddingBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: Colors[colorScheme].text,
            marginBottom: 4,
          }}
        >
          Meus Alunos
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: Colors[colorScheme].secondaryText,
          }}
        >
          {students.length} {students.length === 1 ? "aluno" : "alunos"}{" "}
          cadastrado{students.length === 1 ? "" : "s"}
        </Text>
      </View>

      {/* Lista de alunos */}
      {students.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
          }}
        >
          <Ionicons
            name="people-outline"
            size={80}
            color={Colors[colorScheme].secondaryText}
            style={{ opacity: 0.3, marginBottom: 16 }}
          />
          <Text
            style={{
              color: Colors[colorScheme].text,
              fontSize: 18,
              fontWeight: "600",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Nenhum aluno encontrado
          </Text>
          <Text
            style={{
              color: Colors[colorScheme].secondaryText,
              textAlign: "center",
              fontSize: 15,
            }}
          >
            Os alunos cadastrados aparecerão aqui
          </Text>
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingTop: 8 }}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: Colors[colorScheme].card,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <UserAvatar name={item.name} size={48} />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: Colors[colorScheme].text,
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  {item.name}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
