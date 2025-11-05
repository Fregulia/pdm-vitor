import React from "react";
import { TextInput, TextInputProps, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

// CRIA O INPUT BASEADO NAS INFORMAÇÕES DAS PROPS
export const ThemedInput = React.forwardRef<TextInput, TextInputProps>(
  (props, ref) => {
    // DEFINE O ESQUEMA DE CORES USANDO O HOOK
    const colorScheme = useColorScheme() ?? "light";

    // DEFINE OS ESTILOS DO INPUT
    const styles = StyleSheet.create({
      input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 12,
        backgroundColor: Colors[colorScheme].inputBackground,
        borderColor: Colors[colorScheme].border,
        color: Colors[colorScheme].text,
      },
    });

    return (
      <TextInput
        ref={ref}
        {...props}
        style={[styles.input, props.style]}
        placeholderTextColor={Colors[colorScheme].secondaryText}
      />
    );
  }
);

ThemedInput.displayName = "ThemedInput";
