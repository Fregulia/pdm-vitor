import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";

// FUNÇÃO PARA GERAR A COR DE FUNDO DO AVATAR BASEADO NO NOME
const getColorFromString = (str: string) => {
  let hash = 0;

  // GERA UM HASH SOMANDO OS CARACTERES DA STRING
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // USA O HASH PARA GERAR UMA COR HSL, E DEFINE A SATURAÇÃO E LUMINOSIDADE PARA SEREM SUAVES
  const color = `hsl(${hash % 360}, 70%, 80%)`;
  return color;
};

// FUNÇÃO PARA PEGAR AS DUAS PRIMEIRAS INICIAIS DO NOME PARA MOSTRAR NO AVATAR
const getInitials = (name: string) => {
  const names = name.split(" ");
  const initials = names.map((n) => n[0]).join("");
  return initials.substring(0, 2).toUpperCase();
};

// CRIA A INTERFACE DE PROPS
interface UserAvatarProps {
  name: string;
  size?: number;
}

// CRIA O AVATAR A PARTIR DAS PROPS
export function UserAvatar({ name, size = 40 }: UserAvatarProps) {
  const initials = getInitials(name);
  const backgroundColor = getColorFromString(name);

  // DEFINE OS ESTILOS DO AVATAR (TAMANHO, COR E TEXTO)
  const styles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor,
      justifyContent: "center",
      alignItems: "center",
    },
    text: {
      color: Colors.light.text,
      fontSize: size / 2.5,
      fontWeight: "bold",
    },
  });

  // RETORNA O CONTAINER MONTADO
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{initials}</Text>
    </View>
  );
}
