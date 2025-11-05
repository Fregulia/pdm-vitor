import React from "react";
import {
  TouchableOpacity,
  Text,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

// CRIA A PROPS PARA CRIAÇÃO DO BOTÃO, RECEBENDO TEXTO, TIPO E OUTRAS PROPRIEDADES
interface ThemedButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "destructive";
}

// CRIA O BOTÃO BASEADO NAS INFORMAÇÕES DAS PROPS
export function ThemedButton({
  title,
  variant = "primary",
  ...props
}: ThemedButtonProps) {
  const colorScheme = useColorScheme() ?? "light";

  // MAPEIA A COR DE FUNDO CONFORME A VARIANTE
  const backgroundColor = {
    primary: Colors[colorScheme].tint,
    secondary: Colors[colorScheme].card,
    destructive: "#ff3b30",
  }[variant];

  // MAPEIA A COR DO TEXTO CONFORME A VARIANTE
  const textColor = {
    primary: Colors.light.card,
    secondary: Colors[colorScheme].tint,
    destructive: Colors.light.card,
  }[variant];

  // DEFINE OS ESTILOS DO BOTÃO
  const buttonStyle: ViewStyle = {
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor,
    opacity: props.disabled ? 0.5 : 1,
  };

  // DEFINE OS ESTILOS DO TEXTO
  const textStyle: TextStyle = {
    fontSize: 16,
    fontWeight: "bold" as "bold",
    color: textColor,
  };

  return (
    <TouchableOpacity {...props} style={[buttonStyle, props.style]}>
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
}
