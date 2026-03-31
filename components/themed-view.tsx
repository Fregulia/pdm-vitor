import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

// TIPOS DE PROPS DA VIEW TEMATIZADA
export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

// VIEW COM COR DE FUNDO CONFORME O TEMA
export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
