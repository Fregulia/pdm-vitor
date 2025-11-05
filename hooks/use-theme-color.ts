
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// FUNÇÃO PARA PEGAR A COR DO TEMA
export function useThemeColor(
  
  // DEFINE CORES CUSTOMIZADAS PARA LIGHT E DARK
  props: { light?: string; dark?: string },

  // NOME DA COR PADRÃO DO TEMA
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  // CHAMA O HOOK PARA PEGAR O TEMA ATUAL, SE NÃO TIVER, USA LIGHT
  const theme = useColorScheme() ?? 'light';

  // PEGA A COR DO PROPS DE ACORDO COM O TEMA ATUAL
  const colorFromProps = props[theme];

  // SE TIVER COR NOS PROPS, USA ESSA, SENÃO USA A COR PADRÃO DO TEMA
  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
