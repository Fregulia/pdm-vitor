import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

interface ThemedInputProps extends TextInputProps {
  label?: string;
  containerStyle?: View["props"]["style"];
}

// CRIA O INPUT BASEADO NAS INFORMAÇÕES DAS PROPS
export const ThemedInput = React.forwardRef<TextInput, ThemedInputProps>(
  ({ label, containerStyle, secureTextEntry, ...props }, ref) => {
    // DEFINE O ESQUEMA DE CORES USANDO O HOOK
    const colorScheme = useColorScheme() ?? "light";
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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
      inputContainer: {
        position: "relative",
      },
      input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingRight: secureTextEntry ? 50 : 16,
        fontSize: 16,
        backgroundColor: Colors[colorScheme].inputBackground,
        borderColor: Colors[colorScheme].border,
        color: Colors[colorScheme].text,
      },
      eyeButton: {
        position: "absolute",
        right: 12,
        top: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        width: 40,
      },
    });

    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={styles.inputContainer}>
          <TextInput
            ref={ref}
            {...props}
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            style={[styles.input, props.style]}
            placeholderTextColor={Colors[colorScheme].secondaryText}
            autoCorrect={false}
            importantForAutofill="yes"
          />
          {secureTextEntry && (
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              style={styles.eyeButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isPasswordVisible ? "eye-off" : "eye"}
                size={22}
                color={Colors[colorScheme].icon}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
);

ThemedInput.displayName = "ThemedInput";
