import { UserAvatar } from "@/components/UserAvatar";
import { GlobalStyles } from "@/constants/styles";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { db } from "@/services/firebase";
import { getTrainerContext } from "@/services/trainers";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import React from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

export default function TrainerStudentsScreen() {
  const colorScheme = useColorScheme() ?? "light";
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

  if (!gymId) {
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
        <Text style={{ color: Colors[colorScheme].text, textAlign: "center" }}>
          Você ainda não está vinculado a uma academia.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        GlobalStyles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <Text
        style={[
          GlobalStyles.title,
          { color: Colors[colorScheme].text, marginBottom: 8 },
        ]}
      >
        Alunos
      </Text>
      <Text
        style={{ color: Colors[colorScheme].secondaryText, marginBottom: 16 }}
      >
        Lista de alunos da academia
      </Text>

      {students.length === 0 ? (
        <Text style={{ color: Colors[colorScheme].secondaryText }}>
          Nenhum aluno encontrado.
        </Text>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 8,
              }}
            >
              <UserAvatar name={item.name} size={32} />
              <Text style={{ color: Colors[colorScheme].text, fontSize: 16 }}>
                {item.name}
              </Text>
            </View>
          )}
          ItemSeparatorComponent={() => (
            <View
              style={{
                height: 1,
                backgroundColor: Colors[colorScheme].border,
                opacity: 0.2,
              }}
            />
          )}
        />
      )}
    </View>
  );
}
