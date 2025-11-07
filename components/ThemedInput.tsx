import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

interface ThemedInputProps extends TextInputProps {
  label?: string;
  containerStyle?: View["props"]["style"];
}

// CRIA O INPUT BASEADO NAS INFORMAÇÕES DAS PROPS
export const ThemedInput = React.forwardRef<TextInput, ThemedInputProps>(
  ({ label, containerStyle, ...props }, ref) => {
    // DEFINE O ESQUEMA DE CORES USANDO O HOOK
    const colorScheme = useColorScheme() ?? "light";

    // DEFINE OS ESTILOS DO INPUT
    const styles = StyleSheet.create({
      container: {
        marginBottom: 12,
      },
      label: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 8,
        color: Colors[colorScheme].text,
      },
      input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: Colors[colorScheme].inputBackground,
        borderColor: Colors[colorScheme].border,
        color: Colors[colorScheme].text,
      },
    });

    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={styles.label}>{label}</Text>}
        <TextInput
          ref={ref}
          {...props}
          style={[styles.input, props.style]}
          placeholderTextColor={Colors[colorScheme].secondaryText}
        />
      </View>
    );
  }
);

ThemedInput.displayName = "ThemedInput";
