import { UserAvatar } from "@/components/UserAvatar";
import { GlobalStyles } from "@/constants/styles";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { db } from "@/services/firebase";
import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  query,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

export default function OwnerDashboardPage() {
  const colorScheme = useColorScheme() ?? "light";
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [teacherNames, setTeacherNames] = useState<string[]>([]);
  const [studentNames, setStudentNames] = useState<string[]>([]);
  const [classNames, setClassNames] = useState<string[]>([]);
  const [counts, setCounts] = useState({
    teachers: 0,
    students: 0,
    classes: 0,
  });

  useEffect(() => {
    (async () => {
      if (!user?.uid) return;
      setLoading(true);
      try {
        const teachersRef = collection(db, "academies", user.uid, "teachers");
        const studentsRef = collection(db, "academies", user.uid, "students");
        const classesRef = collection(db, "academies", user.uid, "classes");

        const [tCountSnap, sCountSnap, cCountSnap] = await Promise.all([
          getCountFromServer(teachersRef),
          getCountFromServer(studentsRef),
          getCountFromServer(classesRef),
        ]);
        setCounts({
          teachers: tCountSnap.data().count,
          students: sCountSnap.data().count,
          classes: cCountSnap.data().count,
        });

        const [tDocs, sDocs, cDocs] = await Promise.all([
          getDocs(query(teachersRef, limit(5))),
          getDocs(query(studentsRef, limit(5))),
          getDocs(query(classesRef, limit(5))),
        ]);
        setTeacherNames(tDocs.docs.map((d) => (d.data() as any).name || d.id));
        setStudentNames(sDocs.docs.map((d) => (d.data() as any).name || d.id));
        setClassNames(cDocs.docs.map((d) => (d.data() as any).name || d.id));
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid]);

  const firstName = React.useMemo(() => {
    const candidate = (
      user?.displayName ||
      user?.email?.split("@")[0] ||
      ""
    ).trim();
    const name = candidate.split(/\s+/)[0];
    return name || "Usuário";
  }, [user?.displayName, user?.email]);

  const greeting = React.useMemo(() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return "Bom Dia";
    if (h >= 12 && h < 19) return "Boa Tarde";
    return "Boa Noite";
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
        {greeting} {firstName}!
      </Text>
      <Text
        style={{ color: Colors[colorScheme].secondaryText, marginBottom: 16 }}
      >
        Visão geral da sua academia
      </Text>

      {/* Cards de contagem */}
      <View
        style={{
          flexDirection: "row",
          gap: 12,
          width: "100%",
          marginBottom: 16,
        }}
      >
        <View
          style={[
            GlobalStyles.card,
            { flex: 1, backgroundColor: Colors[colorScheme].card },
          ]}
        >
          <Text style={{ color: Colors[colorScheme].secondaryText }}>
            Professores
          </Text>
          <Text
            style={{
              color: Colors[colorScheme].text,
              fontSize: 28,
              fontWeight: "700",
            }}
          >
            {counts.teachers}
          </Text>
        </View>
        <View
          style={[
            GlobalStyles.card,
            { flex: 1, backgroundColor: Colors[colorScheme].card },
          ]}
        >
          <Text style={{ color: Colors[colorScheme].secondaryText }}>
            Alunos
          </Text>
          <Text
            style={{
              color: Colors[colorScheme].text,
              fontSize: 28,
              fontWeight: "700",
            }}
          >
            {counts.students}
          </Text>
        </View>
        <View
          style={[
            GlobalStyles.card,
            { flex: 1, backgroundColor: Colors[colorScheme].card },
          ]}
        >
          <Text style={{ color: Colors[colorScheme].secondaryText }}>
            Turmas
          </Text>
          <Text
            style={{
              color: Colors[colorScheme].text,
              fontSize: 28,
              fontWeight: "700",
            }}
          >
            {counts.classes}
          </Text>
        </View>
      </View>

      {/* Listas recentes */}
      <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
        <View
          style={[
            GlobalStyles.card,
            { flex: 1, backgroundColor: Colors[colorScheme].card },
          ]}
        >
          <Text
            style={{
              color: Colors[colorScheme].text,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Professores
          </Text>
          {teacherNames.length === 0 ? (
            <Text style={{ color: Colors[colorScheme].secondaryText }}>
              Nenhum professor cadastrado.
            </Text>
          ) : (
            <FlatList
              data={teacherNames}
              keyExtractor={(n, i) => n + i}
              renderItem={({ item }) => (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 8,
                  }}
                >
                  <UserAvatar name={item} size={28} />
                  <Text style={{ color: Colors[colorScheme].text }}>
                    {item}
                  </Text>
                </View>
              )}
            />
          )}
        </View>

        <View
          style={[
            GlobalStyles.card,
            { flex: 1, backgroundColor: Colors[colorScheme].card },
          ]}
        >
          <Text
            style={{
              color: Colors[colorScheme].text,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Alunos
          </Text>
          {studentNames.length === 0 ? (
            <Text style={{ color: Colors[colorScheme].secondaryText }}>
              Nenhum aluno cadastrado.
            </Text>
          ) : (
            <FlatList
              data={studentNames}
              keyExtractor={(n, i) => n + i}
              renderItem={({ item }) => (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 8,
                  }}
                >
                  <UserAvatar name={item} size={28} />
                  <Text style={{ color: Colors[colorScheme].text }}>
                    {item}
                  </Text>
                </View>
              )}
            />
          )}
        </View>

        <View
          style={[
            GlobalStyles.card,
            { flex: 1, backgroundColor: Colors[colorScheme].card },
          ]}
        >
          <Text
            style={{
              color: Colors[colorScheme].text,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Turmas
          </Text>
          {classNames.length === 0 ? (
            <Text style={{ color: Colors[colorScheme].secondaryText }}>
              Nenhuma turma cadastrada.
            </Text>
          ) : (
            <FlatList
              data={classNames}
              keyExtractor={(n, i) => n + i}
              renderItem={({ item }) => (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 8,
                  }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      backgroundColor: Colors[colorScheme].tint,
                      opacity: 0.2,
                    }}
                  />
                  <Text style={{ color: Colors[colorScheme].text }}>
                    {item}
                  </Text>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </View>
  );
}
