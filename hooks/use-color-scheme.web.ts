import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

// FUNÇÃO PARA PEGAR O ESQUEMA DE CORES (LIGHT OU DARK)
export function useColorScheme() {
  
  // ESTADO PARA SABER SE O COMPONENTE FOI MONTADO
  const [hasHydrated, setHasHydrated] = useState(false);

  // VERIFICA SE O COMPONENTE JÁ FOI MONTADO
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // USA O HOOK NATIVO PARA PEGAR A COR DO SISTEMA
  const colorScheme = useRNColorScheme();

  // SE JÁ FOI MONTADO, RETORNA A COR DO SISTEMA
  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
