import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { GlobalStyles } from "@/constants/styles";
import { UserAvatar } from "@/components/UserAvatar";
import { makeMockStudents, Student } from "@/utils/mock-data";
import { FontAwesome } from "@expo/vector-icons";

export default function StudentsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const [students, setStudents] = useState<Student[]>(() =>
    makeMockStudents(30).sort((a, b) => a.name.localeCompare(b.name))
  );

  const handleOptionsPress = (student: Student) => {
    Alert.alert(
      `Opções para ${student.name}`,
      "O que você gostaria de fazer?",
      [
        {
          text: "Editar",
          onPress: () =>
            Alert.alert("Ação", `Editar perfil de ${student.name}.`),
          style: "default",
        },
        {
          text: "Excluir",
          onPress: () => {
            Alert.alert(
              "Confirmar Exclusão",
              `Tem certeza que deseja excluir ${student.name}?`,
              [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Excluir",
                  style: "destructive",
                  onPress: () => {
                    setStudents((prev) =>
                      prev.filter((s) => s.id !== student.id)
                    );
                    Alert.alert("Excluído!", `${student.name} foi removido.`);
                  },
                },
              ]
            );
          },
          style: "destructive",
        },
        {
          text: "Cancelar",
          style: "cancel",
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Student }) => (
    <View
      style={[styles.studentRow, { backgroundColor: Colors[colorScheme].card }]}
    >
      <UserAvatar name={item.name} size={40} />
      <Text style={[styles.studentName, { color: Colors[colorScheme].text }]}>
        {item.name}
      </Text>
      <TouchableOpacity
        onPress={() => handleOptionsPress(item)}
        style={styles.optionsButton}
      >
        <FontAwesome
          name="ellipsis-v"
          size={20}
          color={Colors[colorScheme].secondaryText}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView
      style={[
        GlobalStyles.container,
        { backgroundColor: Colors[colorScheme].background, paddingTop: 24 },
      ]}
    >
      <Text style={[GlobalStyles.title, { color: Colors[colorScheme].text }]}>
        Alunos
      </Text>
      <Text
        style={[
          GlobalStyles.subtitle,
          { color: Colors[colorScheme].secondaryText },
        ]}
      >
        Gerencie sua lista de alunos
      </Text>
      <FlatList
        data={students}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 24 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  studentName: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  optionsButton: {
    padding: 8,
  },
});
