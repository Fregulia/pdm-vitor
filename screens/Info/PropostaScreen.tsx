import React from "react";
import { View, Text, ScrollView } from "react-native";
import { GlobalStyles } from "@/constants/styles";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function PropostaScreen() {
  const colorScheme = useColorScheme() ?? "light";

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
      }}
      style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}
    >
      <View
        style={[
          GlobalStyles.container,
          {
            backgroundColor: Colors[colorScheme].background,
            alignItems: "center",
          },
        ]}
      >
        <Text
          style={[
            GlobalStyles.title,
            {
              color: Colors[colorScheme].text,
              marginBottom: 12,
              textAlign: "center",
            },
          ]}
        >
          Proposta do App
        </Text>
        <Text
          style={{
            color: Colors[colorScheme].secondaryText,
            fontSize: 16,
            lineHeight: 22,
            marginBottom: 16,
            textAlign: "center",
            maxWidth: 520,
          }}
        >
          Este aplicativo foi pensado para personal trainers gerenciarem seus
          alunos, horários e acompanharem a evolução de cada um de forma prática
          e centralizada.
        </Text>
        <Text
          style={[
            GlobalStyles.title,
            {
              color: Colors[colorScheme].text,
              fontSize: 20,
              marginBottom: 8,
              textAlign: "center",
            },
          ]}
        >
          Por que musculação?
        </Text>
        <Text
          style={{
            color: Colors[colorScheme].secondaryText,
            fontSize: 16,
            lineHeight: 22,
            marginBottom: 16,
            textAlign: "center",
            maxWidth: 520,
          }}
        >
          A musculação é essencial para a saúde: melhora a composição corporal,
          fortalece ossos e articulações, auxilia na postura e contribui para
          bem-estar físico e mental. Um acompanhamento próximo e organizado
          potencializa os resultados.
        </Text>
        <Text
          style={[
            GlobalStyles.title,
            {
              color: Colors[colorScheme].text,
              fontSize: 20,
              marginBottom: 8,
              textAlign: "center",
            },
          ]}
        >
          Por que um app?
        </Text>
        <Text
          style={{
            color: Colors[colorScheme].secondaryText,
            fontSize: 16,
            lineHeight: 22,
            textAlign: "center",
            maxWidth: 520,
          }}
        >
          Com este app, o personal consegue manter o cadastro de alunos,
          controlar horários, registrar observações e evoluções, além de
          facilitar a comunicação. Isso reduz erros, economiza tempo e melhora a
          experiência do aluno.
        </Text>
      </View>
    </ScrollView>
  );
}
