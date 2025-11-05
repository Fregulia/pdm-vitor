import { Platform } from "react-native";

const tintColorLight = "#007BFF";
const tintColorDark = "#009cff";

// DEFINIÇÃO DAS CORES DO TEMA LIGHT E DARK
export const Colors = {
  // CORES DO TEMA LIGHT
  light: {
    text: "#212529",
    background: "#F0F4F8",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    card: "#FFFFFF",
    border: "#DDE2E5",
    secondaryText: "#555",
    inputBackground: "#FFFFFF",
    buttonDisabled: "#a9d5ff",
  },
  // CORES DO TEMA DARK
  dark: {
    text: "#EAEAEA",
    background: "#121212",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    card: "#1E1E1E",
    border: "#272727",
    secondaryText: "#bbb",
    inputBackground: "#2a2a2a",
    buttonDisabled: "#004c80",
  },
};

// DEFINE FONTES PARA CARA PLATAFORMA
export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
